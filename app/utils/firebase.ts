import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth'
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore'

export const useFirebase = () => {
  const { $firebase } = useNuxtApp()
  const user = useState<User | null>('user', () => null)
  const loading = useState<boolean>('loading', () => true)

  if (!$firebase?.auth) {
    console.error('Firebase auth is not initialized')
    return
  }

  // Auth functions
  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword($firebase.auth, email, password)
      user.value = userCredential.user
      return userCredential
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword($firebase.auth, email, password)
      user.value = userCredential.user
      return userCredential
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const signOut = async () => {
    try {
      await fbSignOut($firebase.auth)
      user.value = null
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  // Firestore functions
  const createDocument = async (collection: string, id: string, data: any) => {
    try {
      const docRef = doc($firebase.firestore, collection, id)
      await setDoc(docRef, data)
      return true
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const getDocument = async (collection: string, id: string) => {
    try {
      const docRef = doc($firebase.firestore, collection, id)
      const docSnap = await getDoc(docRef)
      return docSnap.exists() ? docSnap.data() : null
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const updateDocument = async (collection: string, id: string, data: any) => {
    try {
      const docRef = doc($firebase.firestore, collection, id)
      await updateDoc(docRef, data)
      return true
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const queryDocuments = async (
    collectionName: string,
    field: string,
    operator: any,
    value: any
  ) => {
    try {
      const q = query(
        collection($firebase.firestore, collectionName),
        where(field, operator, value)
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  // Auth state observer
  onMounted(() => {
    onAuthStateChanged($firebase.auth, (currentUser) => {
      user.value = currentUser
      loading.value = false
    })
  })

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    createDocument,
    getDocument,
    updateDocument,
    queryDocuments
  }
}