import nodemailer, { Transporter } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

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
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });

    console.log("Email transporter not instantiated");
    return this.transporter;
  }

  async SendVerifyEmail(verifyToken: string, userEmail: string) {
    if (this.transporter) {
      const verifyUrl = new URL(
        `verify/${verifyToken}`,
        "http://localhost:3000/"
      );
      // send mail with defined transport object
      let info = await this.transporter.sendMail({
        from: '"Ait Placements 👻" <aitplacements@gmail.com>', // sender address
        to: userEmail, // list of receivers
        subject: "Verify registration to ait-placements portal", // Subject line
        html: `<b>Welcome to AIT Placements</b></br>
        Please click on the link to register into AIT placement link: <a target="_blank" href="${verifyUrl.href}">${verifyUrl.href}</a>`, // html body
      });

      console.log("Message sent: %s", info.messageId);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    } else {
      console.log("Email transporter not instantiated");
    }
  }
  async SendAdminInviteEmail(adminEmail: string) {
    let onboardUrl = new URL("/register", "http://localhost:3000");
    if (this.transporter) {
      // send mail with defined transport object
      let info = await this.transporter.sendMail({
        from: '"Ait Placements 👻" <aitplacements@gmail.com>', // sender address
        to: adminEmail, // list of receivers
        subject: "Verify registration to ait-placements portal", // Subject line
        html: `<b>Welcome to AIT Placements</b></br>
          <p>You have been invited as an <b>ADMIN</b> in ait placements</p></br></br>
          Please click on the link to register into AIT placement link: <a target="_blank" href="${onboardUrl.href}">${onboardUrl.href}</a>`, // html body
      });

      console.log("Message sent: %s", info.messageId);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    } else {
      console.log("Email transporter not instantiated");
    }
  }
}

export const NodemailerInstance = new NodeMailerInstance();
