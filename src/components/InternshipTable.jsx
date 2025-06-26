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
            const data = await response.json();
            setApplications(data);
            setLoading(false);
        } catch (error) {
            console.error("Error Fetching Applications:", error);
            addToast({ title: 'Error', body: "Failed To Fetch !" }, 'error');
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        setButtonLoading(prev => ({ ...prev, [id]: 'approve' }));
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/approve-application/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });

            const data = await response.json();
            if (data.success) {
                addToast({ title: 'Success', body: 'Application Approval Success !' }, 'success');
                fetchApplications();
            } else {
                addToast({ title: 'Error', body: 'Application Approval Failed !' }, 'error');
            }
        } catch (error) {
            console.error("Error Approving Application:", error);
            addToast({ title: 'Error', body: 'Application Approval Failed !' }, 'error');
        } finally {
            setButtonLoading(prev => ({ ...prev, [id]: null }));
        }
    };

    const handleReject = async (id) => {
        const reason = prompt("Enter reason for rejection:");
        if (!reason) return;

        setButtonLoading(prev => ({ ...prev, [id]: 'reject' }));
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reject-application/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason }),
            });

            const data = await response.json();
            if (data.success) {
                addToast({ title: 'Success', body: 'Application Rejection Success !' }, 'success');
                fetchApplications();
            } else {
                addToast({ title: 'Error', body: 'Application Rejection Failed !' }, 'error');
            }
        } catch (error) {
            console.error("Error Rejecting Application:", error);
            addToast({ title: 'Error', body: 'Application Rejection Failed !' }, 'error');
        } finally {
            setButtonLoading(prev => ({ ...prev, [id]: null }));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are You Sure ?")) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/delete-application/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                addToast({ title: 'Success', body: 'Application Deletion Success !' }, 'success');
                fetchApplications();
            } else {
                addToast({ title: 'Error', body: 'Application Deletion Failed !' }, 'error');
            }
        } catch (error) {
            console.error("Error Deleting Application:", error);
            addToast({ title: 'Error', body: 'Application Deletion Failed !' }, 'error');
        }
    };

    const handleDownload = (filePath) => {
        if (filePath && filePath.endsWith(".pdf")) {
            window.open(`${import.meta.env.VITE_API_URL}/${filePath}`, "_blank");
        } else {
            addToast({ title: 'Error', body: 'No File To Download !' }, 'error');
        }
    };

    const filteredApplications = applications.filter(app => {
        const searchLower = searchTerm.toLowerCase();
        return (
            app.name.toLowerCase().includes(searchLower) ||
            app.rollNumber.toLowerCase().includes(searchLower) ||
            app.college.toLowerCase().includes(searchLower) ||
            app.internshipInstitute.toLowerCase().includes(searchLower) ||
            app.status.toLowerCase().includes(searchLower)
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
                        placeholder="Search Roll Number, name, college..."
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
                                            {new Date(app.startDate).toLocaleDateString()} - {new Date(app.endDate).toLocaleDateString()}
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
                                                onClick={() => handleDownload(app.offerLetterPath)}
                                            >
                                                Dow.
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Spinner Styles */}
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
            `}</style>
        </div>
    );
}

export default InternshipTable;