import { requestFirebaseNotificationPermission } from "../NotificationPermission";
import { messaging, initializeMessaging, onMessage, getToken } from "../firebase-config";
import http from "./http";

/**
 * Initializes Firebase notifications for a user
 * @param {string} customerId - Customer ID to associate with FCM token (optional)
 * @returns {Promise<{success: boolean, token: string|null, error: string|null}>}
 */
export async function initializeNotifications(customerId) {

  try {
    // 1. Check if service worker is supported
    if (!("serviceWorker" in navigator)) {
      return {
        success: false,
        token: null,
        error: "Service Worker not supported in this browser",
      };
    }

    // 2. Check if messaging is available
    const messagingInstance = await initializeMessaging();
    if (!messagingInstance) {
      return {
        success: false,
        token: null,
        error: "Firebase messaging not available in this browser",
      };
    }

    // 3. Register service worker (must be done before requesting FCM token)
    let swRegistration;
    try {
      // Get all service worker registrations
      const allRegistrations = await navigator.serviceWorker.getRegistrations();
      
      // Unregister PWA service worker if it exists (to prevent conflicts)
      for (const reg of allRegistrations) {
        const sw = reg.active || reg.waiting || reg.installing;
        if (sw && sw.scriptURL && sw.scriptURL.includes('service-worker.js')) {
          try {
            await reg.unregister();
          } catch (e) {
            // Ignore errors
          }
        }
      }
      
      // Wait a bit after unregistering
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Get fresh registrations after cleanup
      const freshRegistrations = await navigator.serviceWorker.getRegistrations();
      
      // Check if Firebase messaging service worker is already registered and active
      const firebaseSW = freshRegistrations.find(reg => {
        const sw = reg.active || reg.waiting || reg.installing;
        return sw && sw.scriptURL && sw.scriptURL.includes('firebase-messaging-sw.js');
      });
      
      if (firebaseSW && firebaseSW.active) {
        swRegistration = firebaseSW;
      } else {
        // Register Firebase messaging service worker
        swRegistration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );
      }
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      
      // Ensure the Firebase messaging service worker is active
      if (swRegistration.installing) {
        await new Promise((resolve) => {
          const installingWorker = swRegistration.installing;
          const stateChangeHandler = () => {
            if (installingWorker.state === 'installed' || installingWorker.state === 'activated') {
              installingWorker.removeEventListener('statechange', stateChangeHandler);
              resolve();
            }
          };
          installingWorker.addEventListener('statechange', stateChangeHandler);
          setTimeout(() => {
            installingWorker.removeEventListener('statechange', stateChangeHandler);
            resolve();
          }, 5000);
        });
      }
      
      // Force activation if waiting
      if (swRegistration.waiting) {
        swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Final check - ensure we have an active service worker
      if (!swRegistration.active) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (swError) {
      console.error("Service worker registration failed:", swError);
      // Continue anyway - some browsers might still work
    }

    // 4. Request permission and get FCM token
    const token = await requestFirebaseNotificationPermission();

    if (!token) {
      return {
        success: false,
        token: null,
        error: "Notification permission denied or token not generated",
      };
    }

    // 5. Save FCM token to backend
    try {
      const userAgent = navigator.userAgent || null;
      const payload = {
        token: token.trim(),
        customerId: customerId || null,
        userAgent: userAgent,
      };

      await http.post(`/jomfood/fcm-token`, payload);
    } catch (error) {
      // Don't fail - token is still valid for receiving notifications
    }

    // 6. Set up foreground message listener
    setupForegroundMessageListener(messagingInstance);

    return {
      success: true,
      token,
      error: null,
    };
  } catch (error) {
    console.error("❌ Error initializing notifications:", error);
    return {
      success: false,
      token: null,
      error: error.message,
    };
  }
}

/**
 * Sets up listener for foreground messages (when app tab is active)
 * NOTE: We don't show a notification here because:
 * 1. When app is in foreground, we just update the UI (red dot indicator)
 * 2. The service worker will handle background notifications
 * 3. Showing notification here would cause duplicates
 */
function setupForegroundMessageListener(messagingInstance) {
  onMessage(messagingInstance, (payload) => {
    // Just log the notification - don't show it
    // The NotificationContext will handle UI updates (red dot indicator)
    console.log('Foreground notification received:', payload);
    // UI updates are handled by NotificationContext
  });
}

/**
 * Updates existing FCM token with customerId (call after login)
 * This will link the token to the customer account
 * @param {string} customerId - Customer ID to link with FCM token
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function updateFCMTokenWithCustomerId(customerId) {
  if (!customerId) {
    return { success: false, error: "No customerId provided" };
  }

  try {
    // Check if notification permission is granted
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return { success: false, error: "Notification permission not granted" };
    }

    // Get existing FCM token
    const messagingInstance = await initializeMessaging();
    if (!messagingInstance) {
      return { success: false, error: "Firebase messaging not available" };
    }

    // Get the current FCM token
    const VAPID_KEY = "BMggImA6yvEOTFkzLpM2-E6_PWuvVyrdtcrY2dxHF74IEhztvxA4BSWlMQ0Nb_rgcjq7TblY3ucZKfUzyUrNUOM";
    const token = await getToken(messagingInstance, {
      vapidKey: VAPID_KEY,
    });

    if (!token) {
      return { success: false, error: "No FCM token available" };
    }

    // Update token with customerId
    const userAgent = navigator.userAgent || null;
    const payload = {
      token: token.trim(),
      customerId: customerId,
      userAgent: userAgent,
    };

    const response = await http.post(`/jomfood/fcm-token`, payload);

    if (response.data?.success) {
      return { success: true, error: null };
    } else {
      return { success: false, error: "Unexpected backend response" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Removes customerId from FCM token (call on logout)
 * This makes the token anonymous/public again
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function removeCustomerIdFromFCMToken() {
  try {
    // Check if notification permission is granted
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return { success: false, error: "Notification permission not granted" };
    }

    // Get existing FCM token
    const messagingInstance = await initializeMessaging();
    if (!messagingInstance) {
      return { success: false, error: "Firebase messaging not available" };
    }

    // Get the current FCM token
    const VAPID_KEY = "BMggImA6yvEOTFkzLpM2-E6_PWuvVyrdtcrY2dxHF74IEhztvxA4BSWlMQ0Nb_rgcjq7TblY3ucZKfUzyUrNUOM";
    const token = await getToken(messagingInstance, {
      vapidKey: VAPID_KEY,
    });

    if (!token) {
      return { success: false, error: "No FCM token available" };
    }

    // Remove customerId from token (set to null to make it anonymous/public)
    const userAgent = navigator.userAgent || null;
    const payload = {
      token: token.trim(),
      customerId: null,
      userAgent: userAgent,
    };

    const response = await http.post(`/jomfood/fcm-token`, payload);

    if (response.data?.success) {
      return { success: true, error: null };
    } else {
      return { success: false, error: "Unexpected backend response" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Cleanup notifications (call on logout)
 */
export function cleanupNotifications() {
  // Stop any polling or listeners
}

