import React from 'react';
import PropTypes from 'prop-types';
import { Check, Clock, Package, Truck, Home } from 'lucide-react';

const statusConfig = {
  submitted: {
    label: 'Request Submitted',
    icon: Clock,
    color: 'text-green-500',
    bgColor: 'bg-green-100'
  },
  payment_pending: {
    label: 'Payment Pending',
    icon: Clock,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100'
  },
  approval_pending: {
    label: 'Approval Pending',
    icon: Clock,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100'
  },
  approved: {
    label: 'Approved',
    icon: Check,
    color: 'text-green-500',
    bgColor: 'bg-green-100'
  },
  rejected: {
    label: 'Rejected',
    icon: Clock,
    color: 'text-red-500',
    bgColor: 'bg-red-100'
  },
  parcel_expected: {
    label: 'Parcel Expected at Warehouse',
    icon: Clock,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100'
  },
  parcel_arrived: {
    label: 'Parcel Arrived at Warehouse',
    icon: Package,
    color: 'text-green-500',
    bgColor: 'bg-green-100'
  },
  in_storage: {
    label: 'In Storage',
    icon: Package,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100'
  },
  preparing_dispatch: {
    label: 'Preparing for Dispatch',
    icon: Package,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100'
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    icon: Truck,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100'
  },
  delivered: {
    label: 'Delivered',
    icon: Home,
    color: 'text-green-500',
    bgColor: 'bg-green-100'
  },
  issue_reported: {
    label: 'Issue Reported',
    icon: Clock,
    color: 'text-red-500',
    bgColor: 'bg-red-100'
  }
};

const statusOrder = [
  'submitted',
  'payment_pending',
  'approval_pending',
  'approved',
  'parcel_expected',
  'parcel_arrived',
  'in_storage',
  'preparing_dispatch',
  'out_for_delivery',
  'delivered'
];

const StatusTracker = ({ currentStatus, statusHistory }) => {
  const getCurrentStatusIndex = () => {
    return statusOrder.indexOf(currentStatus);
  };

  const isStatusCompleted = (status) => {
    const statusIndex = statusOrder.indexOf(status);
    const currentIndex = getCurrentStatusIndex();
    return statusIndex <= currentIndex;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Order Status</h3>

      <div className="space-y-4">
        {statusOrder.map((status, index) => {
          const config = statusConfig[status];
          const Icon = config.icon;
          const isCompleted = isStatusCompleted(status);
          const isCurrent = status === currentStatus;
          const statusEntry = statusHistory.find(s => s.status === status);

          return (
            <div key={status} className="flex items-start space-x-4">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                isCompleted
                  ? config.bgColor
                  : 'bg-gray-100'
              }`}>
                <Icon className={`h-5 w-5 ${
                  isCompleted ? config.color : 'text-gray-400'
                }`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${
                    isCompleted ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {config.label}
                    {isCurrent && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Current
                      </span>
                    )}
                  </p>

                  {statusEntry && (
                    <p className="text-xs text-gray-500">
                      {formatTimestamp(statusEntry.timestamp)}
                    </p>
                  )}
                </div>

                {statusEntry?.notes && (
                  <p className="text-sm text-gray-600 mt-1">{statusEntry.notes}</p>
                )}

                {index < statusOrder.length - 1 && (
                  <div className={`w-px h-6 ml-5 mt-2 ${
                    isCompleted ? 'bg-green-300' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusTracker;

StatusTracker.propTypes = {
  currentStatus: PropTypes.string.isRequired,
  statusHistory: PropTypes.arrayOf(
    PropTypes.shape({
      status: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired,
      notes: PropTypes.string,
    })
  ).isRequired,
};
