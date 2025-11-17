import * as admin from 'firebase-admin';

// sets up the Admin SDK using a service account key
if (!admin.apps.length) {
  const decoded = Buffer.from(
    // encoded the env 
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY!, "base64"
  ).toString("utf8");

  const serviceAccount = JSON.parse(decoded);

  // initialize Firebase Admin using the service account credentials
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const authAdmin = admin.auth();
