export const serviceBlueprints = {
  development: {
    eyebrow: 'Blueprint',
    heading: 'See what we would automate first.',
    body: 'Describe your business in a sentence. We will map what your team does by hand today, what the same work looks like once it runs itself, and the three things we would build first.',
  },
};

export const blueprintFor = (slug) => serviceBlueprints[slug] || null;

export const blueprintForm = {
  field: {
    label: 'Your business',
    placeholder: 'Describe your business in a sentence.',
    helper: 'Up to 500 characters.',
  },
  examples: {
    label: 'For example',
    items: [
      'I run a pharmacy with three branches in Lahore',
      'We are a letting agency and every viewing gets booked over WhatsApp',
      'I sell furniture online and my team retypes every order into the accounts system',
    ],
  },
  submit: { idle: 'Build the blueprint', pending: 'Building' },
  status: { pending: 'Building your blueprint.', ready: 'Blueprint ready.' },
  result: {
    title: 'Your blueprint',
    today: { heading: 'Today', note: 'What it costs you now' },
    automated: { heading: 'With Geekinate', note: 'What handles it instead' },
    opportunities: { heading: 'Three things we would build for you', effortLabel: 'Effort' },
    pillarLabel: 'Closest to',
    again: 'Describe something else',
  },
  capture: {
    heading: 'Send it to yourself',
    body: 'We will email this blueprint over, and read it ourselves before we reply.',
    label: 'Email',
    placeholder: 'you@company.com',
    submit: { idle: 'Email it to me', pending: 'Sending' },
    success: { title: 'On its way.', body: 'Expect a reply from a person within two working days.' },
    failure: { title: 'That did not send.', body: 'The blueprint is still here. Try again, or write to us directly.' },
    rateLimited: { title: 'That is a few too many.', body: 'Give it a minute, or write to us directly.' },
    unavailable: {
      title: 'We cannot send it from here yet.',
      body: 'The blueprint is still on the page. Write to us and we will pick it up.',
    },
  },
  errors: {
    brief: 'Tell us what your business does, even in one line.',
    briefShort: 'A little more detail, so the blueprint is worth reading.',
    email: 'Add an email address so we can send it.',
    emailShape: 'That address is missing an @ or a domain.',
  },
  failure: { title: 'That did not build.', body: 'Try again, or write to us directly.' },
  unreadable: { title: 'We could not read that one.', body: 'Try describing what your team does day to day.' },
  rateLimited: {
    title: "That is today's blueprints used up.",
    body: 'Book a call and we will build the real one with you.',
  },
  unavailable: {
    title: 'The blueprint is not running right now.',
    body: 'Tell us what you need in the form below and we will map it ourselves.',
  },
};
