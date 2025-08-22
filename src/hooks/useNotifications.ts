import { useState, useCallback } from 'react';
import type { Notification } from '../components/GameNotifications';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((
    type: Notification['type'],
    title: string,
    message: string,
    duration?: number
  ) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const notification: Notification = {
      id,
      type,
      title,
      message,
      duration
    };

    setNotifications(prev => [...prev, notification]);
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Helper methods for different notification types
  const showSuccess = useCallback((title: string, message: string, duration?: number) => {
    return addNotification('success', title, message, duration);
  }, [addNotification]);

  const showError = useCallback((title: string, message: string, duration?: number) => {
    return addNotification('error', title, message, duration);
  }, [addNotification]);

  const showInfo = useCallback((title: string, message: string, duration?: number) => {
    return addNotification('info', title, message, duration);
  }, [addNotification]);

  const showWarning = useCallback((title: string, message: string, duration?: number) => {
    return addNotification('warning', title, message, duration);
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showInfo,
    showWarning
  };
};
