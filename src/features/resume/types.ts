export type Locale = 'en' | 'ru';

export type Theme = 'light' | 'dark';

export type RoleKey = 'roleReactNextAi' | 'roleReact' | 'roleVue';

export type JobId = 'alfa' | 'senla' | 'gp' | 'epam';

export type ResumeCopy = {
  name: string;
  roleLine: string;
  summary: string;
  expHeading: string;
  skillsHeading: string;
  roleReactNextAi: string;
  roleReact: string;
  roleVue: string;
  skipToContent: string;
  langGroupLabel: string;
  themeGroupLabel: string;
  lightLabel: string;
  darkLabel: string;
  pdfLabel: string;
  newTabHint: string;
  jobs: Record<JobId, readonly string[]>;
};

export type SeoCopy = {
  title: string;
  description: string;
  ogLocale: string;
  imageAlt: string;
  firstName: string;
  lastName: string;
};

export type JobUrl = {
  href: string;
  label: string;
};

export type JobMeta = {
  id: JobId;
  company: string;
  period: string;
  urls: readonly JobUrl[];
  roleKey: RoleKey;
};

export type ContactIconName = 'mail' | 'telegram' | 'linkedin' | 'github';

export type Contact = {
  href: string;
  label: string;
  icon: ContactIconName;
};

export type RolePart = {
  text: string;
  showSep: boolean;
};

export type NumberPart = {
  text: string;
  isHighlighted: boolean;
};

export type SummaryPartKind = 'text' | 'highlight' | 'link';

export type SummaryPart = {
  kind: SummaryPartKind;
  text: string;
};

export type PdfAsset = {
  href: string;
  fileName: string;
};
