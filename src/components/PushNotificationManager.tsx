"use client"

import { useState, useEffect } from "react"
import { subscribeUser, unsubscribeUser, sendNotification } from "../app/actions"

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true)
      registerServiceWorker()
    }
  }, [])

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      })
      const sub = await registration.pushManager.getSubscription()
      setSubscription(sub)
    } catch (error) {
      console.error("Failed to register service worker:", error)
    }
  }

  async function subscribeToPush() {
    try {
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      })
      setSubscription(sub)
      await subscribeUser(sub)
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error)
    }
  }

  async function unsubscribeFromPush() {
    try {
      if (subscription) {
        await subscription.unsubscribe()
        await unsubscribeUser(subscription)
        setSubscription(null)
      }
    } catch (error) {
      console.error("Failed to unsubscribe from push notifications:", error)
    }
  }

  async function sendTestNotification() {
    if (subscription) {
      try {
        const result = await sendNotification(message)
        console.log(result.message)
        setMessage("")
      } catch (error) {
        console.error("Failed to send notification:", error)
      }
    }
  }

  if (!isSupported) {
    return <p>Push notifications are not supported in this browser.</p>
  }

  return (
    <div className="mt-4 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Push Notifications</h3>
      {subscription ? (
        <>
          <p className="mb-2">You are subscribed to push notifications.</p>
          <button onClick={unsubscribeFromPush} className="bg-red-500 text-white px-4 py-2 rounded mb-2">
            Unsubscribe
          </button>
          <input
            type="text"
            placeholder="Enter notification message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <button onClick={sendTestNotification} className="bg-blue-500 text-white px-4 py-2 rounded">
            Send Test Notification
          </button>
        </>
      ) : (
        <>
          <p className="mb-2">You are not subscribed to push notifications.</p>
          <button onClick={subscribeToPush} className="bg-green-500 text-white px-4 py-2 rounded">
            Subscribe
          </button>
        </>
      )}
    </div>
  )
}

