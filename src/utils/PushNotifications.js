import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getDatabase, ref, onChildAdded, query, orderByChild, limitToLast } from "firebase/database";
import { app } from "../firebase";

// Ensure messaging is only initialized if supported by the browser
let messaging = null;

export const initializePushNotifications = async () => {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    try {
      messaging = getMessaging(app);

      // Register the service worker explicitly
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registered successfully:', registration);

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted.');

        // Get the FCM Token
        // You should ideally put your VAPID key here if you set it up in Firebase Console
        const token = await getToken(messaging, { 
          serviceWorkerRegistration: registration
        });

        if (token) {
          console.log('FCM Token:', token);
          // Here you would typically send this token to your backend/database 
          // so your Vercel backend knows exactly which device to send push notifications to.
          // For now, since we use topics on the backend, we just need the app to be subscribed.
        } else {
          console.log('No registration token available. Request permission to generate one.');
        }
      } else {
        console.log('Unable to get permission to notify.');
      }
    } catch (error) {
      console.error('Error setting up push notifications:', error);
    }
  }
};

// Listen for foreground messages (when the app is actively open)
export const setupForegroundMessageListener = (onMessageReceived) => {
  if (!messaging) return;
  onMessage(messaging, (payload) => {
    console.log('Message received in foreground: ', payload);
    onMessageReceived(payload);
  });
};

// Listen directly to the database for new security threats (Bypasses Vercel Admin SDK requirements)
export const setupDatabaseNotificationListener = () => {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  
  const db = getDatabase(app);
  const reportsRef = query(ref(db, 'security_reports'), limitToLast(1));
  
  let isInitialLoad = true;
  
  onChildAdded(reportsRef, (snapshot) => {
    if (isInitialLoad) {
      isInitialLoad = false;
      return; // Ignore old data on first load
    }
    
    const data = snapshot.val();
    if (data && data.threatDetected) {
      if (Notification.permission === 'granted') {
        const title = `🚨 FARM THREAT (Level ${data.threatLevel})`;
        const options = {
          body: data.description,
          icon: '/android-chrome-192x192.png',
          image: data.imageUrl,
          vibrate: [200, 100, 200, 100, 200]
        };
        
        // Show native notification
        new Notification(title, options);
        
        // Play an alarm sound if the browser allows it
        try {
          const audio = new Audio('/alarm.mp3'); // Fallback if exists, else silent
          audio.play().catch(e => console.log("Audio play blocked by browser:", e));
        } catch (e) {}
      }
    }
  });
};

const playSOSAlarm = () => {
  try {
    // You can use a loud audio file here
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create a simple oscillator siren sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'square';
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(800, audioContext.currentTime + 0.5);
    oscillator.frequency.linearRampToValueAtTime(400, audioContext.currentTime + 1);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 3); // Play for 3 seconds
  } catch (e) {
    console.error("Audio play error", e);
  }
};
