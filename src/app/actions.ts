"use server";

import webpush from "web-push";

// Ensure VAPID keys are set
if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  console.error("VAPID keys are not set. Push notifications will not work.");
} else {
  webpush.setVapidDetails(
    "mailto:your-email@example.com", // Replace with your email
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// Define the PushSubscription type explicitly
interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Store subscriptions (Replace this with a real database in production)
let subscriptions: PushSubscription[] = [];

/**
 * Subscribe a user to push notifications.
 */
export async function subscribeUser(sub: PushSubscription) {
  if (!sub || !sub.endpoint || !sub.keys || !sub.keys.p256dh || !sub.keys.auth) {
    console.error("Invalid subscription object received:", sub);
    throw new Error("Invalid subscription: Missing required properties");
  }

  // Avoid duplicate subscriptions
  if (!subscriptions.some((s) => s.endpoint === sub.endpoint)) {
    subscriptions.push(sub);
  }

  console.log("User subscribed:", sub);
  return { success: true };
}

/**
 * Unsubscribe a user from push notifications.
 */
export async function unsubscribeUser(sub: PushSubscription) {
  subscriptions = subscriptions.filter((s) => s.endpoint !== sub.endpoint);
  console.log("User unsubscribed:", sub);
  return { success: true };
}

/**
 * Send a push notification to all subscribers.
 */
export async function sendNotification(message: string) {
  if (subscriptions.length === 0) {
    throw new Error("No subscriptions available");
  }

  const notificationPayload = JSON.stringify({
    title: "Musical Loop App Notification",
    body: message,
    icon: "/icon-192x192.png",
  });

  console.log("Sending notifications to:", subscriptions.length, "subscribers");

  const results = await Promise.allSettled(
    subscriptions.map((sub) => {
      if (!sub.keys || !sub.keys.p256dh || !sub.keys.auth) {
        console.warn("Skipping invalid subscription:", sub);
        return Promise.reject("Invalid subscription: Missing keys");
      }
      return webpush.sendNotification(sub, notificationPayload);
    })
  );

  const successes = results.filter((r) => r.status === "fulfilled").length;
  const failures = results.filter((r) => r.status === "rejected").length;

  console.log(`Sent ${successes} notifications successfully. ${failures} failed.`);

  return {
    success: true,
    message: `Sent ${successes} notifications successfully. ${failures} failed.`,
  };
}
