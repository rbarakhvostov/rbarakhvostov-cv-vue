import type { SummaryPart, SummaryPartKind } from '../types';

type SummaryMark = {
  text: string;
  kind: Exclude<SummaryPartKind, 'text'>;
};

const MARKS: readonly SummaryMark[] = [
  { text: 'Senior Frontend Developer', kind: 'highlight' },
  { text: 'Senior Frontend-разработчик', kind: 'highlight' },
  { text: '6 years', kind: 'highlight' },
  { text: '6-летним', kind: 'highlight' },
  { text: 'RS School', kind: 'link' },
];

type Hit = {
  start: number;
  end: number;
  mark: SummaryMark;
};

export function splitSummary(value: string): SummaryPart[] {
  if (value.length === 0) {
    return [];
  }

  const hits: Hit[] = [];

  for (const mark of MARKS) {
    let from = 0;
    while (from < value.length) {
      const start = value.indexOf(mark.text, from);
      if (start === -1) {
        break;
      }
      hits.push({ start, end: start + mark.text.length, mark });
      from = start + mark.text.length;
    }
  }

  hits.sort((a, b) => a.start - b.start);

  const chosen: Hit[] = [];
  let cursor = 0;
  for (const hit of hits) {
    if (hit.start < cursor) {
      continue;
    }
    chosen.push(hit);
    cursor = hit.end;
  }

  const parts: SummaryPart[] = [];
  let pos = 0;
  for (const hit of chosen) {
    if (hit.start > pos) {
      parts.push({ kind: 'text', text: value.slice(pos, hit.start) });
    }
    parts.push({ kind: hit.mark.kind, text: hit.mark.text });
    pos = hit.end;
  }
  if (pos < value.length) {
    parts.push({ kind: 'text', text: value.slice(pos) });
  }

  return parts;
}
