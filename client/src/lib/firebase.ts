import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';

// Add debugging for Firebase initialization
console.log("Firebase module loaded", new Date().toISOString());

const firebaseConfig = {
  apiKey: "AIzaSyAyBCrG2MEQ0Q_qFs3E1OWdXkuqCJtPbFg",
  authDomain: "payoova.firebaseapp.com",
  projectId: "payoova",
  storageBucket: "payoova.appspot.com", // Fixed storage bucket URL
  messagingSenderId: "815977795796",
  appId: "1:815977795796:web:22ce356cfc4d5e059a6b41",
  measurementId: "G-C3163ZP90V"
};

console.log("Initializing Firebase with config:", firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("Firebase app initialized");

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// For development, you can optionally connect to auth emulator
// Uncomment the lines below if you want to use Firebase Auth emulator for local testing
/*
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  try {
    console.log("Connecting to Firebase Auth emulator for local development");
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  } catch (error) {
    console.log("Auth emulator connection failed:", (error as Error).message);
  }
}
*/

console.log("Firebase auth initialized");

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Set the redirect URL for Firebase Auth
// This ensures Firebase redirects back to the app root after authentication
if (typeof window !== 'undefined') {
  googleProvider.setCustomParameters({
    ...googleProvider.getCustomParameters(),
    redirect_uri: window.location.origin
  });
}
console.log("Google provider configured");

export default app;