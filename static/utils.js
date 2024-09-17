export function wc(str) {
  let words = str.replace("\n", " ").split(/\s+/);
  let lines = str.split("\n");

  word_count = words.map((word) => (word.length ? " " : "")).join("").length;

  return {
    lines: lines.length,
    words: word_count,
    chars: str.length,
  };
}
