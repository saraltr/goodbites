import * as admin from 'firebase-admin';

// sets up the Admin SDK using a service account key
if (!admin.apps.length) {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    throw new Error('The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Please make sure to set it in your .env.local file.');
  }

  const decoded = Buffer.from(serviceAccountKey, "base64").toString("utf8");

  try {
    const serviceAccount = JSON.parse(decoded);

    // initialize Firebase Admin using the service account credentials
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (e) {
    console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:', e);
    throw new Error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it is a valid base64 encoded JSON.');
  }
}

export const authAdmin = admin.auth();
export const db = admin.firestore();