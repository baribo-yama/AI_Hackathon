import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_KEY;

export default async function handler(req, res) {
  if (req.method === 'POST') {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase URL or Anon Key is not set.');
      return res.status(500).json({ message: 'Supabase configuration missing.' });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Supabaseから購読情報を取得
    const { data: subscriptions, error: fetchError } = await supabase
      .from('users') // テーブル名が 'users' であることを確認
      .select('endpoint, p256dh, auth');

    if (fetchError) {
      console.error('Error fetching subscriptions from Supabase:', fetchError);
      return res.status(500).json({ message: 'Error fetching subscriptions.' });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return res.status(404).json({ message: 'No subscriptions found in Supabase.' });
    }

    const vapidKeys = {
      publicKey: process.env.VAPID_PUBLIC_KEY,
      privateKey: process.env.VAPID_PRIVATE_KEY,
    };

    webpush.setVapidDetails(
      'mailto:mnaoyuki0228@gmail.com', // Replace with your email
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

    // 各購読情報に対して通知を送信
    const sendPromises = subscriptions.map(sub => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };
      return webpush.sendNotification(pushSubscription, JSON.stringify(notificationPayload));
    });

    try {
      await Promise.all(sendPromises);
      res.status(200).json({ message: 'Notifications sent to all subscribed users.' });
    } catch (error) {
      console.error('Error sending some notifications:', error);
      res.status(500).json({ message: 'Error sending notifications.' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed.' });
  }
}
