import { SERVICE_SECTIONS } from '@/constants';

export const guidedServices = ['development'];

export const guideContent = {
  eyebrow: 'Ask the page',
  title: 'Geekinate',
  status: 'Answers from this page',
  greeting:
    'I am the guide on this page. Tell me what eats your team time, and I will show you what we would automate first — and where on this page the answer lives.',
  label: 'Message the guide',
  placeholder: 'Tell us what your business struggles with',
  send: 'Send',
  sending: 'Sending',
  thinking: 'Typing',
  open: 'Open the guide',
  close: 'Close the guide',
  starterLabel: 'Or start here',
  starters: [
    'My team answers the same WhatsApp questions all day',
    'Can you make my website book appointments by itself?',
    'Show me AI work you have actually shipped',
    'Do you build VR games too?',
  ],
  nudges: {
    default: 'What is the one job your team repeats every single day?',
    'hero-service': 'What is the one job your team repeats every single day?',
    scope: 'Which of these six would you hand over first?',
    process: 'Tell me how your team works and I will say what we would automate first.',
    deliverables: 'Want this list written for your business instead?',
    contact: 'Before you type it all out — shall I map it first?',
  },
  jumps: {
    [SERVICE_SECTIONS.scope]: 'See what we build',
    [SERVICE_SECTIONS.process]: 'See how it runs',
    [SERVICE_SECTIONS.deliverables]: 'See what you leave with',
    [SERVICE_SECTIONS.contact]: 'Send it to the team',
  },
  you: 'You',
  studio: 'Geek',
  errors: { message: 'Type a question first.' },
  capped: {
    title: 'That is the end of this one.',
    body: 'Send the team a message with the form below, and a person will pick it up.',
  },
  failure: { title: 'That did not go through.', body: 'Try again, or use the form at the bottom of the page.' },
  unavailable: { title: 'The guide is not running right now.', body: 'The form at the bottom of the page reaches a person.' },
};
