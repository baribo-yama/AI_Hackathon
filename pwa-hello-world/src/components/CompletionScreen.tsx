import { useState } from 'react';

// APIサーバーのURL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Challenge {
  name: string;
  points: number;
}

interface User {
    nickname: string;
    userId: string;
}

interface CompletionScreenProps {
  challenge: Challenge;
  user: User;
  onFinish: () => void;
}

const CompletionScreen = ({ challenge, user, onFinish }: CompletionScreenProps) => {
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment) {
            alert('コメントを入力してください。');
            return;
        }
        setIsSubmitting(true);
        
        try {
            const response = await fetch(`${API_URL}/api/clear`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userName: user.nickname,
                    userId: user.userId,
                    comment: comment,
                    challengeName: challenge.name,
                    points: challenge.points,
                }),
            });

            if (!response.ok) {
                throw new Error('記録の保存に失敗しました。');
            }
            
            alert('記録しました！');
            onFinish();

        } catch (error) {
            console.error(error);
            alert('エラーが発生しました。もう一度お試しください。');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="card">
            <h2>🎉 クリア！お疲れ様でした！ 🎉</h2>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="今日の感想を一言！（例: 余裕だった！）"
                    required
                ></textarea>
                <button type="submit" disabled={isSubmitting} className="button">
                    {isSubmitting ? '送信中...' : '記録してランキングを見る'}
                </button>
            </form>
        </div>
    );
};

export default CompletionScreen;