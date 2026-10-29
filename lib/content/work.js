import { WORK } from '@/constants';

const clip = (src, details = {}) => ({ sources: [{ src, type: 'video/mp4' }], poster: '', ...details });
const eleveClip = clip('/media/work/eleve-hover.mp4', { poster: '/media/work/eleve-hover.webp' });
const shifaClip = clip('/media/work/shifa.mp4', { poster: '/media/work/shifa.webp' });

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
    slug: 'eleve',
    title: 'Elevé',
    service: 'development',
    disciplines: ['Brand Identity & Web Development'],
    span: 4,
    media: { poster: '/media/work/eleve-mockup.webp', focus: '0% 50%' },
    hoverMedia: eleveClip,
    cover: eleveClip,
    summary:
      'We created the brand identity and website for Elevé, a coworking space in Islamabad. We carried the identity from the wordmark and colour palette into the website, bringing its spaces and online booking journey into one consistent experience.',
    meta: {
      title: 'Elevé Brand Identity and Website',
      description: 'See how Geekinate created Elevé’s brand identity and website for its coworking space in Islamabad.',
    },
    headline: { lead: 'A coworking brand,', mark: 'from the logo up.' },
    facts: [
      { label: 'Client', value: 'Elevé' },
      { label: 'Sector', value: 'Coworking' },
      { label: 'City', value: 'Islamabad' },
    ],
    brief: {
      requirements: [
        'A distinct brand identity for a new coworking space.',
        'A logo system that works across signage, print and small screens.',
        'A website that explains private offices, dedicated desks and meeting rooms.',
        'A clear way for visitors to book a tour or day pass online.',
      ],
      challenge: [
        'Giving a new coworking brand a recognisable identity.',
        'Carrying the same visual language from physical signage to the website.',
        'Making the available spaces and the next step easy to understand.',
      ],
      solution: [
        {
          title: 'Wordmark',
          detail: 'We developed a wordmark and colour palette for Elevé and explored how the identity would appear in the space.',
        },
        { title: 'Logo system', detail: 'We created colour, monochrome and light versions for use across physical and digital surfaces.' },
        {
          title: 'Website',
          detail: 'We carried the brand into a website that presents the spaces and lets visitors book tours and day passes online.',
        },
        { title: 'Enquiries', detail: 'We built an enquiry route for prospective members to contact the team about the space.' },
      ],
    },
    stack: ['Figma', 'Next.js', 'Tailwind CSS', 'Radix UI', 'Nodemailer'],
  },
  {
    slug: 'twinhub',
    title: 'Twinhub',
    service: 'development',
    disciplines: ['Web Development & Digital Marketing'],
    span: 2,
    media: clip('/media/work/twinhub-site.mp4', { poster: '/media/work/twinhub-site.webp' }),
    url: 'https://twinhub.pk/',
    summary:
      'We bring Twinhub’s website, custom CMS and marketing together for its coworking spaces in Islamabad and Rawalpindi. Alongside the website, we handle SEO, social content and paid campaigns to help people discover the spaces and make an enquiry.',
    meta: {
      title: 'Twinhub Website and Digital Marketing',
      description: 'Explore Geekinate’s work for Twinhub across website development, a custom CMS, SEO, social content and paid marketing.',
    },
    headline: { lead: 'A website and marketing', mark: 'that work together.' },
    facts: [
      { label: 'Client', value: 'Twinhub' },
      { label: 'Sector', value: 'Coworking' },
      { label: 'City', value: 'Islamabad and Rawalpindi' },
    ],
    brief: {
      requirements: [
        'A website that reflects the coworking brand and presents the spaces and membership options clearly.',
        'A custom blog and CMS the team can use without routine developer help.',
        'SEO support for the website and its content.',
        'Ongoing social content and paid marketing connected to workspace enquiries.',
      ],
      challenge: [
        'Carrying the feel of the physical spaces into the website.',
        'Presenting a range of membership options without clutter.',
        'Making a distinctive logo shape work with imagery and animation.',
        'Giving the team a manageable publishing workflow.',
        'Connecting website content, social activity and paid campaigns around relevant enquiries.',
        'Separating marketing’s contribution from referrals, existing members and the operations team when assessing occupancy.',
      ],
      solution: [
        {
          title: 'Website',
          detail: 'We built the website to present the spaces and membership options with clear navigation and enquiry routes.',
        },
        { title: 'Brand', detail: 'We carried Twinhub’s logos, colours and visual concept across the site.' },
        { title: 'Interaction', detail: 'We built image treatments and animation around the distinctive logo shape.' },
        { title: 'CMS', detail: 'We created a custom blog and content management system so the team can manage its posts.' },
        { title: 'SEO', detail: 'We built SEO controls into the CMS and continue to work on the website’s search visibility and content.' },
        {
          title: 'Social content',
          detail: 'We create social content to introduce the spaces and keep the brand visible to prospective members.',
        },
        {
          title: 'Paid marketing',
          detail: 'We manage paid campaigns alongside the website, SEO and social content, with a focus on relevant workspace enquiries.',
        },
      ],
    },
    stack: ['Next.js', 'MUI', 'MongoDB', 'AWS EC2'],
  },
  {
    slug: 'ar-game',
    title: 'Augmented Reality Video Game',
    service: 'games',
    disciplines: ['AR Game Development'],
    span: 6,
    media: clip('/media/work/geekinate-ar-game.mp4', { poster: '/media/work/geekinate-ar-game.webp' }),
    summary:
      'We built this mobile AR adventure as a client commission. It turns the player’s own room into the level. The sofa is a cliff, the rug is a river, and no two homes play the same.',
    meta: {
      title: 'Mobile AR Game Case Study',
      description:
        'A client-commissioned mobile AR adventure built by Geekinate, with room-based play, surface anchoring, character controls and capture.',
    },
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
    slug: 'vr-boxing',
    title: 'Virtual Reality Video Game',
    service: 'games',
    disciplines: ['VR Game Development'],
    span: 3,
    media: clip('/media/work/geekinate-vr-game.mp4', { poster: '/media/work/geekinate-vr-game.webp', focus: '25% 50%' }),
    summary:
      'We built this VR boxing game as a client commission for standalone headsets, with the fight mirrored to the TV so the whole room can watch.',
    meta: {
      title: 'VR Boxing Game Case Study',
      description:
        'A client-commissioned VR boxing game built by Geekinate, with controller-based combat, rounds, scoring and live TV casting.',
    },
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
    title: 'Shifa Foundation USA',
    service: 'marketing',
    disciplines: ['Web Development & Performance Marketing'],
    span: 3,
    media: shifaClip,
    cover: shifaClip,
    summary:
      'We partner with Shifa Foundation USA to support its digital fundraising, connecting website development, creative production and performance marketing across the donor journey. By month five, monthly online donation transaction volume had reached 5× the starting baseline. From first discovery to repeat giving, we bring the website, donation experience and campaigns together. Our ongoing partnership now also includes Google Ad Grants management.',
    meta: {
      title: 'Shifa Foundation USA Case Study',
      description:
        'See how Geekinate connects Shifa Foundation USA’s website, donation experience, creative, Meta campaigns and ongoing Google Ad Grants management.',
    },
    headline: { lead: 'Turning compassion', mark: 'into lasting support.' },
    facts: [
      { label: 'Client', value: 'Shifa Foundation USA' },
      { label: 'Work', value: 'Website, creative & donor acquisition' },
      {
        label: 'What we achieved',
        value: 'We helped grow monthly online donation transaction volume to 5× the starting baseline by month five.',
      },
    ],
    brief: {
      requirements: [
        'A clear, trustworthy website with an integrated donation experience that makes supporting the foundation straightforward.',
        'Performance marketing and campaign creatives that guide prospective donors from awareness through consideration, donation and repeat giving.',
        'An ongoing partner to manage, measure and refine digital fundraising, with a scope that now includes Google Ad Grants.',
      ],
      challenge: [
        'Earning donor trust in a crowded fundraising environment and keeping the message consistent from the first ad through to the donation checkout.',
        'Connecting acquisition, retargeting and donor re-engagement, then extending the work to search campaigns within Google Ad Grants’ keyword and account requirements.',
      ],
      solution: [
        {
          title: 'Donation experience',
          detail:
            'We improved the WordPress and Elementor website to communicate the foundation’s causes clearly and give visitors a more direct path to giving. We integrated CharityStack with PayPal to support online donations and donor management.',
        },
        {
          title: 'Performance & creative',
          detail:
            'We manage Meta fundraising across the donor lifecycle, combining campaign strategy and creative production with prospecting, retargeting and donor re-engagement. We connect cause-specific messages with relevant landing pages and the donation experience, then refine the work around completed donations.',
        },
        {
          title: 'Ongoing growth',
          detail:
            'We continue to develop the foundation’s digital fundraising, with our remit now including Google Ad Grants. We manage relevant search campaigns with ongoing attention to keyword eligibility, click-through performance and account requirements.',
        },
      ],
    },
    stackLabel: 'Platforms & Tools',
    stack: ['WordPress', 'Elementor', 'CharityStack', 'Meta Ads', 'Google Ad Grants'],
    contact: {
      eyebrow: 'Let’s talk',
      headings: ['Bring your website and marketing together.'],
      intro:
        'Tell us what you want your website and campaigns to help people do. We’ll talk through the journey, the work involved and how we can measure progress.',
    },
  },
];

export const work = projects.map((project) => ({ ...project, href: `${WORK.path}/${project.slug}` }));
