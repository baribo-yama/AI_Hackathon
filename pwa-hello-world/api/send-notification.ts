import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';
import { IncomingMessage, ServerResponse } from 'http';

// Define a minimal Database type for now
interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          endpoint: string;
          p256dh: string;
          auth: string;
          name: string;
          id: string;
          created_at: string;
        };
        Insert: {
          endpoint: string;
          p256dh: string;
          auth: string;
          name: string;
        };
        Update: {
          // Define update types if needed
        };
      };
    };
  };
}

interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_KEY;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method === 'POST') {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase URL or Anon Key is not set.');
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ message: 'Supabase configuration missing.' }));
      return;
    }

    // Pass the Database type and schema name to createClient
    const supabase = createClient<Database, 'public'>(supabaseUrl, supabaseAnonKey);

    // Supabaseから購読情報を取得
    const { data: subscriptions, error: fetchError } = await supabase
      .from('users')
      .select('endpoint, p256dh, auth');

    if (fetchError) {
      console.error('Error fetching subscriptions from Supabase:', fetchError);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ message: 'Error fetching subscriptions.' }));
      return;
    }

    // Ensure subscriptions is an array of PushSubscriptionData
    const typedSubscriptions: PushSubscriptionData[] = subscriptions as PushSubscriptionData[];

    if (!typedSubscriptions || typedSubscriptions.length === 0) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ message: 'No subscriptions found in Supabase.' }));
      return;
    }

    const vapidKeys = {
      publicKey: process.env.VAPID_PUBLIC_KEY as string,
      privateKey: process.env.VAPID_PRIVATE_KEY as string,
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
    const sendPromises = typedSubscriptions.map(sub => {
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
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ message: 'Notifications sent to all subscribed users.' }));
    } catch (error: any) {
      console.error('Error sending some notifications:', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ message: 'Error sending notifications.' }));
    }
  } else {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Method not allowed.' }));
  }
}
