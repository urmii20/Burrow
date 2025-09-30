import React, { useState } from 'react';
import { Package, Search, AlertCircle, MapPin, Calendar, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../lib/api';

const TrackRequest = () => {
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const formatStatus = (status) => {
    if (!status) {
      return 'Unknown';
    }

    return status
      .split('_')
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ');
  };

  const formatAddress = (address) => {
    if (!address) {
      return 'Destination address not available';
    }

    const parts = [address.line1, address.city, address.state].filter(Boolean);

    if (parts.length === 0) {
      return 'Destination address not available';
    }

    return parts.join(', ');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedOrderNumber = orderNumber.trim();
    if (!trimmedOrderNumber) {
      setError('Please enter an order number to track.');
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setError(null);
    setHasSearched(true);

    try {
      const params = new URLSearchParams({ orderNumber: trimmedOrderNumber });
      const data = await apiClient.get(`/requests?${params.toString()}`);
      const nextResults = Array.isArray(data) ? data : [];
      setResults(nextResults);

      const matchingRequest = nextResults.find(
        (request) => request.orderNumber?.toLowerCase() === trimmedOrderNumber.toLowerCase(),
      );

      if (matchingRequest) {
        navigate(`/request/${matchingRequest.id}`);
      }
    } catch (requestError) {
      setError(requestError.message || 'Unable to fetch delivery requests at the moment.');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const renderResult = (request) => {
    return (
      <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <Package className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Order #{request.orderNumber}</p>
                <p className="text-sm text-gray-500">Status: {formatStatus(request.status)}</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-600">{request.productDescription || 'No product description provided.'}</p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <span>
                  Scheduled:{' '}
                  {request.scheduledDeliveryDate
                    ? new Date(request.scheduledDeliveryDate).toLocaleDateString()
                    : 'To be confirmed'}
                </span>
              </div>

              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-400 mr-2" />
                <span>Time Slot: {request.deliveryTimeSlot || 'To be confirmed'}</span>
              </div>

              <div className="flex items-center sm:col-span-2">
                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                <span>{formatAddress(request.destinationAddress)}</span>
              </div>
            </div>
          </div>

          <Link
            to={`/request/${request.id}`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View details
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-full py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Track your delivery request</h1>
          <p className="text-sm text-gray-600 mb-6">
            Enter your order number to view the current status, scheduled date, and destination details of your request.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700">
                Order number
              </label>
              <div className="mt-2 flex flex-col gap-3 sm:grid sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="relative sm:max-w-none">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="orderNumber"
                    type="text"
                    className="block w-full rounded-lg border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g. BRW-2458"
                    value={orderNumber}
                    onChange={(event) => setOrderNumber(event.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-12 w-full items-center justify-center rounded-lg border border-transparent bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:hover:bg-blue-600 sm:h-full sm:w-auto"
                  disabled={isSearching}
                >
                  {isSearching ? 'Searching...' : 'Track'}
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="mt-6 flex items-center rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          )}

          {hasSearched && !error && (
            <div className="mt-8 space-y-4">
              {results.length > 0 ? (
                results.map((request) => renderResult(request))
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-8 text-center">
                  <Package className="h-10 w-10 text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-gray-900">No delivery requests found</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Double-check your order number or create a new delivery request if you haven&apos;t scheduled one yet.
                  </p>
                  <Link
                    to="/new-request"
                    className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    Schedule a delivery
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackRequest;
