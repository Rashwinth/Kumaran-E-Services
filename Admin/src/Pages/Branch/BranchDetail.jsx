import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "../../Styles/BranchDetail.css";

// Sample hardcoded data (same as Branch.jsx)
const branchesData = [
  {
    _id: "1",
    name: "Main Branch",
    code: "MB001",
    address: {
      street: "123 Main Street",
      city: "Chennai",
      state: "Tamil Nadu",
      country: "India",
      pincode: "600001",
    },
    contact: {
      phone: "9876543210",
      email: "main@kumaran.com",
    },
    gstNumber: "33AAAAA0000A1Z5",
    status: "Active",
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    _id: "2",
    name: "North Branch",
    code: "NB002",
    address: {
      street: "456 North Avenue",
      city: "Coimbatore",
      state: "Tamil Nadu",
      country: "India",
      pincode: "641001",
    },
    contact: {
      phone: "9876543211",
      email: "north@kumaran.com",
    },
    gstNumber: "33BBBBB0000B1Z5",
    status: "Active",
    createdAt: "2024-02-20T14:20:00Z",
  },
  {
    _id: "3",
    name: "South Branch",
    code: "SB003",
    address: {
      street: "789 South Road",
      city: "Madurai",
      state: "Tamil Nadu",
      country: "India",
      pincode: "625001",
    },
    contact: {
      phone: "9876543212",
      email: "south@kumaran.com",
    },
    gstNumber: "33CCCCC0000C1Z5",
    status: "Inactive",
    createdAt: "2024-03-10T09:15:00Z",
  },
];

const BranchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [branch, setBranch] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const foundBranch = branchesData.find((b) => b._id === id);
    if (foundBranch) {
      setBranch(foundBranch);
      setFormData(foundBranch);
    } else {
      navigate("/branch");
    }
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = () => {
    setBranch(formData);
    setIsEditing(false);
    // Here you would normally save to backend
  };

  const handleCancel = () => {
    setFormData(branch);
    setIsEditing(false);
  };

  if (!branch) return null;

  return (
    <div className="branch-detail-container">
      <div className="branch-detail-header">
        <div className="header-left">
          <Link to="/branch" className="back-button">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 12H5M5 12L12 19M5 12L12 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to Branches
          </Link>
          <div className="branch-title">
            <h1>{branch.name}</h1>
            <span className={`status-badge ${branch.status.toLowerCase()}`}>
              {branch.status}
            </span>
          </div>
        </div>
        <div className="header-actions">
          {!isEditing ? (
            <>
              <Link
                to={`/branch/${id}/add-employee`}
                className="add-employee-button"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M20 8V14M23 11H17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Add Employee
              </Link>
              <button
                className="edit-button"
                onClick={() => setIsEditing(true)}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M18.5 2.50023C18.8978 2.1024 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Edit Branch
              </button>
            </>
          ) : (
            <>
              <button className="cancel-button" onClick={handleCancel}>
                Cancel
              </button>
              <button className="save-button" onClick={handleSave}>
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      <div className="branch-detail-content">
        <div className="detail-section">
          <h2>Branch Information</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Branch Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              ) : (
                <p>{branch.name}</p>
              )}
            </div>
            <div className="detail-item">
              <label>Branch Code</label>
              {isEditing ? (
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                />
              ) : (
                <p>{branch.code}</p>
              )}
            </div>
            <div className="detail-item">
              <label>GST Number</label>
              {isEditing ? (
                <input
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleInputChange}
                />
              ) : (
                <p>{branch.gstNumber}</p>
              )}
            </div>
            <div className="detail-item">
              <label>Status</label>
              {isEditing ? (
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              ) : (
                <p>{branch.status}</p>
              )}
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h2>Address</h2>
          <div className="detail-grid">
            <div className="detail-item full-width">
              <label>Street Address</label>
              {isEditing ? (
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                />
              ) : (
                <p>{branch.address.street}</p>
              )}
            </div>
            <div className="detail-item">
              <label>City</label>
              {isEditing ? (
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                />
              ) : (
                <p>{branch.address.city}</p>
              )}
            </div>
            <div className="detail-item">
              <label>State</label>
              {isEditing ? (
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                />
              ) : (
                <p>{branch.address.state}</p>
              )}
            </div>
            <div className="detail-item">
              <label>Country</label>
              {isEditing ? (
                <input
                  type="text"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleInputChange}
                />
              ) : (
                <p>{branch.address.country}</p>
              )}
            </div>
            <div className="detail-item">
              <label>Pincode</label>
              {isEditing ? (
                <input
                  type="text"
                  name="address.pincode"
                  value={formData.address.pincode}
                  onChange={handleInputChange}
                />
              ) : (
                <p>{branch.address.pincode}</p>
              )}
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h2>Contact Information</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="contact.phone"
                  value={formData.contact.phone}
                  onChange={handleInputChange}
                />
              ) : (
                <p>{branch.contact.phone}</p>
              )}
            </div>
            <div className="detail-item">
              <label>Email</label>
              {isEditing ? (
                <input
                  type="email"
                  name="contact.email"
                  value={formData.contact.email}
                  onChange={handleInputChange}
                />
              ) : (
                <p>{branch.contact.email}</p>
              )}
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h2>Branch Analytics</h2>
          <div className="analytics-grid">
            <div className="analytics-card">
              <div className="analytics-icon revenue">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="analytics-info">
                <h3>Today's Revenue</h3>
                <p className="analytics-value">₹45,678</p>
                <span className="analytics-change positive">
                  +12% from yesterday
                </span>
              </div>
            </div>

            <div className="analytics-card">
              <div className="analytics-icon orders">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 16V8C20.9996 7.64927 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="analytics-info">
                <h3>Total Bills</h3>
                <p className="analytics-value">124</p>
                <span className="analytics-change positive">
                  +8% from yesterday
                </span>
              </div>
            </div>

            <div className="analytics-card">
              <div className="analytics-icon customers">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="analytics-info">
                <h3>Active Customers</h3>
                <p className="analytics-value">342</p>
                <span className="analytics-change neutral">No change</span>
              </div>
            </div>

            <div className="analytics-card">
              <div className="analytics-icon inventory">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 16V8C20.9996 7.64927 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="analytics-info">
                <h3>Inventory Items</h3>
                <p className="analytics-value">1,245</p>
                <span className="analytics-change negative">
                  -3% from last week
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <div className="section-header">
            <h2>Branch Products</h2>
            <Link to="/products" className="view-all-link">
              View All Products →
            </Link>
          </div>
          <div className="products-grid">
            <div className="product-card">
              <div className="product-info">
                <h4>Basmati Rice</h4>
                <p className="product-category">Groceries</p>
                <p className="product-price">₹120/kg</p>
              </div>
              <div className="product-stock">
                <span className="stock-badge in-stock">In Stock</span>
                <p className="stock-quantity">250 units</p>
              </div>
            </div>

            <div className="product-card">
              <div className="product-info">
                <h4>Toor Dal</h4>
                <p className="product-category">Groceries</p>
                <p className="product-price">₹95/kg</p>
              </div>
              <div className="product-stock">
                <span className="stock-badge in-stock">In Stock</span>
                <p className="stock-quantity">180 units</p>
              </div>
            </div>

            <div className="product-card">
              <div className="product-info">
                <h4>Sunflower Oil</h4>
                <p className="product-category">Groceries</p>
                <p className="product-price">₹145/ltr</p>
              </div>
              <div className="product-stock">
                <span className="stock-badge in-stock">In Stock</span>
                <p className="stock-quantity">120 units</p>
              </div>
            </div>

            <div className="product-card">
              <div className="product-info">
                <h4>Sugar</h4>
                <p className="product-category">Groceries</p>
                <p className="product-price">₹42/kg</p>
              </div>
              <div className="product-stock">
                <span className="stock-badge low-stock">Low Stock</span>
                <p className="stock-quantity">15 units</p>
              </div>
            </div>

            <div className="product-card">
              <div className="product-info">
                <h4>Wheat Flour</h4>
                <p className="product-category">Groceries</p>
                <p className="product-price">₹38/kg</p>
              </div>
              <div className="product-stock">
                <span className="stock-badge in-stock">In Stock</span>
                <p className="stock-quantity">300 units</p>
              </div>
            </div>

            <div className="product-card">
              <div className="product-info">
                <h4>Tea Powder</h4>
                <p className="product-category">Beverages</p>
                <p className="product-price">₹280/kg</p>
              </div>
              <div className="product-stock">
                <span className="stock-badge in-stock">In Stock</span>
                <p className="stock-quantity">85 units</p>
              </div>
            </div>

            <div className="product-card">
              <div className="product-info">
                <h4>Coffee Powder</h4>
                <p className="product-category">Beverages</p>
                <p className="product-price">₹420/kg</p>
              </div>
              <div className="product-stock">
                <span className="stock-badge in-stock">In Stock</span>
                <p className="stock-quantity">60 units</p>
              </div>
            </div>

            <div className="product-card">
              <div className="product-info">
                <h4>Milk Powder</h4>
                <p className="product-category">Dairy</p>
                <p className="product-price">₹350/kg</p>
              </div>
              <div className="product-stock">
                <span className="stock-badge out-of-stock">Out of Stock</span>
                <p className="stock-quantity">0 units</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchDetail;
