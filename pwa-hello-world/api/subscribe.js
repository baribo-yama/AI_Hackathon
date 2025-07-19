import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_KEY;

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const subscription = req.body.subscription;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase URL or Anon Key is not set.');
      return res.status(500).json({ message: 'Supabase configuration missing.' });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
        return res.status(500).json({ message: 'Error saving subscription.' });
      }

      console.log('Subscription saved to Supabase:', data);
      res.status(200).json({ message: 'Subscription saved.' });
    } catch (error) {
      console.error('Unexpected error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed.' });
  }
}
