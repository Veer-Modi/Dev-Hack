import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { getAuth } from 'firebase/auth';

// Firebase configuration - these values should be replaced with actual Firebase project config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Request permission and get FCM token
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Get the token for this device
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });
      return token;
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

// Listen for foreground messages
export const onForegroundMessage = (callback: (payload: any) => void) => {
  onMessage(messaging, (payload) => {
    callback(payload);
  });
};

// Subscribe user to notifications
export const subscribeToNotifications = async (userId: string, token: string, filters: any) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming JWT token
      },
      body: JSON.stringify({
        userId,
        token,
        filters,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to subscribe to notifications');
    }

    return await response.json();
  } catch (error) {
    console.error('Error subscribing to notifications:', error);
    throw error;
  }
};

// Unsubscribe user from notifications
export const unsubscribeFromNotifications = async (userId: string, token: string) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        userId,
        token,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to unsubscribe from notifications');
    }

    return await response.json();
  } catch (error) {
    console.error('Error unsubscribing from notifications:', error);
    throw error;
  }
};

// Get user's notification subscriptions
export const getUserSubscriptions = async (userId: string) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/subscriptions/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get subscriptions');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    throw error;
  }
};

// Send notification to user
export const sendNotification = async (userId: string, title: string, body: string, data?: any) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        userId,
        title,
        body,
        data,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send notification');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};