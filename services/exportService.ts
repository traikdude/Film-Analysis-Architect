import { CurationSession, Movie } from '../types';

/** ---------------------------------------------------------------
 *  exportService.ts
 *  Converts a CurationSession into formatted Markdown and either
 *  triggers a browser download or copies to clipboard.
 *  Output is formatted for direct upload to NotebookLM or Google Docs.
 * --------------------------------------------------------------- */

const pad2 = (n: number) => String(n).padStart(2, '0');

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} at ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function starRating(movie: Movie, ratings: Record<string, number>): string {
  const r = ratings[movie.title.toLowerCase()];
  if (!r) return '';
  return ' · ' + '★'.repeat(r) + '☆'.repeat(5 - r);
}

export function sessionToMarkdown(session: CurationSession, ratings: Record<string, number> = {}): string {
  const lines: string[] = [];

  lines.push(`# 🎬 Film Curator Session`);
  lines.push(`**Generated:** ${formatDate(session.createdAt)}`);
  lines.push(`**Genres:** ${session.genres.join(' · ')}`);
  lines.push(`**Era:** ${session.yearRange}`);
  lines.push(`**Films curated:** ${session.movieCount}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  session.movies.forEach((movie, i) => {
    const rating = starRating(movie, ratings);
    lines.push(`## ${i + 1}. ${movie.title} (${movie.year})${rating}`);
    lines.push(`**Director:** ${movie.director}  `);
    lines.push(`**Classification:** ${movie.classification}  `);
    if (movie.runtime) lines.push(`**Runtime:** ${movie.runtime}  `);
    lines.push('');

    if (movie.synopsis) {
      lines.push(`### Synopsis`);
      lines.push(movie.synopsis);
      lines.push('');
    }

    if (movie.criticalOverview) {
      lines.push(`### Critical Overview`);
      lines.push(movie.criticalOverview);
      lines.push('');
    }

    if (movie.keyThemes?.length) {
      lines.push(`### Key Themes`);
      movie.keyThemes.forEach(t => lines.push(`- ${t}`));
      lines.push('');
    }

    if (movie.technicalElements?.length) {
      lines.push(`### Technical Elements`);
      movie.technicalElements.forEach(t => lines.push(`- ${t}`));
      lines.push('');
    }

    if (movie.artisticMerit) {
      lines.push(`### Artistic Merit`);
      lines.push(movie.artisticMerit);
      lines.push('');
    }

    if (movie.culturalImpact) {
      lines.push(`### Cultural Impact`);
      lines.push(movie.culturalImpact);
      lines.push('');
    }

    if (movie.trailer) {
      lines.push(`**🎥 Trailer:** ${movie.trailer}`);
      lines.push('');
    }

    lines.push('---');
    lines.push('');
  });

  lines.push(`*Exported from Film Architect Curator — ${formatDate(session.createdAt)}*`);
  return lines.join('\n');
}

export function downloadSessionMarkdown(session: CurationSession, ratings: Record<string, number> = {}): void {
  const md = sessionToMarkdown(session, ratings);
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateTag = new Date(session.createdAt).toISOString().slice(0, 10);
  const genreTag = session.genres.slice(0, 3).join('-').toLowerCase().replace(/\s+/g, '_');
  a.href = url;
  a.download = `film-curator_${dateTag}_${genreTag}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function copySessionToClipboard(session: CurationSession, ratings: Record<string, number> = {}): Promise<boolean> {
  const md = sessionToMarkdown(session, ratings);
  try {
    await navigator.clipboard.writeText(md);
    return true;
  } catch {
    return false;
  }
}

/** Retrieve history from localStorage */
export function loadHistory(): CurationSession[] {
  try {
    const raw = localStorage.getItem('curation_history');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Save a new session to history (max 20, newest first) */
export function saveToHistory(session: CurationSession): void {
  const history = loadHistory();
  // Deduplicate by id
  const updated = [session, ...history.filter(s => s.id !== session.id)].slice(0, 20);
  localStorage.setItem('curation_history', JSON.stringify(updated));
}

/** Delete a session from history */
export function deleteFromHistory(id: string): CurationSession[] {
  const history = loadHistory().filter(s => s.id !== id);
  localStorage.setItem('curation_history', JSON.stringify(history));
  return history;
}
