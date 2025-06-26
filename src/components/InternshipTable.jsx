import { useState, useEffect } from "react";
import "../styles/InternshipTable.css";
import { useToast } from '../context/ToastContext';

function InternshipTable() {
    const { addToast } = useToast();

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [buttonLoading, setButtonLoading] = useState({});

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/applications`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setApplications(data);
        } catch (error) {
            console.error("Error Fetching Applications:", error);
            addToast({ 
                title: 'Error', 
                body: error.message || "Failed to fetch applications" 
            }, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        setButtonLoading(prev => ({ ...prev, [id]: 'approve' }));
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/approve-application`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Approval failed");
            }

            const data = await response.json();
            addToast({ 
                title: 'Success', 
                body: data.message || 'Application approved successfully!' 
            }, 'success');
            fetchApplications();
        } catch (error) {
            console.error("Error Approving Application:", error);
            addToast({ 
                title: 'Error', 
                body: error.message || 'Failed to approve application' 
            }, 'error');
        } finally {
            setButtonLoading(prev => ({ ...prev, [id]: null }));
        }
    };

    const handleReject = async (id) => {
        const reason = window.prompt("Please enter the reason for rejection:");
        if (!reason || reason.trim().length < 5) {
            addToast({
                title: 'Warning',
                body: 'Please provide a valid reason (minimum 5 characters)'
            }, 'warning');
            return;
        }

        setButtonLoading(prev => ({ ...prev, [id]: 'reject' }));
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reject-application`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, reason }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Rejection failed");
            }

            const data = await response.json();
            addToast({ 
                title: 'Success', 
                body: data.message || 'Application rejected successfully!' 
            }, 'success');
            fetchApplications();
        } catch (error) {
            console.error("Error Rejecting Application:", error);
            addToast({ 
                title: 'Error', 
                body: error.message || 'Failed to reject application' 
            }, 'error');
        } finally {
            setButtonLoading(prev => ({ ...prev, [id]: null }));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this application?")) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/delete-application/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Deletion failed");
            }

            addToast({ 
                title: 'Success', 
                body: 'Application deleted successfully!' 
            }, 'success');
            fetchApplications();
        } catch (error) {
            console.error("Error Deleting Application:", error);
            addToast({ 
                title: 'Error', 
                body: error.message || 'Failed to delete application' 
            }, 'error');
        }
    };

    const handleDownload = (filePath, fileName) => {
        if (filePath && filePath.endsWith(".pdf")) {
            window.open(`${import.meta.env.VITE_API_URL}/${filePath}`, "_blank");
        } else {
            addToast({ 
                title: 'Error', 
                body: 'No PDF file available for download' 
            }, 'error');
        }
    };

    const filteredApplications = applications.filter(app => {
        const searchLower = searchTerm.toLowerCase();
        return (
            app.name?.toLowerCase().includes(searchLower) ||
            app.rollNumber?.toLowerCase().includes(searchLower) ||
            app.college?.toLowerCase().includes(searchLower) ||
            app.internshipInstitute?.toLowerCase().includes(searchLower) ||
            app.status?.toLowerCase().includes(searchLower)
        );
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredApplications.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    return (
        <div className="admin-container">
            <div className="admin-content">
                <h1 className="admin-heading">Internship Applications</h1>

                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search by name, roll number, college..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="table-controls">
                    <div className="items-per-page">
                        <label className="items-per-page-label">Show:</label>
                        <select
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            className="items-per-page-select"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                        <span className="items-per-page-label">entries</span>
                    </div>

                    {filteredApplications.length > itemsPerPage && (
                        <div className="pagination">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="pagination-button prev-next"
                            >
                                Previous
                            </button>
                            <div className="page-numbers">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                    <button
                                        key={number}
                                        onClick={() => handlePageChange(number)}
                                        className={`pagination-button number ${currentPage === number ? 'active' : ''}`}
                                    >
                                        {number}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="pagination-button prev-next"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="loading-spinner">Loading...</div>
                ) : (
                    <div className="applications-table-container">
                        {currentItems.length === 0 ? (
                            <div className="no-results">
                                No applications found matching your search criteria
                            </div>
                        ) : (
                            <table className="applications-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Roll No.</th>
                                        <th>College</th>
                                        <th>Institute</th>
                                        <th className="date-col">Dates</th>
                                        <th>Status</th>
                                        <th className="action-col">Approve</th>
                                        <th className="action-col">Reject</th>
                                        <th className="action-col">Del</th>
                                        <th className="action-col">PDF</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((app) => (
                                        <tr key={app._id}>
                                            <td>{app.name}</td>
                                            <td>{app.rollNumber}</td>
                                            <td>{app.college}</td>
                                            <td>{app.internshipInstitute}</td>
                                            <td className="date-col">
                                                {new Date(app.startDate).toLocaleDateString()} -{" "}
                                                {new Date(app.endDate).toLocaleDateString()}
                                            </td>
                                            <td>
                                                <span className={`status-badge ${app.status.toLowerCase()}`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="action-col">
                                                {app.status !== "Approved" && (
                                                    <button
                                                        className="action-btn approve-btn"
                                                        onClick={() => handleApprove(app._id)}
                                                        disabled={buttonLoading[app._id] === 'approve'}
                                                    >
                                                        {buttonLoading[app._id] === 'approve' ? (
                                                            <span className="spinner"></span>
                                                        ) : 'Approve'}
                                                    </button>
                                                )}
                                            </td>
                                            <td className="action-col">
                                                {app.status !== "Rejected" && (
                                                    <button
                                                        className="action-btn reject-btn"
                                                        onClick={() => handleReject(app._id)}
                                                        disabled={buttonLoading[app._id] === 'reject'}
                                                    >
                                                        {buttonLoading[app._id] === 'reject' ? (
                                                            <span className="spinner"></span>
                                                        ) : 'Reject'}
                                                    </button>
                                                )}
                                            </td>
                                            <td className="action-col">
                                                <button
                                                    className="action-btn delete-btn"
                                                    onClick={() => handleDelete(app._id)}
                                                >
                                                    Del
                                                </button>
                                            </td>
                                            <td className="action-col">
                                                <button
                                                    className="action-btn download-btn"
                                                    onClick={() =>
                                                        handleDownload(app.offerLetterPath, `${app.name}_offer_letter.pdf`)
                                                    }
                                                    disabled={!app.offerLetterPath}
                                                >
                                                    {app.offerLetterPath ? 'Dow.' : 'N/A'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                .spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid white;
                    border-top: 2px solid transparent;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                    display: inline-block;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .no-results {
                    padding: 20px;
                    text-align: center;
                    font-size: 1.1rem;
                    color: #666;
                }
            `}</style>
        </div>
    );
}

export default InternshipTable;