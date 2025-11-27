import { messaging, getToken, onMessage, initializeMessaging } from "./firebase-config";

// JomSmart VAPID Key
const VAPID_KEY = "BMggImA6yvEOTFkzLpM2-E6_PWuvVyrdtcrY2dxHF74IEhztvxA4BSWlMQ0Nb_rgcjq7TblY3ucZKfUzyUrNUOM";

/**
 * Requests Firebase notification permission and returns FCM token
 * @returns {Promise<string|null>} FCM token or null if permission denied
 */
export const requestFirebaseNotificationPermission = async () => {
    try {
        // Check if messaging is supported
        const messagingInstance = await initializeMessaging();
        if (!messagingInstance) {
            return null;
        }

        // Ensure service worker is ready before getting token
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.ready;
            } catch (swError) {
                // Continue anyway
            }
        }

        // Get token - permission should already be granted at this point
        // Edge requires service worker to be ready before getToken
        const token = await getToken(messagingInstance, {
            vapidKey: VAPID_KEY,
        });
        
        if (token) {
            return token;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting FCM token:", error);
        return null;
    }
};

