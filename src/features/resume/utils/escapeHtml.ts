const HTML_ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export const escapeHtml = (value: string): string => {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);
};

export const escapeJsonLd = (json: string): string => {
  return json.replace(/</g, '\\u003c');
};
