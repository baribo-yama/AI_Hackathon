import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    const { name, subscription } = req.body;
    const { endpoint, keys } = subscription;

    const { error } = await supabase.from('users').upsert({
        name,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth
    }, { onConflict: ['endpoint'] });

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json({ message: 'ok' });
}
