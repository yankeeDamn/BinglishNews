// ========================================
// FIREBASE CONFIGURATION FILE
// ========================================
// 
// INSTRUCTIONS TO SET UP YOUR FIREBASE PROJECT:
// 
// STEP 1: Create Firebase Project
//   → Go to: https://console.firebase.google.com
//   → Click "Add Project" button
//   → Enter project name: "yourbrand-media" (or your choice)
//   → Follow the setup wizard
// 
// STEP 2: Enable Authentication
//   → In Firebase Console, click "Authentication" in left menu
//   → Click "Get Started"
//   → Go to "Sign-in method" tab
//   → Click "Email/Password"
//   → Enable it and click "Save"
// 
// STEP 3: Create Firestore Database
//   → Click "Firestore Database" in left menu
//   → Click "Create database"
//   → Choose "Start in test mode" (for development)
//   → Select your region (closest to you)
//   → Click "Enable"
// 
// STEP 4: Enable Storage
//   → Click "Storage" in left menu
//   → Click "Get started"
//   → Click "Next" to use default rules
//   → Select your region
//   → Click "Done"
// 
// STEP 5: Get Your Configuration
//   → Click the gear icon ⚙️ next to "Project Overview"
//   → Click "Project settings"
//   → Scroll down to "Your apps" section
//   → Click the web icon "</>"
//   → Register your app (give it a nickname)
//   → Copy the firebaseConfig object values
//   → Paste them below (replace ALL_CAPS placeholders)
// 
// STEP 6: Replace the placeholder values below with YOUR values
// 
// ========================================

const firebaseConfig = {
  // Find this in: Project Settings → General → Your apps → Web app
  apiKey: "AIzaSyDT9sYqPUEP-LiAM9LLXnGxcvSh0m9f5dc",
  
  // Usually: your-project-id.firebaseapp.com
  authDomain: "yourbrand-media.firebaseapp.com",
  
  // Your Firebase project ID (same as project name)
  projectId: "yourbrand-media",
  
  // Usually: your-project-id.appspot.com
  storageBucket: "yourbrand-media.firebasestorage.app",
  
  // Messaging sender ID (numeric)
  messagingSenderId: "1084725378413",
  
  // App ID (starts with "1:")
  appId: "1:1084725378413:web:1165180b0bfcf310fe6e64"
};

// ========================================
// DO NOT MODIFY BELOW THIS LINE
// ========================================

// Check if configuration is set up
function isFirebaseConfigured() {
  return !firebaseConfig.apiKey.includes('PASTE_YOUR') &&
         !firebaseConfig.authDomain.includes('PASTE_YOUR') &&
         !firebaseConfig.projectId.includes('PASTE_YOUR');
}

// Make config available globally
if (typeof window !== 'undefined') {
  window.firebaseConfig = firebaseConfig;
  window.isFirebaseConfigured = isFirebaseConfigured;
}

console.log('🔧 Firebase config loaded. Configured:', isFirebaseConfigured());