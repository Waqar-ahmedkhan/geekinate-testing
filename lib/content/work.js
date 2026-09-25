import { WORK } from '@/constants';

const clip = (src, details = {}) => ({ sources: [{ src, type: 'video/mp4' }], poster: '', ...details });

export const workContent = {
  eyebrow: 'Work',
  heading: 'Featured work.',
  allWork: { label: 'All work', href: '' },
};

export const caseStudyContent = {
  actions: [{ label: 'Start a project', href: '#contact', accent: true }],
  visit: 'Visit the website',
  intro: { id: 'overview', label: 'Overview', service: 'Service' },
  stack: { id: 'stack', label: 'Tech stack' },
  brief: {
    id: 'brief',
    parts: [
      { id: 'requirements', label: 'Requirements', heading: 'What they asked for.' },
      { id: 'challenge', label: 'Challenge', heading: 'What stood in the way.' },
    ],
  },
  solution: { id: 'solution', label: 'Solution', heading: 'What we built.' },
  more: { id: 'more-work', label: 'More work', heading: 'Keep looking.', all: { label: 'All work', href: '/#work' } },
};

const projects = [
  {
    slug: 'ar-game',
    title: 'Mobile AR Game',
    disciplines: ['Games & Interactive'],
    span: 4,
    media: clip('/media/work/geekinate-ar-game.mp4'),
    summary: 'A mobile AR game that drops a third-person character into the player’s own room and turns the furniture into the level.',
    headline: { lead: 'The level is', mark: 'your own room.' },
    facts: [
      { label: 'Platform', value: 'iOS and Android' },
      { label: 'Genre', value: 'AR adventure' },
      { label: 'Played', value: 'Anywhere with a floor' },
    ],
    brief: {
      requirements: [
        'A mobile game that places a third-person character in the player’s own room through the phone camera.',
        'Collectibles and objectives anchored to real floors and furniture, so every room plays differently.',
        'Touch controls that still work while the phone is held up at arm’s length.',
        'Capture built in, so a run can be recorded and shared from inside the game.',
      ],
      challenge: [
        'Keeping the character planted on real surfaces while the camera moves around it.',
        'Holding a steady frame rate on mid-range phones with tracking running underneath.',
        'Lighting a 3D character so it reads as part of the room rather than pasted over it.',
      ],
      solution: [
        {
          title: 'Anchoring',
          detail: 'Plane detection and anchoring that pins the character and every collectible to the room, not the screen.',
        },
        { title: 'Controls', detail: 'A thumb joystick and a follow camera tuned for playing with the phone held up.' },
        { title: 'Lighting', detail: 'Light estimation that shades the character with the room’s own light.' },
        { title: 'Capture', detail: 'An in-game capture button that records the camera feed and the game together.' },
      ],
    },
    stack: ['Unity', 'AR Foundation', 'ARKit', 'ARCore', 'C#'],
  },
  {
    slug: 'twinhub',
    title: 'Twinhub — Coworking Space Website',
    disciplines: ['Web Products'],
    span: 2,
    media: clip('/media/work/twinhub-site.mp4', { poster: '/media/work/twinhub-site.webp' }),
    url: 'https://www.twinhub.pk/',
    summary: 'A fast, premium website for a coworking space in Islamabad and Rawalpindi, with a blog the team runs and ranks on its own.',
    headline: { lead: 'A premium space deserves a', mark: 'premium site.' },
    facts: [
      { label: 'Client', value: 'Twinhub' },
      { label: 'Sector', value: 'Coworking' },
      { label: 'City', value: 'Islamabad and Rawalpindi' },
    ],
    brief: {
      requirements: [
        'Create a premium-looking website to align with the client’s brand identity.',
        'Prioritize performance and user-friendly navigation.',
        'Develop a custom blog with SEO-optimized CMS features.',
        'Improve the blog with key CMS features for enhanced SEO.',
      ],
      challenge: [
        'Enhance the site to mirror the premium coworking space in the city’s exclusive locale.',
        'Refine web design for brand impact, integrating logos, colors, and design concept.',
        'Navigate non-traditional logo challenges, seamlessly integrating animations and images.',
        'Efficiently manage a wide range of membership packages without cluttering the homepage.',
        'Ensure a minimalistic approach to prevent user confusion despite abundant content.',
        'Address the importance of SEO for the blog section.',
      ],
      solution: [
        { title: 'Next.js', detail: 'Built a sleek, high-performance website with Next.js and MUI.' },
        { title: 'Hosting', detail: 'Hosted the website on AWS (EC2) to ensure reliability and scalability.' },
        { title: 'Data', detail: 'Leveraged MongoDB for efficient data management.' },
        {
          title: 'Brand',
          detail: 'Transformed the website design by playing with brand logos, colors, and overall concept, bringing life to the brand.',
        },
        {
          title: 'Logo',
          detail:
            'Addressed the challenge of the non-traditional logo shape by designing frames, adding animations, and aligning images accordingly.',
        },
        { title: 'Blog', detail: 'Developed a custom blog with a user-friendly CMS, providing easy control over blog posts.' },
        {
          title: 'SEO',
          detail: 'Integrated essential CMS features to improve SEO, ensuring better visibility on search engines.',
        },
      ],
    },
    stack: ['Next.js', 'MUI', 'MongoDB', 'AWS EC2'],
  },
  {
    slug: 'eleve',
    title: 'Elevé — Brand and Website',
    disciplines: ['Web Products'],
    span: 6,
    media: clip('/media/work/eleve-mockup.mp4', { focus: '0% 50%', loop: false }),
    hoverMedia: clip('/media/work/eleve-logo.mp4', { tone: 'light' }),
    cover: clip('/media/work/eleve-site.mp4', { poster: '/media/work/eleve-site.webp' }),
    summary: 'Brand identity and website for Elevé, a premium coworking space in F6 Markaz, Islamabad.',
    headline: { lead: 'A coworking brand,', mark: 'from the logo up.' },
    facts: [
      { label: 'Client', value: 'Elevé' },
      { label: 'Sector', value: 'Coworking' },
      { label: 'City', value: 'Islamabad' },
    ],
    brief: {
      requirements: [
        'A brand identity for a new premium coworking space in F6 Markaz, Islamabad.',
        'A logo that holds up on signage, screens and print alike.',
        'A website that sells private offices, dedicated desks and meeting rooms.',
        'Tours and day passes bookable straight from the site.',
      ],
      challenge: [
        'Standing apart in a city where most coworking spaces look the same.',
        'Carrying one brand from a lit sign on the wall to a favicon in a browser tab.',
        'Getting a visitor from the first screen to a booked tour without a sales call.',
      ],
      solution: [
        { title: 'Wordmark', detail: 'A wordmark and palette built for the space itself, then rendered into the office before it opened.' },
        { title: 'Logos', detail: 'A logo system with colour, mono and light-ground versions for every surface.' },
        { title: 'Website', detail: 'A Next.js site with tour and day-pass booking on its first screen.' },
        { title: 'Enquiries', detail: 'Enquiries delivered straight to the team’s inbox from the site’s own forms.' },
      ],
    },
    stack: ['Figma', 'Next.js', 'Tailwind CSS', 'Radix UI', 'Nodemailer'],
  },
  {
    slug: 'vr-boxing',
    title: 'VR Boxing Game',
    disciplines: ['Games & Interactive'],
    span: 3,
    media: clip('/media/work/geekinate-vr-game.mp4', { focus: '25% 50%' }),
    summary: 'A VR boxing game for standalone headsets, mirrored to the TV so the whole room can watch the fight.',
    headline: { lead: 'A boxing ring', mark: 'in your living room.' },
    facts: [
      { label: 'Platform', value: 'Standalone VR' },
      { label: 'Genre', value: 'Boxing' },
      { label: 'Played', value: 'Standing, at home' },
    ],
    brief: {
      requirements: [
        'A boxing game for standalone VR headsets, played standing in an ordinary living room.',
        'Punches that land with weight, read from the controllers the player already holds.',
        'A view on the TV for everyone else in the room while the player fights.',
      ],
      challenge: [
        'Reading a punch’s speed and angle from controller motion without false hits.',
        'Holding the frame rate on a standalone headset, where a dropped frame is felt, not just seen.',
        'Keeping the player inside a safe play space without breaking the fight.',
      ],
      solution: [
        { title: 'Hits', detail: 'Hit detection built on controller velocity, so a jab and a hook land differently.' },
        { title: 'Rounds', detail: 'Rounds, opponents and scoring paced like a real bout, with rest between rounds.' },
        { title: 'Casting', detail: 'Casting to the TV so the room watches the fight live.' },
        { title: 'Budget', detail: 'A performance budget set per scene and held on the headset itself.' },
      ],
    },
    stack: ['Unity', 'Meta XR SDK', 'OpenXR', 'C#'],
  },
  {
    slug: 'shifa-international',
    title: 'Shifa International',
    disciplines: ['Web Products'],
    span: 3,
    media: clip('/media/work/stats-grid.mp4', { poster: '/media/work/stats-grid.webp' }),
    summary: 'A website for Shifa International that leads with the numbers behind its work.',
    headline: { lead: 'The impact,', mark: 'told in numbers.' },
    facts: [
      { label: 'Client', value: 'Shifa International' },
      { label: 'Built', value: 'Website' },
      { label: 'Leads with', value: 'The numbers' },
    ],
    brief: {
      requirements: [
        'A website that puts Shifa International’s track record in front of visitors first.',
        'Key figures presented so they read at a glance on any screen.',
        'A structure the team can update as the numbers grow.',
      ],
      challenge: ['Making the figures feel earned rather than decorative.', 'Keeping a photo-led design fast on mobile connections.'],
      solution: [
        {
          title: 'Figures',
          detail: 'A figures grid that counts up as it comes into view, over photography of the people behind the work.',
        },
        { title: 'Speed', detail: 'Images compressed and sized per screen, so the page stays fast on mobile.' },
        { title: 'Content', detail: 'Content managed in one place, so updating a figure is a one-line change.' },
      ],
    },
    stack: ['Next.js', 'Tailwind CSS', 'GSAP'],
  },
];

export const work = projects.map((project) => ({ ...project, href: `${WORK.path}/${project.slug}` }));
