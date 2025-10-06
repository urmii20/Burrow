import React, { useState } from 'react';
import { Package, Search, AlertCircle, MapPin, Calendar, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../lib/api';
import { mockRequests } from '../../data/mockData';

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

  const findMatchingRequest = (collection, value) => {
    if (!Array.isArray(collection) || collection.length === 0 || !value) {
      return null;
    }

    const normalisedValue = value.toLowerCase();
    return collection.find((request) => {
      const orderNumber = request.orderNumber?.toLowerCase();
      const requestId = request.id?.toLowerCase();
      return orderNumber === normalisedValue || requestId === normalisedValue;
    });
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


      const matchingRequest = nextResults.find(
        (request) => request.orderNumber?.toLowerCase() === trimmedOrderNumber.toLowerCase(),
      );






      if (matchingRequest) {
        setResults([matchingRequest]);
        navigate(`/request/${matchingRequest.id}`);
      } else {
        setResults([]);
      }
    } catch (requestError) {
      const fallbackMatch = findMatchingRequest(mockRequests, trimmedOrderNumber);

      if (fallbackMatch) {
        setResults([fallbackMatch]);
        setError(null);
        navigate(`/request/${fallbackMatch.id}`);
      } else {
        setError(requestError.message || 'Unable to fetch delivery requests at the moment.');
        setResults([]);
      }
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
    <div className="bg-gray-50 min-h-full py-12 page-fade">
      <div className="layout-container-narrow">
        <div className="card-panel page-fade">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Track your delivery request</h1>
          <p className="text-sm text-gray-600 mb-6">
            Enter your order number to view the current status, scheduled date, and destination details of your request.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 fade-stagger">
            <div>
              <label htmlFor="orderNumber" className="form-label">
                Order number
              </label>
              <div className="mt-2 flex flex-col gap-3 sm:grid sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="input-group sm:max-w-none">
                  <div className="input-icon">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="orderNumber"
                    type="text"
                    className="input-field"
                    placeholder="e.g. BRW-2458"
                    value={orderNumber}
                    onChange={(event) => setOrderNumber(event.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="btn-blue btn-md sm:h-full sm:w-auto"
                  disabled={isSearching}
                >
                  {isSearching ? 'Searching...' : 'Track'}
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="alert-error mt-6">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          )}

          {hasSearched && !error && (
            <div className="mt-8 space-y-4 fade-stagger">
              {results.length > 0 ? (
                results.map((request) => renderResult(request))
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-8 text-center">
                  <Package className="h-10 w-10 text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-gray-900">No results found</p>
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
