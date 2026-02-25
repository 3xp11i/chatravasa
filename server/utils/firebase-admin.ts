import admin from 'firebase-admin'
import { readFileSync } from 'fs'
import { join } from 'path'

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    readFileSync(
      join(process.cwd(), 'server/config/fcm-service-account.json'),
      'utf8'
    )
  )

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  })
}

export const messaging = admin.messaging()