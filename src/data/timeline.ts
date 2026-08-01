import type { TimelineItem } from '../models/TimelineItem';

export const timeline: TimelineItem[] = [
  {
    id: 'mealhada-00',
    title: 'Mealhada',
    description: 'Origin point and early roots in Mealhada, Portugal.',
    date: '1982-05',
    routeProgressPercentage: 0.0,
    type: 'location',
    status: 'ORIGIN_HUB',
    technologies: ['Portugal', 'Origin'],
    bullets: [
      'Origin point and early roots in Mealhada, Portugal.',
      'Beginning of personal and technological journey.'
    ]
  },
  {
    id: 'coimbra-01',
    title: 'Coimbra',
    description: 'Academic foundation and computer science engineering environment in Coimbra.',
    date: '2000-09',
    routeProgressPercentage: 0.067,
    type: 'location',
    status: 'ACADEMIC_HUB',
    technologies: ['Portugal', 'Academia', 'Engineering'],
    bullets: [
      'Academic foundation and software engineering environment in Coimbra, Portugal.',
      'Early exploration of algorithms, web standards, and software engineering principles.'
    ]
  },
  {
    id: 'porto-02',
    title: 'Porto',
    description: 'Relocation to Porto — commencing professional software engineering career.',
    date: '2013-05',
    routeProgressPercentage: 0.133,
    type: 'location',
    status: 'CAREER_HUB',
    technologies: ['Portugal', 'Tech Hub'],
    bullets: [
      'Relocation to Porto, establishing the core foundation for professional web development.',
      'Active participation in regional tech meetups and developer networks.'
    ]
  },
  {
    id: 'wecreateyou-03',
    title: 'WeCreateYou',
    company: 'WeCreateYou',
    role: 'Web Developer',
    description: 'Web developer building e-commerce applications and WeCreateFleet route planning software.',
    date: 'Apr 2015 – Apr 2016',
    routeProgressPercentage: 0.2,
    type: 'code',
    status: 'COMPLETED',
    technologies: ['PHP', 'JavaScript', 'HTML5', 'CSS3', 'Ajax', 'jQuery'],
    bullets: [
      'Developed websites and e-commerce solutions for small/medium companies using HTML5, CSS3, PHP, JavaScript and jQuery.',
      'Worked on WeCreateFleet, a fleet management software with route planning modules, using PHP, HTML5, CSS3, JavaScript and Ajax.'
    ]
  },
  {
    id: 'lisboa-04',
    title: 'Lisboa',
    description: 'Relocation to Lisboa — expanding into enterprise & fintech development.',
    date: '2016-04',
    routeProgressPercentage: 0.267,
    type: 'location',
    status: 'TECH_METROPOLIS',
    technologies: ['Portugal', 'Capital Hub', 'Fintech'],
    bullets: [
      'Relocation to Lisbon tech metropolis.',
      'Scaling development experience across major media outlets, national associations, and global banking entities.'
    ]
  },
  {
    id: 'global-media-group-05',
    title: 'Global Media Group',
    company: 'Global Media Group',
    role: 'Frontend Developer Consultant',
    description: 'Frontend consultant optimizing web performance across high-traffic digital media platforms.',
    date: 'Apr 2016 – Aug 2017',
    routeProgressPercentage: 0.333,
    type: 'code',
    status: 'COMPLETED',
    technologies: ['Angular', 'TypeScript', 'HTML5', 'CSS3', 'Bootstrap', 'Web Performance'],
    bullets: [
      'Worked as a frontend developer consultant mainly with Angular and TypeScript, focusing on high-traffic web performance.',
      'Used tools like Visual Studio Code, Node.js, Adobe Photoshop and Bootstrap; technologies included Angular, HTML5, CSS3, PHP, JavaScript and jQuery.'
    ]
  },
  {
    id: 'anf-06',
    title: 'ANF Pharmacies',
    company: 'ANF – National Pharmacies Association',
    role: 'Frontend Developer',
    description: 'Built customer service frontend applications for Portuguese national pharmacies.',
    date: 'Sep 2017 – May 2018',
    routeProgressPercentage: 0.4,
    type: 'code',
    status: 'COMPLETED',
    technologies: ['Angular', 'Redux', 'NgRx', 'JavaScript', 'LESS', 'HTML/CSS'],
    bullets: [
      'Worked as a frontend developer at the Portuguese National Pharmacies Association building customer service applications.',
      'Collaborated within a multifaceted team delivering complex and highly challenging Angular customer-facing solutions.',
      'Applied modern state management concepts using Redux and NgRx.'
    ]
  },
  {
    id: 'bnp-paribas-07',
    title: 'BNP Paribas',
    company: 'BNP Paribas',
    role: 'Frontend & Mobile Developer',
    description: 'Engineered mobile banking apps with Ionic & Angular and built departmental design systems.',
    date: 'May 2018 – Mar 2019',
    routeProgressPercentage: 0.467,
    type: 'code',
    status: 'COMPLETED',
    technologies: ['Ionic', 'Angular', 'SCSS', 'Mobile Apps', 'Design System', 'Fintech'],
    bullets: [
      'Focused on developing mobile applications using Ionic with Angular 2+, working on a variety of financial applications for the bank.',
      'Built proof-of-concepts for the migration of the current technology stack to Angular, creating a departmental design system.',
      'Utilised Ionic and deep expertise in SCSS, HTML, and JavaScript to assist multiple internal development squads.'
    ]
  },
  {
    id: 'hovione-08',
    title: 'Hovione',
    company: 'Hovione',
    role: 'Full Stack Software Developer',
    description: 'Led Industry 4.0 greenfield projects with Express.js, Angular, Docker containers, and CI/CD.',
    date: 'Mar 2019 – Aug 2020',
    routeProgressPercentage: 0.533,
    type: 'code',
    status: 'COMPLETED',
    technologies: ['Angular', 'Express.js', 'Docker', 'Industry 4.0', 'Cypress', 'Jenkins'],
    bullets: [
      'Started new greenfield projects from the ground up, defining API contracts and communication patterns using Express.js and Angular for Industry 4.0.',
      'Took a leadership role in frontend architecture, sharing best practices and introducing new technologies across teams.',
      'Implemented containerization with Docker, E2E testing with Cypress & Chai, and CI/CD pipelines via Jenkins.'
    ]
  },
  {
    id: 'rydoo-09',
    title: 'Rydoo',
    company: 'Rydoo',
    role: 'Senior Frontend Developer',
    description: 'Developed SaaS expense management platforms, Nx monorepo architecture, and design systems.',
    date: 'Aug 2020 – Jul 2022',
    routeProgressPercentage: 0.6,
    type: 'code',
    status: 'COMPLETED',
    technologies: ['Angular', 'NgRx', 'Nx Monorepo', 'Design System', 'Jest'],
    bullets: [
      'Instrumental in developing a global SaaS expense management platform using Angular, NgRx state management, and Jest for unit testing.',
      'Drove migration to a Monorepo approach using Nx and implemented a unified corporate Design System.'
    ]
  },
  {
    id: 'pagerduty-10',
    title: 'PagerDuty',
    company: 'PagerDuty',
    role: 'Senior Frontend Developer',
    description: "Built the 'Status Page' product suite across React apps and shared component libraries.",
    date: 'Jul 2022 – Jun 2023',
    routeProgressPercentage: 0.667,
    type: 'code',
    status: 'COMPLETED',
    technologies: ['React', 'TypeScript', 'Status Page', 'Design Systems', 'Jest', 'Component Libraries'],
    bullets: [
      'Worked on a brand new product called "Status Page", empowering companies to transparently communicate service availability to customers.',
      'Primarily responsible for developing two React applications — one for administrative management and one for public status viewing.',
      'Partnered closely with product managers and designers to translate product vision into polished, high-quality experiences.',
      'Contributed to shared design systems and key internal component libraries.',
      'Championed company-wide initiatives moving codebases to TypeScript and enforcing modern frontend best practices.'
    ]
  },
  {
    id: 'berlin-11',
    title: 'Berlin',
    description: 'International relocation to Berlin, Germany — expanding European tech footprint.',
    date: '2023-06',
    routeProgressPercentage: 0.733,
    type: 'location',
    status: 'EUROPEAN_HUB',
    technologies: ['Germany', 'Berlin Tech Hub'],
    bullets: [
      'Relocation to Berlin, Germany.',
      'Engaging with top-tier international scale-ups and European tech hubs.'
    ]
  },
  {
    id: 'bigenius-12',
    title: 'BiGenius',
    company: 'BiGenius',
    role: 'Senior Frontend Developer',
    description: 'Built smart data automation applications using Angular, NgRx, Ag-Grid, and Material Design.',
    date: 'Jun 2023 – Apr 2024',
    routeProgressPercentage: 0.8,
    type: 'code',
    status: 'COMPLETED',
    technologies: ['Angular', 'NgRx', 'Material Design', 'Ag-Grid', 'Cypress', 'Jest'],
    bullets: [
      'Senior frontend developer focused on complex Angular enterprise applications.',
      'Developed smart data automation software using NgRx state management, customized Material Design components, and Ag-Grid tables.',
      'Implemented new product functionalities, optimized application performance, and wrote E2E tests with Cypress and unit tests with Jest.'
    ]
  },
  {
    id: 'amsterdam-13',
    title: 'Amsterdam',
    description: 'Relocation to Amsterdam, Netherlands — current headquarters & engineering base.',
    date: '2024-04',
    routeProgressPercentage: 0.867,
    type: 'location',
    status: 'HEADQUARTERS',
    technologies: ['Netherlands', 'Amsterdam FinTech'],
    bullets: [
      'Relocation to Amsterdam, Netherlands.',
      'Leading staff and senior engineering efforts in modern European fintech platforms.'
    ]
  },
  {
    id: 'dialog-14',
    title: 'Dialog',
    company: 'Dialog',
    role: 'Staff Frontend Engineer',
    description: 'Led frontend development and technical architecture with Angular, RxJS, Akita, and Nx.',
    date: 'Apr 2024 – Oct 2025',
    routeProgressPercentage: 0.900,
    type: 'code',
    status: 'COMPLETED',
    technologies: ['Angular', 'RxJS', 'Akita', 'Nx Monorepo', 'Sass', 'Frontend Architecture'],
    bullets: [
      'Led frontend development, implementing key features in Angular with RxJS, Akita, Nx, and Sass.',
      'Mentored engineering team members, drove core technical decisions, and shaped application architecture through rigorous code reviews and version migration strategies.'
    ]
  },
  {
    id: 'semmiewealth-15',
    title: 'SemmieWealth',
    company: 'SemmieWealth',
    role: 'Senior Frontend Developer',
    description: 'Developing the IEX Golden Bull-winning Semmie App across iOS, Android & Web using Ionic, NgRx, and AI-assisted workflows.',
    date: 'Oct 2025 – Present',
    routeProgressPercentage: 1.0,
    type: 'code',
    status: 'ACTIVE DEPLOYMENT',
    technologies: ['Ionic', 'Angular', 'NgRx', 'Nx Monorepo', 'Jest', 'Azure/AWS', 'GitHub Copilot', 'TDD'],
    bullets: [
      'Develop and enhance the IEX Golden Bull-winning Semmie App (iOS, Android, and web) using Ionic in a hybrid fintech platform.',
      'Design and implement new features, debug complex framework-level issues, and optimize performance and reliability across platforms.',
      'Drive state management with NgRx, integrate APIs and cloud services (Azure/AWS), and contribute to a modular Nx monorepo architecture.',
      'Apply test-driven development with Jest and CI/CD via GitHub Actions to maintain high-quality, dependable releases.',
      'Leverage AI-assisted development with GitHub Copilot and autonomous workflows for faster coding, PR quality checks, and smarter documentation.'
    ]
  },
];
