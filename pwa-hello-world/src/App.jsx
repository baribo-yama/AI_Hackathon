import { useEffect } from "react";

function App() {
  const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready.then((registration) => {
        // You can do something with the registration here
      });
    }
  }, []);

  const handleSubscribe = async () => {
    if (!("serviceWorker" in navigator)) {
      console.error("Service Worker not supported");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscription }),
      });

      alert("Subscribed to notifications!");
    } catch (error) {
      console.error("Error subscribing to notifications:", error);
      alert("Error subscribing to notifications.");
    }
  };

  const handleSendNotification = async () => {
    try {
      await fetch("/api/send-notification", {
        method: "POST",
      });
      alert("Notification sent!");
    } catch (error) {
      console.error("Error sending notification:", error);
      alert("Error sending notification.");
    }
  };

  // Helper function to convert VAPID key
  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // トップ画面ここに
  return (
    <div>
      <h1>Hello PWA - Updated Again!</h1>
      <button onClick={handleSubscribe}>Subscribe to Notifications</button>
      <button onClick={handleSendNotification}>Send Notification</button>
      <h1>初チャレンジ通知アプリ</h1>
      {registered ? (
        <p>登録完了！1分おきに通知が届きます。</p>
      ) : (
        <div>
          <input
            type="text"
            placeholder="名前を入力"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={handleRegister}>登録</button>
        </div>
      )}
    </div>
  );
}

export default App;
