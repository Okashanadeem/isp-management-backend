import cron from 'node-cron';
import moment from 'moment';
import _ from 'lodash';
import CustomerSubscription from '../models/packageModel.js';


    // Run every day at 12 AM 
cron.schedule(
  '0 0 * * *',
  async () => {
    try {
      console.log(' Running daily subscription monitoring job at 12 AM...');

      const today = moment().startOf('day');
      const twoDaysFromNow = moment(today).add(2, 'days').startOf('day');

      //  Find subscriptions expiring 2 days before expiry 
      const expiringSoonSubs = await CustomerSubscription.find({
        endDate: {
          $gte: twoDaysFromNow.toDate(),
          $lt: moment(twoDaysFromNow).endOf('day').toDate(),
        },
        status: 'active',
      }).populate('customer package');

      // Find subscriptions that expired today
      const expiredTodaySubs = await CustomerSubscription.find({
        endDate: {
          $gte: today.toDate(),
          $lt: moment(today).endOf('day').toDate(),
        },
        status: { $in: ['active', 'pending'] },
      }).populate('customer package');

      // Mark expired subscriptions as 'expired'
      for (const sub of expiredTodaySubs) {
        sub.status = 'expired';
        await sub.save();
      }

      console.log(
        `📅 Expiring soon: ${expiringSoonSubs.length} | Expired today: ${expiredTodaySubs.length}`
      );
    } catch (error) {
      console.error('❌ Error running daily subscription job:', error);
    }
  },
  {
    timezone: 'Asia/Karachi', 
  }
);

export const startCronJobs = () => {
  console.log('🚀 Cron jobs initialized successfully.');
};
