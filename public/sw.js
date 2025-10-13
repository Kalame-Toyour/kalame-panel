self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  let data = {}
  try { data = event.data?.json?.() || JSON.parse(event.data?.text?.() || '{}') } catch {}
  const title = data.title || 'پیام جدید'
  const body = data.body || ''
  const url = data.url || '/'
  // Get logo based on current domain
  const logo = self.location.hostname === 'kalame.chat' ? '/kalame-logo.png' : '/okian-logo.svg'
  event.waitUntil(self.registration.showNotification(title, {
    body,
    icon: logo,
    data: { url }
  }))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification?.data?.url || '/'
  event.waitUntil(self.clients.openWindow(url))
})


