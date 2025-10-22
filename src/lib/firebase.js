import { getApp, getApps, initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

import { firebaseConfig } from '../config/firebaseConfig';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const database = getDatabase(app);
