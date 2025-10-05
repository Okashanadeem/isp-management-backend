import cron from "node-cron";


const task = () =>{
    console.log("running a schedule task at : ", new Date());
}

const SubscriptionMonitor = cron.schedule("* * * */2 *",task);

export default SubscriptionMonitor;