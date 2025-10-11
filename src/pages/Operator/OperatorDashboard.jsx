import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';

import apiClient from '../../lib/api';
import { downloadBlob, formatDate, toTitleFromSnake } from '../../lib/utils';

const hasReceiptFile = (receipt) => {
  if (!receipt || typeof receipt !== 'object') {
    return false;
  }

  if (receipt.hasData === true) {
    return true;
  }

  const numericFileSize = Number(receipt.fileSize);
  return Number.isFinite(numericFileSize) && numericFileSize > 0;
};

const formatFileSize = (bytes) => {
  const numeric = Number(bytes);

  if (!Number.isFinite(numeric) || numeric < 0) {
    return '';
  }

  if (numeric < 1024) {
    return `${numeric} B`;
  }

  const kb = numeric / 1024;

  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
};

// OperatorDashboard empowers staff to review and manage requests.
const OperatorDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatingRequestId, setUpdatingRequestId] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const [modalStatus, setModalStatus] = useState('');
  const [modalNotes, setModalNotes] = useState('');
  const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false);
  const [receiptDownloadError, setReceiptDownloadError] = useState(null);
  const isMountedRef = useRef(true);

  // fetchRequests loads all delivery requests for operators.
  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/requests');

      if (isMountedRef.current) {
        setRequests(Array.isArray(response) ? response : []);
      }
    } catch (fetchError) {
      if (isMountedRef.current) {
        setError(fetchError?.message || 'Unable to fetch requests');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchRequests();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchRequests]);

  // filteredRequests applies text and status filters.
  const filteredRequests = requests.filter(request => {
    const lowerSearch = searchTerm.toLowerCase();
    const matchesSearch =
      request.orderNumber.toLowerCase().includes(lowerSearch) ||
      request.productDescription.toLowerCase().includes(lowerSearch);
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // stats summarises aggregate counts for quick scanning.
  const stats = {
    total: requests.length,
    pending: requests.filter(req => req.status === 'approval_pending').length,
    approved: requests.filter(req => req.status === 'approved').length,
    delivered: requests.filter(req => req.status === 'delivered').length
  };

  const getStatusBadge = (status) => {
    const neutralBadge = 'bg-burrow-primary/10 text-burrow-primary';
    const config = {
      submitted: { color: neutralBadge, label: 'Submitted' },
      approval_pending: { color: neutralBadge, label: 'Pending Approval' },
      approved: { color: neutralBadge, label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-700', label: 'Rejected' },
      parcel_expected: { color: neutralBadge, label: 'Parcel Expected' },
      parcel_arrived: { color: neutralBadge, label: 'Parcel Arrived' },
      in_storage: { color: neutralBadge, label: 'In Storage' },
      preparing_dispatch: { color: neutralBadge, label: 'Preparing Dispatch' },
      out_for_delivery: { color: neutralBadge, label: 'Out for Delivery' },
      delivered: { color: neutralBadge, label: 'Delivered' }
    };

    const statusConfig =
      config[status] || { color: neutralBadge, label: toTitleFromSnake(status, 'Unknown') };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
        {statusConfig.label}
      </span>
    );
  };

  // handleStatusUpdate applies status changes and syncs state.
  const handleStatusUpdate = async (requestId, newStatus, note) => {
    setUpdateError(null);
    setUpdatingRequestId(requestId);

    try {
      const updatedRequest = await apiClient.patch(`/requests/${requestId}/status`, {
        status: newStatus,
        ...(note?.trim() ? { note: note.trim() } : {})
      });

      setUpdateError(null);
      setRequests((previousRequests) =>
        previousRequests.map((request) =>
          request.id === updatedRequest?.id ? { ...request, ...updatedRequest } : request
        )
      );

      if (selectedRequest?.id === updatedRequest?.id) {
        setSelectedRequest((current) => ({ ...current, ...updatedRequest }));
      }

      return updatedRequest;
    } catch (updateError_) {
      const errorMessage =
        updateError_?.status === 404
          ? 'Request not found'
          : updateError_?.message || 'Unable to update request status.';

      setUpdateError(errorMessage);
      throw updateError_;
    } finally {
      setUpdatingRequestId(null);
    }
  };

  // handleModalStatusChange updates the pending status in the modal.
  const handleModalStatusChange = (newStatus) => {
    setModalStatus(newStatus);
  };

  // handleModalSubmit persists modal edits to the server.
  const handleModalSubmit = async () => {
    if (!selectedRequest) {
      return;
    }

    const previousStatus = selectedRequest.status;

    try {
      const updatedRequest = await handleStatusUpdate(selectedRequest.id, modalStatus, modalNotes);
      setModalNotes('');

      if (updatedRequest && typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch {
      setModalStatus(previousStatus);
    }
  };

  // handleQuickStatusChange triggers inline status updates.
  const handleQuickStatusChange = (requestId, newStatus) => {
    handleStatusUpdate(requestId, newStatus).catch(() => {});
  };

  // handleOpenRequest opens a request in the side modal.
  const handleOpenRequest = (request) => {
    setSelectedRequest(request);
    setModalStatus(request.status);
    setModalNotes('');
    setUpdateError(null);
    setReceiptDownloadError(null);
    setIsDownloadingReceipt(false);
  };

  // handleReceiptDownload fetches and downloads the customer receipt.
  const handleReceiptDownload = useCallback(async () => {
    if (!selectedRequest?.id || !hasReceiptFile(selectedRequest.receipt)) {
      return;
    }

    setIsDownloadingReceipt(true);
    setReceiptDownloadError(null);

    try {
      const downloadResponse = await apiClient.download(`/requests/${selectedRequest.id}/receipt`);

      if (!downloadResponse?.blob) {
        throw new Error('Receipt file is unavailable.');
      }

      const resolvedFileName =
        downloadResponse.fileName?.trim() ||
        selectedRequest.receipt.fileName?.trim() ||
        (selectedRequest.orderNumber ? `${selectedRequest.orderNumber}.pdf` : 'receipt.pdf');

      downloadBlob(downloadResponse.blob, resolvedFileName);
    } catch (downloadError) {
      const message = downloadError?.message || 'Unable to download the receipt. Please try again.';
      setReceiptDownloadError(message);
    } finally {
      setIsDownloadingReceipt(false);
    }
  }, [selectedRequest]);

  return (
    <div className="min-h-screen bg-burrow-background page-fade">
      <div className="bg-burrow-surface shadow-sm border-b border-burrow-border page-fade">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-burrow-text-primary">Operator Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-burrow-text-secondary">Welcome, Operator</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 fade-stagger">
          {[
            { label: 'Total Requests', value: stats.total, icon: Clock },
            { label: 'Pending Approval', value: stats.pending, icon: Clock },
            { label: 'Approved Today', value: stats.approved, icon: CheckCircle },
            { label: 'Delivered', value: stats.delivered, icon: CheckCircle }
          ].map((item) => (
            <div key={item.label} className="card p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-burrow-primary/10 text-burrow-primary flex items-center justify-center">
                  <item.icon className="h-6 w-6" />
                </div>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium text-burrow-text-secondary">{item.label}</p>
                  <p className="text-2xl font-bold text-burrow-text-primary">{item.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-6 mb-8 page-fade">
          {/* Filter controls for search and status */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-burrow-text-muted" />
                <input
                  type="text"
                  placeholder="Search by order number or product..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-burrow-text-muted" />
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="input-field-plain"
                >
                  <option value="all">All Status</option>
                  <option value="submitted">Submitted</option>
                  <option value="approval_pending">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="parcel_expected">Parcel Expected</option>
                  <option value="parcel_arrived">Parcel Arrived</option>
                  <option value="in_storage">In Storage</option>
                  <option value="preparing_dispatch">Preparing Dispatch</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-burrow-border/80">
            <h2 className="text-lg font-semibold text-burrow-text-primary">Delivery Requests</h2>
          </div>

          {error && (
            <div className="px-6 py-4 bg-red-50 border-b border-red-100 text-sm text-red-600">
              {error}
            </div>
          )}

          {updateError && !selectedRequest && (
            <div className="px-6 py-4 bg-red-50 border-b border-red-100 text-sm text-red-600">
              {updateError}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-head">
                <tr>
                  <th className="table-head-cell">
                    Request ID
                  </th>
                  <th className="table-head-cell">
                    Order Details
                  </th>
                  <th className="table-head-cell">
                    Status
                  </th>
                  <th className="table-head-cell">
                    Delivery Date
                  </th>
                  <th className="table-head-cell">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-burrow-surface divide-y divide-burrow-border">
                {isLoading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-6 text-center text-sm text-burrow-text-muted">
                      Loading requests...
                    </td>
                  </tr>
                )}

                {!isLoading && !filteredRequests.length && !error && (
                  <tr>
                    <td colSpan={5} className="px-6 py-6 text-center text-sm text-burrow-text-muted">
                      No requests found matching your criteria.
                    </td>
                  </tr>
                )}

                {!isLoading && filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-burrow-background">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-burrow-text-primary">{request.id}</div>
                      <div className="text-sm text-burrow-text-muted">{formatDate(request.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-burrow-text-primary">{request.orderNumber}</div>
                      <div className="text-sm text-burrow-text-muted">{request.platform}</div>
                      <div className="text-sm text-burrow-text-muted truncate max-w-xs">
                        {request.productDescription}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-burrow-text-primary">{formatDate(request.scheduledDeliveryDate)}</div>
                      <div className="text-sm text-burrow-text-muted">{request.deliveryTimeSlot}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleOpenRequest(request)}
                          className="text-burrow-primary hover:text-burrow-primary/80"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {request.status === 'approval_pending' && (
                          <>
                            <button
                              onClick={() => handleQuickStatusChange(request.id, 'approved')}
                              disabled={updatingRequestId === request.id}
                              className={`text-burrow-primary hover:text-burrow-primary/80 ${
                                updatingRequestId === request.id ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleQuickStatusChange(request.id, 'rejected')}
                              disabled={updatingRequestId === request.id}
                              className={`text-red-600 hover:text-red-900 ${
                                updatingRequestId === request.id ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="card max-w-2xl w-full max-h-screen overflow-y-auto shadow-xl">
              <div className="px-6 py-4 border-b border-burrow-border/80 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-burrow-text-primary">
                  Request Details - {selectedRequest.id}
                </h3>
                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    setModalStatus('');
                    setModalNotes('');
                  }}
                  className="text-burrow-text-muted hover:text-burrow-text-secondary"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="px-6 py-4 space-y-6">
                <div>
                  <h4 className="font-medium text-burrow-text-primary mb-2">Order Information</h4>
                  <div className="bg-burrow-background rounded-xl p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-burrow-text-secondary">Order Number:</span>
                      <span className="font-medium text-burrow-text-primary">{selectedRequest.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-burrow-text-secondary">Platform:</span>
                      <span className="font-medium text-burrow-text-primary">{selectedRequest.platform}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-burrow-text-secondary">Product:</span>
                      <span className="font-medium text-burrow-text-primary">{selectedRequest.productDescription}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-burrow-text-primary mb-2">Receipt</h4>
                  <div className="bg-burrow-background rounded-xl p-4 space-y-3">
                    {selectedRequest.receipt ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-burrow-text-secondary">File Name:</span>
                          <span className="font-medium text-burrow-text-primary truncate max-w-xs">
                            {selectedRequest.receipt.fileName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-burrow-text-secondary">File Size:</span>
                          <span className="font-medium text-burrow-text-primary">
                            {formatFileSize(selectedRequest.receipt.fileSize) || '—'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-burrow-text-secondary">Uploaded:</span>
                          <span className="font-medium text-burrow-text-primary">
                            {selectedRequest.receipt.uploadedAt
                              ? new Date(selectedRequest.receipt.uploadedAt).toLocaleString()
                              : '—'}
                          </span>
                        </div>
                        {hasReceiptFile(selectedRequest.receipt) ? (
                          <div className="pt-3 border-t border-burrow-border/60 space-y-2">
                            {receiptDownloadError && (
                              <p className="text-sm text-red-600">{receiptDownloadError}</p>
                            )}
                            <div className="flex justify-end">
                              <button
                                type="button"
                                className="btn-secondary btn-sm"
                                onClick={handleReceiptDownload}
                                disabled={isDownloadingReceipt}
                              >
                                {isDownloadingReceipt ? 'Preparing download…' : 'Download Receipt'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-burrow-text-muted">
                            Receipt file is unavailable.
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-burrow-text-muted">No receipt was provided.</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-burrow-text-primary mb-2">Delivery Information</h4>
                  <div className="bg-burrow-background rounded-xl p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-burrow-text-secondary">Scheduled Date:</span>
                      <span className="font-medium text-burrow-text-primary">
                        {new Date(selectedRequest.scheduledDeliveryDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-burrow-text-secondary">Time Slot:</span>
                      <span className="font-medium text-burrow-text-primary">{selectedRequest.deliveryTimeSlot}</span>
                    </div>
                    <div>
                      <span className="text-burrow-text-secondary">Destination:</span>
                      <p className="font-medium text-burrow-text-primary mt-1">
                        {selectedRequest.destinationAddress.line1}
                        {selectedRequest.destinationAddress.line2 && `, ${selectedRequest.destinationAddress.line2}`}
                        <br />
                        {selectedRequest.destinationAddress.city}, {selectedRequest.destinationAddress.state}{' '}
                        {selectedRequest.destinationAddress.pincode}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-burrow-text-primary mb-2">Update Status</h4>
                  <select
                    value={modalStatus}
                    onChange={(event) => handleModalStatusChange(event.target.value)}
                    className="input-field-plain"
                  >
                    <option value="submitted">Submitted</option>
                    <option value="approval_pending">Approval Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="parcel_expected">Parcel Expected</option>
                    <option value="parcel_arrived">Parcel Arrived</option>
                    <option value="in_storage">In Storage</option>
                    <option value="preparing_dispatch">Preparing Dispatch</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>

                <div>
                  <h4 className="font-medium text-burrow-text-primary mb-2">Add Notes</h4>
                  <textarea
                    rows={3}
                    placeholder="Add any notes or comments..."
                    value={modalNotes}
                    onChange={(event) => setModalNotes(event.target.value)}
                    className="input-field-plain"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-burrow-border/80 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    setModalStatus('');
                    setModalNotes('');
                  }}
                  className="btn-secondary btn-md"
                >
                  Close
                </button>
                {updateError && (
                  <div className="flex items-center text-sm text-red-600 mr-auto">
                    {updateError}
                  </div>
                )}
                <button
                  onClick={handleModalSubmit}
                  disabled={updatingRequestId === selectedRequest.id}
                  className={`btn-primary btn-md ${
                    updatingRequestId === selectedRequest.id
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  Update Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OperatorDashboard;
