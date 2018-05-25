var nodemailer = require('nodemailer');
var smtpTransport = require("nodemailer-smtp-transport");
var fs = require('fs');
var path = require('path');


sendCouponEmail = async (event_coupon, event_name, event_url, email_to) => {

    var htmlPath = path.join(__dirname, 'email_templates', `${event_coupon}.html`);
    var emailTemplateHTML = fs.readFileSync(htmlPath, 'utf8');

    var transporter = nodemailer.createTransport(smtpTransport({
        host : process.env.APP_MAIL_HOST,
        port: process.env.APP_MAIL_PORT,
        auth : {
            user : process.env.APP_MAIL,
            pass : process.env.APP_MAIL_PASSWORD
        }
    }));

    var emailTemplateText;
    var emailTemplateHTML;
    var emailSubject;

    emailSubject = `Cupom de Desconto - VIVA Startups - ${event_name}`;

    emailTemplateText = `Clique no link abaixo para acessar o Cupom de Desconto.\n\n`;
    emailTemplateText = emailTemplateText + `${event_url}\n\n`;

    var mailOptions = {
        from: `NO-REPLY VIVA Startups <${process.env.APP_MAIL}>`,
        to: email_to,
        subject: emailSubject,
        text: emailTemplateText,
        html: emailTemplateHTML,
    };

    return new Promise((resolve, reject) => {
      if (!email_to) {
        reject('No email');
      }
      transporter.sendMail(mailOptions, function(error, info){
        if(error){
            reject('Email not sent to destination');
        }else{
            resolve();
        }
      });
  });

};


module.exports = {sendCouponEmail};
