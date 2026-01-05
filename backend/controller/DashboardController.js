const Branch = require("../models/Branch");
const Sale = require("../models/Sale");
const Customer = require("../models/Customer");
// const Account = require("../models/Accounts");
const Inventory = require("../models/Inventory");
// const User = require("../models/user");

// Helper to get date string YYYY-MM-DD
const formatDate = (date) => date.toISOString().slice(0, 10);

// Helper to calculate percentage change
const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
};

// @desc    Get dashboard statistics
// @route   GET /admin/dashboard/stats
// @access  Private (Admin/Manager)
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const dateKey = formatDate(today);

    // --- Date Ranges ---
    const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    const thisMonthStartStr = formatDate(startOfThisMonth);
    const lastMonthStartStr = formatDate(startOfLastMonth);
    const lastMonthEndStr = formatDate(endOfLastMonth);

    // 1. Core Counts & Growth
    const totalUsers = await Customer.countDocuments();
    const newUsersThisMonth = await Customer.countDocuments({
      createdAt: { $gte: startOfThisMonth },
    });
    const newUsersLastMonth = await Customer.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    });
    const userGrowth = calculatePercentageChange(
      newUsersThisMonth,
      newUsersLastMonth
    );

    // 2. Revenue & Bills (Aggregated)
    const statsResult = await Sale.aggregate([
      {
        $facet: {
          thisMonth: [
            { $match: { date: { $gte: thisMonthStartStr } } },
            {
              $group: {
                _id: null,
                revenue: { $sum: "$dayGrandTotal" },
                bills: {
                  $sum: {
                    $cond: [{ $isArray: "$sales" }, { $size: "$sales" }, 0],
                  },
                },
              },
            },
          ],
          lastMonth: [
            {
              $match: {
                date: { $gte: lastMonthStartStr, $lte: lastMonthEndStr },
              },
            },
            {
              $group: {
                _id: null,
                revenue: { $sum: "$dayGrandTotal" },
                bills: {
                  $sum: {
                    $cond: [{ $isArray: "$sales" }, { $size: "$sales" }, 0],
                  },
                },
              },
            },
          ],
          allTime: [
            {
              $group: {
                _id: null,
                total: { $sum: "$dayGrandTotal" },
                totalBills: {
                  $sum: {
                    $cond: [{ $isArray: "$sales" }, { $size: "$sales" }, 0],
                  },
                },
              },
            },
          ],
          trend: [
            { $sort: { date: -1 } },
            { $limit: 7 },
            { $project: { date: 1, revenue: "$dayGrandTotal" } },
          ],
        },
      },
    ]);

    const stats = statsResult[0] || {};
    const revenueThisMonth = stats.thisMonth?.[0]?.revenue || 0;
    const billsThisMonth = stats.thisMonth?.[0]?.bills || 0;
    const revenueLastMonth = stats.lastMonth?.[0]?.revenue || 0;
    const billsLastMonth = stats.lastMonth?.[0]?.bills || 0;
    const totalRevenue = stats.allTime?.[0]?.total || 0;
    const totalBills = stats.allTime?.[0]?.totalBills || 0;
    const revenueTrend = (stats.trend || []).reverse();

    const revenueGrowth = calculatePercentageChange(
      revenueThisMonth,
      revenueLastMonth
    );
    const billsGrowth = calculatePercentageChange(
      billsThisMonth,
      billsLastMonth
    );

    // 3. Today's Branch Stats & Payment Split
    const branches = await Branch.find({ status: "Active" }).select(
      "name code status"
    );
    const todaysSales = await Sale.find({ date: dateKey })
      .populate("branch", "code name")
      .populate({ path: "sales.paymentMethod", select: "type" });

    let paymentSplit = { Cash: 0, Online: 0 };
    const branchStats = branches.map((branch) => {
      const branchSale = todaysSales.find(
        (s) => s.branch && s.branch.code === branch.code
      );
      return {
        id: branch._id,
        name: branch.name,
        code: branch.code,
        revenue: branchSale ? branchSale.dayGrandTotal : 0,
        bills: branchSale
          ? Array.isArray(branchSale.sales)
            ? branchSale.sales.length
            : 0
          : 0,
        status: branch.status,
      };
    });

    todaysSales.forEach((dayRecord) => {
      if (Array.isArray(dayRecord.sales)) {
        dayRecord.sales.forEach((s) => {
          const amount = Number(s.grandTotal) || 0;
          if (s.paymentMethod?.type === "Cash") {
            paymentSplit.Cash += amount;
          } else {
            paymentSplit.Online += amount;
          }
        });
      }
    });

    // 4. Top Products (Monthly)
    const productStats = await Sale.aggregate([
      { $match: { date: { $gte: thisMonthStartStr } } },
      { $unwind: { path: "$sales", preserveNullAndEmptyArrays: false } },
      { $unwind: { path: "$sales.items", preserveNullAndEmptyArrays: false } },
      {
        $group: {
          _id: "$sales.items.product",
          totalQty: { $sum: "$sales.items.qty" },
          revenue: { $sum: "$sales.items.lineTotal" },
        },
      },
      { $sort: { totalQty: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
    ]);

    const topProducts = productStats.map((p) => ({
      name: p.productInfo?.[0]?.name || "Unknown Product",
      qty: p.totalQty || 0,
      revenue: p.revenue || 0,
    }));

    // 5. Low Stock
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ["$quantity", "$lowStockThreshold"] },
    })
      .populate("product", "name sku unit")
      .populate("branch", "name")
      .limit(5);

    // 5. Recent Transactions
    const recentSalesRecords = await Sale.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("sales.customer", "name")
      .populate("branch", "name");

    const recentTransactions = [];
    recentSalesRecords.forEach((dayRecord) => {
      if (Array.isArray(dayRecord.sales)) {
        dayRecord.sales.slice(-5).forEach((s) => {
          recentTransactions.push({
            billNumber: s.billNumber || "N/A",
            customer: s.customer?.name || "Walk-in",
            amount: s.grandTotal || 0,
            branch: dayRecord.branch?.name || "Unknown",
            time: s.createdAt,
          });
        });
      }
    });
    recentTransactions.sort((a, b) => new Date(b.time) - new Date(a.time));

    // 6. Top Staff (Monthly)
    const staffStats = await Sale.aggregate([
      { $match: { date: { $gte: thisMonthStartStr } } },
      { $unwind: { path: "$sales", preserveNullAndEmptyArrays: false } },
      {
        $group: {
          _id: "$sales.staff",
          totalSales: { $sum: "$sales.grandTotal" },
          billCount: { $sum: 1 },
        },
      },
      { $sort: { totalSales: -1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "staffInfo",
        },
      },
    ]);

    const topStaff = staffStats.map((s) => ({
      name: s.staffInfo?.[0]?.name || "Unknown",
      revenue: s.totalSales || 0,
      bills: s.billCount || 0,
    }));

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        userGrowth,
        totalRevenue,
        revenueGrowth,
        totalBills,
        billsGrowth,
        todayTotalRevenue: branchStats.reduce((sum, b) => sum + b.revenue, 0),
        todayTotalBills: branchStats.reduce((sum, b) => sum + b.bills, 0),
        branchStats,
        revenueTrend,
        paymentSplit,
        topProducts,
        lowStockCount: lowStockItems.length,
        lowStockItems: lowStockItems.map((i) => ({
          name: i.product?.name,
          branch: i.branch?.name,
          qty: i.quantity,
          threshold: i.lowStockThreshold,
        })),
        recentTransactions: recentTransactions.slice(0, 5),
        topStaff,
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard statistics",
    });
  }
};
