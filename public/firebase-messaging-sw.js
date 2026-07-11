importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAzj0FLC2X_yIRHA7SG032DoF55F63lyBU",
  authDomain: "farm-cap-2.firebaseapp.com",
  projectId: "farm-cap-2",
  storageBucket: "farm-cap-2.firebasestorage.app",
  messagingSenderId: "392023711565",
  appId: "1:392023711565:web:b3774311e4e0577572e104",
  measurementId: "G-4HEGZ8LDX5",
  databaseURL: "https://farm-cap-2-default-rtdb.firebaseio.com"
};

// Initialize Firebase in the service worker
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Listen for background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || 'Farm Alert';
  const notificationOptions = {
    body: payload.notification?.body || 'New alert received from Farm Cap.',
    icon: '/favicon.svg',
    image: payload.data?.imageUrl, // This enables rich push notifications with images
    // Vibrate pattern: SOS (3 short, 3 long, 3 short)
    vibrate: [100, 50, 100, 50, 100, 50, 400, 50, 400, 50, 400, 50, 100, 50, 100, 50, 100],
    requireInteraction: true,
    data: payload.data
  };

  // The push notification itself doesn't play a sound automatically on all Android devices
  // unless we specify a custom sound or the OS handles it.
  // But we can trigger a notification.
  
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Add an event listener for when the user clicks the notification
self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] Notification click received.');
  
  event.notification.close();

  // Open the app when notification is clicked
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        let client = windowClients[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
