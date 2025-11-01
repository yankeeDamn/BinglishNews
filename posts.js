// ========================================
// POST MANAGEMENT FUNCTIONS
// ========================================
// Handles all post-related operations with Firestore
// ========================================

// Create a new post
async function createNewPost(postData) {
  const { db, auth } = window.getFirebaseServices();
  
  if (!db || !auth) {
    throw new Error('Firebase not initialized');
  }
  
  if (!auth.currentUser) {
    throw new Error('User not authenticated');
  }
  
  try {
    const post = {
      title: postData.title,
      content: postData.content,
      excerpt: postData.excerpt || postData.content.substring(0, 150),
      category: postData.category,
      state: postData.state,
      tags: postData.tags || [],
      imageUrl: postData.imageUrl || '',
      status: postData.status || 'published',
      authorEmail: auth.currentUser.email,
      authorId: auth.currentUser.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      views: 0
    };
    
    const docRef = await db.collection('posts').add(post);
    console.log('✅ Post created:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating post:', error);
    throw error;
  }
}

// Update existing post
async function updatePost(postId, postData) {
  const { db } = window.getFirebaseServices();
  
  if (!db) {
    throw new Error('Firebase not initialized');
  }
  
  try {
    await db.collection('posts').doc(postId).update({
      ...postData,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Post updated:', postId);
  } catch (error) {
    console.error('❌ Error updating post:', error);
    throw error;
  }
}

// Delete post
async function deletePost(postId) {
  const { db } = window.getFirebaseServices();
  
  if (!db) {
    throw new Error('Firebase not initialized');
  }
  
  try {
    await db.collection('posts').doc(postId).delete();
    console.log('✅ Post deleted:', postId);
  } catch (error) {
    console.error('❌ Error deleting post:', error);
    throw error;
  }
}

// Get all published posts
async function getAllPosts() {
  const { db } = window.getFirebaseServices();
  
  if (!db) {
    console.warn('Firebase not initialized, using sample data');
    return [];
  }
  
  try {
    const snapshot = await db.collection('posts')
      .where('status', '==', 'published')
      .orderBy('createdAt', 'desc')
      .get();
    
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().createdAt?.toDate().toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
    }));
    
    console.log(`✅ Loaded ${posts.length} posts`);
    return posts;
  } catch (error) {
    console.error('❌ Error loading posts:', error);
    return [];
  }
}

// Get posts by user
async function getUserPosts(userId) {
  const { db } = window.getFirebaseServices();
  
  if (!db) {
    throw new Error('Firebase not initialized');
  }
  
  try {
    const snapshot = await db.collection('posts')
      .where('authorId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`✅ Loaded ${posts.length} user posts`);
    return posts;
  } catch (error) {
    console.error('❌ Error loading user posts:', error);
    throw error;
  }
}

// Upload image to Firebase Storage
async function uploadPostImage(file, onProgress) {
  const { storage } = window.getFirebaseServices();
  
  if (!storage) {
    throw new Error('Firebase Storage not initialized');
  }
  
  // Validate file
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }
  
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size must be less than 5MB');
  }
  
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
          console.error('❌ Upload error:', error);
          reject(error);
        },
        async () => {
          const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
          console.log('✅ Image uploaded:', downloadURL);
          resolve(downloadURL);
        }
      );
    });
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    throw error;
  }
}

// Save contact form submission
async function saveContactMessage(contactData) {
  const { db } = window.getFirebaseServices();
  
  if (!db) {
    throw new Error('Firebase not initialized');
  }
  
  try {
    await db.collection('contacts').add({
      name: contactData.name,
      email: contactData.email,
      phone: contactData.phone || '',
      subject: contactData.subject,
      message: contactData.message,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      status: 'new'
    });
    
    console.log('✅ Contact message saved');
  } catch (error) {
    console.error('❌ Error saving contact message:', error);
    throw error;
  }
}

// Load courses from Firestore
async function getAllCourses() {
  const { db } = window.getFirebaseServices();
  
  if (!db) {
    console.warn('Firebase not initialized');
    return [];
  }
  
  try {
    const snapshot = await db.collection('courses').get();
    const courses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`✅ Loaded ${courses.length} courses`);
    return courses;
  } catch (error) {
    console.error('❌ Error loading courses:', error);
    return [];
  }
}

// Initialize sample data if collections are empty
async function initializeSampleData(samplePosts, sampleCourses) {
  const { db } = window.getFirebaseServices();
  
  if (!db) return;
  
  try {
    // Check if posts exist
    const postsSnapshot = await db.collection('posts').limit(1).get();
    
    if (postsSnapshot.empty && samplePosts && samplePosts.length > 0) {
      console.log('📝 Adding sample posts...');
      const batch = db.batch();
      
      samplePosts.forEach(article => {
        const docRef = db.collection('posts').doc();
        batch.set(docRef, {
          title: article.title,
          content: article.excerpt + ' ' + article.excerpt,
          excerpt: article.excerpt,
          category: article.category,
          state: article.state,
          tags: article.tags || [],
          imageUrl: '',
          authorEmail: 'admin@yourbrandmedia.in',
          authorId: 'admin',
          createdAt: firebase.firestore.Timestamp.fromDate(new Date(article.date)),
          updatedAt: firebase.firestore.Timestamp.fromDate(new Date(article.date)),
          views: 0,
          status: 'published'
        });
      });
      
      await batch.commit();
      console.log('✅ Sample posts added');
    }
    
    // Check if courses exist
    const coursesSnapshot = await db.collection('courses').limit(1).get();
    
    if (coursesSnapshot.empty && sampleCourses && sampleCourses.length > 0) {
      console.log('📚 Adding sample courses...');
      const batch = db.batch();
      
      sampleCourses.forEach(course => {
        const docRef = db.collection('courses').doc();
        batch.set(docRef, course);
      });
      
      await batch.commit();
      console.log('✅ Sample courses added');
    }
  } catch (error) {
    console.error('❌ Error initializing sample data:', error);
  }
}

// Export functions
if (typeof window !== 'undefined') {
  window.postsFunctions = {
    createNewPost,
    updatePost,
    deletePost,
    getAllPosts,
    getUserPosts,
    uploadPostImage,
    saveContactMessage,
    getAllCourses,
    initializeSampleData
  };
}

console.log('📝 Posts management module loaded');