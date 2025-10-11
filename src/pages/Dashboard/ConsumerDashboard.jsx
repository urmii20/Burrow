import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import apiClient from '../../lib/api';
import { formatDate } from '../../lib/utils';

const badgeGroups = [
  {
    keys: ['submitted', 'approval_pending', 'payment_pending', 'reschedule_requested'],
    label: 'Pending',
    className: 'border border-burrow-border/60 bg-burrow-primary/10 text-burrow-primary'
  },
  {
    keys: ['approved', 'scheduled', 'parcel_expected', 'parcel_arrived', 'in_storage', 'preparing_dispatch', 'out_for_delivery'],
    label: 'In Progress',
    className: 'border border-burrow-border/60 bg-burrow-primary/10 text-burrow-primary'
  },
  {
    keys: ['delivered'],
    label: 'Delivered',
    className: 'bg-burrow-primary text-burrow-text-inverse shadow-sm shadow-burrow-border/40'
  },
  {
    keys: ['rejected', 'issue_reported'],
    label: 'Issue Reported',
    className: 'bg-red-100 text-red-800'
  },
  {
    keys: ['cancelled'],
    label: 'Cancelled',
    className: 'border border-burrow-border/60 bg-burrow-background text-burrow-text-muted'
  }
];

const statusBadgeMap = badgeGroups.reduce((map, group) => {
  group.keys.forEach((key) => map.set(key, group));
  return map;
}, new Map());

// ConsumerDashboard summarises the consumer's requests and stats.
const ConsumerDashboard = () => {
  const { state } = useAuth();

  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // fetchRequests loads the user's recent delivery requests.
  useEffect(() => {
    let isMounted = true;

    const fetchRequests = async () => {
      if (!state.user?.id) {
        setRequests([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ userId: state.user.id });
        const response = await apiClient.get(`/requests?${params.toString()}`);

        if (isMounted) {
          setRequests(response ?? []);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError?.message || 'Unable to load your requests.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchRequests();

    return () => {
      isMounted = false;
    };
  }, [state.user?.id]);

  // userRequests ensures the view only shows the signed in user's data.
  const userRequests = useMemo(
    () => requests.filter(req => req.userId === state.user?.id),
    [requests, state.user?.id]
  );

  // stats summarises active, pending, and completed counts.
  const stats = useMemo(
    () =>
      userRequests.reduce(
        (acc, request) => {
          if (!['delivered', 'rejected'].includes(request.status)) acc.active += 1;
          if (['submitted', 'approval_pending', 'payment_pending'].includes(request.status)) acc.pending += 1;
          if (request.status === 'delivered') acc.completed += 1;
          return acc;
        },
        { active: 0, pending: 0, completed: 0 }
      ),
    [userRequests]
  );

  // getStatusBadge renders the correct badge for any status.
  const getStatusBadge = (status) => {
    const badge = statusBadgeMap.get(status) || {
      label: 'Unknown',
      className: 'border border-burrow-border/60 bg-burrow-background text-burrow-text-muted'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-burrow-background py-8 page-fade">
      <div className="layout-container">
        {/* Welcome banner greets the user */}
        <div className="mb-8 page-fade">
          <h1 className="text-3xl font-bold text-burrow-text-primary">Welcome back, {state.user?.name}!</h1>
          <p className="text-burrow-text-secondary mt-1">Manage your deliveries and schedule new requests</p>
        </div>

        {/* Stat cards summarise request counts */}
        <div className="stats-grid mb-8 fade-stagger">
          {[
            { label: 'Active Requests', value: stats.active, icon: Clock },
            { label: 'Pending Approval', value: stats.pending, icon: AlertTriangle },
            { label: 'Completed', value: stats.completed, icon: CheckCircle }
          ].map((item) => (
            <div key={item.label} className="stat-card">
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

        {/* Quick actions provide shortcuts */}
        <div className="card-padded mb-8 page-fade">
          <h2 className="text-xl font-semibold text-burrow-text-primary mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/new-request"
              className="btn-primary btn-md"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Request
            </Link>

            <Link
              to="/track"
              className="btn-neutral btn-md"
            >
              <Package className="h-5 w-5 mr-2" />
              Track Parcel
            </Link>
          </div>
        </div>

        {/* Request list shows latest deliveries */}
        <div className="card page-fade">
          <div className="px-6 py-4 border-b border-burrow-border/80">
            <h2 className="text-xl font-semibold text-burrow-text-primary">Recent Requests</h2>
          </div>

          <div className="divide-y divide-burrow-border">
            {error && (
              <div className="px-6 py-4 text-sm text-red-600 bg-red-50 border-b border-red-100">{error}</div>
            )}

            {isLoading && (
              <div className="px-6 py-4 text-sm text-burrow-text-muted">Loading your recent requests...</div>
            )}

            {!isLoading && !error && userRequests.length > 0 ? (
              userRequests.slice(0, 5).map((request) => (
                <div key={request.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-sm font-medium text-burrow-text-primary">{request.orderNumber}</h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-sm text-burrow-text-secondary mt-1">{request.productDescription}</p>
                      <p className="text-xs text-burrow-text-muted mt-1">
                        Scheduled: {formatDate(request.scheduledDeliveryDate, 'TBC')}
                        {request.deliveryTimeSlot ? ` at ${request.deliveryTimeSlot}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link to={`/request/${request.id}`} className="nav-link font-medium text-sm">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : null}

            {!isLoading && !error && userRequests.length === 0 && (
              <div className="px-6 py-8 text-center">
                <Package className="h-12 w-12 text-burrow-primary mx-auto mb-4" />
                <p className="text-burrow-text-secondary">No requests yet</p>
                <p className="text-burrow-text-muted text-sm mt-1">Create your first delivery request to get started</p>
                <Link
                  to="/new-request"
                  className="btn-primary btn-md mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Request
                </Link>
              </div>
            )}
          </div>

          {!isLoading && !error && userRequests.length > 5 && (
            <div className="px-6 py-4 border-t border-burrow-border/80 bg-burrow-background">
              <Link to="/orders" className="nav-link font-medium text-sm">
                View all requests →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsumerDashboard;
