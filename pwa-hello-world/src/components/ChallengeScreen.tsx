import { useState, useEffect } from 'react';

interface Challenge {
  name: string;
  points: number;
  duration: number;
}

interface ChallengeScreenProps {
  challenge: Challenge;
  onComplete: () => void;
}

const ChallengeScreen = ({ challenge, onComplete }: ChallengeScreenProps) => {
  const [timeLeft, setTimeLeft] = useState(challenge.duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, onComplete]);

  return (
    <div className="card">
      <h2>{challenge.name}</h2>
      <div className="timer-display">{timeLeft}</div>
      <p>残り時間内にチャレンジを完了しよう！</p>
      <button onClick={onComplete} className="button">
        完了！
      </button>
    </div>
  );
};

export default ChallengeScreen;