const SubCategory = require("../models/SubCategory");

// @desc    Get all subcategories
// @route   GET /admin/subcategories
// @access  Private (Admin/Manager)
exports.getAllSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.find({ isActive: true })
      .populate("category", "name")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: subCategories.length,
      data: subCategories,
    });
  } catch (error) {
    console.error("Get subcategories error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching subcategories",
    });
  }
};

// @desc    Get subcategories by category ID
// @route   GET /admin/subcategories/category/:categoryId
// @access  Private (Admin/Manager)
exports.getSubCategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const subCategories = await SubCategory.find({
      category: categoryId,
      isActive: true,
    }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: subCategories.length,
      data: subCategories,
    });
  } catch (error) {
    console.error("Get subcategories by category error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching subcategories",
    });
  }
};

// @desc    Create new subcategory
// @route   POST /admin/subcategories
// @access  Private (Admin only)
exports.createSubCategory = async (req, res) => {
  try {
    const { name, category, description } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: "Please provide subcategory name and parent category",
      });
    }

    // Check if subcategory exists in this category
    const existingSub = await SubCategory.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      category: category,
    });

    if (existingSub) {
      return res.status(400).json({
        success: false,
        message: "Subcategory already exists in this category",
      });
    }

    const subCategory = await SubCategory.create({
      name,
      category,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Subcategory created successfully",
      data: subCategory,
    });
  } catch (error) {
    console.error("Create subcategory error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating subcategory",
    });
  }
};

// @desc    Update subcategory
// @route   PUT /admin/subcategories/:id
// @access  Private (Admin only)
exports.updateSubCategory = async (req, res) => {
  try {
    const { name, category, description } = req.body;
    const subCategoryId = req.params.id;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: "Please provide subcategory name and parent category",
      });
    }

    // Check if another subcategory with same name exists in this category
    const existingSub = await SubCategory.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      category: category,
      _id: { $ne: subCategoryId },
    });

    if (existingSub) {
      return res.status(400).json({
        success: false,
        message: "Subcategory name already exists in this category",
      });
    }

    const subCategory = await SubCategory.findByIdAndUpdate(
      subCategoryId,
      { name, category, description },
      { new: true, runValidators: true }
    );

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Subcategory updated successfully",
      data: subCategory,
    });
  } catch (error) {
    console.error("Update subcategory error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating subcategory",
    });
  }
};

// @desc    Delete subcategory
// @route   DELETE /admin/subcategories/:id
// @access  Private (Admin only)
exports.deleteSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id);

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    await subCategory.deleteOne();

    res.status(200).json({
      success: true,
      message: "Subcategory deleted successfully",
      data: {},
    });
  } catch (error) {
    console.error("Delete subcategory error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting subcategory",
    });
  }
};
