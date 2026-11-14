const HTML_ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Для значений атрибутов и текста в head'е, который собирается конкатенацией строк. */
export const escapeHtml = (value: string): string => {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);
};

/**
 * `</script>` внутри JSON-LD закрыл бы тег и выбросил остаток схемы в разметку.
 * Экранируем `<` — JSON-парсер читает `<` как обычный символ.
 */
export const escapeJsonLd = (json: string): string => {
  return json.replace(/</g, '\\u003c');
};
