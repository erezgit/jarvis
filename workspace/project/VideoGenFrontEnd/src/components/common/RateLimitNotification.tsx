import * as React from 'react';
import { useEffect, useState } from 'react';

interface RateLimitNotificationProps {
  retryAfter: number;
  onRetry: () => void;
}

export const RateLimitNotification: React.FC<RateLimitNotificationProps> = ({
  retryAfter,
  onRetry,
}) => {
  const [timeLeft, setTimeLeft] = useState(retryAfter);

  useEffect(() => {
    if (timeLeft <= 0) {
      onRetry();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onRetry]);

  return (
    <div className="rounded-md bg-yellow-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">Rate Limit Exceeded</h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>Please wait {timeLeft} seconds before trying again.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
