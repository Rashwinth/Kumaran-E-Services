const mongoose = require("mongoose");
const Sale = require("../models/Sale");
const Account = require("../models/Accounts");
const Branch = require("../models/Branch");
const Inventory = require("../models/Inventory");
const Customer = require("../models/customerModel");

// @desc    Create new sale (Daily Storage version)
// @route   POST /api/sales
// @access  Private (Staff/Admin)
exports.createSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      customer, // Customer ID (Optional for walk-ins, we handle it)
      items,
      subtotal,
      totalTax,
      grandTotal,
      paymentMethod,
    } = req.body;

    const branch = await Branch.findOne({ code: req.user.branchCode }).session(
      session
    );
    if (!branch) {
      throw new Error("Branch not found for the user");
    }

    // 1. Resolve Customer (Auto-manage Walk-in if ID not provided)
    let customerId = customer;
    if (!customerId) {
      let walkIn = await Customer.findOne({
        phone: "0000000000",
        branchCode: req.user.branchCode,
      }).session(session);

      if (!walkIn) {
        walkIn = await Customer.create(
          [
            {
              name: "Walk-in Customer",
              phone: "0000000000",
              city: "Local",
              branch: branch._id,
              branchCode: req.user.branchCode,
            },
          ],
          { session }
        );
        walkIn = walkIn[0];
      }
      customerId = walkIn._id;
    }

    const today = new Date();
    const dateKey = today.toISOString().slice(0, 10);
    const dateStr = dateKey.replace(/-/g, "");

    // 2. Fetch Account to check type
    const account = await Account.findById(paymentMethod).session(session);
    if (!account) {
      throw new Error("Payment account not found");
    }

    // Determine status based on payment method
    const saleStatus = account.type === "Credits" ? "Pending" : "Completed";

    // Increment sequential bill number
    branch.lastBillNumber += 1;
    await branch.save({ session });

    const billNumber = `${req.user.branchCode}-${dateStr}-${branch.lastBillNumber}`;

    const individualSale = {
      billNumber,
      customer: customerId,
      items,
      subtotal,
      totalTax,
      grandTotal,
      paymentMethod,
      staff: req.user.id,
      status: saleStatus,
      createdAt: new Date(),
    };

    // If payment is "Credits", we must have a real customer (not walk-in with phone 0000000000)
    if (account.type === "Credits") {
      const custDoc = await Customer.findById(customerId).session(session);
      if (custDoc.phone === "0000000000") {
        throw new Error(
          "Credits are not allowed for Walk-in Customers. Please register the customer first."
        );
      }

      // Update Customer Credits Array
      custDoc.credits.push({
        date: new Date(),
        products: items.map((i) => i.product),
        totalAmount: grandTotal,
      });
      await custDoc.save({ session });
    }

    // 3. Update/Create Daily Sale Record
    const updateData = {
      $push: { sales: individualSale },
    };

    // Only update daily totals if payment is received (Completed status)
    if (saleStatus === "Completed") {
      updateData.$inc = {
        daySubtotal: subtotal,
        dayTotalTax: totalTax,
        dayGrandTotal: grandTotal,
      };
    }

    const saleRecord = await Sale.findOneAndUpdate(
      { date: dateKey, branch: branch._id },
      updateData,
      { upsert: true, new: true, session }
    );

    // 4. Update Account Balance
    const openingBalance = account.currentBalance || 0;
    const closingBalance = openingBalance + grandTotal;

    account.balanceHistory.push({
      date: new Date(),
      openingBalance,
      closingBalance,
    });
    account.currentBalance = closingBalance;
    await account.save({ session });

    // 5. Update Inventory and validate stock
    for (const item of items) {
      // First check current inventory
      const currentInventory = await Inventory.findOne({
        product: item.product,
        branch: branch._id,
      })
        .populate("product", "name sku")
        .session(session);

      if (!currentInventory) {
        throw new Error(
          `Product not found in inventory. Please add it to branch inventory first.`
        );
      }

      if (currentInventory.quantity < item.qty) {
        throw new Error(
          `Insufficient stock for ${currentInventory.product.name} (SKU: ${currentInventory.product.sku}). Available: ${currentInventory.quantity}, Required: ${item.qty}`
        );
      }

      // Update inventory quantity
      const inventoryUpdate = await Inventory.findOneAndUpdate(
        {
          product: item.product,
          branch: branch._id,
          quantity: { $gte: item.qty },
        },
        [
          {
            $set: {
              quantity: { $subtract: ["$quantity", item.qty] },
              isActive: {
                $cond: {
                  if: { $eq: [{ $subtract: ["$quantity", item.qty] }, 0] },
                  then: false,
                  else: "$isActive",
                },
              },
            },
          },
        ],
        { session, new: true }
      );

      if (!inventoryUpdate) {
        throw new Error(
          `Failed to update inventory for ${currentInventory.product.name}`
        );
      }
    }

    await session.commitTransaction();
    res.status(201).json({
      success: true,
      message: "Sale completed successfully",
      data: saleRecord.sales[saleRecord.sales.length - 1],
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error("Create sale error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while creating sale",
    });
  } finally {
    session.endSession();
  }
};

// @desc    Get all sales for a branch
// @route   GET /api/sales
// @access  Private (Staff/Admin)
exports.getSales = async (req, res) => {
  try {
    const branch = await Branch.findOne({ code: req.user.branchCode });
    if (!branch && req.user.role !== "admin") {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const query = req.user.role === "admin" ? {} : { branch: branch._id };

    const dailyRecords = await Sale.find(query)
      .populate("sales.paymentMethod", "type upiAccountName")
      .populate("sales.staff", "name")
      .populate("sales.customer", "name phone city")
      .populate("sales.items.product", "name sku")
      .sort({ date: -1 });

    const flattenedSales = dailyRecords.reduce((acc, record) => {
      const salesWithMeta = record.sales.map((s) => ({
        ...s.toObject(),
        branchId: record.branch,
        _id: s._id,
      }));
      return acc.concat(salesWithMeta);
    }, []);

    flattenedSales.sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json({
      success: true,
      count: flattenedSales.length,
      data: flattenedSales,
    });
  } catch (error) {
    console.error("Get sales error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching sales",
    });
  }
};
