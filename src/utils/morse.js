const LETTER_BREAK_MS = 700;
const WORD_BREAK_MS = 1800;
const LONG_PRESS_MS = 300;

const RAW_MORSE_PAIRS = [
  ["A", ".-"],
  ["B", "-..."],
  ["C", "-.-."],
  ["D", "-.."],
  ["E", "."],
  ["F", "..-."],
  ["G", "--."],
  ["H", "...."],
  ["I", ".."],
  ["J", ".---"],
  ["K", "-.-"],
  ["L", ".-.."],
  ["M", "--"],
  ["N", "-."],
  ["O", "---"],
  ["P", ".--."],
  ["Q", "--.-"],
  ["R", ".-."],
  ["S", "..."],
  ["T", "-"],
  ["U", "..-"],
  ["V", "...-"],
  ["W", ".--"],
  ["X", "-..-"],
  ["Y", "-.--"],
  ["Z", "--.."],
  ["0", "-----"],
  ["1", ".----"],
  ["2", "..---"],
  ["3", "...--"],
  ["4", "....-"],
  ["5", "....."],
  ["6", "-...."],
  ["7", "--..."],
  ["8", "---.."],
  ["9", "----."],
  [".", ".-.-.-"],
  [",", "--..--"],
  ["?", "..--.."],
  ["!", "-.-.--"],
  ["'", ".----."],
  ['"', ".-..-."],
  ["/", "-..-."],
  ["(", "-.--."],
  [")", "-.--.-"],
  ["&", ".-..."],
  [":", "---..."],
  [";", "-.-.-."],
  ["=", "-...-"],
  ["+", ".-.-."],
  ["-", "-....-"],
  ["_", "..--.-"],
  ["@", ".--.-."],
];

export const MORSE_ENTRIES = RAW_MORSE_PAIRS.map(([character, morse]) => ({
  character,
  morse,
  category: /[A-Z]/.test(character)
    ? "Alphabet"
    : /[0-9]/.test(character)
      ? "Numbers"
      : "Punctuation",
}));

export const CHAR_TO_MORSE = new Map(RAW_MORSE_PAIRS);
export const MORSE_TO_CHAR = new Map(
  RAW_MORSE_PAIRS.map(([character, morse]) => [morse, character]),
);

export const MORSE_TRIE = buildTrie(RAW_MORSE_PAIRS);

function buildTrie(pairs) {
  const root = { children: new Map(), values: [] };

  for (const [character, morse] of pairs) {
    let node = root;
    for (const symbol of morse) {
      if (!node.children.has(symbol)) {
        node.children.set(symbol, { children: new Map(), values: [] });
      }
      node = node.children.get(symbol);
      node.values.push(character);
    }
    node.character = character;
  }

  return root;
}

export function resolvePrefix(prefix) {
  if (!prefix) {
    return {
      exact: null,
      matches: MORSE_ENTRIES.map((entry) => entry.character),
      hasPrefix: true,
    };
  }

  let node = MORSE_TRIE;
  for (const symbol of prefix) {
    node = node.children.get(symbol);
    if (!node) {
      return { exact: null, matches: [], hasPrefix: false };
    }
  }

  return {
    exact: node.character ?? null,
    matches: node.values ?? [],
    hasPrefix: true,
  };
}

export function textToMorse(text) {
  return text
    .toUpperCase()
    .split("")
    .map((character) => {
      if (character === " ") {
        return "/";
      }
      return CHAR_TO_MORSE.get(character) ?? "";
    })
    .filter(Boolean)
    .join(" ");
}

export function splitMorseSymbols(morseText) {
  return morseText.split(" ").filter(Boolean);
}

export function normalizeInputText(text) {
  return text.replace(/\s+/g, " ").trimStart();
}

export function isSupportedCharacter(character) {
  return CHAR_TO_MORSE.has(character.toUpperCase()) || character === " ";
}

export function getTimingConfig() {
  return {
    letterBreakMs: LETTER_BREAK_MS,
    wordBreakMs: WORD_BREAK_MS,
    longPressMs: LONG_PRESS_MS,
  };
}
