const User = require("../models/user");

exports.register = async (req, res) => {
  try {
    const { name, email, phone, age, password, role, branchCode, branchId } =
      req.body;

    if (!name || !email || !phone || !age || !password || !branchCode) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({
          success: false,
          message: "Email already registered",
        });
      }
      if (existingUser.phone === phone) {
        return res.status(400).json({
          success: false,
          message: "Phone number already registered",
        });
      }
    }

    const user = await User.create({
      name,
      email,
      phone,
      age,
      password,
      role: role || "staff",
      branchCode,
    });

    res.status(201).json({
      success: true,
      message: "Employee registered successfully",
      employee: {
        id: user._id,
        name: user.name,
        email: user.email,
        employeeId: user.employeeId,
        phone: user.phone,
        age: user.age,
        role: user.role,
        branchCode: user.branchCode,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0],
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};
