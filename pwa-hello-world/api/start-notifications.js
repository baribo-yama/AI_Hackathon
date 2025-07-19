import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_KEY;

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, subscription } = req.body;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase URL or Anon Key is not set.');
      return res.status(500).json({ message: 'Supabase configuration missing.' });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    try {
      // 既存のユーザーをチェック
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('endpoint', subscription.endpoint)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116は「データが見つからない」エラー
        console.error('Error checking existing user:', checkError);
        return res.status(500).json({ message: 'Error checking existing user.' });
      }

      let result;
      if (existingUser) {
        // 既存ユーザーの場合は名前を更新
        const { data, error } = await supabase
          .from('users')
          .update({ name: name })
          .eq('endpoint', subscription.endpoint)
          .select();

        if (error) {
          console.error('Error updating user:', error);
          return res.status(500).json({ message: 'Error updating user.' });
        }
        result = data;
      } else {
        // 新規ユーザーの場合は挿入
        const { data, error } = await supabase
          .from('users')
          .insert([
            {
              name: name,
              endpoint: subscription.endpoint,
              p256dh: subscription.keys.p256dh,
              auth: subscription.keys.auth
              // created_atは自動で設定される
            }
          ])
          .select();

        if (error) {
          console.error('Error saving user to Supabase:', error);
          return res.status(500).json({ message: 'Error saving user.' });
        }
        result = data;
      }

      console.log('User saved to Supabase:', result);

      // 1分おきの通知送信を開始するためのレスポンス
      res.status(200).json({
        message: 'Notifications started for user: ' + name,
        user: result
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed.' });
  }
}
