import React, { useEffect } from 'react';
import './GameNotifications.css';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

interface GameNotificationsProps {
  notifications: Notification[];
  onRemoveNotification: (id: string) => void;
}

const GameNotifications: React.FC<GameNotificationsProps> = ({
  notifications,
  onRemoveNotification
}) => {
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.duration !== 0) {
        const timer = setTimeout(() => {
          onRemoveNotification(notification.id);
        }, notification.duration || 4000);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, onRemoveNotification]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="game-notifications">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type}`}
          onClick={() => onRemoveNotification(notification.id)}
        >
          <div className="notification-icon">
            {getNotificationIcon(notification.type)}
          </div>
          <div className="notification-content">
            <div className="notification-title">{notification.title}</div>
            <div className="notification-message">{notification.message}</div>
          </div>
          <button
            className="notification-close"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveNotification(notification.id);
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default GameNotifications;
