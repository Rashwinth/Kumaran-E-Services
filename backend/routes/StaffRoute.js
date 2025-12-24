const express = require("express");
const router = express.Router();
const { createSale, getSales } = require("../controller/SalesController");
const { getMyBranchAccounts } = require("../controller/accountController");
const {
  getMyBranchCustomers,
  upsertCustomer,
  searchByPhone,
} = require("../controller/customerController");
const {  getInventoryByBranchStaff } = require("../controller/InventoryController");
const { protect } = require("../middleware/auth");
const {  getBranchBycode } = require("../controller/BranchController");
const { GetProdctBYBranch } = require("../controller/ProductController");

// Sales routes
router.post("/", protect, createSale);
router.get("/", protect, getSales);

// Inventory routes for staff
router.get("/inventory/my-branch", protect, getInventoryByBranchStaff);

// Account routes for staff
router.get("/accounts/my-branch", protect, getMyBranchAccounts);

// Customer routes for staff
router.get("/customers/my-branch", protect, getMyBranchCustomers);
router.post("/customers", protect, upsertCustomer);
router.get("/customers/search/:phone", protect, searchByPhone);

//get brabch products
router.get("/products/:BranchId", protect,GetProdctBYBranch );



//branch route
router.get("/Branch/:branchcode", protect,getBranchBycode );



module.exports = router;
