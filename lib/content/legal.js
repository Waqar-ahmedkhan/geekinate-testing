import { LEGAL, SITE } from '@/constants';

const updated = '6 October 2026';
const reachUs = `Email us at ${SITE.email} and a real person will reply.`;

const contactSection = {
  heading: 'Contact us',
  body: ['Questions about this page? Email us and a real person will reply.'],
  email: SITE.email,
};

export const legalContent = {
  eyebrow: 'Legal',
  updatedLabel: 'Last updated',
};

export const legalPages = {
  privacy: {
    path: LEGAL.privacy,
    title: 'Privacy Policy',
    summary: 'What Geekinate collects when you use this website or contact us, why we collect it, and what you can ask us to do with it.',
    updated,
    intro:
      'This policy explains what information Geekinate collects when you visit this website or get in touch, how we use it, and the choices you have. We keep it short because we collect very little.',
    sections: [
      {
        heading: 'What we collect',
        body: ['We only collect what you choose to send us, plus the basic technical information any website receives.'],
        list: [
          'Contact form: your name, email address, website or company if you add one, your message, what you would like help with if you pick it, and the service page you sent it from.',
          'Referral partner form: your name, work email, company, website and a few details about your network. If you refer a lead, the name, company and email of the person you refer and what they need.',
          'Emails you send us directly, and anything you include in them.',
          'Technical information: your IP address and basic request details such as browser type and time of visit, which our hosting may record in standard server logs.',
        ],
      },
      {
        heading: 'Cookies and analytics',
        body: [
          'This website does not set advertising or analytics cookies, and it does not use third-party trackers. Fonts, images and videos are served from our own server.',
          'If we add analytics in the future, we will update this policy before we do.',
        ],
      },
      {
        heading: 'How we use it',
        body: ['We use what you send us:'],
        list: [
          'To reply to your enquiry and talk through your project.',
          'To run the referral partner program, including following up on leads and paying commission.',
          'To protect the site from spam and abuse. We use your IP address briefly to limit repeated referral form submissions; it is held in memory and never saved.',
          'To keep records of our conversations and agreements with clients and partners.',
        ],
      },
      {
        heading: 'Who we share it with',
        body: [
          'We do not sell your information, and we do not use it to send you marketing you did not ask for.',
          'We share information only with the services that help us run this website and deliver your messages to our team, such as our hosting provider and our email delivery provider. They can use it only to provide that service to us.',
          'We will also share information if the law requires it, or to protect our rights or the safety of others.',
        ],
      },
      {
        heading: 'How long we keep it',
        body: [
          'We keep enquiries and referral details for as long as we need them to respond, to work with you, and to keep proper business records. If you would like us to delete your information sooner, ask and we will.',
        ],
      },
      {
        heading: 'Your choices',
        body: [
          `You can ask us to show you the information we hold about you, correct it, delete it, or stop using it. ${reachUs} Depending on where you live, you may also have the right to complain to your local data protection authority.`,
        ],
      },
      {
        heading: 'Where your information is handled',
        body: [
          'Our team works remotely, so your information may be handled in countries other than the one you live in. Wherever it is handled, we protect it as this policy describes.',
        ],
      },
      {
        heading: 'Children',
        body: [
          'This website is meant for businesses and is not directed at children under 16. We do not knowingly collect their information.',
        ],
      },
      {
        heading: 'Changes to this policy',
        body: ['If we change how we handle your information, we will update this page and the date at the top.'],
      },
      contactSection,
    ],
  },
  terms: {
    path: LEGAL.terms,
    title: 'Terms & Conditions',
    summary: 'The terms that apply when you use the Geekinate website, send us an enquiry or refer a lead.',
    updated,
    intro: 'These terms apply when you use this website. By using it, you agree to them. If you do not agree, please do not use the site.',
    sections: [
      {
        heading: 'About this website',
        body: [
          'This website describes Geekinate and the services we offer. It is for general information, and we may change or remove any part of it at any time.',
        ],
      },
      {
        heading: 'Enquiries and project work',
        body: [
          'Sending us a message through the website does not create an agreement between us. Any estimate, timeline or price we share is not binding until we both agree to it in writing.',
          'When we work together, the proposal or contract we both sign sets out the scope, fees, ownership and other terms of the work, and it takes priority over these terms.',
        ],
      },
      {
        heading: 'Referral partner program',
        body: [
          'Our referral partner program is governed by the program terms we provide when you join. Submitting a referral does not by itself entitle you to commission.',
        ],
      },
      {
        heading: 'Using the site',
        body: ['You agree not to:'],
        list: [
          'Use the site in a way that breaks the law or harms anyone.',
          'Send spam, malicious code or misleading information through our forms.',
          'Try to gain unauthorised access to the site, its server or the systems behind it.',
          'Interfere with how the site works, or put an unreasonable load on it.',
        ],
      },
      {
        heading: 'Content and trademarks',
        body: [
          'The text, design, code, videos and graphics on this site, and the Geekinate name and logo, belong to Geekinate or the people who licensed them to us. You may view and share pages for personal or internal business use, but you may not copy, sell or reuse them without our permission.',
          'Client names, logos and project work shown on this site belong to their respective owners.',
        ],
      },
      {
        heading: 'Links to other sites',
        body: ['We may link to websites we do not run. We are not responsible for their content or how they handle your information.'],
      },
      {
        heading: 'No guarantees',
        body: [
          'We work to keep this site accurate and available, but we provide it as it is. We do not promise that it will always be available, error-free or up to date.',
        ],
      },
      {
        heading: 'Limitation of liability',
        body: [
          'To the extent the law allows, Geekinate is not liable for any indirect or consequential loss arising from your use of this website. Nothing in these terms limits liability that cannot be limited by law.',
        ],
      },
      {
        heading: 'Privacy',
        body: ['Our Privacy Policy explains how we handle the information you send us through this website.'],
      },
      {
        heading: 'Changes to these terms',
        body: ['We may update these terms from time to time. The date at the top shows when they last changed.'],
      },
      contactSection,
    ],
  },
};
