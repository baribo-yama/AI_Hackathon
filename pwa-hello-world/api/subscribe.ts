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

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface RequestBody extends IncomingMessage {
  body: {
    subscription: PushSubscription;
  };
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_KEY;

export default async function handler(req: RequestBody, res: ServerResponse) {
  if (req.method === 'POST') {
    const subscription = req.body.subscription;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase URL or Anon Key is not set.');
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ message: 'Supabase configuration missing.' }));
      return;
    }

    // Pass the Database type and schema name to createClient
    const supabase = createClient<Database, 'public'>(supabaseUrl, supabaseAnonKey);

    try {
      const { data, error } = await supabase
        .from('users') // テーブル名が 'users' であることを確認
        .insert([
          {
            name: 'John Doe',
            endpoint: subscription.endpoint,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
          },
        ]);

      if (error) {
        console.error('Error saving subscription to Supabase:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'Error saving subscription.' }));
        return;
      }

      console.log('Subscription saved to Supabase:', data);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ message: 'Subscription saved.' }));
    } catch (error: any) {
      console.error('Unexpected error:', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ message: 'Internal server error.' }));
    }
  } else {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Method not allowed.' }));
  }
}
