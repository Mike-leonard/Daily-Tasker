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
   This pulls in the Firebase SDK that backs schedule persistence.
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

## Firebase Setup

The schedule data now syncs through Firebase Realtime Database and is shared across every device.

1. [Create a Firebase project](https://console.firebase.google.com/) and add a Realtime Database.
2. Copy the web app credentials from **Project Settings → General → Your apps**.
3. Update `src/config/firebaseConfig.js` with the values from the Firebase console.<br>
   If you prefer to keep secrets out of source control, create `src/config/firebaseConfig.local.js`, copy the exported object, and switch the import in `src/lib/firebase.js` to use it.
4. Ensure your Realtime Database has rules that allow the app read/write access. During development you can use:
   ```json
   {
     "rules": {
       "scheduleDefinitions": {
         ".read": true,
         ".write": true
       },
       "scheduleTemplates": {
         ".read": true,
         ".write": true
       }
     }
   }
   ```
   Lock the rules down (for example with Firebase Auth) before shipping to production.

Schedule templates live under the `scheduleDefinitions` node so every device references the same work/off day plans. When a focus timer finishes successfully, the app writes to `scheduleTemplates/<MonthName><Day>_<Year>/<dayType>/<index>` with `activity`, `time`, and `status: true`. On launch those status flags hydrate the UI, so completed blocks stay marked done across refreshes. For example, completing the first off-day block on October 21, 2025 produces `/scheduleTemplates/October21_2025/off/0`. Local AsyncStorage caching still keeps the UI responsive offline.

## Project Structure

- `App.js` contains the main React Native component tree and task logic.
- `index.js` registers the root component for Expo and native builds.
- `app.json` configures the Expo app metadata.
- `metro.config.js` and `babel.config.js` maintain bundler/transpiler defaults compatible with Expo SDK 51.
- `assets/` stores placeholder icons and splash assets; replace these with your own branding as needed.

## Linting

Run `npm run lint` to analyze the project with ESLint. The configuration leverages `eslint-config-universe`, the standard Expo lint preset.

## Next Steps Ideas

- Wire up Firebase Authentication so each user syncs to a private schedule path.
- Add due dates, priority tags, and filters.
- Explore Expo Router or React Navigation for multi-screen workflows.
