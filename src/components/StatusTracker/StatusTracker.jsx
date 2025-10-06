import { useEffect, useMemo, useState } from 'react';
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
  const currentStatusIndex = useMemo(() => statusOrder.indexOf(currentStatus), [currentStatus]);
  const [animatedIndex, setAnimatedIndex] = useState(-1);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    if (currentStatusIndex < 0) {
      setAnimatedIndex(-1);
      setAnimationComplete(true);
      return undefined;
    }

    const startDelay = 150;
    const stepDuration = 260;
    let intervalId;

    setAnimatedIndex(-1);
    setAnimationComplete(false);

    const kickoffTimeout = setTimeout(() => {
      setAnimatedIndex(0);

      if (currentStatusIndex === 0) {
        setAnimationComplete(true);
        return;
      }

      let nextIndex = 1;
      intervalId = setInterval(() => {
        if (nextIndex > currentStatusIndex) {
          setAnimationComplete(true);
          clearInterval(intervalId);
          return;
        }

        setAnimatedIndex(nextIndex);
        nextIndex += 1;
      }, stepDuration);
    }, startDelay);

    return () => {
      clearTimeout(kickoffTimeout);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [currentStatusIndex]);

  const shouldAnimate = currentStatusIndex >= 0;

  const isStatusCompleted = (statusIndex) => {
    if (!shouldAnimate) {
      return statusIndex <= currentStatusIndex;
    }

    return statusIndex <= animatedIndex && animatedIndex !== -1;
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
          const isCompleted = isStatusCompleted(index);
          const isCurrent = status === currentStatus;
          const statusEntry = statusHistory.find(s => s.status === status);
          const isRevealed = !shouldAnimate || animationComplete || index <= animatedIndex;
          const lineFilled = !shouldAnimate
            ? index < currentStatusIndex
            : animatedIndex > index;

          return (
            <div
              key={status}
              className={`flex items-start space-x-4 transition-all duration-500 ease-out ${
                isRevealed ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'
              }`}
            >
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ease-out ${
                  isCompleted
                    ? `${config.bgColor} shadow-sm`
                    : 'bg-gray-100'
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-colors duration-500 ${
                    isCompleted ? config.color : 'text-gray-400'
                  }`}
                />
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

                {statusEntry && (statusEntry.notes || statusEntry.note) && (
                  <p className="text-sm text-gray-600 mt-1">
                    {statusEntry.notes ?? statusEntry.note}
                  </p>
                )}

                {index < statusOrder.length - 1 && (
                  <div className="relative w-px h-6 ml-5 mt-2 bg-gray-200 overflow-hidden">
                    <div
                      className={`absolute inset-0 bg-green-300 transform origin-top transition-transform duration-500 ease-out ${
                        lineFilled ? 'scale-y-100' : 'scale-y-0'
                      }`}
                    />
                  </div>
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
