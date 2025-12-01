// public/firebase-messaging-sw.js
// Service Worker for handling background notifications

// Import Firebase SDKs (using compat version for service workers)
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");

// Initialize Firebase with JomSmart configuration
firebase.initializeApp({
    apiKey: "AIzaSyD6SizDRgrX9bGORiyJe3EcCckyM0_c2qo",
    authDomain: "jomsmart-76336.firebaseapp.com",
    projectId: "jomsmart-76336",
    storageBucket: "jomsmart-76336.firebasestorage.app",
    messagingSenderId: "225222312566",
    appId: "1:225222312566:web:a0552b12ddf97116e3d557",
    measurementId: "G-G5P8S46WGY"
});

let messaging = null;

// Initialize messaging
const initializeMessaging = async () => {
    try {
        if (typeof firebase !== 'undefined' && firebase.messaging) {
            messaging = firebase.messaging();
            return messaging;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error initializing Firebase Messaging:", error);
        return null;
    }
};

// Initialize and set up background message handler
initializeMessaging().then((messagingInstance) => {
    if (messagingInstance) {
        // ✅ Main FCM background message handler
        messagingInstance.onBackgroundMessage(function (payload) {
            // Check notification permission
            if (self.Notification.permission !== 'granted') {
                return Promise.resolve();
            }

            const notificationTitle = payload.notification?.title || "New Notification";
            const notificationOptions = {
                body: payload.notification?.body || "You have a new notification",
                icon: payload.notification?.icon || "/jomfood-rlc0lk0I.png",
                badge: "/jomfood-rlc0lk0I.png",
                data: payload.data || {},
                tag: 'jomfood-fcm-notification',
                requireInteraction: false,
                silent: false
            };

            // Show notification
            return self.registration.showNotification(notificationTitle, notificationOptions)
                .catch(error => {
                    console.error("Error showing FCM notification:", error);
                    // Try again with minimal options
                    return self.registration.showNotification(notificationTitle, {
                        body: notificationOptions.body
                    });
                });
        });
    }
});

// ❌ REMOVED: Standard push event listener
// This was causing duplicate notifications because:
// 1. FCM's onBackgroundMessage already handles background notifications
// 2. Having both onBackgroundMessage AND push event listener = 2 notifications
// 3. Firebase handles push events automatically through onBackgroundMessage
// 
// If you need to test with DevTools, use the FCM test tool or send through Firebase Console
// The onBackgroundMessage handler above is sufficient for all FCM notifications

// Handle notification clicks
self.addEventListener("notificationclick", function (event) {
    event.notification.close();

    // Open app or specific URL
    event.waitUntil(
        clients.openWindow(event.notification.data?.url || "/")
    );
});

