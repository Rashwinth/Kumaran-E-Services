import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ViewEmployee from "../../Components/Employee/viewEmployee";
import "../../Styles/Employee.css";
import { useBranch } from "../../Context/BranchContext";

const Employee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [branch, setBranch] = useState("");
  const { branches, getBranches } = useBranch();

  useEffect(() => {
    if (branches.length === 0) {
      getBranches();
    } else {
      const foundBranch = branches.find((b) => b._id === id);
      if (foundBranch) {
        setBranch(foundBranch);
      }
    }
  }, [branches, id, getBranches]);

  // Handler to switch to add view
  const handleAddClick = () => {
    navigate(`/branch/${id}/employee/add-employee`);
  };

  return (
    <div className="employee-page-main">
      <div className="header-left">
        <Link to={`/branch/${branch._id}`} className="back-button">
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
          Back to Branch
        </Link>
      </div>

      <div className="view-employee-header">
        <div className="header-title-section">
          <div className="header-icon">
            <i className="bi bi-people-fill"></i>
          </div>
          <div>
            <h1>{branch.name} Employees</h1>
          </div>
        </div>

        <button className="add-btn" onClick={handleAddClick}>
          <i className="bi bi-person-plus-fill"></i>
          Add Employee
        </button>
      </div>
      <ViewEmployee BranchCode={branch.code} />
    </div>
  );
};

export default Employee;
