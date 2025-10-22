import { getApp, getApps, initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

import { firebaseConfig, isFirebaseConfigValid } from '../config/firebaseConfig';

if (!isFirebaseConfigValid) {
  throw new Error(
    'Firebase configuration is incomplete. Check your environment variables in .env or Expo project configuration.',
  );
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const database = getDatabase(app);
