import * as Y from "yjs";

// Removes HTML tags and split by whitespace
export function wordCount(text: string): number {
  return text
    .replace(/<[^>]*>/g, "")
    .split(/\s+/)
    .filter(Boolean).length;
}

// Changes summary for version history
export function getChangeSummary(
  prevDoc: Y.Doc | null,
  currDoc: Y.Doc,
): string {
  if (!prevDoc) {
    return "Initial version";
  }

  // Converts Y.Doc to plain text because
  // Y.XmlFragment is not JSON serializable
  const prevText = prevDoc.getXmlFragment("default").toString();
  const currText = currDoc.getXmlFragment("default").toString();

  if (prevText === currText) {
    return "No changes";
  }

  const diff = wordCount(currText) - wordCount(prevText);

  const pluralize = (count: number, word: string) => {
    return `${count} ${word}${count === 1 ? "" : "s"}`;
  };

  if (diff > 0) {
    return `+${pluralize(diff, "word")} added`;
  }

  if (diff < 0) {
    return `${pluralize(Math.abs(diff), "word")} removed`;
  }

  return "Minor edits";
}
