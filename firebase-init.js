// ========================================
// FIREBASE INITIALIZATION
// ========================================
// This file initializes Firebase using the config from firebase-config.js
// DO NOT MODIFY unless you know what you're doing
// ========================================

let app, auth, db, storage;
let firebaseInitialized = false;

// Initialize Firebase
function initializeFirebase() {
  try {
    // Check if config is properly set
    if (!window.isFirebaseConfigured || !window.isFirebaseConfigured()) {
      console.warn('⚠️ Firebase not configured yet!');
      console.warn('📝 Please edit firebase-config.js and add your Firebase credentials');
      console.warn('📚 See instructions at the top of firebase-config.js');
      
      // Show user-friendly message
      setTimeout(() => {
        showSetupInstructions();
      }, 1000);
      
      return false;
    }

    // Check if Firebase SDK is loaded
    if (typeof firebase === 'undefined') {
      console.error('❌ Firebase SDK not loaded. Check your script tags in index.html');
      return false;
    }

    // Initialize Firebase app
    app = firebase.initializeApp(window.firebaseConfig);
    
    // Initialize services
    auth = firebase.auth();
    db = firebase.firestore();
    storage = firebase.storage();
    
    firebaseInitialized = true;
    console.log('✅ Firebase initialized successfully!');
    console.log('📦 Services ready: Auth, Firestore, Storage');
    
    return true;
    
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    console.error('💡 Make sure you added your config in firebase-config.js');
    
    // Show error to user
    setTimeout(() => {
      showFirebaseError(error.message);
    }, 1000);
    
    return false;
  }
}

// Show setup instructions to user
function showSetupInstructions() {
  const instructionsHTML = `
    <div style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 32px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      max-width: 600px;
      width: 90%;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <h2 style="color: #1e3a8a; margin: 0 0 16px 0;">🔧 Firebase Setup Required</h2>
      <p style="color: #6b7280; margin-bottom: 24px;">
        Welcome! To use this application, you need to configure Firebase first.
      </p>
      
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
        <h3 style="color: #1f2937; margin: 0 0 12px 0; font-size: 16px;">Quick Setup Steps:</h3>
        <ol style="color: #4b5563; margin: 0; padding-left: 20px; line-height: 1.8;">
          <li>Create a Firebase project at <a href="https://console.firebase.google.com" target="_blank" style="color: #1e3a8a;">console.firebase.google.com</a></li>
          <li>Enable <strong>Authentication</strong> (Email/Password)</li>
          <li>Create <strong>Firestore Database</strong> (test mode)</li>
          <li>Enable <strong>Storage</strong></li>
          <li>Get your config from <strong>Project Settings</strong></li>
          <li>Open <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">firebase-config.js</code></li>
          <li>Replace the placeholder values with your config</li>
          <li>Refresh this page</li>
        </ol>
      </div>
      
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 4px; margin-bottom: 24px;">
        <p style="margin: 0; color: #92400e; font-size: 14px;">
          <strong>📝 Note:</strong> Detailed instructions are in the <code>firebase-config.js</code> file.
        </p>
      </div>
      
      <button onclick="this.parentElement.remove()" style="
        background: #1e3a8a;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 16px;
        font-weight: 600;
        width: 100%;
      ">
        I understand, let me configure Firebase
      </button>
    </div>
    <div onclick="this.nextElementSibling.remove(); this.remove();" style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 9999;
    "></div>
  `;
  
  const container = document.createElement('div');
  container.innerHTML = instructionsHTML;
  document.body.appendChild(container);
}

// Show Firebase error
function showFirebaseError(errorMessage) {
  console.error('Firebase Error:', errorMessage);
  // You can add a user-friendly error display here
}

// Export for use in other files
if (typeof window !== 'undefined') {
  window.initializeFirebase = initializeFirebase;
  window.getFirebaseServices = function() {
    return { app, auth, db, storage, firebaseInitialized };
  };
}

console.log('🔧 Firebase initialization module loaded');