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

function App() {
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

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>筋チャレ</h1>
                {user && <p className="welcome-message">ようこそ、{user.nickname}さん！</p>}
            </header>
            <main>
                {renderGameState()}
            </main>
        </div>
    );
}

export default App;
