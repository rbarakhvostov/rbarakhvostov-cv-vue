import type { JobMeta } from '../types';

export const jobs: readonly JobMeta[] = [
  {
    id: 'alfa',
    company: 'Alfa-Bank',
    period: '2025 -\u00a0',
    urls: [
      { href: 'https://www.alfabank.by', label: 'https://www.alfabank.by' },
    ],
    roleKey: 'roleReactNext',
  },
  {
    id: 'senla',
    company: 'Senla',
    period: '2021 - 2025',
    urls: [{ href: 'https://senlainc.com', label: 'https://senlainc.com' }],
    roleKey: 'roleReact',
  },
  {
    id: 'gp',
    company: 'GP Solutions (Leverice)',
    period: '2020 - 2021',
    urls: [
      { href: 'https://gpsolutions.com', label: 'https://gpsolutions.com' },
      { href: 'https://leverice.com', label: 'https://leverice.com' },
    ],
    roleKey: 'roleVue',
  },
  {
    id: 'epam',
    company: 'EPAM',
    period: '2020',
    urls: [{ href: 'https://www.epam.com', label: 'https://www.epam.com' }],
    roleKey: 'roleReact',
  },
];
