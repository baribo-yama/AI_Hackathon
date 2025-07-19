import webpush from 'web-push';

let subscription = null; // In a real app, you would fetch this from a database.

subscription = {
  "endpoint":"https://fcm.googleapis.com/fcm/send/cxXQfiCaL0E:APA91bGt8BmT_WNTn08Fv1JbEBplhmF6RDFt-CVN9p_310zuEBK4dFR_DI7AHj9ICKHNp5LWMzVYxuDVvNJ3y3DLlh7RIKGE1Ed8nx2WVk7GNjUhHdXwLbhg93XcflatTyri2HPZi3i6",
  "expirationTime":null,
  "keys":{
    "p256dh":"BMAx-CFpBww2JiZDU_ckawYjjgNwbwjh_SpqQJbQLSrTsY-bChSTxe6Y-2V7TaOtgMWXx-WcOH38EIgHgRyUGnA",
    "auth":"oSEeOi1AFa3nclFq8R9G5w"
  }
};

export default function handler(req, res) {
  if (req.method === 'POST') {
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
        title: 'New Notification',
        body: 'Hello World',
        icon: 'pwa-192x192.png',
      },
    };

    // This is where you would get the subscription from your database
    // For this example, we're using the one saved in memory
    if (subscription) {
      webpush.sendNotification(subscription, JSON.stringify(notificationPayload))
        .then(response => res.status(200).json({ message: 'Notification sent.' }))
        .catch(error => {
          console.error('Error sending notification:', error);
          res.status(500).json({ message: 'Error sending notification.' });
        });
    } else {
      res.status(404).json({ message: 'Subscription not found.' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed.' });
  }
}
