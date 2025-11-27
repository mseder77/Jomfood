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

// ✅ Fallback: Handle standard push events (in case FCM fails or DevTools test)
self.addEventListener("push", function (event) {
    // Check notification permission
    if (self.Notification.permission !== 'granted') {
        return;
    }

    let notificationData = {
        title: "New Notification",
        body: "You have a new notification",
        icon: "/jomfood-rlc0lk0I.png",
        badge: "/jomfood-rlc0lk0I.png"
    };

    // Try to parse notification data
    if (event.data) {
        try {
            // Handle different data formats
            let data;
            let textData = null;
            
            // First, try to get text data (for DevTools plain text testing)
            try {
                if (event.data.text) {
                    textData = event.data.text();
                } else if (typeof event.data === 'string') {
                    textData = event.data;
                }
            } catch (textError) {
                // Ignore text extraction errors
            }
            
            // Try to parse as JSON if we have text data
            if (textData) {
                try {
                    // Try to parse as JSON first
                    data = JSON.parse(textData);
                } catch (jsonError) {
                    // If JSON parsing fails, it's plain text (like DevTools test)
                    notificationData.body = textData;
                    data = null;
                }
            } else {
                // Try JSON method
                try {
                    data = event.data.json();
                } catch (jsonError) {
                    // If json() fails, try direct access
                    data = event.data;
                }
            }
            
            // Only process JSON data structure if we have parsed JSON
            if (data && typeof data === 'object') {
                notificationData = {
                    title: data.notification?.title || data.title || notificationData.title,
                    body: data.notification?.body || data.body || data.message || notificationData.body,
                    icon: data.notification?.icon || data.icon || notificationData.icon,
                    badge: data.notification?.badge || data.badge || notificationData.badge,
                    data: data.data || data
                };
            }
            // If data is null, we already set the body from plain text above
            
        } catch (e) {
            // Fallback: try to get text and use as body
            try {
                if (event.data.text) {
                    notificationData.body = event.data.text();
                } else if (typeof event.data === 'string') {
                    notificationData.body = event.data;
                }
            } catch (fallbackError) {
                // Ignore fallback errors
            }
        }
    }

    // Show notification
    const notificationPromise = self.registration.showNotification(notificationData.title, {
        body: notificationData.body,
        icon: notificationData.icon,
        badge: notificationData.badge,
        data: notificationData.data || {},
        tag: 'jomfood-push-notification',
        requireInteraction: false,
        silent: false
    }).catch(error => {
        console.error("Error showing notification:", error);
        // Try again with minimal options
        return self.registration.showNotification(notificationData.title, {
            body: notificationData.body,
            tag: 'jomfood-push-minimal'
        });
    });

    event.waitUntil(notificationPromise);
});

// Handle notification clicks
self.addEventListener("notificationclick", function (event) {
    event.notification.close();

    // Open app or specific URL
    event.waitUntil(
        clients.openWindow(event.notification.data?.url || "/")
    );
});

