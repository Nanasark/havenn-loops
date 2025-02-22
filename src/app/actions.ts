"use server"

import webpush from "web-push"

// Initialize webpush with VAPID keys
if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  console.error("VAPID keys are not set. Push notifications will not work.")
} else {
  webpush.setVapidDetails(
    "mailto:your-email@example.com", // Replace with your email
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  )
}

// In a real application, you'd store subscriptions in a database
let subscriptions: PushSubscription[] = []

export async function subscribeUser(sub: PushSubscription) {
  subscriptions.push(sub)
  return { success: true }
}

export async function unsubscribeUser(sub: PushSubscription) {
  subscriptions = subscriptions.filter((s) => s.endpoint !== sub.endpoint)
  return { success: true }
}

export async function sendNotification(message: string) {
  if (subscriptions.length === 0) {
    throw new Error("No subscriptions available")
  }

  const notificationPayload = JSON.stringify({
    title: "Musical Loop App Notification",
    body: message,
    icon: "/icon-192x192.png",
  })

  const results = await Promise.allSettled(
    subscriptions.map((sub) => webpush.sendNotification(sub, notificationPayload)),
  )

  const successes = results.filter((r) => r.status === "fulfilled").length
  const failures = results.filter((r) => r.status === "rejected").length

  return {
    success: true,
    message: `Sent ${successes} notifications successfully. ${failures} failed.`,
  }
}

