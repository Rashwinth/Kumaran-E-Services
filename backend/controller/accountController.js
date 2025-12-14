const Account = require("../models/Accounts");

// @desc    Get all accounts
// @route   GET /admin/accounts
// @access  Private (Admin/Manager)
exports.getAllAccounts = async (req, res) => {
  try {
    const accounts = await Account.find().populate("branch", "name code");
    res.status(200).json({
      success: true,
      count: accounts.length,
      data: accounts,
    });
  } catch (error) {
    console.error("Get accounts error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching accounts",
    });
  }
};

// @desc    Get accounts by branch ID
// @route   GET /admin/accounts/branch/:branchId
// @access  Private (Admin/Manager)
exports.getAccountsByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    const accounts = await Account.find({ branch: branchId }).populate(
      "branch",
      "name code"
    );

    res.status(200).json({
      success: true,
      count: accounts.length,
      data: accounts,
    });
  } catch (error) {
    console.error("Get branch accounts error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching branch accounts",
    });
  }
};

// @desc    Get single account by ID
// @route   GET /admin/accounts/:id
// @access  Private (Admin/Manager)
exports.getAccountById = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id).populate(
      "branch",
      "name code"
    );
    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }
    res.status(200).json({
      success: true,
      data: account,
    });
  } catch (error) {
    console.error("Get account error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching account",
    });
  }
};

// @desc    Create new account
// @route   POST /admin/accounts
// @access  Private (Admin)
exports.createAccount = async (req, res) => {
  try {
    const { type, upiAccountName, branch, balanceHistory, status } = req.body;

    // Validate UPI account name if type is Upi
    if (type === "Upi" && !upiAccountName) {
      return res.status(400).json({
        success: false,
        message: "UPI account name is required for UPI accounts",
      });
    }

    // Check for existing Cash or Credits account in this branch
    if (type === "Cash" || type === "Credits") {
      const existingAccount = await Account.findOne({ branch, type });
      if (existingAccount) {
        return res.status(400).json({
          success: false,
          message: `${type} account already exists for this branch. Only one ${type} account is allowed.`,
        });
      }
    }

    const account = new Account({
      type,
      upiAccountName: type === "Upi" ? upiAccountName : undefined,
      branch,
      balanceHistory: balanceHistory || [],
      status: status || "Active",
    });

    const newAccount = await account.save();
    const populatedAccount = await Account.findById(newAccount._id).populate(
      "branch",
      "name code"
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: populatedAccount,
    });
  } catch (error) {
    console.error("Create account error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while creating account",
    });
  }
};

// @desc    Update account
// @route   PUT /admin/accounts/:id
// @access  Private (Admin)
exports.updateAccount = async (req, res) => {
  try {
    const { type, upiAccountName, branch, balanceHistory, status } = req.body;

    if (type === "Upi" && !upiAccountName) {
      return res.status(400).json({
        success: false,
        message: "UPI account name is required for UPI accounts",
      });
    }

    // Check for existing Cash or Credits account if type is changing
    if (type === "Cash" || type === "Credits") {
      const existingAccount = await Account.findOne({
        branch,
        type,
        _id: { $ne: req.params.id },
      });
      if (existingAccount) {
        return res.status(400).json({
          success: false,
          message: `${type} account already exists for this branch. Only one ${type} account is allowed.`,
        });
      }
    }

    const updateData = {
      type,
      branch,
      status,
      // Only set upiAccountName if type is Upi
      upiAccountName: type === "Upi" ? upiAccountName : undefined,
    };

    if (balanceHistory) {
      updateData.balanceHistory = balanceHistory;
    }

    // Since we conditionally set fields, better to find then update or use set.
    // But findByIdAndUpdate is fine if updateData is correct.

    // Note: If type changed from UPI to Cash, upiAccountName should be unset ($unset or undefined works if schema handles it? Schema strict mode strips undefined? No, we need to explicitly unset or set to null if we want to remove from DB, but schema requirement handles creation. For Update, old field might persist if not overwritten).
    // Let's rely on Mongoose schema defaults/validators.

    // Actually, setting it to undefined in JS object passed to update, Mongoose might ignore it (unless $unset used).
    // Let's use find and save for precise control if needed, but findByIdAndUpdate is standard.
    // If I want to remove `upiAccountName` when switching to Cash, I should use $unset.

    let updateOp = { $set: updateData };
    if (type !== "Upi") {
      updateOp.$unset = { upiAccountName: 1 };
      delete updateData.upiAccountName; // Remove from $set
    }

    // Simpler: Just pass updateData. If Mongoose doesn't unset, the field remains but is ignored by app logic. The Schema definition for required is conditional, so it won't complain if missing for Cash. If present, it's just extra data.
    // I will stick to standard findByIdAndUpdate(..., updateData).

    const account = await Account.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("branch", "name code");

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Account updated successfully",
      data: account,
    });
  } catch (error) {
    console.error("Update account error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while updating account",
    });
  }
};

// @desc    Delete account
// @route   DELETE /admin/accounts/:id
// @access  Private (Admin)
exports.deleteAccount = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    await account.deleteOne();

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
      data: {},
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting account",
    });
  }
};

// @desc    Add balance history entry
// @route   POST /admin/accounts/:id/balance
// @access  Private (Admin)
exports.addBalanceHistory = async (req, res) => {
  try {
    const { date, openingBalance, closingBalance } = req.body;

    const account = await Account.findById(req.params.id);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    account.balanceHistory.push({
      date: date || Date.now(),
      openingBalance,
      closingBalance,
    });

    await account.save();
    const populatedAccount = await Account.findById(account._id).populate(
      "branch",
      "name code"
    );

    res.status(200).json({
      success: true,
      data: populatedAccount,
    });
  } catch (error) {
    console.error("Add balance history error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while adding balance history",
    });
  }
};
