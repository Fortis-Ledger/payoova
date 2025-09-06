const admin = require('firebase-admin');

// Firebase Admin SDK configuration
const initializeFirebase = () => {
  if (!admin.apps.length) {
    // For development, use application default credentials
    // In production, you should use a service account key
    try {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID
      });
    } catch (error) {
      console.warn('Firebase Admin SDK initialization failed:', error.message);
      console.warn('Using mock Firebase for development - tokens will not be verified');
      // Return a mock admin object for development
      return {
        auth: () => ({
          verifyIdToken: async (token) => {
            console.warn('Mock Firebase verification - accepting all tokens');
            return {
              uid: 'mock-user-id',
              email: 'mock@example.com',
              name: 'Mock User'
            };
          }
        })
      };
    }
  }
  return admin;
};

module.exports = { initializeFirebase, admin };