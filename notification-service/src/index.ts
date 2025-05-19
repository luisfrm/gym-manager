// import cron from "node-cron";

// cron.schedule("* 26 * * * *", () => {
//   console.log("My first cron job");
// });
import EmailSender from "./libs/email-sender";

const emailSender = new EmailSender();

emailSender.sendPaymentReminderEmail("luisfrm_@outlook.com", "Recordatorio de pago");
