import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBY2dcEkd680w_i7ghxe-DXtGTKrbXfRNg",
  authDomain: "vincent-ai-tiktok.firebaseapp.com",
  projectId: "vincent-ai-tiktok",
  storageBucket: "vincent-ai-tiktok.firebasestorage.app",
  messagingSenderId: "853086367048",
  appId: "1:853086367048:web:16abbfd3781a54f25e577d"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
