const Customer = require("../models/customerModel");
const Branch = require("../models/Branch");

// @desc    Get all customers for a branch
// @route   GET /api/customers/my-branch
// @access  Private (Staff/Admin)
exports.getMyBranchCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({
      branchCode: req.user.branchCode,
    }).sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create/Update customer
// @route   POST /api/customers
// @access  Private (Staff/Admin)
exports.upsertCustomer = async (req, res) => {
  try {
    const { name, phone, city } = req.body;

    // Find branch
    const branch = await Branch.findOne({ code: req.user.branchCode });
    if (!branch) {
      return res
        .status(404)
        .json({ success: false, message: "Branch not found" });
    }

    // Try to find by phone within the same branch
    let customer = await Customer.findOne({
      phone,
      branchCode: req.user.branchCode,
    });

    if (customer) {
      customer.name = name;
      customer.city = city;
      await customer.save();
    } else {
      customer = await Customer.create({
        name,
        phone,
        city,
        branch: branch._id,
        branchCode: req.user.branchCode,
      });
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Search customers by phone
// @route   GET /api/customers/search/:phone
// @access  Private
exports.searchByPhone = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      phone: req.params.phone,
      branchCode: req.user.branchCode,
    });

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
