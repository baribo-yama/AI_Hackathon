let subscription = null;

export default function handler(req, res) {
  if (req.method === 'POST') {
    subscription = req.body.subscription;
    res.status(200).json({ message: 'Subscription saved.' });
  } else {
    res.status(405).json({ message: 'Method not allowed.' });
  }
}
