export function wc(str) {
  const words = str.replace("\n", " ").split(/\s+/);
  const lines = str.split("\n");

  const word_count = words
    .map((word) => (word.length ? " " : ""))
    .join("").length;

  return {
    lines: lines.length,
    words: word_count,
    chars: str.length,
  };
}
