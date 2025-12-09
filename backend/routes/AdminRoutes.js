const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { register } = require("../controller/EmployeeController");
const {
  getAllBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  getBranchStats,
} = require("../controller/BranchController");

// Public routes
router.get("/", (req, res) => {
  res.send("Backend is running");
});

// Protected routes - Employee Management
router.post(
  "/registeremployee/:id",
  protect,
  authorize("admin", "manager"),
  register
);

// Protected routes - Branch Management
router.get(
  "/branches/stats",
  protect,
  authorize("admin", "manager"),
  getBranchStats
);
router.get("/branches", protect, authorize("admin", "manager"), getAllBranches);

router.post("/branches", protect, authorize("admin"), createBranch);
router.put("/branches/:id", protect, authorize("admin"), updateBranch);
router.delete("/branches/:id", protect, authorize("admin"), deleteBranch);

module.exports = router;
