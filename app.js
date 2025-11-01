/*
============================================
FIREBASE CONFIGURATION
============================================
REPLACE WITH YOUR FIREBASE CONFIG VALUES

1. Go to Firebase Console > Project Settings
2. Scroll to "Your apps" section
3. Click the web app icon
4. Copy your config object
5. Paste it below
============================================
*/

// Firebase Configuration - REPLACE WITH YOUR VALUES
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

/*
============================================
FIRESTORE SECURITY RULES (Copy to Firebase Console)
============================================
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.authorId;
    }
    match /courses/{courseId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /contacts/{contactId} {
      allow create: if true;
      allow read, update, delete: if false;
    }
  }
}

STORAGE SECURITY RULES
============================================
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /posts/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
                  && request.resource.size < 5 * 1024 * 1024
                  && request.resource.contentType.matches('image/.*');
    }
  }
}
============================================
*/

// Initialize Firebase
let app, auth, db, storage;
let unsubscribeAuth = null;

try {
  // Import Firebase modules from CDN
  importScripts = null; // Prevent errors
  
  // Firebase will be initialized after DOM loads
  console.log('Firebase configuration ready');
} catch (error) {
  console.error('Firebase initialization will occur after page load');
}

// Application State
const state = {
  currentPage: 'home',
  currentUser: null,
  articles: [],
  userPosts: [],
  courses: [],
  searchQuery: '',
  filters: {
    state: 'all',
    courseCategory: 'all',
    archiveMonth: 'all',
    archiveYear: '2025',
    archiveCategory: 'all'
  },
  currentArchivePage: 1,
  archivePerPage: 10,
  editingPostId: null
};

// Sample Data
const sampleArticles = [
  {
    id: 1,
    title: "West Bengal Announces New Infrastructure Development Plan for Rural Areas",
    state: "West Bengal",
    category: "Politics",
    date: "2025-10-25",
    excerpt: "The state government unveiled a comprehensive plan to improve rural infrastructure, focusing on roads, electricity, and water supply across 500 villages.",
    tags: ["Infrastructure", "Rural Development", "West Bengal"]
  },
  {
    id: 2,
    title: "Bihar's Digital Literacy Campaign Reaches 2 Million Students",
    state: "Bihar",
    category: "Education",
    date: "2025-10-24",
    excerpt: "The state's ambitious digital literacy program has successfully trained over 2 million students in basic computer skills and internet safety.",
    tags: ["Education", "Digital Literacy", "Bihar"]
  },
  {
    id: 3,
    title: "Maharashtra Reports 15% Growth in IT Sector Employment",
    state: "Maharashtra",
    category: "Business",
    date: "2025-10-23",
    excerpt: "The IT sector in Maharashtra showed robust growth with 15% increase in employment, adding over 50,000 new jobs in the last quarter.",
    tags: ["IT Sector", "Employment", "Maharashtra"]
  },
  {
    id: 4,
    title: "Tamil Nadu Launches Electric Bus Fleet in Major Cities",
    state: "Tamil Nadu",
    category: "Technology",
    date: "2025-10-22",
    excerpt: "The state government introduced 500 electric buses across Chennai, Coimbatore, and Madurai to reduce carbon emissions and improve public transport.",
    tags: ["Electric Vehicles", "Transport", "Tamil Nadu"]
  },
  {
    id: 5,
    title: "Karnataka Farmers Adopt AI-Powered Crop Monitoring Systems",
    state: "Karnataka",
    category: "Technology",
    date: "2025-10-21",
    excerpt: "Progressive farmers in Karnataka are using AI-based monitoring systems to optimize crop yields and reduce water consumption.",
    tags: ["Agriculture", "AI", "Karnataka"]
  },
  {
    id: 6,
    title: "Uttar Pradesh Invests ₹5000 Crore in Healthcare Infrastructure",
    state: "Uttar Pradesh",
    category: "Health",
    date: "2025-10-20",
    excerpt: "The state government announced major investment in healthcare, focusing on establishing new hospitals and upgrading medical facilities across districts.",
    tags: ["Healthcare", "Investment", "Uttar Pradesh"]
  },
  {
    id: 7,
    title: "Kerala Sets New Record in Renewable Energy Production",
    state: "Kerala",
    category: "Technology",
    date: "2025-10-19",
    excerpt: "Kerala achieved 80% renewable energy target ahead of schedule, with solar and wind power plants contributing significantly to the state's energy mix.",
    tags: ["Renewable Energy", "Environment", "Kerala"]
  },
  {
    id: 8,
    title: "Delhi Metro Expands with 3 New Lines and 25 Stations",
    state: "Delhi",
    category: "Technology",
    date: "2025-10-18",
    excerpt: "The Delhi Metro Rail Corporation inaugurated three new metro lines, adding 25 stations to the network and improving connectivity across NCR.",
    tags: ["Metro", "Infrastructure", "Delhi"]
  },
  {
    id: 9,
    title: "Rajasthan Tourism Sees 40% Increase in International Visitors",
    state: "Rajasthan",
    category: "Business",
    date: "2025-10-17",
    excerpt: "The state's tourism sector witnessed remarkable growth with 40% increase in international tourists, boosting local economy and employment.",
    tags: ["Tourism", "Economy", "Rajasthan"]
  },
  {
    id: 10,
    title: "Gujarat's Smart City Project Wins National Award",
    state: "Gujarat",
    category: "Technology",
    date: "2025-10-16",
    excerpt: "Ahmedabad's smart city initiatives received national recognition for innovative urban planning, digital governance, and sustainable development.",
    tags: ["Smart City", "Urban Planning", "Gujarat"]
  },
  {
    id: 11,
    title: "West Bengal Police Launch Cybercrime Awareness Campaign",
    state: "West Bengal",
    category: "Crime",
    date: "2025-10-15",
    excerpt: "State police department initiated a statewide campaign to educate citizens about cybercrime prevention and online safety measures.",
    tags: ["Cybercrime", "Safety", "West Bengal"]
  },
  {
    id: 12,
    title: "Bihar's Industrial Corridor Attracts ₹10,000 Crore Investment",
    state: "Bihar",
    category: "Business",
    date: "2025-10-14",
    excerpt: "The newly established industrial corridor in Bihar has attracted significant investments from major corporations in manufacturing and logistics sectors.",
    tags: ["Industry", "Investment", "Bihar"]
  },
  {
    id: 13,
    title: "Maharashtra Launches State-Wide Free Wi-Fi Initiative",
    state: "Maharashtra",
    category: "Technology",
    date: "2025-10-13",
    excerpt: "The government announced plans to provide free Wi-Fi in all public spaces across major cities to promote digital connectivity.",
    tags: ["Wi-Fi", "Digital India", "Maharashtra"]
  },
  {
    id: 14,
    title: "Tamil Nadu's Startup Ecosystem Ranks Second in India",
    state: "Tamil Nadu",
    category: "Business",
    date: "2025-10-12",
    excerpt: "The state's supportive policies and infrastructure have positioned Tamil Nadu as the second-largest startup hub in the country.",
    tags: ["Startups", "Innovation", "Tamil Nadu"]
  },
  {
    id: 15,
    title: "Karnataka Announces Scholarship for 50,000 Students",
    state: "Karnataka",
    category: "Education",
    date: "2025-10-11",
    excerpt: "The state government launched a comprehensive scholarship program to support meritorious students from economically disadvantaged backgrounds.",
    tags: ["Scholarship", "Education", "Karnataka"]
  },
  {
    id: 16,
    title: "Uttar Pradesh Sports Academy Produces 20 National Champions",
    state: "Uttar Pradesh",
    category: "Sports",
    date: "2025-09-28",
    excerpt: "The state-run sports academy has produced 20 national-level champions across various sports disciplines this year.",
    tags: ["Sports", "Achievement", "Uttar Pradesh"]
  },
  {
    id: 17,
    title: "Kerala's Healthcare Model Wins International Recognition",
    state: "Kerala",
    category: "Health",
    date: "2025-09-15",
    excerpt: "The World Health Organization praised Kerala's primary healthcare system as a model for developing regions.",
    tags: ["Healthcare", "Recognition", "Kerala"]
  },
  {
    id: 18,
    title: "Delhi Air Quality Improves by 30% with New Green Policies",
    state: "Delhi",
    category: "Health",
    date: "2025-08-22",
    excerpt: "Stringent environmental policies and increased green cover have led to significant improvement in Delhi's air quality index.",
    tags: ["Environment", "Air Quality", "Delhi"]
  },
  {
    id: 19,
    title: "Rajasthan's Solar Energy Initiative Powers 1000 Villages",
    state: "Rajasthan",
    category: "Technology",
    date: "2025-07-10",
    excerpt: "The state's ambitious solar energy project has successfully electrified 1000 remote villages using renewable energy.",
    tags: ["Solar Energy", "Rural Electrification", "Rajasthan"]
  },
  {
    id: 20,
    title: "Gujarat Becomes India's Largest Electric Vehicle Manufacturing Hub",
    state: "Gujarat",
    category: "Business",
    date: "2025-06-18",
    excerpt: "With multiple EV manufacturing plants, Gujarat now accounts for 35% of India's electric vehicle production capacity.",
    tags: ["Electric Vehicles", "Manufacturing", "Gujarat"]
  }
];

const sampleCourses = [
  {
    id: 1,
    title: "Complete Python Programming for Beginners",
    category: "Technology",
    duration: "8 weeks",
    level: "Beginner"
  },
  {
    id: 2,
    title: "Digital Marketing Mastery",
    category: "Business",
    duration: "6 weeks",
    level: "Intermediate"
  },
  {
    id: 3,
    title: "Data Science Fundamentals",
    category: "Technology",
    duration: "10 weeks",
    level: "Intermediate"
  },
  {
    id: 4,
    title: "English Communication Skills",
    category: "Language",
    duration: "4 weeks",
    level: "Beginner"
  },
  {
    id: 5,
    title: "Financial Planning and Investment",
    category: "Business",
    duration: "5 weeks",
    level: "Beginner"
  },
  {
    id: 6,
    title: "Web Development with HTML/CSS/JavaScript",
    category: "Technology",
    duration: "12 weeks",
    level: "Beginner"
  },
  {
    id: 7,
    title: "Leadership and Management",
    category: "Professional Skills",
    duration: "6 weeks",
    level: "Advanced"
  },
  {
    id: 8,
    title: "Graphic Design Essentials",
    category: "Technology",
    duration: "8 weeks",
    level: "Beginner"
  },
  {
    id: 9,
    title: "Advanced Excel for Data Analysis",
    category: "Business",
    duration: "4 weeks",
    level: "Intermediate"
  },
  {
    id: 10,
    title: "Mobile App Development with React Native",
    category: "Technology",
    duration: "10 weeks",
    level: "Advanced"
  }
];

const states = [
  "West Bengal", "Bihar", "Maharashtra", "Uttar Pradesh", 
  "Tamil Nadu", "Karnataka", "Kerala", "Delhi", "Rajasthan", "Gujarat"
];

const milestones = [
  { year: 2020, event: "YourBrand Media founded with mission to democratize news and education" },
  { year: 2021, event: "Launched statewise news coverage across 10 Indian states" },
  { year: 2022, event: "Introduced Learning Hub with 50+ free courses" },
  { year: 2023, event: "Reached 1 million monthly readers" },
  { year: 2024, event: "Expanded to video content and live streaming" },
  { year: 2025, event: "Launched mobile app and AI-powered news recommendations" }
];

// Initialize Firebase
async function initFirebase() {
  try {
    // Load Firebase scripts dynamically
    await loadScript('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
    await loadScript('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js');
    await loadScript('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js');
    await loadScript('https://www.gstatic.com/firebasejs/10.7.1/firebase-storage-compat.js');
    
    // Initialize Firebase
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    storage = firebase.storage();
    
    console.log('Firebase initialized successfully');
    
    // Set up auth state listener
    unsubscribeAuth = auth.onAuthStateChanged(handleAuthStateChanged);
    
    // Load data
    await loadArticles();
    await loadCourses();
    
  } catch (error) {
    console.error('Firebase initialization error:', error);
    showToast('error', 'Setup Required', 'Please configure Firebase credentials in app.js');
    
    // Use sample data as fallback
    state.articles = sampleArticles;
    state.courses = sampleCourses;
  }
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Initialize app
async function init() {
  setupEventListeners();
  populateDropdowns();
  
  // Show loading state
  showToast('info', 'Loading', 'Initializing application...');
  
  // Initialize Firebase
  await initFirebase();
  
  // Render initial page
  renderHomePage();
  checkBackToTop();
}

// Event Listeners
function setupEventListeners() {
  // Navigation
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', handleNavigation);
  });
  
  document.querySelectorAll('[data-page]').forEach(link => {
    link.addEventListener('click', handleNavigation);
  });
  
  // Mobile menu
  document.getElementById('mobileMenuBtn').addEventListener('click', toggleMobileMenu);
  
  // Search
  document.getElementById('searchBtn').addEventListener('click', openSearchModal);
  document.getElementById('searchModalClose').addEventListener('click', closeSearchModal);
  document.getElementById('searchInput').addEventListener('input', handleSearch);
  
  // Auth buttons
  const signInBtn = document.getElementById('signInBtn');
  if (signInBtn) {
    signInBtn.addEventListener('click', () => navigateToPage('signin'));
  }
  
  const signOutBtn = document.getElementById('signOutBtn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Are you sure you want to sign out?')) {
        signOut();
      }
    });
  }
  
  // User profile dropdown
  const userProfileBtn = document.getElementById('userProfileBtn');
  const userDropdown = document.getElementById('userDropdown');
  if (userProfileBtn && userDropdown) {
    userProfileBtn.addEventListener('click', () => {
      userDropdown.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!userProfileBtn.contains(e.target) && !userDropdown.contains(e.target)) {
        userDropdown.classList.remove('active');
      }
    });
  }
  
  // Auth forms
  const signInForm = document.getElementById('signInForm');
  if (signInForm) {
    signInForm.addEventListener('submit', handleSignInForm);
  }
  
  const signUpForm = document.getElementById('signUpForm');
  if (signUpForm) {
    signUpForm.addEventListener('submit', handleSignUpForm);
  }
  
  // Create post form
  const createPostForm = document.getElementById('createPostForm');
  if (createPostForm) {
    createPostForm.addEventListener('submit', handleCreatePostForm);
    
    // Live preview
    document.getElementById('postTitle')?.addEventListener('input', updatePreview);
    document.getElementById('postContent')?.addEventListener('input', updatePreview);
    document.getElementById('postCategory')?.addEventListener('change', updatePreview);
    document.getElementById('postState')?.addEventListener('change', updatePreview);
    
    // Image upload
    const postImage = document.getElementById('postImage');
    if (postImage) {
      postImage.addEventListener('change', handleImageSelect);
    }
    
    const removeImage = document.getElementById('removeImage');
    if (removeImage) {
      removeImage.addEventListener('click', clearImagePreview);
    }
    
    // Save draft
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    if (saveDraftBtn) {
      saveDraftBtn.addEventListener('click', handleSaveDraft);
    }
  }
  
  // Filters
  document.getElementById('stateFilter').addEventListener('change', handleStateFilter);
  document.getElementById('courseFilter').addEventListener('change', handleCourseFilter);
  document.getElementById('courseSearch').addEventListener('input', handleCourseSearch);
  document.getElementById('applyArchiveFilters').addEventListener('click', applyArchiveFilters);
  
  // Forms
  document.getElementById('contactForm').addEventListener('submit', handleContactForm);
  
  const newsletterForms = document.querySelectorAll('.newsletter-form');
  newsletterForms.forEach(form => {
    form.addEventListener('submit', handleNewsletterForm);
  });
  
  // Back to top
  document.getElementById('backToTop').addEventListener('click', scrollToTop);
  window.addEventListener('scroll', checkBackToTop);
  
  // Close mobile menu on page click
  document.querySelector('.main').addEventListener('click', () => {
    document.getElementById('nav').classList.remove('active');
  });
}

// Navigation
function handleNavigation(e) {
  e.preventDefault();
  const page = e.target.getAttribute('data-page');
  
  if (page) {
    // Check if page requires authentication
    if ((page === 'create-post' || page === 'dashboard') && !state.currentUser) {
      showToast('error', 'Authentication Required', 'Please sign in to access this page');
      navigateToPage('signin');
      return;
    }
    
    navigateToPage(page);
    // Close mobile menu
    document.getElementById('nav').classList.remove('active');
    
    // Close user dropdown
    const userDropdown = document.getElementById('userDropdown');
    if (userDropdown) {
      userDropdown.classList.remove('active');
    }
  }
}

function navigateToPage(page) {
  state.currentPage = page;
  
  // Update active nav link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-page') === page) {
      link.classList.add('active');
    }
  });
  
  // Show active page
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
  });
  document.getElementById(`page-${page}`).classList.add('active');
  
  // Render page content
  switch(page) {
    case 'home':
      renderHomePage();
      break;
    case 'statewise':
      renderStatewisePage();
      break;
    case 'learning':
      renderLearningPage();
      break;
    case 'archive':
      renderArchivePage();
      break;
    case 'history':
      renderHistoryPage();
      break;
    case 'dashboard':
      if (state.currentUser) {
        loadUserPosts();
      }
      break;
    case 'create-post':
      resetCreatePostForm();
      break;
    case 'signin':
    case 'signup':
    case 'contact':
      // Static pages
      break;
  }
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMobileMenu() {
  document.getElementById('nav').classList.toggle('active');
}

// Search
function openSearchModal() {
  document.getElementById('searchModal').classList.add('active');
  document.getElementById('searchInput').focus();
}

function closeSearchModal() {
  document.getElementById('searchModal').classList.remove('active');
  document.getElementById('searchInput').value = '';
  document.getElementById('searchResults').innerHTML = '';
}

function handleSearch(e) {
  const query = e.target.value.toLowerCase().trim();
  
  if (query.length < 2) {
    document.getElementById('searchResults').innerHTML = '';
    return;
  }
  
  const results = [];
  
  // Search articles
  state.articles.forEach(article => {
    if (article.title.toLowerCase().includes(query) || 
        article.excerpt.toLowerCase().includes(query) ||
        article.category.toLowerCase().includes(query) ||
        article.state.toLowerCase().includes(query)) {
      results.push({ type: 'article', data: article });
    }
  });
  
  // Search courses
  state.courses.forEach(course => {
    if (course.title.toLowerCase().includes(query) || 
        course.category.toLowerCase().includes(query)) {
      results.push({ type: 'course', data: course });
    }
  });
  
  renderSearchResults(results);
}

function renderSearchResults(results) {
  const container = document.getElementById('searchResults');
  
  if (results.length === 0) {
    container.innerHTML = '<p style="padding: 16px; color: #6b7280;">No results found</p>';
    return;
  }
  
  container.innerHTML = results.map(result => {
    if (result.type === 'article') {
      return `
        <div class="search-result-item">
          <h4>${result.data.title}</h4>
          <p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">${result.data.state} • ${result.data.category}</p>
          <p style="font-size: 14px; color: #6b7280;">${result.data.excerpt.substring(0, 100)}...</p>
        </div>
      `;
    } else {
      return `
        <div class="search-result-item">
          <h4>📚 ${result.data.title}</h4>
          <p style="font-size: 14px; color: #6b7280;">${result.data.category} • ${result.data.duration} • ${result.data.level}</p>
        </div>
      `;
    }
  }).join('');
}

// Populate Dropdowns
function populateDropdowns() {
  const stateFilter = document.getElementById('stateFilter');
  states.forEach(state => {
    const option = document.createElement('option');
    option.value = state;
    option.textContent = state;
    stateFilter.appendChild(option);
  });
}

// Home Page
function renderHomePage() {
  renderLatestNews();
  renderStatewiseHighlights();
  renderTrendingList();
  renderRecentList();
}

function renderLatestNews() {
  const container = document.getElementById('latestNews');
  const latestArticles = state.articles.slice(0, 6);
  
  container.innerHTML = latestArticles.map(article => createNewsCard(article)).join('');
}

function renderStatewiseHighlights() {
  const container = document.getElementById('statewiseHighlights');
  const highlightStates = ['West Bengal', 'Bihar', 'Maharashtra', 'Tamil Nadu'];
  
  container.innerHTML = highlightStates.map(stateName => {
    const stateArticles = state.articles.filter(a => a.state === stateName).slice(0, 3);
    return `
      <div class="state-card">
        <h3>${stateName}</h3>
        ${stateArticles.map(article => `
          <div class="state-news-item">
            <h4>${article.title.substring(0, 80)}...</h4>
            <span>${formatDate(article.date)}</span>
          </div>
        `).join('')}
      </div>
    `;
  }).join('');
}

function renderTrendingList() {
  const container = document.getElementById('trendingList');
  const trending = state.articles.slice(0, 5);
  
  container.innerHTML = trending.map((article, index) => `
    <li>
      <a href="#" style="display: flex; gap: 8px;">
        <span style="color: #dc2626; font-weight: 600;">${index + 1}.</span>
        <span>${article.title}</span>
      </a>
    </li>
  `).join('');
}

function renderRecentList() {
  const container = document.getElementById('recentList');
  const recent = state.articles.slice(0, 5);
  
  container.innerHTML = recent.map(article => `
    <li>
      <a href="#">
        <div style="font-weight: 500; margin-bottom: 4px;">${article.title.substring(0, 60)}...</div>
        <div style="font-size: 12px; color: #6b7280;">${formatDate(article.date)}</div>
      </a>
    </li>
  `).join('');
}

// Statewise Page
function renderStatewisePage() {
  renderStatewiseNews();
  renderStateLinks();
}

function handleStateFilter(e) {
  state.filters.state = e.target.value;
  renderStatewiseNews();
}

function renderStatewiseNews() {
  const container = document.getElementById('statewiseNews');
  let filteredArticles = state.articles;
  
  if (state.filters.state !== 'all') {
    filteredArticles = state.articles.filter(a => a.state === state.filters.state);
  }
  
  if (filteredArticles.length === 0) {
    container.innerHTML = '<p style="text-align: center; padding: 32px; color: #6b7280;">No articles found for this state.</p>';
    return;
  }
  
  container.innerHTML = filteredArticles.map(article => createNewsCard(article)).join('');
}

function renderStateLinks() {
  const container = document.getElementById('stateLinks');
  container.innerHTML = states.map(state => `
    <li>
      <a href="#" data-state="${state}" class="state-link">${state}</a>
    </li>
  `).join('');
  
  // Add click handlers
  document.querySelectorAll('.state-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const stateName = e.target.getAttribute('data-state');
      document.getElementById('stateFilter').value = stateName;
      state.filters.state = stateName;
      renderStatewiseNews();
    });
  });
}

// Learning Page
function renderLearningPage() {
  renderCourses();
}

function handleCourseFilter(e) {
  state.filters.courseCategory = e.target.value;
  renderCourses();
}

function handleCourseSearch(e) {
  const query = e.target.value.toLowerCase();
  renderCourses(query);
}

function renderCourses(searchQuery = '') {
  const container = document.getElementById('coursesGrid');
  let filteredCourses = state.courses;
  
  // Apply category filter
  if (state.filters.courseCategory !== 'all') {
    filteredCourses = filteredCourses.filter(c => c.category === state.filters.courseCategory);
  }
  
  // Apply search
  if (searchQuery) {
    filteredCourses = filteredCourses.filter(c => 
      c.title.toLowerCase().includes(searchQuery) || 
      c.category.toLowerCase().includes(searchQuery)
    );
  }
  
  if (filteredCourses.length === 0) {
    container.innerHTML = '<p style="text-align: center; padding: 32px; color: #6b7280; grid-column: 1 / -1;">No courses found.</p>';
    return;
  }
  
  container.innerHTML = filteredCourses.map(course => `
    <div class="course-card">
      <div class="course-card-image"></div>
      <div class="course-card-content">
        <h3 class="course-card-title">${course.title}</h3>
        <div class="course-card-info">
          <span>⏱️ ${course.duration}</span>
          <span>📁 ${course.category}</span>
        </div>
        <div class="course-level">${course.level}</div>
        <button class="btn btn-primary" style="width: 100%; margin-top: 16px;">Enroll Now</button>
      </div>
    </div>
  `).join('');
}

// Archive Page
function applyArchiveFilters() {
  state.filters.archiveMonth = document.getElementById('archiveMonth').value;
  state.filters.archiveYear = document.getElementById('archiveYear').value;
  state.filters.archiveCategory = document.getElementById('archiveCategory').value;
  state.currentArchivePage = 1;
  renderArchivePage();
}

function renderArchivePage() {
  let filteredArticles = state.articles;
  
  // Apply filters
  if (state.filters.archiveCategory !== 'all') {
    filteredArticles = filteredArticles.filter(a => a.category === state.filters.archiveCategory);
  }
  
  if (state.filters.archiveMonth !== 'all') {
    filteredArticles = filteredArticles.filter(a => {
      const articleMonth = new Date(a.date).getMonth() + 1;
      return articleMonth.toString().padStart(2, '0') === state.filters.archiveMonth;
    });
  }
  
  filteredArticles = filteredArticles.filter(a => a.date.startsWith(state.filters.archiveYear));
  
  // Sort by date
  filteredArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Pagination
  const totalPages = Math.ceil(filteredArticles.length / state.archivePerPage);
  const startIndex = (state.currentArchivePage - 1) * state.archivePerPage;
  const paginatedArticles = filteredArticles.slice(startIndex, startIndex + state.archivePerPage);
  
  // Render articles
  const container = document.getElementById('archiveList');
  
  if (paginatedArticles.length === 0) {
    container.innerHTML = '<p style="text-align: center; padding: 32px; color: #6b7280;">No articles found for the selected filters.</p>';
    document.getElementById('archivePagination').innerHTML = '';
    return;
  }
  
  container.innerHTML = paginatedArticles.map(article => `
    <div class="archive-item">
      <div class="archive-item-header">
        <div>
          <h3 class="archive-item-title">${article.title}</h3>
          <div style="display: flex; gap: 16px; margin-top: 8px;">
            <span class="news-card-category">${article.category}</span>
            <span style="color: #6b7280; font-size: 14px;">📍 ${article.state}</span>
          </div>
        </div>
        <span class="archive-item-date">${formatDate(article.date)}</span>
      </div>
      <p class="archive-item-excerpt">${article.excerpt}</p>
    </div>
  `).join('');
  
  // Render pagination
  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const container = document.getElementById('archivePagination');
  
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }
  
  let pagination = '';
  
  // Previous button
  if (state.currentArchivePage > 1) {
    pagination += `<button onclick="changePage(${state.currentArchivePage - 1})">« Previous</button>`;
  }
  
  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === state.currentArchivePage) {
      pagination += `<button class="active">${i}</button>`;
    } else if (i === 1 || i === totalPages || (i >= state.currentArchivePage - 1 && i <= state.currentArchivePage + 1)) {
      pagination += `<button onclick="changePage(${i})">${i}</button>`;
    } else if (i === state.currentArchivePage - 2 || i === state.currentArchivePage + 2) {
      pagination += `<span style="padding: 8px;">...</span>`;
    }
  }
  
  // Next button
  if (state.currentArchivePage < totalPages) {
    pagination += `<button onclick="changePage(${state.currentArchivePage + 1})">Next »</button>`;
  }
  
  container.innerHTML = pagination;
}

function changePage(page) {
  state.currentArchivePage = page;
  renderArchivePage();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Make changePage available globally
window.changePage = changePage;

// History Page
function renderHistoryPage() {
  const container = document.getElementById('timeline');
  container.innerHTML = milestones.map(milestone => `
    <div class="timeline-item">
      <span class="timeline-year">${milestone.year}</span>
      <p class="timeline-event">${milestone.event}</p>
    </div>
  `).join('');
}

// Auth Form Handlers
async function handleSignInForm(e) {
  e.preventDefault();
  
  const email = document.getElementById('signInEmail').value;
  const password = document.getElementById('signInPassword').value;
  const errorDiv = document.getElementById('signInError');
  const submitBtn = document.getElementById('signInSubmit');
  
  // Validation
  if (!email || !password) {
    errorDiv.textContent = 'Please fill in all fields';
    errorDiv.style.display = 'block';
    return;
  }
  
  if (password.length < 6) {
    errorDiv.textContent = 'Password must be at least 6 characters';
    errorDiv.style.display = 'block';
    return;
  }
  
  // Show loading
  submitBtn.querySelector('.btn-text').style.display = 'none';
  submitBtn.querySelector('.btn-loader').style.display = 'inline';
  submitBtn.disabled = true;
  errorDiv.style.display = 'none';
  
  try {
    await signIn(email, password);
  } catch (error) {
    let errorMessage = 'Sign in failed. Please try again.';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    }
    
    errorDiv.textContent = errorMessage;
    errorDiv.style.display = 'block';
  } finally {
    submitBtn.querySelector('.btn-text').style.display = 'inline';
    submitBtn.querySelector('.btn-loader').style.display = 'none';
    submitBtn.disabled = false;
  }
}

async function handleSignUpForm(e) {
  e.preventDefault();
  
  const email = document.getElementById('signUpEmail').value;
  const password = document.getElementById('signUpPassword').value;
  const confirmPassword = document.getElementById('signUpPasswordConfirm').value;
  const errorDiv = document.getElementById('signUpError');
  const submitBtn = document.getElementById('signUpSubmit');
  
  // Validation
  if (!email || !password || !confirmPassword) {
    errorDiv.textContent = 'Please fill in all fields';
    errorDiv.style.display = 'block';
    return;
  }
  
  if (password.length < 6) {
    errorDiv.textContent = 'Password must be at least 6 characters';
    errorDiv.style.display = 'block';
    return;
  }
  
  if (password !== confirmPassword) {
    errorDiv.textContent = 'Passwords do not match';
    errorDiv.style.display = 'block';
    return;
  }
  
  // Show loading
  submitBtn.querySelector('.btn-text').style.display = 'none';
  submitBtn.querySelector('.btn-loader').style.display = 'inline';
  submitBtn.disabled = true;
  errorDiv.style.display = 'none';
  
  try {
    await signUp(email, password);
  } catch (error) {
    let errorMessage = 'Sign up failed. Please try again.';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'An account with this email already exists';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak';
    }
    
    errorDiv.textContent = errorMessage;
    errorDiv.style.display = 'block';
  } finally {
    submitBtn.querySelector('.btn-text').style.display = 'inline';
    submitBtn.querySelector('.btn-loader').style.display = 'none';
    submitBtn.disabled = false;
  }
}

// Create Post Functions
function resetCreatePostForm() {
  const form = document.getElementById('createPostForm');
  if (form) {
    form.reset();
    clearImagePreview();
    updatePreview();
  }
}

function updatePreview() {
  const title = document.getElementById('postTitle')?.value || 'Your title will appear here';
  const content = document.getElementById('postContent')?.value || 'Your content preview...';
  const category = document.getElementById('postCategory')?.value || 'Category';
  const state = document.getElementById('postState')?.value || 'State';
  
  document.getElementById('previewTitle').textContent = title;
  document.getElementById('previewExcerpt').textContent = content.substring(0, 150) + (content.length > 150 ? '...' : '');
  document.getElementById('previewCategory').textContent = category;
  document.getElementById('previewState').textContent = state;
  
  const today = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  document.getElementById('previewDate').textContent = today;
}

function handleImageSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  // Validate file
  if (!file.type.startsWith('image/')) {
    showToast('error', 'Invalid File', 'Please select an image file');
    e.target.value = '';
    return;
  }
  
  if (file.size > 5 * 1024 * 1024) {
    showToast('error', 'File Too Large', 'Image must be less than 5MB');
    e.target.value = '';
    return;
  }
  
  // Show preview
  const reader = new FileReader();
  reader.onload = (event) => {
    const preview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    previewImg.src = event.target.result;
    preview.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

function clearImagePreview() {
  const postImage = document.getElementById('postImage');
  const preview = document.getElementById('imagePreview');
  
  if (postImage) postImage.value = '';
  if (preview) preview.style.display = 'none';
}

async function handleCreatePostForm(e) {
  e.preventDefault();
  
  if (!state.currentUser) {
    showToast('error', 'Not Authorized', 'Please sign in to create posts');
    return;
  }
  
  const title = document.getElementById('postTitle').value;
  const content = document.getElementById('postContent').value;
  const category = document.getElementById('postCategory').value;
  const postState = document.getElementById('postState').value;
  const tags = document.getElementById('postTags').value.split(',').map(t => t.trim()).filter(t => t);
  const imageFile = document.getElementById('postImage').files[0];
  const errorDiv = document.getElementById('createPostError');
  const submitBtn = document.getElementById('publishPostBtn');
  
  // Validation
  if (title.length < 10) {
    errorDiv.textContent = 'Title must be at least 10 characters';
    errorDiv.style.display = 'block';
    return;
  }
  
  if (content.length < 100) {
    errorDiv.textContent = 'Content must be at least 100 characters';
    errorDiv.style.display = 'block';
    return;
  }
  
  if (!category || !postState) {
    errorDiv.textContent = 'Please select category and state';
    errorDiv.style.display = 'block';
    return;
  }
  
  // Show loading
  submitBtn.querySelector('.btn-text').style.display = 'none';
  submitBtn.querySelector('.btn-loader').style.display = 'inline';
  submitBtn.disabled = true;
  errorDiv.style.display = 'none';
  
  try {
    let imageUrl = '';
    
    // Upload image if selected
    if (imageFile) {
      const progressDiv = document.getElementById('uploadProgress');
      const progressFill = document.getElementById('progressFill');
      const progressText = document.getElementById('progressText');
      
      progressDiv.style.display = 'block';
      
      imageUrl = await uploadImage(imageFile, (progress) => {
        progressFill.style.width = progress + '%';
        progressText.textContent = Math.round(progress) + '%';
      });
      
      progressDiv.style.display = 'none';
    }
    
    // Create post
    const postData = {
      title,
      content,
      excerpt: content.substring(0, 150),
      category,
      state: postState,
      tags,
      imageUrl,
      status: 'published'
    };
    
    await createPost(postData);
    
    // Reset form and navigate
    e.target.reset();
    clearImagePreview();
    navigateToPage('dashboard');
    
  } catch (error) {
    errorDiv.textContent = 'Failed to create post. Please try again.';
    errorDiv.style.display = 'block';
  } finally {
    submitBtn.querySelector('.btn-text').style.display = 'inline';
    submitBtn.querySelector('.btn-loader').style.display = 'none';
    submitBtn.disabled = false;
  }
}

async function handleSaveDraft() {
  if (!state.currentUser) return;
  
  const title = document.getElementById('postTitle').value;
  const content = document.getElementById('postContent').value;
  const category = document.getElementById('postCategory').value;
  const postState = document.getElementById('postState').value;
  const tags = document.getElementById('postTags').value.split(',').map(t => t.trim()).filter(t => t);
  
  if (!title || !content) {
    showToast('error', 'Invalid Data', 'Title and content are required');
    return;
  }
  
  try {
    const postData = {
      title,
      content,
      excerpt: content.substring(0, 150),
      category: category || 'Uncategorized',
      state: postState || 'Other',
      tags,
      imageUrl: '',
      status: 'draft'
    };
    
    await createPost(postData);
    showToast('success', 'Draft Saved', 'Your post has been saved as draft');
    
  } catch (error) {
    showToast('error', 'Save Failed', 'Failed to save draft');
  }
}

// Dashboard Functions
function renderDashboard() {
  const totalPosts = state.userPosts.length;
  const publishedPosts = state.userPosts.filter(p => p.status === 'published').length;
  const draftPosts = state.userPosts.filter(p => p.status === 'draft').length;
  
  document.getElementById('totalPosts').textContent = totalPosts;
  document.getElementById('publishedPosts').textContent = publishedPosts;
  document.getElementById('draftPosts').textContent = draftPosts;
  
  const postsContainer = document.getElementById('userPostsList');
  const loadingMessage = document.getElementById('dashboardLoading');
  
  if (loadingMessage) {
    loadingMessage.style.display = 'none';
  }
  
  if (state.userPosts.length === 0) {
    postsContainer.innerHTML = '<p style="text-align: center; padding: 32px; color: #6b7280;">You haven\'t created any posts yet. <a href="#" data-page="create-post">Create your first post</a></p>';
    return;
  }
  
  postsContainer.innerHTML = state.userPosts.map(post => `
    <div class="post-item">
      <div class="post-item-header">
        <div>
          <h3 class="post-item-title">${post.title}</h3>
          <div class="post-item-meta">
            <span class="post-status ${post.status}">${post.status.toUpperCase()}</span>
            <span>${post.category}</span>
            <span>${post.state}</span>
            <span>${post.createdAt ? formatDate(post.createdAt.toDate().toISOString().split('T')[0]) : 'Today'}</span>
          </div>
        </div>
      </div>
      <p class="post-item-excerpt">${post.excerpt}</p>
      <div class="post-item-actions">
        <button class="btn btn-sm btn-secondary" onclick="editPost('${post.id}')">Edit</button>
        <button class="btn btn-sm" style="background: #dc2626; color: white;" onclick="confirmDeletePost('${post.id}')">Delete</button>
      </div>
    </div>
  `).join('');
  
  // Re-attach event listeners for data-page links
  postsContainer.querySelectorAll('[data-page]').forEach(link => {
    link.addEventListener('click', handleNavigation);
  });
}

window.editPost = function(postId) {
  // For simplicity, just navigate to create post page
  // In a full implementation, you'd load the post data into the form
  showToast('info', 'Edit Mode', 'Edit functionality - load post data in create form');
  navigateToPage('create-post');
};

window.confirmDeletePost = async function(postId) {
  if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
    try {
      await deletePost(postId);
    } catch (error) {
      showToast('error', 'Delete Failed', 'Failed to delete post');
    }
  }
};

// Forms
async function handleContactForm(e) {
  e.preventDefault();
  
  const name = document.getElementById('contactName').value;
  const email = document.getElementById('contactEmail').value;
  const phone = document.getElementById('contactPhone').value;
  const subject = document.getElementById('contactSubject').value;
  const message = document.getElementById('contactMessage').value;
  
  // Simple validation
  if (!name || !email || !subject || !message) {
    showToast('error', 'Invalid Data', 'Please fill in all required fields.');
    return;
  }
  
  try {
    if (db) {
      await saveContact({ name, email, phone, subject, message });
    } else {
      showToast('success', 'Message Sent', 'We will get back to you soon!');
    }
    
    // Show success message
    document.getElementById('formSuccess').style.display = 'block';
    e.target.reset();
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      document.getElementById('formSuccess').style.display = 'none';
    }, 5000);
  } catch (error) {
    showToast('error', 'Error', 'Failed to send message. Please try again.');
  }
}

function handleNewsletterForm(e) {
  e.preventDefault();
  
  const email = e.target.querySelector('input[type="email"]').value;
  
  if (!email) {
    alert('Please enter your email address.');
    return;
  }
  
  alert('Thank you for subscribing! You will receive our newsletter soon.');
  e.target.reset();
}

// Utility Functions
function createNewsCard(article) {
  return `
    <div class="news-card">
      <div class="news-card-image"></div>
      <div class="news-card-content">
        <span class="news-card-category">${article.category}</span>
        <h3 class="news-card-title">${article.title}</h3>
        <p class="news-card-excerpt">${article.excerpt.substring(0, 120)}...</p>
        <div class="news-card-meta">
          <span>📍 ${article.state}</span>
          <span>${formatDate(article.date)}</span>
        </div>
        <div class="news-card-tags">
          ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      </div>
    </div>
  `;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-IN', options);
}

function getAuthErrorMessage(error) {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/weak-password':
      return 'Password is too weak (min 6 characters)';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later';
    default:
      return error.message || 'Authentication failed';
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function checkBackToTop() {
  const backToTop = document.getElementById('backToTop');
  if (window.pageYOffset > 300) {
    backToTop.classList.add('show');
  } else {
    backToTop.classList.remove('show');
  }
}

// Firebase Authentication Functions
function handleAuthStateChanged(user) {
  state.currentUser = user;
  
  if (user) {
    console.log('User signed in:', user.email);
    showAuthenticatedUI(user);
    
    // Load user's posts if on dashboard
    if (state.currentPage === 'dashboard') {
      loadUserPosts();
    }
  } else {
    console.log('User signed out');
    showUnauthenticatedUI();
  }
}

function showAuthenticatedUI(user) {
  // Show authenticated elements
  document.querySelectorAll('.auth-required').forEach(el => {
    el.style.display = el.tagName === 'LI' ? 'list-item' : 'block';
  });
  
  // Hide sign-in button
  document.querySelectorAll('.auth-hidden').forEach(el => {
    el.style.display = 'none';
  });
  
  // Show user profile
  const userProfile = document.getElementById('userProfile');
  const userEmail = document.getElementById('userEmail');
  if (userProfile && userEmail) {
    userProfile.style.display = 'block';
    userEmail.textContent = user.email;
  }
}

function showUnauthenticatedUI() {
  // Hide authenticated elements
  document.querySelectorAll('.auth-required').forEach(el => {
    el.style.display = 'none';
  });
  
  // Show sign-in button
  document.querySelectorAll('.auth-hidden').forEach(el => {
    el.style.display = el.tagName === 'BUTTON' ? 'inline-block' : 'block';
  });
  
  // Hide user profile
  const userProfile = document.getElementById('userProfile');
  if (userProfile) {
    userProfile.style.display = 'none';
  }
}

async function signUp(email, password) {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    showToast('success', 'Success', 'Account created successfully!');
    navigateToPage('home');
    return userCredential.user;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
}

async function signIn(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    showToast('success', 'Welcome Back', `Signed in as ${email}`);
    navigateToPage('home');
    return userCredential.user;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

async function signOut() {
  try {
    await auth.signOut();
    showToast('success', 'Signed Out', 'You have been signed out successfully');
    navigateToPage('home');
  } catch (error) {
    console.error('Sign out error:', error);
    showToast('error', 'Error', 'Failed to sign out');
  }
}

// Firestore Functions
async function loadArticles() {
  try {
    // First, add sample articles if collection is empty (for demo)
    const snapshot = await db.collection('posts').limit(1).get();
    
    if (snapshot.empty) {
      console.log('No posts found, adding sample data...');
      await addSamplePosts();
    }
    
    // Load all posts
    const postsSnapshot = await db.collection('posts')
      .where('status', '==', 'published')
      .orderBy('createdAt', 'desc')
      .get();
    
    state.articles = postsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().createdAt?.toDate().toISOString().split('T')[0] || '2025-10-25'
    }));
    
    console.log(`Loaded ${state.articles.length} articles`);
    
    // Re-render current page
    if (state.currentPage === 'home') renderHomePage();
    if (state.currentPage === 'statewise') renderStatewisePage();
    if (state.currentPage === 'archive') renderArchivePage();
    
  } catch (error) {
    console.error('Error loading articles:', error);
    state.articles = sampleArticles; // Fallback
  }
}

async function addSamplePosts() {
  const batch = db.batch();
  
  sampleArticles.forEach(article => {
    const docRef = db.collection('posts').doc();
    batch.set(docRef, {
      title: article.title,
      content: article.excerpt + ' ' + article.excerpt,
      excerpt: article.excerpt,
      category: article.category,
      state: article.state,
      tags: article.tags,
      imageUrl: '',
      authorEmail: 'YourBrand Media',
      authorId: 'admin',
      createdAt: firebase.firestore.Timestamp.fromDate(new Date(article.date)),
      updatedAt: firebase.firestore.Timestamp.fromDate(new Date(article.date)),
      views: 0,
      status: 'published'
    });
  });
  
  await batch.commit();
  console.log('Sample posts added');
}

async function loadCourses() {
  try {
    // Add sample courses if empty
    const snapshot = await db.collection('courses').limit(1).get();
    
    if (snapshot.empty) {
      const batch = db.batch();
      sampleCourses.forEach(course => {
        const docRef = db.collection('courses').doc();
        batch.set(docRef, course);
      });
      await batch.commit();
    }
    
    // Load courses
    const coursesSnapshot = await db.collection('courses').get();
    state.courses = coursesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Loaded ${state.courses.length} courses`);
    
  } catch (error) {
    console.error('Error loading courses:', error);
    state.courses = sampleCourses; // Fallback
  }
}

async function createPost(postData) {
  try {
    const post = {
      ...postData,
      authorEmail: state.currentUser.email,
      authorId: state.currentUser.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      views: 0
    };
    
    const docRef = await db.collection('posts').add(post);
    console.log('Post created:', docRef.id);
    
    showToast('success', 'Published', 'Your post has been published successfully!');
    
    // Reload articles
    await loadArticles();
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

async function updatePost(postId, postData) {
  try {
    await db.collection('posts').doc(postId).update({
      ...postData,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    showToast('success', 'Updated', 'Post updated successfully');
    await loadUserPosts();
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
}

async function deletePost(postId) {
  try {
    await db.collection('posts').doc(postId).delete();
    showToast('success', 'Deleted', 'Post deleted successfully');
    await loadUserPosts();
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
}

async function loadUserPosts() {
  if (!state.currentUser) return;
  
  try {
    const snapshot = await db.collection('posts')
      .where('authorId', '==', state.currentUser.uid)
      .orderBy('createdAt', 'desc')
      .get();
    
    state.userPosts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    renderDashboard();
  } catch (error) {
    console.error('Error loading user posts:', error);
  }
}

// Firebase Storage Functions
async function uploadImage(file, onProgress) {
  try {
    const timestamp = Date.now();
    const fileName = `posts/${timestamp}_${file.name}`;
    const storageRef = storage.ref(fileName);
    
    const uploadTask = storageRef.put(file);
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
          resolve(downloadURL);
        }
      );
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

async function saveContact(contactData) {
  try {
    await db.collection('contacts').add({
      ...contactData,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    showToast('success', 'Message Sent', 'We will get back to you soon!');
  } catch (error) {
    console.error('Error saving contact:', error);
    throw error;
  }
}

// Toast Notification System
function showToast(type, title, message) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close">×</button>
  `;
  
  document.body.appendChild(toast);
  
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => {
    toast.remove();
  });
  
  setTimeout(() => {
    toast.remove();
  }, 5000);
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}