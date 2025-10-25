require("dotenv").config();

const baseConfig = require("./app.json");

const readEnv = (key) =>
  process.env[`EXPO_PUBLIC_${key}`] ?? process.env[key] ?? "";

const buildFirebaseExtra = () => ({
  apiKey: readEnv('FIREBASE_API_KEY'),
  authDomain: readEnv('FIREBASE_AUTH_DOMAIN'),
  databaseURL: readEnv('FIREBASE_DATABASE_URL'),
  projectId: readEnv('FIREBASE_PROJECT_ID'),
  storageBucket: readEnv('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: readEnv('FIREBASE_MESSAGING_SENDER_ID'),
  appId: readEnv('FIREBASE_APP_ID'),
});

module.exports = ({ config }) => ({
  ...baseConfig,
  expo: {
    ...baseConfig.expo,
    ...(config?.expo ?? {}),
    extra: {
      ...(baseConfig.expo?.extra ?? {}),
      ...(config?.expo?.extra ?? {}),
      firebase: buildFirebaseExtra(),
    },
  },
});
