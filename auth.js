// ========================================
// AUTHENTICATION FUNCTIONS
// ========================================
// Handles all user authentication operations
// ========================================

let currentUser = null;
let authStateListener = null;

// Set up authentication state listener
function setupAuthListener(callback) {
  const { auth } = window.getFirebaseServices();
  
  if (!auth) {
    console.warn('Auth service not available');
    return;
  }
  
  authStateListener = auth.onAuthStateChanged((user) => {
    currentUser = user;
    if (callback) callback(user);
  });
}

// Sign up new user
async function signUpUser(email, password) {
  const { auth } = window.getFirebaseServices();
  
  if (!auth) {
    throw new Error('Firebase not initialized. Please configure firebase-config.js');
  }
  
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    console.log('✅ User signed up:', userCredential.user.email);
    return userCredential.user;
  } catch (error) {
    console.error('❌ Sign up error:', error);
    throw error;
  }
}

// Sign in existing user
async function signInUser(email, password) {
  const { auth } = window.getFirebaseServices();
  
  if (!auth) {
    throw new Error('Firebase not initialized. Please configure firebase-config.js');
  }
  
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    console.log('✅ User signed in:', userCredential.user.email);
    return userCredential.user;
  } catch (error) {
    console.error('❌ Sign in error:', error);
    throw error;
  }
}

// Sign out current user
async function signOutUser() {
  const { auth } = window.getFirebaseServices();
  
  if (!auth) {
    throw new Error('Firebase not initialized');
  }
  
  try {
    await auth.signOut();
    console.log('✅ User signed out');
  } catch (error) {
    console.error('❌ Sign out error:', error);
    throw error;
  }
}

// Get current user
function getCurrentUser() {
  return currentUser;
}

// Check if user is signed in
function isUserSignedIn() {
  return currentUser !== null;
}

// Get auth error message
function getAuthErrorMessage(error) {
  const errorMessages = {
    'auth/email-already-in-use': 'An account with this email already exists',
    'auth/invalid-email': 'Invalid email address',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/weak-password': 'Password is too weak (minimum 6 characters)',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later',
    'auth/network-request-failed': 'Network error. Please check your connection'
  };
  
  return errorMessages[error.code] || error.message || 'Authentication failed';
}

// Export functions
if (typeof window !== 'undefined') {
  window.authFunctions = {
    setupAuthListener,
    signUpUser,
    signInUser,
    signOutUser,
    getCurrentUser,
    isUserSignedIn,
    getAuthErrorMessage
  };
}

console.log('🔐 Authentication module loaded');