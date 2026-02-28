import admin from 'firebase-admin'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

if (!admin.apps.length) {
  let serviceAccount: admin.ServiceAccount

  // Option 1: Use individual environment variables (for Vercel / production)
  // Only 3 fields are required for Firebase Admin SDK initialization
  if (process.env.FCM_PROJECT_ID && process.env.FCM_CLIENT_EMAIL && process.env.FCM_PRIVATE_KEY) {
    serviceAccount = {
      projectId: process.env.FCM_PROJECT_ID,
      clientEmail: process.env.FCM_CLIENT_EMAIL,
      // Private key comes with escaped newlines from env vars, need to unescape
      privateKey: process.env.FCM_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }
  }
  // Option 2: Read from local file (for local development)
  else {
    const filePath = join(process.cwd(), 'server/config/fcm-service-account.json')
    if (!existsSync(filePath)) {
      console.error('[Firebase] Service account not found. Set FCM_PROJECT_ID, FCM_CLIENT_EMAIL, and FCM_PRIVATE_KEY env vars, or place the file at server/config/fcm-service-account.json')
      throw new Error('Firebase service account configuration not found')
    }
    serviceAccount = JSON.parse(readFileSync(filePath, 'utf8'))
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  })
}

export const messaging = admin.messaging()