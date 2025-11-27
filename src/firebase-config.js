import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

// JomSmart Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyD6SizDRgrX9bGORiyJe3EcCckyM0_c2qo",
  authDomain: "jomsmart-76336.firebaseapp.com",
  projectId: "jomsmart-76336",
  storageBucket: "jomsmart-76336.firebasestorage.app",
  messagingSenderId: "225222312566",
  appId: "1:225222312566:web:a0552b12ddf97116e3d557",
  measurementId: "G-G5P8S46WGY"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Check if messaging is supported before initializing
let messaging = null;

const initializeMessaging = async () => {
  try {
    const supported = await isSupported();
    if (supported) {
      messaging = getMessaging(app);
      console.log("✅ Firebase Messaging initialized successfully");
      return messaging;
    } else {
      console.warn("⚠️ Firebase Messaging is not supported in this browser");
      return null;
    }
  } catch (error) {
    console.error("❌ Error initializing Firebase Messaging:", error);
    return null;
  }
};

// Initialize messaging immediately
initializeMessaging().then((messagingInstance) => {
  messaging = messagingInstance;
});

// Export for use in other files
export { messaging, getToken, onMessage, initializeMessaging };

