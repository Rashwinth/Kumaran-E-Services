const Inventory = require("../models/Inventory");
const Product = require("../models/Product");

// @desc    Add inventory to branch
// @route   POST /api/admin/inventory
// @access  Private/Admin
const addInventory = async (req, res) => {
  try {
    const {
      branch,
      product,
      quantity,
      costPrice,
      sellingPrice,
      FinalPrice,
      lowStockThreshold,
    } = req.body;

    // Check if inventory already exists for this product in this branch
    let inventory = await Inventory.findOne({ branch, product });

    if (inventory) {
      // Update existing inventory
      inventory.quantity += Number(quantity);
      // Update prices if needed, or keep latest? Usually latest entry might update prices.
      // Let's assume we update prices to the new values provided
      inventory.costPrice = costPrice;
      inventory.sellingPrice = sellingPrice;
      inventory.FinalPrice = FinalPrice;
      inventory.lowStockThreshold = lowStockThreshold;

      await inventory.save();
      await inventory.populate({
        path: "product",
        populate: [
          { path: "category", select: "name" },
          { path: "subCategory", select: "name" },
        ],
      });
      return res.status(200).json(inventory);
    }

    // Create new inventory
    inventory = await Inventory.create({
      branch,
      product,
      quantity,
      costPrice,
      sellingPrice,
      FinalPrice,
      lowStockThreshold,
    });

    await inventory.populate({
      path: "product",
      populate: [
        { path: "category", select: "name" },
        { path: "subCategory", select: "name" },
      ],
    });
    res.status(201).json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get inventory by branch
// @route   GET /api/admin/inventory/:branchId
// @access  Private/Admin, Manager
const getInventoryByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    const inventory = await Inventory.find({ branch: branchId })
      .populate({
        path: "product",
        populate: [
          { path: "category", select: "name" },
          { path: "subCategory", select: "name" },
        ],
      })
      .populate("branch", "name code")
      .sort({ createdAt: -1 });

    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update inventory details (e.g. stock correction, price change)
// @route   PUT /api/admin/inventory/:id
// @access  Private/Admin
const updateInventory = async (req, res) => {
  try {
    const { quantity, costPrice, sellingPrice, FinalPrice, lowStockThreshold } =
      req.body;

    const inventory = await Inventory.findById(req.params.id);

    if (!inventory) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    inventory.quantity = quantity !== undefined ? quantity : inventory.quantity;
    inventory.costPrice =
      costPrice !== undefined ? costPrice : inventory.costPrice;
    inventory.sellingPrice =
      sellingPrice !== undefined ? sellingPrice : inventory.sellingPrice;
    inventory.FinalPrice =
      FinalPrice !== undefined ? FinalPrice : inventory.FinalPrice;
    inventory.lowStockThreshold =
      lowStockThreshold !== undefined
        ? lowStockThreshold
        : inventory.lowStockThreshold;

    await inventory.save();
    await inventory.populate({
      path: "product",
      populate: [
        { path: "category", select: "name" },
        { path: "subCategory", select: "name" },
      ],
    });

    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/admin/inventory/:id
// @access  Private/Admin
const deleteInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    await inventory.remove();
    res.status(200).json({ message: "Inventory item removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addInventory,
  getInventoryByBranch,
  updateInventory,
  deleteInventory,
};
