import { useState } from 'react';

interface StartScreenProps {
  onStart: (nickname: string, userId: string) => void;
}

const StartScreen = ({ onStart }: StartScreenProps) => {
  const [nickname, setNickname] = useState('');

  const handleStart = () => {
    if (!nickname.trim()) {
      alert('ニックネームを入力してください。');
      return;
    }
    // Generate a simple unique ID and save it
    const userId = 'user_' + Date.now();
    localStorage.setItem('kin-challe-nickname', nickname);
    localStorage.setItem('kin-challe-userId', userId);
    onStart(nickname, userId);
  };

  return (
    <div className="card">
      <h2>今日のチャレンジに挑戦！</h2>
      <p>ニックネームを入力して、全国のライバルと競い合おう！</p>
      <input
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="ニックネーム"
      />
      <button onClick={handleStart} className="button">
        チャレンジ開始！
      </button>
    </div>
  );
};

export default StartScreen;