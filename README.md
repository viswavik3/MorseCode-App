# Morse Studio

Morse Studio is a React + Vite web app for working with Morse code in three ways:

- Live signal input that decodes dots and dashes into text
- Reverse conversion from plain text to Morse
- A searchable reference for supported characters

It is designed as a client-side app with a polished UI, keyboard support, optional sound and haptics, and responsive layouts for desktop and mobile.

## Features

- Real-time Morse input with automatic letter resolution
- Dot/dash entry using the on-screen press pad
- Adjustable press-to-dash timeout
- Adjustable next-letter timeout
- Dedicated `Add space` control for manual word spacing
- Spacebar support for signal input
- Editable decoded output field with cursor-aware insertion and deletion
- Reverse conversion from text to Morse code
- Searchable reference view for alphabet, numbers, and punctuation
- Light and dark theme toggle with persistence in `localStorage`
- Optional audio feedback using the Web Audio API
- Optional vibration feedback using the Vibration API
- Copy-to-clipboard actions for decoded text and Morse output

## Tech Stack

- React 18
- Vite 5
- React Router DOM 6
- Tailwind CSS 3
- PostCSS + Autoprefixer
- Lucide React for icons
- `clsx` available as a utility dependency

## Project Structure

```text
.
|-- index.html
|-- package.json
|-- postcss.config.js
|-- tailwind.config.js
|-- vite.config.js
`-- src
    |-- App.jsx
    |-- main.jsx
    |-- styles.css
    |-- components
    |   |-- AppShell.jsx
    |   |-- ControlButton.jsx
    |   |-- MetricPill.jsx
    |   |-- MorseGrid.jsx
    |   |-- MorsePressPad.jsx
    |   |-- OutputDisplay.jsx
    |   |-- ReferenceCard.jsx
    |   |-- SectionHeading.jsx
    |   `-- ThemeProvider.jsx
    |-- pages
    |   |-- MorseInputPage.jsx
    |   |-- ReferencePage.jsx
    |   `-- ReversePage.jsx
    |-- test
    |   |-- setup.js
    |   `-- test-utils.jsx
    `-- utils
        |-- audio.js
        `-- morse.js
```

## Pages and Routes

### `/`

Primary live-input experience.

- Accepts Morse signals as dots and dashes
- Uses idle timing to decide when a letter is complete
- Lets you adjust both press and letter-break timing
- Uses a dedicated `Add space` button for word spacing
- Shows matching characters while the current symbol prefix is being entered
- Exposes the decoded result in an editable text box

### `/reverse`

Text-to-Morse converter.

- Converts typed text into Morse in real time
- Preserves spaces as `/`
- Ignores unsupported characters

### `/reference`

Reference dictionary for supported symbols.

- Search by character, Morse pattern, or category
- Groups results into alphabet, numbers, and punctuation

## Morse Timing Rules

These values are currently defined in [`src/utils/morse.js`](C:\Users\viswa\OneDrive\Desktop\Morse Code APP\src\utils\morse.js):

- Long press threshold: `300ms`
- Letter break: `700ms`
- Word break: `1800ms`

In input mode:

- A press shorter than `300ms` is treated as a dot (`.`)
- A press longer than `300ms` is treated as a dash (`-`)
- After `700ms` of inactivity, the current letter is resolved
- The press-to-dash threshold and next-letter timeout are adjustable in the UI
- Longer pauses update status but do not insert spaces automatically
- Spaces are inserted only when the user presses the `Add space` button

## Supported Characters

The app currently supports:

- Letters: `A-Z`
- Numbers: `0-9`
- Punctuation: `. , ? ! ' " / ( ) & : ; = + - _ @`

The source of truth lives in [`src/utils/morse.js`](C:\Users\viswa\OneDrive\Desktop\Morse Code APP\src\utils\morse.js).

## Getting Started

### Prerequisites

- Node.js 18 or newer recommended
- npm 9 or newer recommended

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

By default, Vite will print a local URL in the terminal, usually:

```text
http://localhost:5173
```

### Build for production

```bash
npm run build
```

The production-ready output is generated in the `dist/` directory.

### Preview the production build locally

```bash
npm run preview
```

## Available Scripts

Defined in [`package.json`](C:\Users\viswa\OneDrive\Desktop\Morse Code APP\package.json):

- `npm run dev` - starts the Vite dev server
- `npm run build` - creates a production build
- `npm run preview` - serves the built app locally for verification
- `npm test` - runs the Vitest test suite

## How Input Mode Works

The live decoder on [`src/pages/MorseInputPage.jsx`](C:\Users\viswa\OneDrive\Desktop\Morse Code APP\src\pages\MorseInputPage.jsx) combines several pieces:

- Keyboard listeners detect `Space` key press and release timing
- The on-screen pad can emit dots and dashes directly
- A trie-based Morse lookup resolves exact symbols and prefix matches
- Timers determine when to commit a letter
- The decoded output is an editable text area with selection-aware deletion
- A dedicated control inserts spaces manually
- Decoded output can be copied to the clipboard

## Browser APIs Used

This app is fully client-side and depends on a few browser APIs:

- `localStorage` for theme persistence
- `navigator.clipboard.writeText()` for copy actions
- `window.AudioContext` for tone playback
- `navigator.vibrate()` for haptic feedback when supported

Notes for developers:

- Clipboard access may require a secure context in some browsers
- Vibration support is device/browser dependent
- Audio playback behavior may vary until the page receives user interaction

## Styling

Styling is handled with Tailwind CSS and custom design tokens in [`src/styles.css`](C:\Users\viswa\OneDrive\Desktop\Morse Code APP\src\styles.css).

Notable setup details:

- Global color variables are defined for both dark and light themes
- `Sora` is loaded from Google Fonts
- Tailwind content scanning includes `index.html` and `src/**/*.{js,jsx}`
- Custom animations and a mesh background are configured in [`tailwind.config.js`](C:\Users\viswa\OneDrive\Desktop\Morse Code APP\tailwind.config.js)

## Routing

Routing is handled with `react-router-dom` using `BrowserRouter`, configured in:

- [`src/main.jsx`](C:\Users\viswa\OneDrive\Desktop\Morse Code APP\src\main.jsx)
- [`src/App.jsx`](C:\Users\viswa\OneDrive\Desktop\Morse Code APP\src\App.jsx)

Unknown routes are redirected back to `/`.

## Deployment Notes

This is a static frontend app, so it can be deployed to any platform that serves Vite build output, including:

- Vercel
- Netlify
- GitHub Pages
- Firebase Hosting
- Static hosting on any CDN or web server

General deployment flow:

1. Run `npm install`
2. Run `npm run build`
3. Deploy the generated `dist/` folder

If deploying behind a non-root base path, you may need to update `vite.config.js` with a `base` setting.

## Development Notes

- The app includes a Vitest + Testing Library test suite
- There is no linter configuration checked in right now
- The project is written in JavaScript with JSX, even though React type packages are installed in `devDependencies`

If you want to extend the app, good next additions would be:

- End-to-end tests for input interactions
- Accessibility testing for keyboard and screen-reader behavior
- Import/export history for practice sessions

## Troubleshooting

### `npm install` fails

- Confirm Node.js and npm are installed
- Delete `node_modules` and retry
- Make sure you are running commands from the project root

### Sound does not play

- Interact with the page first to satisfy browser autoplay restrictions
- Check whether your browser blocks Web Audio until a gesture occurs

### Haptics do not work

- `navigator.vibrate()` is not supported on all devices or browsers
- Desktop browsers often ignore vibration requests

### Copy actions do not work

- Clipboard APIs can be restricted in some browser contexts
- Try running the app from the Vite dev server instead of opening files directly

## License

No license file is currently present in this repository. Add one if you plan to distribute or open-source the project.
