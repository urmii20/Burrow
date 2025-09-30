import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, MessageCircle } from 'lucide-react';
import StatusTracker from '../../components/StatusTracker/StatusTracker';

import apiClient from '../../lib/api';

const RequestStatus = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

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

  const warehouse = useMemo(
    () => warehouses.find((w) => w.id === request?.warehouseId),
    [warehouses, request?.warehouseId]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading request details...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Request not found</h2>
          <p className="text-gray-600 mt-2">The request you&apos;re looking for doesn&apos;t exist.</p>
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-500 mt-4 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Something went wrong</h2>
          <p className="text-gray-600 mt-2">{error}</p>
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-500 mt-4 inline-block">
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-gray-800 transition-colors">
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Dashboard
            </Link>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Request {request.id}</h1>
              <p className="text-gray-600 mt-1">Track your delivery request status</p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => {
                  const paymentDetails = request.paymentDetails ?? {};
                  const paymentStatusValue = paymentDetails.paymentStatus ?? 'pending';
                  const formattedPaymentStatus =
                    paymentStatusValue.charAt(0).toUpperCase() + paymentStatusValue.slice(1);
                  const receiptLines = [
                    `Receipt for Request ${request.id}`,
                    `Order Number: ${request.orderNumber}`,
                    `Platform: ${request.platform}`,
                    `Product: ${request.productDescription}`,
                    '',
                    'Payment Details:',
                    `  Base Handling Fee: ₹${paymentDetails.baseHandlingFee ?? 0}`,
                    `  Storage Fee: ₹${paymentDetails.storageFee ?? 0}`,
                    `  Delivery Charge: ₹${paymentDetails.deliveryCharge ?? 0}`,
                    `  GST: ₹${paymentDetails.gst ?? 0}`,
                    `  Total Amount: ₹${paymentDetails.totalAmount ?? 0}`,
                    `  Payment Method: ${paymentDetails.paymentMethod ?? 'Not specified'}`,
                    `  Payment Status: ${formattedPaymentStatus}`,
                    '',
                    `Generated on: ${new Date().toLocaleString()}`
                  ];

                  const blob = new Blob([receiptLines.join('\n')], {
                    type: 'text/plain;charset=utf-8'
                  });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `burrow-receipt-${request.id}.txt`;
                  link.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </button>
              <button
                type="button"
                onClick={() => {
                  const footer = document.getElementById('site-footer');
                  if (footer) {
                    footer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Support
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <StatusTracker currentStatus={request.status} statusHistory={request.statusHistory ?? []} />
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h3>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Order Number:</span>
                  <p className="font-medium text-gray-900">{request.orderNumber}</p>
                </div>

                <div>
                  <span className="text-gray-600">Platform:</span>
                  <p className="font-medium text-gray-900">{request.platform}</p>
                </div>

                <div>
                  <span className="text-gray-600">Product:</span>
                  <p className="font-medium text-gray-900">{request.productDescription}</p>
                </div>

                <div>
                  <span className="text-gray-600">Original ETA:</span>
                  <p className="font-medium text-gray-900">
                    {request.originalETA ? new Date(request.originalETA).toLocaleDateString() : 'Not available'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Details</h3>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Scheduled Date:</span>
                  <p className="font-medium text-gray-900">
                    {request.scheduledDeliveryDate
                      ? new Date(request.scheduledDeliveryDate).toLocaleDateString()
                      : 'Not scheduled'}
                  </p>
                </div>

                <div>
                  <span className="text-gray-600">Time Slot:</span>
                  <p className="font-medium text-gray-900">{request.deliveryTimeSlot || 'Not assigned'}</p>
                </div>

                <div>
                  <span className="text-gray-600">Destination:</span>
                  <p className="font-medium text-gray-900">
                    {request.destinationAddress ? (
                      <>
                        {request.destinationAddress.line1}
                        {request.destinationAddress.line2 ? `, ${request.destinationAddress.line2}` : ''}
                        <br />
                        {[request.destinationAddress.city, request.destinationAddress.state]
                          .filter(Boolean)
                          .join(', ')}
                        {request.destinationAddress.pincode ? ` ${request.destinationAddress.pincode}` : ''}
                      </>
                    ) : (
                      'Not provided'
                    )}
                  </p>
                </div>
              </div>

            </div>

            {warehouse && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Warehouse Details</h3>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">Facility:</span>
                    <p className="font-medium text-gray-900">{warehouse.name}</p>
                  </div>

                  <div>
                    <span className="text-gray-600">Address:</span>
                    <p className="font-medium text-gray-900">{warehouse.address}</p>
                  </div>

                  <div>
                    <span className="text-gray-600">Operating Hours:</span>
                    <p className="font-medium text-gray-900">{warehouse.operatingHours}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Handling Fee</span>
                  <span className="font-medium">₹{request.paymentDetails?.baseHandlingFee ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Storage Fee</span>
                  <span className="font-medium">₹{request.paymentDetails?.storageFee ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Charge</span>
                  <span className="font-medium">₹{request.paymentDetails?.deliveryCharge ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GST</span>
                  <span className="font-medium">₹{request.paymentDetails?.gst ?? 0}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total Amount</span>
                  <span className="text-blue-600">₹{request.paymentDetails?.totalAmount ?? 0}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    paymentStatus === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : paymentStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
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
