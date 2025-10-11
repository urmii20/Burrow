import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, MessageCircle } from 'lucide-react';
import StatusTracker from '../../components/StatusTracker/StatusTracker';

import apiClient from '../../lib/api';
import { mockRequests as mockRequestsData, warehouses as mockWarehouseData } from '../../data/mockData';
import { buildReceiptText, downloadBlob, formatAddress, formatDate, scrollToElement, toTitleFromSnake } from '../../lib/utils';

// RequestStatus displays a detailed timeline and metadata for a request.
const RequestStatus = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  // fetchData loads request and warehouse info with mock fallbacks.
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!id) {
        return;
      }

      setIsLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const [requestResponse, warehousesResponse] = await Promise.all([
          apiClient.get(`/requests/${id}`),
          apiClient.get('/warehouses').catch(() => [])
        ]);

        if (isMounted) {
          setRequest(requestResponse ?? null);
          setWarehouses(Array.isArray(warehousesResponse) ? warehousesResponse : []);
        }
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        const normalisedId = typeof id === 'string' ? id.toLowerCase() : '';
        const fallbackRequest = mockRequestsData.find((item) => {
          const orderNumber = item.orderNumber?.toLowerCase();
          const requestId = item.id?.toLowerCase();
          return requestId === normalisedId || orderNumber === normalisedId;
        });

        if (fallbackRequest) {
          setRequest(fallbackRequest);
          setWarehouses(mockWarehouseData);
          return;
        }

        if (fetchError?.status === 404) {
          setNotFound(true);
        } else {
          setError(fetchError?.message || 'Unable to load request details.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // warehouse memo picks the matching facility from the list.
  const warehouse = useMemo(
    () => warehouses.find((w) => w.id === request?.warehouseId),
    [warehouses, request?.warehouseId]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-burrow-background flex items-center justify-center page-fade">
        <p className="text-burrow-text-secondary">Loading request details...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-burrow-background flex items-center justify-center page-fade">
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-bold text-burrow-text-primary">Request not found</h2>
          <p className="text-burrow-text-secondary">The request you&apos;re looking for doesn&apos;t exist.</p>
          <Link to="/dashboard" className="btn-primary btn-md inline-flex">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-burrow-background flex items-center justify-center page-fade">
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-bold text-burrow-text-primary">Something went wrong</h2>
          <p className="text-burrow-text-secondary">{error}</p>
          <Link to="/dashboard" className="btn-primary btn-md inline-flex">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!request) {
    return null;
  }

  const paymentStatus = request.paymentDetails?.paymentStatus ?? 'pending';
  const paymentStatusLabel = toTitleFromSnake(paymentStatus, paymentStatus);

  const handleDownloadReceipt = () => {
    const receiptLines = buildReceiptText(request);
    const blob = new Blob([receiptLines.join('\n')], {
      type: 'text/plain;charset=utf-8'
    });
    downloadBlob(blob, `burrow-receipt-${request.id}.txt`);
  };

  const handleContactSupport = () => scrollToElement('site-footer');

  return (
    <div className="min-h-screen bg-burrow-background py-8 page-fade">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header allows navigation back and quick actions */}
        <div className="mb-8 page-fade">
          <div className="flex items-center space-x-4 mb-4">
            <Link to="/dashboard" className="flex items-center text-burrow-text-secondary hover:text-burrow-primary transition-colors">
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Dashboard
            </Link>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-burrow-text-primary">Delivery Request</h1>
                {request.orderNumber && (
                  <span className="inline-flex items-center rounded-full border border-burrow-border/70 bg-burrow-surface px-3 py-1 text-sm font-medium text-burrow-text-secondary">
                    Order: {request.orderNumber}
                  </span>
                )}
              </div>
              <p className="text-burrow-text-secondary mt-1">Track your delivery request status</p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleDownloadReceipt}
                className="btn-secondary btn-md"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </button>
              <button
                type="button"
                onClick={handleContactSupport}
                className="btn-primary btn-md"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Support
              </button>
            </div>
          </div>
        </div>

        {/* Layout splits timeline and metadata */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 fade-stagger">
          <div className="lg:col-span-2 page-fade">
            <StatusTracker currentStatus={request.status} statusHistory={request.statusHistory ?? []} />
          </div>

          <div className="space-y-6">
            {/* Order information card */}
            <div className="card p-6 page-fade">
              <h3 className="text-lg font-semibold text-burrow-text-primary mb-4">Order Information</h3>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-burrow-text-secondary">Order Number:</span>
                  <p className="font-medium text-burrow-text-primary">{request.orderNumber}</p>
                </div>

                <div>
                  <span className="text-burrow-text-secondary">Platform:</span>
                  <p className="font-medium text-burrow-text-primary">{request.platform}</p>
                </div>

                <div>
                  <span className="text-burrow-text-secondary">Product:</span>
                  <p className="font-medium text-burrow-text-primary">{request.productDescription}</p>
                </div>

                <div>
                  <span className="text-burrow-text-secondary">Original ETA:</span>
                  <p className="font-medium text-burrow-text-primary">
                    {formatDate(request.originalETA)}
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery details card */}
            <div className="card p-6 page-fade">
              <h3 className="text-lg font-semibold text-burrow-text-primary mb-4">Delivery Details</h3>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-burrow-text-secondary">Scheduled Date:</span>
                  <p className="font-medium text-burrow-text-primary">
                    {formatDate(request.scheduledDeliveryDate, 'Not scheduled')}
                  </p>
                </div>

                <div>
                  <span className="text-burrow-text-secondary">Time Slot:</span>
                  <p className="font-medium text-burrow-text-primary">{request.deliveryTimeSlot || 'Not assigned'}</p>
                </div>

                <div>
                  <span className="text-burrow-text-secondary">Destination:</span>
                  <p className="font-medium text-burrow-text-primary">
                    {request.destinationAddress
                      ? formatAddress({ ...request.destinationAddress, line2: undefined })
                      : 'Not provided'}
                  </p>
                </div>
              </div>

            </div>

            {warehouse && (
              /* Warehouse card summarises facility info */
              <div className="card p-6 page-fade">
                <h3 className="text-lg font-semibold text-burrow-text-primary mb-4">Warehouse Details</h3>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-burrow-text-secondary">Facility:</span>
                    <p className="font-medium text-burrow-text-primary">{warehouse.name}</p>
                  </div>

                  <div>
                    <span className="text-burrow-text-secondary">Address:</span>
                    <p className="font-medium text-burrow-text-primary">{warehouse.address}</p>
                  </div>

                  <div>
                    <span className="text-burrow-text-secondary">Operating Hours:</span>
                    <p className="font-medium text-burrow-text-primary">{warehouse.operatingHours}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="card p-6 page-fade">
              <h3 className="text-lg font-semibold text-burrow-text-primary mb-4">Payment Details</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-burrow-text-secondary">Base Handling Fee</span>
                  <span className="font-medium">₹{request.paymentDetails?.baseHandlingFee ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-burrow-text-secondary">Storage Fee</span>
                  <span className="font-medium">₹{request.paymentDetails?.storageFee ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-burrow-text-secondary">Delivery Charge</span>
                  <span className="font-medium">₹{request.paymentDetails?.deliveryCharge ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-burrow-text-secondary">GST</span>
                  <span className="font-medium">₹{request.paymentDetails?.gst ?? 0}</span>
                </div>
                <div className="border-t border-burrow-border/70 pt-2 flex justify-between font-semibold">
                  <span>Total Amount</span>
                  <span className="text-burrow-primary">₹{request.paymentDetails?.totalAmount ?? 0}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-burrow-border/70">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    paymentStatus === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : paymentStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {paymentStatusLabel}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestStatus;
