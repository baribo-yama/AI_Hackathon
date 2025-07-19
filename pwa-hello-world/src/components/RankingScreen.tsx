import { useState, useEffect } from 'react';

// The backend API URL. This works for both local and Vercel environments.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface RankingData {
  rank: number;
  name: string;
  totalPoints: number;
}

const RankingScreen = () => {
    const [ranking, setRanking] = useState<RankingData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRanking = async () => {
            try {
                setLoading(true);
                // Use the full URL to fetch
                const response = await fetch(`${API_URL}/api/ranking`);
                if (!response.ok) {
                    throw new Error('Failed to fetch ranking data');
                }
                const data = await response.json();
                setRanking(data);
            } catch (err) {
                setError('ランキングの読み込みに失敗しました。APIサーバーが起動しているか確認してください。');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchRanking();
    }, []);

    if (loading) return <p>ランキングを読み込み中...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div className="card ranking-card">
            <h2>ランキング</h2>
            <ol className="ranking-list">
                {ranking.map((item) => (
                    <li key={item.rank}>
                        <span>{item.rank}位</span>
                        <span>{item.name}</span>
                        <span>{item.totalPoints} pt</span>
                    </li>
                ))}
            </ol>
        </div>
    );
};

export default RankingScreen;