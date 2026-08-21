import type { Locale, PdfAsset } from '../types';

const PDF_FILES = {
  en: {
    path: 'uploads/CV_ROMAN_BARAKHVOSTOV_FRONTEND_REACT_DEVELOPER_EN.pdf',
    fileName: 'Roman_Barakhvostov_CV_EN.pdf',
  },
  ru: {
    path: 'uploads/CV_ROMAN_BARAKHVOSTOV_FRONTEND_REACT_DEVELOPER_RU.pdf',
    fileName: 'Roman_Barakhvostov_CV_RU.pdf',
  },
} as const satisfies Record<Locale, { path: string; fileName: string }>;

export function getPdfAsset(locale: Locale): PdfAsset {
  const asset = PDF_FILES[locale];

  return {
    href: `${import.meta.env.BASE_URL}${asset.path}`,
    fileName: asset.fileName,
  };
}
