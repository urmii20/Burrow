import React, { useState } from 'react';
import { Package, Search, AlertCircle, MapPin, Calendar, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../lib/api';
import { mockRequests } from '../../data/mockData';

// TrackRequest component searches for a delivery request by order number.
const TrackRequest = () => {
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Formats status codes into capitalised words for display.
  const formatStatus = (status) => {
    if (!status) {
      return 'Unknown';
    }

    return status
      .split('_')
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ');
  };

  // Formats the destination address for summary cards.
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

  // Helper to locate a matching request in a collection.
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

  // Submits the search form and navigates to a matching request.
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

  // Renders a single search result card.
  const renderResult = (request) => {
    return (
      <div key={request.id} className="bg-burrow-surface rounded-2xl shadow-sm border border-burrow-border p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <Package className="h-6 w-6 text-burrow-primary" />
              <div>
                <p className="text-sm font-medium text-burrow-text-primary">Order #{request.orderNumber}</p>
                <p className="text-sm text-burrow-text-muted">Status: {formatStatus(request.status)}</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-burrow-text-secondary">{request.productDescription || 'No product description provided.'}</p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-burrow-text-secondary">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-burrow-text-muted mr-2" />
                <span>
                  Scheduled:{' '}
                  {request.scheduledDeliveryDate
                    ? new Date(request.scheduledDeliveryDate).toLocaleDateString()
                    : 'To be confirmed'}
                </span>
              </div>

              <div className="flex items-center">
                <Clock className="h-4 w-4 text-burrow-text-muted mr-2" />
                <span>Time Slot: {request.deliveryTimeSlot || 'To be confirmed'}</span>
              </div>

              <div className="flex items-center sm:col-span-2">
                <MapPin className="h-4 w-4 text-burrow-text-muted mr-2" />
                <span>{formatAddress(request.destinationAddress)}</span>
              </div>
            </div>
          </div>

          <Link
            to={`/request/${request.id}`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-burrow-primary hover:text-burrow-primary/80"
          >
            View details
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-burrow-background min-h-full py-12 page-fade">
      <div className="layout-container-narrow">
        {/* Intro text describes how to use the tracking form. */}
        <div className="card-panel page-fade">
          <h1 className="text-2xl font-bold text-burrow-text-primary mb-2">Track your delivery request</h1>
          <p className="text-sm text-burrow-text-secondary mb-6">
            Enter your order number to view the current status, scheduled date, and destination details of your request.
          </p>

          {/* Search form captures the order number and triggers lookup. */}
          <form onSubmit={handleSubmit} className="space-y-4 fade-stagger">
            <div>
              <label htmlFor="orderNumber" className="form-label">
                Order number
              </label>
              <div className="mt-2 flex flex-col gap-3 sm:grid sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="input-group sm:max-w-none">
                  <div className="input-icon">
                    <Search className="h-5 w-5" />
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
                  className="btn-primary btn-md sm:h-full sm:w-auto"
                  disabled={isSearching}
                >
                  {isSearching ? 'Searching...' : 'Track'}
                </button>
              </div>
            </div>
          </form>

          {/* Error banner displays issues from the search request. */}
          {error && (
            <div className="alert-error mt-6">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          )}

          {/* Results area renders matches or an empty state. */}
          {hasSearched && !error && (
            <div className="mt-8 space-y-4 fade-stagger">
              {results.length > 0 ? (
                results.map((request) => renderResult(request))
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-burrow-border p-8 text-center bg-burrow-surface/60">
                  <Package className="h-10 w-10 text-burrow-primary mb-3" />
                  <p className="text-sm font-medium text-burrow-text-primary">No results found</p>
                  <p className="mt-1 text-sm text-burrow-text-muted">
                    Double-check your order number or create a new delivery request if you haven&apos;t scheduled one yet.
                  </p>
                  <Link
                    to="/new-request"
                    className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-burrow-primary hover:text-burrow-primary/80"
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
