import React from "react";
import "../Styles/UniversalDelete.css";

const UniversalDelete = ({
  isOpen,
  onClose,
  onDelete,
  title = "Delete Item",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  itemName = "",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="universal-delete-overlay">
      <div
        className="universal-delete-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-warning">
          <div className="warning-icon-wrapper">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </div>
          <h3>{title}</h3>
        </div>

        <div className="modal-body">
          <p>
            {message}
            {itemName && <span className="delete-item-name">{itemName}</span>}
          </p>
        </div>

        <div className="modal-footer">
          <button
            className="modal-btn cancel-btn"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="modal-btn delete-confirm-btn"
            onClick={onDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-sm"></span>
                Deleting...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
                  <line x1="18" y1="9" x2="12" y2="15"></line>
                  <line x1="12" y1="9" x2="18" y2="15"></line>
                </svg>
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UniversalDelete;
