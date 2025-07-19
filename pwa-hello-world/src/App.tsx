import { useEffect, useState } from "react";

function App(): JSX.Element {
  const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;

  const [registered, setRegistered] = useState<boolean>(false);
  const [name, setName] = useState<string>("");

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready.then((registration: ServiceWorkerRegistration) => {
        // You can do something with the registration here
      });
    }
  }, []);

  const handleSubscribe = async (): Promise<void> => {
    if (!("serviceWorker" in navigator)) {
      console.error("Service Worker not supported");
      return;
    }

    if (!VAPID_PUBLIC_KEY) {
      console.error("VAPID_PUBLIC_KEY is not defined.");
      alert("VAPID_PUBLIC_KEY is not defined. Please set it in your environment variables.");
      return;
    }

    try {
      const registration: ServiceWorkerRegistration = await navigator.serviceWorker.ready;
      const subscription: PushSubscription = await registration.pushManager.subscribe({
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
    } catch (error: any) {
      console.error("Error subscribing to notifications:", error);
      alert("Error subscribing to notifications.");
    }
  };

  const handleSendNotification = async (): Promise<void> => {
    try {
      await fetch("/api/send-notification", {
        method: "POST",
      });
      alert("Notification sent!");
    } catch (error: any) {
      console.error("Error sending notification:", error);
      alert("Error sending notification.");
    }
  };

  const handleRegister = (): void => {
    // ここに登録ロジックを追加します。
    // 例えば、Supabaseにユーザー情報を保存する処理など。
    // 現時点では、登録状態を切り替えるだけにします。
    setRegistered(true);
    alert(`User ${name} registered!`);
  };

  // Helper function to convert VAPID key
  function urlBase64ToUint8Array(base64String: string): Uint8Array {
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          />
          <button onClick={handleRegister}>登録</button>
        </div>
      )}
    </div>
  );
}

export default App;
