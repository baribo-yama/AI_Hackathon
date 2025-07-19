import { useEffect, useState } from "react";

function App(): JSX.Element {
  const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
  const [name, setName] = useState("");
  const [registered, setRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [registered, setRegistered] = useState<boolean>(false);
  const [name, setName] = useState<string>("");

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready.then((registration: ServiceWorkerRegistration) => {
        // You can do something with the registration here
      });
    }
  }, []);

<<<<<<< HEAD:pwa-hello-world/src/App.jsx
  const handleRegister = async () => {
    if (!name.trim()) {
      alert("名前を入力してください");
      return;
    }

    if (!("serviceWorker" in navigator)) {
      alert("Service Worker not supported");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Service Workerの準備
      const registration = await navigator.serviceWorker.ready;

      // 2. プッシュ通知の購読
      const subscription = await registration.pushManager.subscribe({
=======
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
>>>>>>> 1720767c8a2d356ae9f328e1e1a4d9ce0540f764:pwa-hello-world/src/App.tsx
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // 3. ユーザー情報とプッシュ通知情報をサーバーに送信
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          subscription
        }),
      });

<<<<<<< HEAD:pwa-hello-world/src/App.jsx
      if (!response.ok) {
        throw new Error("登録に失敗しました");
      }

            // 4. 1分おきの通知送信を開始
      await fetch("/api/start-notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          subscription
        }),
      });

      // 5. スケジューラーを開始
      await fetch("/api/scheduler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "start" }),
      });

      setRegistered(true);
      alert("登録完了！1分おきに筋トレ通知が届きます。");
    } catch (error) {
      console.error("Error registering:", error);
      alert("登録に失敗しました: " + error.message);
    } finally {
      setIsLoading(false);
=======
      alert("Subscribed to notifications!");
    } catch (error: any) {
      console.error("Error subscribing to notifications:", error);
      alert("Error subscribing to notifications.");
>>>>>>> 1720767c8a2d356ae9f328e1e1a4d9ce0540f764:pwa-hello-world/src/App.tsx
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

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ color: "#4CAF50", textAlign: "center", marginBottom: "30px" }}>
        初チャレンジ通知アプリ
      </h1>

      {registered ? (
        <div style={{ textAlign: "center" }}>
          <h2 style={{ color: "#4CAF50" }}>登録完了！</h2>
          <p style={{ fontSize: "18px", marginBottom: "20px" }}>
            {name}さん、1分おきに筋トレ通知が届きます。
          </p>
          <div style={{
            backgroundColor: "#e8f5e8",
            padding: "20px",
            borderRadius: "10px",
            border: "2px solid #4CAF50"
          }}>
            <p style={{ margin: "0", fontWeight: "bold" }}>
              💪 筋トレの時間になったら通知が届きます 💪
            </p>
          </div>
        </div>
      ) : (
<<<<<<< HEAD:pwa-hello-world/src/App.jsx
        <div style={{ textAlign: "center" }}>
          <h2 style={{ color: "#4CAF50", marginBottom: "20px" }}>
            ユーザー登録
          </h2>
          <div style={{ marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="名前を入力してください"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                width: "100%",
                maxWidth: "300px",
                fontSize: "16px",
                marginBottom: "15px"
              }}
            />
            <br />
            <button
              onClick={handleRegister}
              disabled={isLoading || !name.trim()}
              style={{
                padding: "12px 30px",
                backgroundColor: isLoading ? "#cccccc" : "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: isLoading ? "not-allowed" : "pointer",
                fontSize: "16px",
                fontWeight: "bold"
              }}
            >
              {isLoading ? "登録中..." : "登録する"}
            </button>
          </div>
          <p style={{ color: "#666", fontSize: "14px" }}>
            登録すると1分おきに筋トレの通知が届きます
          </p>
        </div>
      )}

      {/* デバッグ用ボタン（開発時のみ表示） */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <button onClick={handleSendNotification} style={{
            padding: "8px 16px",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}>
            テスト通知送信
          </button>
=======
        <div>
          <input
            type="text"
            placeholder="名前を入力"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          />
          <button onClick={handleRegister}>登録</button>
>>>>>>> 1720767c8a2d356ae9f328e1e1a4d9ce0540f764:pwa-hello-world/src/App.tsx
        </div>
      )}
    </div>
  );
}

export default App;
