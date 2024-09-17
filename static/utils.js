export function wc(str) {
  const words = str.replace("\n", " ").split(/\s+/);
  const lines = str.split("\n");

  const wordCount = words
    .map((word) => (word.length ? " " : ""))
    .join("").length;

  return {
    lines: lines.length,
    words: wordCount,
    chars: str.length,
  };
}

export function newSelectionRange(newString) {
  const start = input.selectionStart;
  const end = input.selectionEnd;
  const lines = input.value.split("\n");
  const newLines = newString.split("\n");

  if (start !== end) return; // range selection is not handled

  let lineIndex = 0; // line number of the cursor is on
  let positionAtLine = start; // position of the cursor starting at the current line
  for (let i = 0; i < lines.length; i++) {
    if (positionAtLine < lines[i].length + 1) {
      lineIndex = i;
      break;
    } else positionAtLine -= lines[i].length + 1;
  }

  const currentLine = lines[lineIndex];
  if (newLines.length < lineIndex) return; // new line is shorter than the old one
  const newCurrentLine = newLines[lineIndex];

  if (
    currentLine === newCurrentLine &&
    input.value.slice(0, start) === newString.slice(0, start)
  )
    return { start: start, end: end }; // change happens in following lines

  const newStart =
    newLines.slice(0, lineIndex).join("\n").length + positionAtLine + 1;
  if (currentLine === newCurrentLine) return { start: newStart, end: newStart }; // current line is not changed

  if (
    lines.slice(0, lineIndex).join("\n") ===
    newLines.slice(0, lineIndex).join("\n")
  ) {
    const endOfCurrentLine = newLines.slice(0, lineIndex + 1).join("\n").length;
    return { start: endOfCurrentLine, end: endOfCurrentLine }; // jump to the end of current line
  }
}
