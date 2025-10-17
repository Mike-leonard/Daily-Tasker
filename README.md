# Tasker React Native App

A simple task management app built with React Native (Expo) and JavaScript. The UI showcases a lightweight task list with add, toggle-complete, and delete interactions to help you learn core React Native concepts.

## Requirements

- Node.js 18 or newer
- npm 9+ or pnpm/yarn if you prefer alternative package managers
- Expo CLI (`npm install --global expo-cli`) optional but recommended

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run start
   ```
   Use the Expo dev tools to launch on an emulator/simulator or scan the QR code with Expo Go on your device.

3. Platform-specific helpers are also available:
   ```bash
   npm run android
   npm run ios
   npm run web
   ```

## Project Structure

- `App.js` contains the main React Native component tree and task logic.
- `index.js` registers the root component for Expo and native builds.
- `app.json` configures the Expo app metadata.
- `metro.config.js` and `babel.config.js` maintain bundler/transpiler defaults compatible with Expo SDK 51.
- `assets/` stores placeholder icons and splash assets; replace these with your own branding as needed.

## Linting

Run `npm run lint` to analyze the project with ESLint. The configuration leverages `eslint-config-universe`, the standard Expo lint preset.

## Next Steps Ideas

- Persist tasks with AsyncStorage or a backend API.
- Add due dates, priority tags, and filters.
- Explore Expo Router or React Navigation for multi-screen workflows.
