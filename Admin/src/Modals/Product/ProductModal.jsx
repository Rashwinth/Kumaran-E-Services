import React, { useState, useEffect } from "react";
import { useProduct } from "../../Context/ProductContext";
import CategoryModal from "./CategoryModal";
import SubCategoryModal from "./SubCategoryModal";
import BarcodeInput from "../../Components/BarcodeInput";
import "../../Styles/ProductModal.css";

const ProductModal = ({ isOpen, onClose, productToEdit = null }) => {
  const {
    addProduct,
    updateProduct,
    categories,
    getCategories,
    getSubCategoriesByCategory,
  } = useProduct();

  const [loading, setLoading] = useState(false);
  const [subCategories, setSubCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    subCategory: "",
    unit: "pcs",
    price: "",
    gstType: "NotIncluded",
    commonGst: "0",
    brand: "",
    model: "",
  });

  // Modal states for adding Category/SubCategory
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] = useState(false);

  // Fetch categories on mount if not loaded
  useEffect(() => {
    if (isOpen && categories.length === 0) {
      getCategories();
    }
  }, [isOpen, categories.length, getCategories]);

  // Load product data when editing
  useEffect(() => {
    if (productToEdit) {
      // Calculate common GST from component parts if possible, or just take cgst * 2
      const cgst = productToEdit.gst?.cgst || 0;
      const sgst = productToEdit.gst?.sgst || 0;
      const commonGstVal = (cgst + sgst).toString();

      setFormData({
        name: productToEdit.name,
        sku: productToEdit.sku,
        category: productToEdit.category?._id || productToEdit.category,
        subCategory:
          productToEdit.subCategory?._id || productToEdit.subCategory,
        unit: productToEdit.unit,
        price: productToEdit.mrp,
        gstType: productToEdit.gstType,
        commonGst: commonGstVal,
        brand: productToEdit.brand || "",
        model: productToEdit.model || "",
      });
      // Fetch subcategories for the existing category
      if (productToEdit.category) {
        handleCategoryChange(
          productToEdit.category?._id || productToEdit.category,
          true
        );
      }
    } else {
      // Reset form
      setFormData({
        name: "",
        sku: "",
        category: "",
        subCategory: "",
        unit: "pcs",
        price: "",
        gstType: "NotIncluded",
        commonGst: "0",
        brand: "",
        model: "",
      });
      setSubCategories([]);
    }
  }, [productToEdit, isOpen]);

  const handleCategoryChange = async (
    categoryId,
    preserveSubCategory = false
  ) => {
    const subs = await getSubCategoriesByCategory(categoryId);
    setSubCategories(subs);

    if (!preserveSubCategory) {
      setFormData((prev) => ({
        ...prev,
        category: categoryId,
        subCategory: "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, category: categoryId }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "category") {
      handleCategoryChange(value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Split common GST
    const totalGst = Number(formData.commonGst) || 0;
    const splitGst = totalGst / 2;

    const payload = {
      name: formData.name,
      sku: formData.sku,
      category: formData.category,
      subCategory: formData.subCategory,
      unit: formData.unit,
      mrp: Number(formData.price),
      gstType: formData.gstType,
      gst: {
        cgst: splitGst,
        sgst: splitGst,
        isGstApplicable: formData.gstType !== "NotApplicable",
      },
      brand: formData.brand,
      model: formData.model,
    };

    try {
      if (productToEdit) {
        await updateProduct(productToEdit._id, payload);
      } else {
        await addProduct(payload);
      }
      onClose();
    } catch (error) {
      console.error("Form submission error", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="product-modal-overlay" onClick={onClose}>
        <div className="product-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{productToEdit ? "Edit Product" : "Add New Product"}</h2>
            <button className="close-btn" onClick={onClose}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="modal-body">
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Basmati Rice"
                  required
                />
              </div>

              <div className="form-group">
                <label>SKU / Barcode</label>
                <BarcodeInput
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Unit</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  required
                >
                  <option value="pcs">Pieces (pcs)</option>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="g">Gram (g)</option>
                  <option value="ltr">Liter (ltr)</option>
                  <option value="ml">Milliliter (ml)</option>
                  <option value="box">Box</option>
                  <option value="pkt">Packet (pkt)</option>
                  <option value="dozen">Dozen</option>
                  <option value="set">Set</option>
                </select>
              </div>

              <div className="form-group">
                <label>Category</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    style={{ flex: 1 }}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn-add-mini"
                    onClick={() => setIsCategoryModalOpen(true)}
                    title="Add New Category"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Sub Category</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <select
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleChange}
                    required
                    disabled={!formData.category}
                    style={{ flex: 1 }}
                  >
                    <option value="">Select Sub Category</option>
                    {subCategories.map((sub) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn-add-mini"
                    onClick={() => setIsSubCategoryModalOpen(true)}
                    disabled={!formData.category}
                    title="Add New SubCategory"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>MRP (Price)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label>Brand (Optional)</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="Brand Name"
                />
              </div>

              <div className="gst-section">
                <span className="section-title">GST Configuration</span>
                <div className="gst-grid">
                  <div className="form-group">
                    <label>GST Type</label>
                    <select
                      name="gstType"
                      value={formData.gstType}
                      onChange={handleChange}
                    >
                      <option value="NotIncluded">Excluded (Extra)</option>
                      <option value="Included">Included in MRP</option>
                      <option value="NotApplicable">Not Applicable</option>
                    </select>
                  </div>

                  {formData.gstType !== "NotApplicable" && (
                    <div
                      className="form-group"
                      style={{ gridColumn: "span 2" }}
                    >
                      <label>Total GST % (CGST + SGST)</label>
                      <input
                        type="number"
                        name="commonGst"
                        value={formData.commonGst}
                        onChange={handleChange}
                        min="0"
                        step="0.1"
                        placeholder="e.g. 18"
                      />
                      <small style={{ color: "#718096", fontSize: "0.75rem" }}>
                        Will be split into CGST:{" "}
                        {(Number(formData.commonGst) / 2).toFixed(1)}% and SGST:{" "}
                        {(Number(formData.commonGst) / 2).toFixed(1)}%
                      </small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>

          <div className="modal-footer">
            <button className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              className="btn-submit"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : productToEdit
                ? "Update Product"
                : "Add Product"}
            </button>
          </div>
        </div>
      </div>

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      <SubCategoryModal
        isOpen={isSubCategoryModalOpen}
        onClose={() => setIsSubCategoryModalOpen(false)}
        defaultCategoryId={formData.category}
      />
    </>
  );
};

export default ProductModal;
