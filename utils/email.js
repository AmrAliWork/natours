const { convert } = require('html-to-text');
const pug = require('pug');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;

    // Resend's default sender for testing
    this.from = 'Amr Ali <onboarding@resend.dev>';
  }

  async send(template, subject) {
    // 1) Render HTML based on Pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject
      }
    );

    // 2) Convert HTML to plain text
    const text = convert(html);

    // 3) Send email using Resend
    const { data, error } = await resend.emails.send({
      from: this.from,
      to: [this.to],
      subject,
      html,
      text
    });

    // 4) Handle Resend errors
    if (error) {
      console.error('Resend error:', error);
      throw new Error('Email service is currently unavailable');
    }

    console.log('Email sent successfully:', data.id);
  }

  async sendWelcome() {
    await this.send('Welcome', "Welcome to Natour's family!");
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 min)'
    );
  }
};
