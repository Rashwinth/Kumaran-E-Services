import React from "react";

const SaleHistoryPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="d-flex justify-content-center  align-items-center mt-4 bg-white p-3 rounded-4 shadow-sm border border-secondary border-opacity-10">
      <nav aria-label="Page navigation text-center d-flex justify-content-center align-items-center ">
        <ul className="pagination fs-5 mb-0 gap-3 ">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link rounded-3 border-0 bg-light text-dark shadow-none"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
<i class="fa-sharp-duotone fa-solid fa-angles-left"></i>            </button>
          </li>

          {getPageNumbers().map((page, index) => (
            <li
              key={index}
              className={`page-item fw-2 ${
                page === currentPage ? "active" : ""
              } ${page === "..." ? "disabled" : ""}`}
            >
              <button
                className={`page-link rounded-3 border-0 ${
                  page === currentPage
                    ? "bg-primary text-white"
                    : "bg-light text-dark"
                } shadow-none`}
                onClick={() => typeof page === "number" && onPageChange(page)}
              >
                {page}
              </button>
            </li>
          ))}

          <li
            className={`page-item ${
              currentPage === totalPages ? "disabled" : ""
            }`}
          >
            <button
              className="page-link rounded-3 border-0 bg-light text-dark shadow-none"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
<i className="fa-sharp-duotone fa-solid fa-angles-right"></i>            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default SaleHistoryPagination;
