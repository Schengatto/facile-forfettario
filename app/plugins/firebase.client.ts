import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

import type { Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'

interface FirebasePlugin {
    app: unknown
    auth: Auth
    firestore: Firestore
}

export default defineNuxtPlugin((): { provide: { firebase: FirebasePlugin } } => {
    const config = useRuntimeConfig()

    const firebaseConfig = {
        apiKey: String(config.public.firebaseApiKey),
        authDomain: String(config.public.firebaseAuthDomain),
        projectId: String(config.public.firebaseProjectId),
        storageBucket: String(config.public.firebaseStorageBucket),
        messagingSenderId: String(config.public.firebaseMessagingSenderId),
        appId: String(config.public.firebaseAppId),
    }

    const app = initializeApp(firebaseConfig)
    const auth = getAuth(app)
    const firestore = getFirestore(app)

    return {
        provide: {
            firebase: {
                app,
                auth,
                firestore
            }
        }
    }
})