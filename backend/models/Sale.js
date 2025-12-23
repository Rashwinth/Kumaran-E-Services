const mongoose = require("mongoose");
const { Schema } = mongoose;

const saleItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  qty: { type: Number, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  taxAmount: { type: Number, required: true },
  lineTotal: { type: Number, required: true },
});

const individualSaleSchema = new Schema({
  billNumber: {
    type: String,
    required: true,
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: "Customer",
    required: true, // Now required to ensure clean data as per request
  },
  items: [saleItemSchema],
  subtotal: {
    type: Number,
    required: true,
  },
  totalTax: {
    type: Number,
    required: true,
  },
  grandTotal: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  staff: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["Completed", "Held", "Cancelled"],
    default: "Completed",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const saleSchema = new Schema(
  {
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    branch: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    sales: [individualSaleSchema],
    daySubtotal: {
      type: Number,
      default: 0,
    },
    dayTotalTax: {
      type: Number,
      default: 0,
    },
    dayGrandTotal: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

saleSchema.index({ date: 1, branch: 1 }, { unique: true });

module.exports = mongoose.model("Sale", saleSchema);
