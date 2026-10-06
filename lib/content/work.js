import { WORK } from '@/constants';

const clip = (src, details = {}) => ({ sources: [{ src, type: 'video/mp4' }], poster: '', ...details });

export const workContent = {
  eyebrow: 'Work',
  heading: 'A closer look at our work.',
  allWork: { label: 'All work', href: '' },
};

export const caseStudyContent = {
  actions: [{ label: 'Let’s talk', href: '#contact', accent: true }],
  visit: 'Visit the website',
  intro: { id: 'overview', label: 'Overview', service: 'Service' },
  stack: { id: 'stack', label: 'Tech stack' },
  brief: {
    id: 'brief',
    parts: [
      { id: 'requirements', label: 'Requirements', heading: 'What they needed.' },
      { id: 'challenge', label: 'Challenge', heading: 'What made it hard.' },
    ],
  },
  solution: { id: 'solution', label: 'Solution', heading: 'How we cracked it.' },
  more: { id: 'more-work', label: 'More work', heading: 'There’s more where that came from.', all: { label: 'All work', href: '/#work' } },
};

const projects = [
  {
    slug: 'ar-game',
    title: 'Mobile AR Game',
    service: 'games',
    disciplines: ['Games & Interactive'],
    span: 4,
    media: clip('/media/work/geekinate-ar-game.mp4'),
    summary:
      'A mobile AR adventure that turns the player’s own room into the level. The sofa is a cliff, the rug is a river, and no two homes play the same.',
    headline: { lead: 'The level is', mark: 'your own room.' },
    facts: [
      { label: 'Platform', value: 'iOS and Android' },
      { label: 'Genre', value: 'AR adventure' },
      { label: 'Played', value: 'Anywhere with a floor' },
    ],
    brief: {
      requirements: [
        'Drop a third-person hero into the player’s real room, straight through the phone camera.',
        'Pin collectibles and goals to real floors and furniture, so every room becomes a new level.',
        'Controls that feel natural with the phone held up at arm’s length.',
        'One-tap capture, so every great run can be recorded and shared.',
      ],
      challenge: [
        'Keeping the hero planted on real surfaces while the camera swings around it.',
        'Holding a smooth frame rate on mid-range phones with AR tracking running underneath.',
        'Lighting a 3D character so it belongs in the room instead of looking pasted on top.',
      ],
      solution: [
        { title: 'Anchoring', detail: 'Plane detection that locks the hero and every collectible to the room, not the screen.' },
        { title: 'Controls', detail: 'A thumb joystick and a follow camera tuned for playing with the phone held up.' },
        { title: 'Lighting', detail: 'Light estimation that shades the hero with the room’s own light, lamp by lamp.' },
        { title: 'Capture', detail: 'A capture button that records the camera feed and the game together, ready to post.' },
      ],
    },
    stack: ['Unity', 'AR Foundation', 'ARKit', 'ARCore', 'C#'],
  },
  {
    slug: 'twinhub',
    title: 'Twinhub — Coworking Space Website',
    service: 'development',
    disciplines: ['AI Development'],
    span: 2,
    media: clip('/media/work/twinhub-site.mp4', { poster: '/media/work/twinhub-site.webp' }),
    url: 'https://www.twinhub.pk/',
    summary:
      'A premium website for Twinhub’s coworking spaces in Islamabad and Rawalpindi. Fast, unmistakably on-brand, with a blog the team runs and ranks on its own.',
    headline: { lead: 'A premium space deserves a', mark: 'premium site.' },
    facts: [
      { label: 'Client', value: 'Twinhub' },
      { label: 'Sector', value: 'Coworking' },
      { label: 'City', value: 'Islamabad and Rawalpindi' },
    ],
    brief: {
      requirements: [
        'A website that feels as premium as the space itself and matches the brand down to the pixel.',
        'Fast pages and navigation anyone can find their way around.',
        'A custom blog with a CMS the team can run without a developer.',
        'SEO features built into that CMS, so every post has a shot at ranking.',
      ],
      challenge: [
        'Capturing the feel of a premium coworking space in one of the city’s most exclusive areas.',
        'Bringing brand logos, colours and concept into the design so the site feels like the space.',
        'Working with a non-traditional logo shape instead of fighting it, alongside animation and imagery.',
        'Showing a wide range of membership packages without cluttering the homepage.',
        'Keeping the site minimal and clear despite a lot of content.',
        'Turning the blog into a real source of search traffic.',
      ],
      solution: [
        { title: 'Next.js', detail: 'A sleek, high-performance site built with Next.js and MUI.' },
        { title: 'Hosting', detail: 'Hosted on AWS EC2 for reliability that scales with demand.' },
        { title: 'Data', detail: 'MongoDB behind the scenes, keeping content quick to manage.' },
        { title: 'Brand', detail: 'Logos, colours and concept woven through every page, bringing the brand to life on screen.' },
        { title: 'Logo', detail: 'Custom frames and animation built around the unusual logo shape, turning a challenge into a signature.' },
        { title: 'Blog', detail: 'A custom blog with a simple CMS that puts the team in full control of every post.' },
        { title: 'SEO', detail: 'SEO tools built into the CMS, so every post goes out ready to be found.' },
      ],
    },
    stack: ['Next.js', 'MUI', 'MongoDB', 'AWS EC2'],
  },
  {
    slug: 'eleve',
    title: 'Elevé — Brand and Website',
    service: 'development',
    disciplines: ['AI Development'],
    span: 6,
    media: { poster: '/media/work/eleve-mockup.webp', focus: '0% 50%' },
    hoverMedia: clip('/media/work/eleve-logo.mp4', { tone: 'light' }),
    cover: clip('/media/work/eleve-site.mp4', { poster: '/media/work/eleve-site.webp' }),
    summary:
      'A brand and website built from scratch for Elevé, a premium coworking space in F6 Markaz, Islamabad. From the first sketch of the logo to tours booked online.',
    headline: { lead: 'A coworking brand,', mark: 'from the logo up.' },
    facts: [
      { label: 'Client', value: 'Elevé' },
      { label: 'Sector', value: 'Coworking' },
      { label: 'City', value: 'Islamabad' },
    ],
    brief: {
      requirements: [
        'A brand identity that makes a brand-new coworking space stand out from day one.',
        'A logo that works as well on a lit sign as it does on a phone screen.',
        'A website that sells private offices, dedicated desks and meeting rooms.',
        'Tours and day passes booked straight from the site.',
      ],
      challenge: [
        'Standing out in a city where most coworking spaces look the same.',
        'Carrying one brand all the way from a sign on the wall to the favicon in a browser tab.',
        'Getting a visitor from the first screen to a booked tour without a sales call.',
      ],
      solution: [
        { title: 'Wordmark', detail: 'A wordmark and palette made for the space, rendered into the office before it even opened.' },
        { title: 'Logos', detail: 'A full logo system with colour, mono and light versions for every surface.' },
        { title: 'Website', detail: 'A Next.js site with tour and day-pass booking right on the first screen.' },
        { title: 'Enquiries', detail: 'Every enquiry lands straight in the team’s inbox, ready for a same-day follow-up.' },
      ],
    },
    stack: ['Figma', 'Next.js', 'Tailwind CSS', 'Radix UI', 'Nodemailer'],
  },
  {
    slug: 'vr-boxing',
    title: 'VR Boxing Game',
    service: 'games',
    disciplines: ['Games & Interactive'],
    span: 3,
    media: clip('/media/work/geekinate-vr-game.mp4', { focus: '25% 50%' }),
    summary: 'A VR boxing game for standalone headsets, mirrored to the TV so the whole room can cheer every knockout.',
    headline: { lead: 'A boxing ring', mark: 'in your living room.' },
    facts: [
      { label: 'Platform', value: 'Standalone VR' },
      { label: 'Genre', value: 'Boxing' },
      { label: 'Played', value: 'Standing, at home' },
    ],
    brief: {
      requirements: [
        'A boxing game for standalone VR headsets, played standing up in an ordinary living room.',
        'Punches that land with real weight, read from the controllers already in the player’s hands.',
        'A live view on the TV, so everyone else in the room gets to watch the fight.',
      ],
      challenge: [
        'Reading a punch’s speed and angle from controller motion without false hits.',
        'Holding the frame rate on a standalone headset, where a dropped frame is felt, not just seen.',
        'Keeping the player inside a safe play space without breaking the fight.',
      ],
      solution: [
        { title: 'Hits', detail: 'Hit detection built on controller speed, so a jab and a hook land differently.' },
        { title: 'Rounds', detail: 'Rounds, opponents and scoring paced like a real bout, rest breaks included.' },
        { title: 'Casting', detail: 'Casting to the TV, so the room watches every punch live.' },
        { title: 'Budget', detail: 'A performance budget set per scene and held on the headset itself.' },
      ],
    },
    stack: ['Unity', 'Meta XR SDK', 'OpenXR', 'C#'],
  },
  {
    slug: 'shifa-international',
    title: 'Shifa International',
    service: 'marketing',
    disciplines: ['Marketing'],
    span: 3,
    media: clip('/media/work/stats-grid.mp4', { poster: '/media/work/stats-grid.webp' }),
    summary:
      'Marketing for Shifa International that leads with impact. The numbers come first, with the people behind them never out of frame.',
    headline: { lead: 'The impact,', mark: 'told in numbers.' },
    facts: [
      { label: 'Client', value: 'Shifa International' },
      { label: 'Work', value: 'Marketing campaign' },
      { label: 'Leads with', value: 'The numbers' },
    ],
    brief: {
      requirements: [
        'Campaign content that puts Shifa International’s impact in front of people first.',
        'Key figures that read at a glance, on any screen and in any feed.',
        'A visual system the team can reuse as the numbers grow.',
      ],
      challenge: [
        'Making the figures feel earned rather than decorative.',
        'Standing out in a crowded feed without losing the human story.',
      ],
      solution: [
        { title: 'Figures', detail: 'Figures that count up as they come into view, over photography of the people behind the work.' },
        { title: 'Story', detail: 'Real faces first and numbers second, so the impact reads as human rather than a report.' },
        { title: 'System', detail: 'A reusable template, so updating a figure or launching the next post takes minutes.' },
      ],
    },
    stack: ['Next.js', 'Tailwind CSS', 'GSAP'],
  },
];

export const work = projects.map((project) => ({ ...project, href: `${WORK.path}/${project.slug}` }));
