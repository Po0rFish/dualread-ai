import type { TranslationItem } from '../../types/translation';

export default function ByParts({ item }: { readonly item: TranslationItem }) {
  if (!item.byParts?.length) {
    return <p className="translation-popover__placeholder">By parts is unavailable for this translation.</p>;
  }
  return (
    <details>
      <summary>By parts</summary>
      <p className="translation-popover__placeholder">Meanings in German source order.</p>
      <ol>
        {item.byParts.map((part, index) => (
          <li key={index}><span lang="de">{part.source}</span>: <span lang="en">{part.meaning}</span></li>
        ))}
      </ol>
    </details>
  );
}
