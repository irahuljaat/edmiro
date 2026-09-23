// firebase/config.js

import { initializeApp, getApps, getApp } from "firebase/app";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    setDoc, 
    doc, 
    query, 
    where, 
    Timestamp 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// 1. Central / Default Firebase Project Config
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_APP_ID,
};

// 2. MVG Project Config
const mvgFirebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_MVG_API_KEY || process.env.NEXT_MVG_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_MVG_AUTH_DOMAIN || process.env.NEXT_MVG_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_MVG_PROJECT_ID || process.env.NEXT_MVG_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_MVG_STORAGE_BUCKET || process.env.NEXT_MVG_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_MVG_MESSAGING_SENDER_ID || process.env.NEXT_MVG_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_MVG_APP_ID || process.env.NEXT_MVG_APP_ID,
};

// Initialize Primary Central App (Default)
const app = !getApps().some(a => a.name === '[DEFAULT]')
    ? initializeApp(firebaseConfig)
    : getApp();

// Initialize MVG School App (Named Instance: 'mvgApp')
const mvgApp = !getApps().some(a => a.name === 'mvgApp')
    ? initializeApp(mvgFirebaseConfig, 'mvgApp')
    : getApp('mvgApp');

// Primary Services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Dedicated MVG Services
export const mvgDb = getFirestore(mvgApp);
export const mvgStorage = getStorage(mvgApp);

export {  
    app,
    mvgApp,
    collection,
    getDocs, 
    setDoc, 
    doc, 
    query, 
    where, 
    Timestamp 
};