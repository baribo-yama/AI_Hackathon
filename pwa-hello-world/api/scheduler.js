import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_KEY;

// 通知送信の間隔（ミリ秒）- 1分 = 60000ms
const NOTIFICATION_INTERVAL = 60000;

// アクティブな通知タイマーを保持
let notificationTimer = null;

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { action } = req.body;

    if (action === 'start') {
      // 通知送信を開始
      if (notificationTimer) {
        clearInterval(notificationTimer);
      }

      notificationTimer = setInterval(async () => {
        await sendNotificationsToAllUsers();
      }, NOTIFICATION_INTERVAL);

      res.status(200).json({ message: 'Notification scheduler started' });
    } else if (action === 'stop') {
      // 通知送信を停止
      if (notificationTimer) {
        clearInterval(notificationTimer);
        notificationTimer = null;
      }
      res.status(200).json({ message: 'Notification scheduler stopped' });
    } else {
      res.status(400).json({ message: 'Invalid action' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

async function sendNotificationsToAllUsers() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or Anon Key is not set.');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // 全ユーザーを取得（notification_activeカラムがないため）
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('name, endpoint, p256dh, auth');

    if (fetchError) {
      console.error('Error fetching users from Supabase:', fetchError);
      return;
    }

    if (!users || users.length === 0) {
      console.log('No users found');
      return;
    }

    const vapidKeys = {
      publicKey: process.env.VAPID_PUBLIC_KEY,
      privateKey: process.env.VAPID_PRIVATE_KEY,
    };

    webpush.setVapidDetails(
      'mailto:mnaoyuki0228@gmail.com',
      vapidKeys.publicKey,
      vapidKeys.privateKey
    );

    const notificationPayload = {
      notification: {
        title: '筋トレの時間です',
        body: '💪2分以内に筋トレを開始💪',
        icon: 'pwa-192x192.png',
      },
    };

    // 各ユーザーに通知を送信
    const sendPromises = users.map(user => {
      const pushSubscription = {
        endpoint: user.endpoint,
        keys: {
          p256dh: user.p256dh,
          auth: user.auth,
        },
      };
      return webpush.sendNotification(pushSubscription, JSON.stringify(notificationPayload))
        .catch(error => {
          console.error(`Error sending notification to ${user.name}:`, error);
          // エラーが発生した場合、ログに記録するのみ（テーブルにnotification_activeカラムがないため）
          return Promise.resolve();
        });
    });

    await Promise.all(sendPromises);
    console.log(`Notifications sent to ${users.length} users at ${new Date().toLocaleString()}`);
  } catch (error) {
    console.error('Error in sendNotificationsToAllUsers:', error);
  }
}
