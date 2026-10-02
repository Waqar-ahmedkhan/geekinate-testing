import { PARTNER } from '@/constants';

const rates = `${PARTNER.standardRate}–${PARTNER.establishedRate}%`;
const earningWindow = `${PARTNER.windowMonths} months`;
const partnerHref = `#${PARTNER.hashes.partner}`;
const leadHref = `#${PARTNER.hashes.lead}`;

export const partnerMeta = {
  title: 'Referral Partner Program',
  description: `Refer businesses that need development, AI, games, or marketing. Earn ${rates} on eligible Geekinate service revenue for ${earningWindow}.`,
};

export const partnerHero = {
  eyebrow: 'Referral partner program',
  headline: { lead: 'Refer the right client.', trail: `Earn ${rates}.` },
  support: [
    'Know a business that needs development, AI, interactive experiences, or marketing? Make the introduction. We handle the rest.',
    `You earn commission on eligible Geekinate service revenue we collect from that client during their first ${earningWindow}.`,
  ],
  actions: [
    { label: 'Become a referral partner', href: partnerHref, accent: true, intent: PARTNER.modes.partner },
    { label: 'Refer a lead', href: leadHref, accent: false, intent: PARTNER.modes.lead },
  ],
  flow: {
    label: 'How it runs',
    steps: [{ title: 'You introduce' }, { title: 'We sell' }, { title: 'We ship' }, { title: `You earn ${rates}` }],
  },
  proof: [`${rates} commission`, `${PARTNER.windowMonths}-month earning window`, 'No quotas', 'No exclusivity'],
};

export const partnerIdea = {
  heading: 'Good introductions should be worth something.',
  intro: 'You already know businesses that occasionally need capabilities outside your own expertise.',
  cases: [
    'Maybe a client needs a custom platform.',
    'Maybe someone in your network needs an AI automation.',
    'Maybe a campaign needs an interactive experience.',
    'Maybe a growing business needs better marketing infrastructure.',
  ],
  closing: ['You do not need to sell the work.', 'You just need to make the right introduction.'],
};

export const partnerAudiences = {
  eyebrow: 'Who refers',
  heading: 'Who can refer?',
  cards: [
    {
      title: 'Agency owners',
      body: [
        'A client needs something outside your core service offering.',
        'Send them our way instead of stretching your team into work you do not specialise in.',
      ],
    },
    {
      title: 'Consultants & freelancers',
      body: [
        'You are often close to the problem before an agency or technical team gets involved.',
        'If Geekinate is a fit, make the connection.',
      ],
    },
    {
      title: 'Founders & operators',
      body: ['Know another business struggling with a problem we can solve?', 'Introduce us.'],
    },
    {
      title: 'Existing clients & friends of Geekinate',
      body: ['If you trust our work enough to recommend us, we want to reward the introduction.'],
    },
  ],
};

export const partnerServices = {
  eyebrow: 'What to refer',
  heading: 'What should you refer?',
  cards: [
    {
      title: 'Development & AI',
      items: [
        'Custom platforms',
        'SaaS products',
        'AI agents and automation',
        'Internal tools',
        'APIs and integrations',
        'Complex web applications',
      ],
    },
    {
      title: 'Games & Interactive',
      items: ['Browser games', 'Branded games', 'Gamification', 'Interactive campaigns', 'Playable experiences', 'Custom game mechanics'],
    },
    {
      title: 'Marketing',
      items: [
        'Conversion-focused websites',
        'Funnels',
        'Marketing automation',
        'Analytics and tracking',
        'Growth infrastructure',
        'Custom integrations',
      ],
    },
  ],
  reassurance: {
    lead: 'Not sure whether the opportunity fits?',
    body: 'Send it anyway. We will tell you quickly whether Geekinate is the right team.',
    action: { label: 'Refer a lead', href: leadHref, intent: PARTNER.modes.lead },
  },
};

export const partnerSteps = {
  eyebrow: 'Process',
  heading: 'How the referral program works.',
  intro: 'Four steps, and only the first one is yours.',
  steps: [
    {
      title: 'Make the introduction.',
      detail: [
        'A warm email introduction is enough. Tell us who the prospect is and, if you know it, what they need.',
        'You do not need to qualify the project or sell Geekinate on our behalf.',
      ],
    },
    {
      title: 'We take it from there.',
      detail: [
        'We speak to the prospect, understand the problem, scope the work, send the proposal, and manage the sales process.',
        'If it is not a good fit, we say so.',
      ],
    },
    {
      title: 'We deliver.',
      detail: [
        'If the client moves forward, Geekinate handles the engagement directly.',
        'You can stay informed without needing to manage the project.',
      ],
    },
    {
      title: 'You get paid.',
      detail: [
        'When Geekinate receives eligible client payments, your commission is recorded.',
        `You continue earning on eligible service revenue from that client for their first ${earningWindow}.`,
      ],
    },
  ],
};

export const partnerCommission = {
  eyebrow: 'Commission',
  heading: `Start at ${PARTNER.standardRate}%. Grow to ${PARTNER.establishedRate}%.`,
  tiers: [
    {
      value: `${PARTNER.standardRate}%`,
      title: 'Referral Partner',
      body: `Earn ${PARTNER.standardRate}% of eligible Geekinate service revenue from your referred client for their first ${earningWindow}.`,
      note: 'Available from your first successful referral.',
    },
    {
      value: `Up to ${PARTNER.establishedRate}%`,
      title: 'Established Referral Partner',
      body: `Partners who consistently send good-fit opportunities can qualify for an enhanced ${PARTNER.establishedRate}% commission rate.`,
      note: 'The higher rate is based on the strength and consistency of the relationship, not on hitting arbitrary monthly quotas.',
    },
  ],
  disclosure:
    'Commission applies to eligible service revenue Geekinate actually receives. Full terms are provided when you join the program.',
};

export const partnerEarnings = {
  eyebrow: 'Examples',
  heading: 'What could that look like?',
  examples: [
    { engagement: '$10,000 client engagement', rate: 'At 10%', payout: 'You earn $1,000' },
    { engagement: '$25,000 client engagement', rate: 'At 10%', payout: 'You earn $2,500' },
    { engagement: '$50,000 client engagement', rate: 'At 15%', payout: 'You earn $7,500' },
  ],
  footnote: 'Illustrative examples based on eligible service revenue actually received by Geekinate.',
  followOn: `Because the commission window lasts ${earningWindow}, additional eligible work from the same referred client can continue generating commission during that period.`,
};

export const partnerTrust = {
  eyebrow: 'Reputation',
  heading: 'Your reputation comes with the referral.',
  lead: 'We treat that seriously.',
  promises: [
    {
      title: 'We do not spam your contacts.',
      body: [
        'A referral is permission to have a relevant business conversation.',
        'It is not permission to aggressively sell everything Geekinate offers.',
      ],
    },
    {
      title: 'We keep you informed.',
      body: ['You should not need to chase us to find out whether your introduction turned into a conversation, proposal, or client.'],
    },
    {
      title: 'We do not make you sell.',
      body: ['You are not becoming a Geekinate salesperson.', 'A good introduction is enough.'],
    },
    {
      title: 'We protect the relationship.',
      body: ['If you introduced us because someone trusts you, we understand that our behaviour reflects on you too.'],
    },
  ],
};

export const partnerQualification = {
  eyebrow: 'Attribution',
  columns: [
    {
      heading: 'A good referral usually looks like this.',
      tone: 'good',
      items: [
        'Someone is actively considering a project.',
        'There is a real business problem to solve.',
        'They have access to decision-makers.',
        'They are willing to invest in solving it properly.',
        "The work overlaps with Geekinate's core capabilities.",
      ],
      closing: 'That is usually enough.',
    },
    {
      heading: 'What does not count as a referral?',
      tone: 'bad',
      items: [
        'Someone already actively speaking with Geekinate.',
        'An existing Geekinate client.',
        'A lead already in our active sales pipeline.',
        'A self-referral.',
        'A prospect submitted by multiple referrers after attribution has already been established.',
      ],
      closing: 'We confirm referral attribution when the introduction is accepted.',
    },
  ],
};

export const partnerTerms = {
  eyebrow: 'Terms',
  heading: 'Simple rules. No surprises.',
  body: [
    `Referral commission is calculated on eligible Geekinate service revenue actually received from the referred client during the first ${earningWindow} after their first payment.`,
    'Taxes, refunds, third-party software, advertising spend, hosting costs, pass-through expenses, and other non-service charges are excluded unless specifically agreed otherwise.',
    'Full terms are provided when you join the program.',
  ],
};

export const partnerFaq = {
  eyebrow: 'Questions',
  heading: 'Frequently asked questions.',
  items: [
    {
      question: 'Do I need to be an agency?',
      answer:
        'No. The program is open to agencies, consultants, freelancers, founders, existing clients, and other professionals with relevant networks.',
    },
    {
      question: 'Do I need to sell Geekinate?',
      answer:
        'No. Make the introduction and give us enough context to start the conversation. We handle qualification, scoping, proposals, and closing.',
    },
    {
      question: 'How much do I earn?',
      answer: `Referral Partners earn ${PARTNER.standardRate}% of eligible service revenue. Established Referral Partners can qualify for a ${PARTNER.establishedRate}% rate.`,
    },
    {
      question: 'How long do I earn commission?',
      answer: `For ${earningWindow} from the referred client's first payment to Geekinate.`,
    },
    {
      question: 'What happens if the client hires Geekinate for more work?',
      answer: `If the additional work falls within the same ${earningWindow} earning window and qualifies as eligible service revenue, it also contributes to your commission.`,
    },
    {
      question: 'When do I get paid?',
      answer:
        'Commission is paid against eligible client revenue Geekinate has actually received. The exact payout schedule is included in your referral agreement.',
    },
    {
      question: 'Can I refer more than one company?',
      answer: 'Yes. There is no cap on the number of qualified clients you can refer.',
    },
  ],
};

export const partnerHandoff = {
  headline: partnerHero.headline,
  actions: partnerHero.actions,
};

export const partnerConversion = {
  eyebrow: 'Make the introduction',
  heading: 'Know someone we should know?',
  body: ['You make the introduction.', 'We do the work.', 'You share in the upside.'],
  expectations: [
    { title: 'A reply from a person', detail: 'We will review your application or referral and respond within two working days.' },
    { title: 'A quick fit check', detail: 'We will tell you whether the opportunity is relevant before anyone wastes time.' },
    { title: 'Clear attribution', detail: 'We confirm when an eligible referral has been accepted.' },
  ],
  direct: { label: 'Or make a warm introduction by email' },
};

export const referralForm = {
  mode: {
    label: 'What brings you here?',
    options: [
      { value: PARTNER.modes.partner, label: 'Become a referral partner' },
      { value: PARTNER.modes.lead, label: 'Refer a lead' },
    ],
  },
  shared: {
    name: { label: 'Your name', placeholder: 'Your name', autoComplete: 'name' },
    email: { label: 'Your work email', placeholder: 'you@company.com', autoComplete: 'email' },
    company: { label: 'Your company', optional: 'optional', placeholder: 'Where you work', autoComplete: 'organization' },
  },
  partner: {
    type: {
      label: 'Which describes you?',
      options: [
        { value: 'agency', label: 'Agency owner' },
        { value: 'consultant', label: 'Consultant / freelancer' },
        { value: 'founder', label: 'Founder / operator' },
        { value: 'client', label: 'Existing client' },
        { value: 'other', label: 'Other' },
      ],
    },
    website: { label: 'Website', optional: 'optional', placeholder: 'geekinate.com', autoComplete: 'url' },
    network: {
      label: 'Your network',
      optional: 'optional',
      placeholder: 'What kinds of businesses or opportunities do you usually come across?',
    },
    consent: 'I agree to the Geekinate Privacy Policy and understand that applications are reviewed.',
    submit: { idle: 'Apply to become a partner', pending: 'Sending' },
    success: { title: 'Application received.', body: 'We will review it and reply within two working days.', again: 'Send another' },
  },
  lead: {
    prospectName: { label: 'Who should we speak to?', placeholder: 'Their name' },
    prospectCompany: { label: 'Their company', placeholder: 'Where they work' },
    prospectEmail: {
      label: 'Their email',
      optional: 'optional',
      helper: 'Optional if you plan to introduce us by email.',
      placeholder: 'them@company.com',
    },
    fit: {
      label: 'Looks like',
      optional: 'optional',
      options: [
        { value: 'development', label: 'Development & AI' },
        { value: 'games', label: 'Games & Interactive' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'unsure', label: 'Not sure' },
      ],
    },
    opportunity: { label: 'The opportunity', placeholder: 'What are they trying to solve, and why might Geekinate be a fit?' },
    permission: "I have permission to share this person's details with Geekinate.",
    consent: 'I agree to the Geekinate Privacy Policy and understand that referrals are reviewed.',
    submit: { idle: 'Submit referral', pending: 'Sending' },
    success: {
      title: 'Referral received.',
      body: 'We will check fit and attribution, then reply within two working days.',
      again: 'Refer someone else',
    },
  },
  errors: {
    name: 'Add your name so we know who is writing.',
    nameShort: 'That looks too short to be a name.',
    email: 'Add an email address so we can reply.',
    emailShape: 'That address is missing an @ or a domain.',
    partnerType: 'Pick the one that fits you best.',
    prospectName: 'Tell us who we should speak to.',
    prospectCompany: 'Add the company they work for.',
    prospectEmailShape: 'That address is missing an @ or a domain.',
    opportunity: 'Tell us what they are trying to solve.',
    opportunityShort: 'A little more detail, so we can judge the fit.',
    permission: 'Confirm you have permission before sharing their email.',
    consent: 'Tick this to continue.',
  },
  summary: { title: 'Check these before sending', jump: 'Go to field' },
  failure: { title: 'That did not go through.', body: 'Try again, or email us directly.' },
  rateLimited: { title: 'That is a few too many.', body: 'Give it a minute and try again, or email us directly.' },
};
