/* global importScripts, firebase */
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js')

firebase.initializeApp({
    apiKey: "AIzaSyCz0nesx4F2IGzIGTuqloIuy0CPyfRopek",
    authDomain: "kalame-53363.firebaseapp.com",
    projectId: "kalame-53363",
    storageBucket: "kalame-53363.firebasestorage.app",
    messagingSenderId: "621834198067",
    appId: "1:621834198067:web:81d6da745008d6c32fd746",
    measurementId: "G-N33SPK07W8"
  });

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  try {
    // Log for debugging in Service Worker console
    // Open DevTools → Application → Service Workers to see these logs
    console.log('[SW] onBackgroundMessage:', payload)
  } catch {}
  const raw = payload || {}
  const n = raw.notification || {}
  const d = raw.data || {}
  const title = n.title || d.title || raw.title || 'پیام جدید'
  const body = n.body || d.body || raw.body || ''
  const url = d.url || raw.url || '/'
  self.registration.showNotification(title, {
    body,
    icon: '/kalame-logo.png',
    data: { url, ...d },
  })
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification?.data?.url || '/'
  event.waitUntil(self.clients.openWindow(url))
})



