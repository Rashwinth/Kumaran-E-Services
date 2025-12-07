import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../Styles/Branch.css";

// Sample hardcoded data based on Branch model
const initialBranches = [
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

const Branch = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState(initialBranches);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "India",
      pincode: "",
    },
    contact: {
      phone: "",
      email: "",
    },
    gstNumber: "",
    status: "Active",
  });

  const handleOpenModal = (mode, branch = null) => {
    setModalMode(mode);
    setSelectedBranch(branch);
    if (branch) {
      setFormData(branch);
    } else {
      setFormData({
        name: "",
        code: "",
        address: {
          street: "",
          city: "",
          state: "",
          country: "India",
          pincode: "",
        },
        contact: {
          phone: "",
          email: "",
        },
        gstNumber: "",
        status: "Active",
      });
    }
    setShowModal(true);
  };

  const handleViewBranch = (branchId) => {
    navigate(`/branch/${branchId}`);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBranch(null);
  };

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalMode === "add") {
      const newBranch = {
        ...formData,
        _id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      setBranches([...branches, newBranch]);
    } else if (modalMode === "edit") {
      setBranches(
        branches.map((branch) =>
          branch._id === selectedBranch._id
            ? { ...formData, _id: branch._id }
            : branch
        )
      );
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this branch?")) {
      setBranches(branches.filter((branch) => branch._id !== id));
    }
  };

  return (
    <div className="branch-container">
      <div className="branch-header">
        <h1>Branch Management</h1>
        <button
          className="add-branch-btn"
          onClick={() => handleOpenModal("add")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 5V19M5 12H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Add New Branch
        </button>
      </div>

      <div className="branch-grid">
        {branches.map((branch) => (
          <div key={branch._id} className="branch-card">
            <div className="branch-card-header">
              <div>
                <h3>{branch.name}</h3>
                <span className="branch-code">{branch.code}</span>
              </div>
              <span className={`status-badge ${branch.status.toLowerCase()}`}>
                {branch.status}
              </span>
            </div>

            <div className="branch-card-body">
              <div className="branch-info">
                <div className="info-item">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div>
                    <p className="info-label">Address</p>
                    <p className="info-value">
                      {branch.address.street}, {branch.address.city}
                    </p>
                    <p className="info-value-small">
                      {branch.address.state}, {branch.address.pincode}
                    </p>
                  </div>
                </div>

                <div className="info-item">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.18C2.095 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 2H7.10999C7.5953 1.99522 8.06579 2.16708 8.43376 2.48353C8.80173 2.79999 9.04207 3.23945 9.10999 3.72C9.23662 4.68007 9.47144 5.62273 9.80999 6.53C9.94454 6.88792 9.97366 7.27691 9.8939 7.65088C9.81415 8.02485 9.62886 8.36811 9.35999 8.64L8.08999 9.91C9.51355 12.4135 11.5864 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div>
                    <p className="info-label">Contact</p>
                    <p className="info-value">{branch.contact.phone}</p>
                    <p className="info-value-small">{branch.contact.email}</p>
                  </div>
                </div>

                <div className="info-item">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 2V8H20"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div>
                    <p className="info-label">GST Number</p>
                    <p className="info-value">{branch.gstNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="branch-card-footer">
              <button
                className="btn-view"
                onClick={() => handleViewBranch(branch._id)}
              >
                View Details
              </button>
              <button
                className="btn-edit"
                onClick={() => handleOpenModal("edit", branch)}
              >
                Edit
              </button>
              <button
                className="btn-delete"
                onClick={() => handleDelete(branch._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalMode === "add" ? "Add New Branch" : "Edit Branch"}</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Branch Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Branch Code *</label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Street Address</label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Pincode</label>
                    <input
                      type="text"
                      name="address.pincode"
                      value={formData.address.pincode}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="contact.phone"
                      value={formData.contact.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="contact.email"
                      value={formData.contact.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>GST Number</label>
                    <input
                      type="text"
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Status *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {modalMode === "add" ? "Add Branch" : "Update Branch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branch;
