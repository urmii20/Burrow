import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Check, Clock, Package, Truck, Home } from 'lucide-react';

// statusConfig maps statuses to their labels and styling.
const statusConfig = {
  submitted: {
    label: 'Request Submitted',
    icon: Clock,
    color: 'text-burrow-primary',
    bgColor: 'bg-burrow-primary/10'
  },
  payment_pending: {
    label: 'Payment Pending',
    icon: Clock,
    color: 'text-burrow-primary',
    bgColor: 'bg-burrow-primary/10'
  },
  approval_pending: {
    label: 'Approval Pending',
    icon: Clock,
    color: 'text-burrow-primary',
    bgColor: 'bg-burrow-primary/10'
  },
  approved: {
    label: 'Approved',
    icon: Check,
    color: 'text-burrow-primary',
    bgColor: 'bg-burrow-primary/10'
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
    color: 'text-burrow-primary',
    bgColor: 'bg-burrow-primary/10'
  },
  parcel_arrived: {
    label: 'Parcel Arrived at Warehouse',
    icon: Package,
    color: 'text-burrow-primary',
    bgColor: 'bg-burrow-primary/10'
  },
  in_storage: {
    label: 'In Storage',
    icon: Package,
    color: 'text-burrow-primary',
    bgColor: 'bg-burrow-primary/10'
  },
  preparing_dispatch: {
    label: 'Preparing for Dispatch',
    icon: Package,
    color: 'text-burrow-primary',
    bgColor: 'bg-burrow-primary/10'
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    icon: Truck,
    color: 'text-burrow-primary',
    bgColor: 'bg-burrow-primary/10'
  },
  delivered: {
    label: 'Delivered',
    icon: Home,
    color: 'text-burrow-primary',
    bgColor: 'bg-burrow-primary/10'
  },
  issue_reported: {
    label: 'Issue Reported',
    icon: Clock,
    color: 'text-red-500',
    bgColor: 'bg-red-100'
  }
};

// statusOrder defines the chronological order for animation.
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

// StatusTracker animates and displays the delivery timeline.
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

  const formatTimestamp = (timestamp) => new Date(timestamp).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="card-padded">
      <h3 className="text-xl font-semibold text-burrow-text-primary mb-6">Order Status</h3>

      <div className="timeline">
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
              className={`timeline-item ${
                isRevealed ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'
              }`}
            >
              <div
                className={`timeline-icon ${
                  isCompleted
                    ? `${config.bgColor} shadow-sm shadow-burrow-border/40`
                    : 'bg-burrow-background border border-burrow-border'
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-colors duration-500 ${
                    isCompleted ? config.color : 'text-burrow-text-muted'
                  }`}
                />
              </div>

              <div className="timeline-content">
                <div className="flex items-center justify-between">
                  <p className={`timeline-title ${
                    isCompleted ? 'text-burrow-text-primary' : 'text-burrow-text-muted'
                  }`}>
                    {config.label}
                    {isCurrent && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-burrow-primary text-burrow-text-inverse">
                        Current
                      </span>
                    )}
                  </p>

                  {statusEntry && (
                    <p className="timeline-meta">
                      {formatTimestamp(statusEntry.timestamp)}
                    </p>
                  )}
                </div>

                {statusEntry && (statusEntry.notes || statusEntry.note) && (
                  <p className="text-sm text-burrow-text-secondary mt-1">
                    {statusEntry.notes ?? statusEntry.note}
                  </p>
                )}

                {index < statusOrder.length - 1 && (
                  <div className="relative w-px h-6 ml-5 mt-2 bg-burrow-border overflow-hidden">
                    <div
                      className={`absolute inset-0 bg-burrow-primary/40 transform origin-top transition-transform duration-500 ease-out ${
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
