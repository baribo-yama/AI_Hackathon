import express from 'express';
import cors from 'cors';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const creds = {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\n/g, '\n'),
};


// --- 初期設定 ---
const app = express();
app.use(cors()); // CORSを許可
app.use(express.json());

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

const serviceAccountAuth = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);

// --- APIエンドポイント ---

// ランキングデータを取得するAPI
app.get('/api/ranking', async (req, res) => {
    try {
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
        const rows = await sheet.getRows();

        const userPoints = {};
        rows.forEach(row => {
            const userName = row.get('userName');
            const points = parseInt(row.get('points'), 10);
            if(userName && !isNaN(points)) {
                userPoints[userName] = (userPoints[userName] || 0) + points;
            }
        });

        const ranking = Object.entries(userPoints)
            .sort(([, a], [, b]) => b - a)
            .map(([name, totalPoints], index) => ({ rank: index + 1, name, totalPoints }));

        res.json(ranking);
    } catch (error) {
        console.error('Error fetching ranking:', error);
        res.status(500).json({ error: 'Failed to fetch ranking data' });
    }
});

// チャレンジクリアの記録を書き込むAPI
app.post('/api/clear', async (req, res) => {
    try {
        const { userName, challengeName, points, comment } = req.body;

        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];

        await sheet.addRow({
            timestamp: new Date().toISOString(),
            userId: 'user_' + Date.now(), // 簡単なユニークID
            userName,
            challengeName,
            points,
            comment,
        });
        res.status(201).json({ message: 'Challenge data saved successfully!' });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ error: 'Failed to save data' });
    }
});


// --- サーバー起動 ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});