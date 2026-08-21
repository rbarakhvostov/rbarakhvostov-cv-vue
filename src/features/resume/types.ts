export type Locale = 'en' | 'ru'

export type Theme = 'light' | 'dark'

export type RoleKey = 'roleReactNext' | 'roleReact' | 'roleVue'

export type JobId = 'alfa' | 'senla' | 'gp' | 'epam'

export type ResumeCopy = {
  name: string
  roleLine: string
  summary: string
  expHeading: string
  skillsHeading: string
  roleReactNext: string
  roleReact: string
  roleVue: string
  lightLabel: string
  darkLabel: string
  jobs: Record<JobId, readonly string[]>
}

export type JobUrl = {
  href: string
  label: string
}

export type JobMeta = {
  id: JobId
  company: string
  period: string
  urls: readonly JobUrl[]
  roleKey: RoleKey
}

export type Contact = {
  href: string
  label: string
}

export type RolePart = {
  text: string
  showSep: boolean
}

export type PdfAsset = {
  href: string
  fileName: string
}
