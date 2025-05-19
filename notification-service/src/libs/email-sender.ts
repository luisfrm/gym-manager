import { Resend } from "resend";
// import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import { GMAIL_USER, RESEND_APIKEY, SENDGRID_API_KEY, SENDGRID_USERNAME } from "./config";
import sgMail from "@sendgrid/mail";

import PaymentReminderEmail from "../emails.body/PaymentReminderEmail";

const resend = new Resend(RESEND_APIKEY);

const html = render(PaymentReminderEmail());

class EmailSender {
  async sendPaymentReminderEmailResend(email: string, subject: string) {
    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: [email],
      subject,
      html: await html,
    });
  }

  async sendPaymentReminderEmail(email: string, subject: string) {
    // const transporter = nodemailer.createTransport({
    //   host: "smtp.sendgrid.net",
    //   port: 587,
    //   secure: false,
    //   auth: {
    //     user: SENDGRID_USERNAME,
    //     pass: SENDGRID_API_KEY,
    //   },
    // });

    // const mailOptions = {
    //   from: `Centro Medico Marivi <${GMAIL_USER}>`,
    //   to: email,
    //   subject: subject,
    //   html: await html,
    // };

    // transporter.sendMail(mailOptions, (error, info) => {
    //   if (error) {
    //     console.log(error);
    //   } else {
    //     console.log("Email sent: " + info.response);
    //   }
    // });

    sgMail.setApiKey(SENDGRID_API_KEY);
    const msg = {
      to: "email-receiver", // Change to your recipient
      from: GMAIL_USER, // Change to your verified sender
      subject: subject,
      html: await html,
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error: any) => {
        console.error(error);
      });
  }
}

export default EmailSender;
