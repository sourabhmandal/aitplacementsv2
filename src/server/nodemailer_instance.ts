import nodemailer, { Transporter } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { getBaseUrl } from "../utils/trpc";

class NodeMailerInstance {
  private transporter: Transporter<SMTPTransport.SentMessageInfo> | null;

  constructor() {
    // create reusable transporter object using the default SMTP transport
    this.transporter = null;
  }

  async GetNodemailer(): Promise<Transporter<SMTPTransport.SentMessageInfo>> {
    if (this.transporter) {
      return this.transporter;
    }

    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    this.transporter = await nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.OUTLOOK_EMAIL, // generated ethereal user
        pass: process.env.OUTLOOK_PASSWORD, // generated ethereal password
      },
    });

    console.log("Email transporter not instantiated");
    return this.transporter;
  }

  async SendUserInviteEmail(email: string, role: string) {
    let onboardUrl = new URL("/auth/login", getBaseUrl());
    if (this.transporter) {
      // send mail with defined transport object
      let info = await this.transporter.sendMail({
        from: "Ait Placements Invitation", // sender address
        to: email, // list of receivers
        subject: "Invitation for onboarding on AIT Placements", // Subject line
        html: `<b>Welcome to AIT Placements</b></br>
          <p>You have been invited as an <b>${role}</b> in ait placements</p></br></br>
          Please follow the link to login to the platform: <a target="_blank" href="${onboardUrl.href}">${onboardUrl.href}</a>
          and onboard yourself into AIT placement`, // html body
      });

      console.log("Message sent: %s", info.messageId);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    } else {
      console.log("Email transporter not instantiated");
    }
  }
}

export const NodemailerInstance = new NodeMailerInstance();
