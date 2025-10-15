import cron from 'node-cron';
import moment from 'moment';
import CustomerSubscription from '../models/customerSubscriptionModel.js';

cron.schedule(
  '*/2 * * * *', // Runs every 2 minutes (testing/demo)
  async () => {
    try {
      console.log(`[Cron] Running subscription monitoring job - ${new Date().toLocaleString()}`);

      const today = moment().startOf('day');
      const twoDaysFromNow = moment(today).add(2, 'days').startOf('day');

      const expiringSoonSubs = await CustomerSubscription.find({
        endDate: { $gte: twoDaysFromNow.toDate(), $lt: moment(twoDaysFromNow).endOf('day').toDate() },
        status: 'active',
      }).populate('customer package');

      const expiredTodaySubs = await CustomerSubscription.find({
        endDate: { $gte: today.toDate(), $lt: moment(today).endOf('day').toDate() },
        status: { $in: ['active', 'pending'] },
      }).populate('customer package');

      for (const sub of expiredTodaySubs) {
        sub.status = 'expired';
        await sub.save();
      }

      console.log(`[Cron] Expiring soon: ${expiringSoonSubs.length} | Expired today: ${expiredTodaySubs.length}`);
    } catch (error) {
      console.error(`[Cron Error] Subscription monitoring failed: ${error.message}`);
    }
  },
  { timezone: 'Asia/Karachi' }
);

/*
Example (Production):
---------------------
Run the same job daily at 12:00 AM

cron.schedule('0 0 * * *', async () => {
  // same logic as above
}, { timezone: 'Asia/Karachi' });
*/

export const startCronJobs = () => {
  console.log('Cron jobs initialized successfully.');
};
