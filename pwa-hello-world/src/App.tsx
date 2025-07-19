import { useState, useEffect } from 'react';
import './App.css';
import ChallengeScreen from './components/ChallengeScreen';
import CompletionScreen from './components/CompletionScreen';
import RankingScreen from './components/RankingScreen';
import StartScreen from './components/StartScreen';

// 仮のチャレンジデータ
const MOCK_CHALLENGE = {
    name: '腕立て伏せ',
    points: 20,
    duration: 30, // 秒
};

export default function App() {
    // ユーザー情報をstateで管理
    const [user, setUser] = useState<{ nickname: string; userId: string } | null>(null);
    const [gameState, setGameState] = useState('start'); // 'start', 'challenge', 'completion', 'ranking'

    // ページ読み込み時に、ブラウザに保存されたニックネームを探す
    useEffect(() => {
        const savedNickname = localStorage.getItem('kin-challe-nickname');
        const savedUserId = localStorage.getItem('kin-challe-userId');
        if (savedNickname && savedUserId) {
            setUser({ nickname: savedNickname, userId: savedUserId });
        }
    }, []);

    // スタートボタンが押された時の処理
    const handleStart = (nickname: string, userId: string) => {
        setUser({ nickname, userId });
        setGameState('challenge');
    };

    const renderGameState = () => {
        switch (gameState) {
            case 'start':
                // ニックネームが既にあれば、すぐにチャレンジ画面へ
                if (user) {
                    return <ChallengeScreen challenge={MOCK_CHALLENGE} onComplete={() => setGameState('completion')} />;
                }
                return <StartScreen onStart={handleStart} />;
            case 'challenge':
                return <ChallengeScreen challenge={MOCK_CHALLENGE} onComplete={() => setGameState('completion')} />;
            case 'completion':
                // ユーザー情報がない場合はスタート画面に戻す
                if (!user) {
                    return <StartScreen onStart={handleStart} />;
                }
                return <CompletionScreen challenge={MOCK_CHALLENGE} user={user} onFinish={() => setGameState('ranking')} />;
            case 'ranking':
                return <RankingScreen />;
            default:
                return <StartScreen onStart={handleStart} />;
        }
    };

    // PWAのプッシュ通知登録ロジック
    const VAPID_PUBLIC_KEY = import.meta.env.VITE_APP_VAPID_PUBLIC_KEY;
    const [registeredForPush, setRegisteredForPush] = useState(false);
    const [pushName, setPushName] = useState('');
    const [isLoadingPush, setIsLoadingPush] = useState(false);

    useEffect(() => {
        // 既存の購読情報を確認
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.ready.then(async (registration) => {
                const subscription = await registration.pushManager.getSubscription();
                if (subscription) {
                    // 購読済みであれば、ユーザー名をローカルストレージから取得して表示
                    const savedPushName = localStorage.getItem('pwa-push-name');
                    if (savedPushName) {
                        setPushName(savedPushName);
                        setRegisteredForPush(true);
                    }
                }
            });
        }
    }, []);

    const handleRegisterPush = async () => {
        if (!pushName.trim()) {
            alert('名前を入力してください');
            return;
        }

        if (!('serviceWorker' in navigator)) {
            alert('Service Worker not supported');
            return;
        }

        setIsLoadingPush(true);

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });

            const response = await fetch('/api/start-notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: pushName.trim(),
                    subscription
                }),
            });

            if (!response.ok) {
                throw new Error('登録に失敗しました');
            }

            // スケジューラーを開始
            await fetch('/api/scheduler', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'start' }),
            });

            localStorage.setItem('pwa-push-name', pushName.trim());
            setRegisteredForPush(true);
            alert('登録完了！1分おきに筋トレ通知が届きます。');
        } catch (error: any) {
            console.error('Error registering for push:', error);
            alert('プッシュ通知の登録に失敗しました: ' + error.message);
        } finally {
            setIsLoadingPush(false);
        }
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
        <div className="app-container">
            <header className="app-header">
                <h1>筋チャレ</h1>
                {user && <p className="welcome-message">ようこそ、{user.nickname}さん！</p>}
            </header>
            <main>
                {renderGameState()}
            </main>

            <div className="card" style={{ marginTop: '20px' }}>
                <h2>プッシュ通知登録</h2>
                {registeredForPush ? (
                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{ color: '#4CAF50' }}>登録済み！</h3>
                        <p style={{ fontSize: '18px', marginBottom: '20px' }}>
                            {pushName}さん、1分おきに筋トレ通知が届きます。
                        </p>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <input
                            type="text"
                            placeholder="通知を受け取る名前"
                            value={pushName}
                            onChange={(e) => setPushName(e.target.value)}
                            style={{
                                padding: '12px',
                                border: '1px solid #ccc',
                                borderRadius: '8px',
                                width: '100%',
                                maxWidth: '300px',
                                fontSize: '16px',
                                marginBottom: '15px'
                            }}
                        />
                        <button
                            onClick={handleRegisterPush}
                            disabled={isLoadingPush || !pushName.trim()}
                            style={{
                                padding: '12px 30px',
                                backgroundColor: isLoadingPush ? '#cccccc' : '#4CAF50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: isLoadingPush ? 'not-allowed' : 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold'
                            }}
                        >
                            {isLoadingPush ? '登録中...' : 'プッシュ通知を登録する'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}