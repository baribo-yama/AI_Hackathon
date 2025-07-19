import { useState } from 'react';

function CommentForm({ challenge }) {
    const [comment, setComment] = useState('');
    const [userName, setUserName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        // バックエンドAPIにデータを送信
        await fetch('/api/clear', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userName: userName,
                challengeName: challenge.name,
                points: challenge.points,
                comment: comment
            })
        });
        alert('お疲れ様でした！');
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>🎉 チャレンジクリア！ 🎉</h3>
            <input 
                type="text" 
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="ニックネーム"
                required 
            />
            <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="超余裕だった！" 
                required
            ></textarea>
            <button type="submit">投稿してポイント獲得！</button>
        </form>
    );
}

export default CommentForm;