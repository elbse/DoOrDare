const { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  addDoc,
  serverTimestamp 
} = require('firebase/firestore');
const { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  onAuthStateChanged 
} = require('firebase/auth');
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { auth, db, storage } = require('../firebase-config');

// User Authentication Services
const authService = {
  // Sign up new user
  async signUp(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      
      // Create user profile in Firestore
      await this.createUserProfile(userCredential.user.uid, {
        name: displayName,
        email,
        joinDate: new Date().toISOString(),
        totalGoals: 0,
        completedGoals: 0,
        currentStreak: 0,
        status: 'online',
        initials: displayName
          .split(' ')
          .map(name => name.charAt(0).toUpperCase())
          .join('')
          .slice(0, 2)
      });
      
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },

  // Sign in user
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Ensure user profile exists in Firestore
      try {
        await this.createUserProfile(userCredential.user.uid, {
          name: userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'User',
          email: userCredential.user.email,
          joinDate: new Date().toISOString(),
          totalGoals: 0,
          completedGoals: 0,
          currentStreak: 0,
          status: 'online',
          initials: (userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'U')
            .split(' ')
            .map(name => name.charAt(0).toUpperCase())
            .join('')
            .slice(0, 2)
        });
      } catch (error) {
        // Profile might already exist, which is fine
        console.log('Profile creation skipped (likely already exists):', error.message);
      }
      
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },

  // Sign out user
  async signOut() {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  },

  // Listen to auth state changes
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }
};

// User Profile Services
const userService = {
  // Create user profile
  async createUserProfile(userId, userData) {
    try {
      await setDoc(doc(db, 'users', userId), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true }); // Use merge to avoid overwriting existing data
    } catch (error) {
      throw error;
    }
  },

  // Get user profile
  async getUserProfile(userId) {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error('User profile not found');
      }
    } catch (error) {
      throw error;
    }
  },

  // Update user profile
  async updateUserProfile(userId, updates) {
    try {
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      throw error;
    }
  },

  // Upload profile picture
  async uploadProfilePicture(userId, file) {
    try {
      const storageRef = ref(storage, `profile-pictures/${userId}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Update user profile with new picture URL
      await this.updateUserProfile(userId, { avatar: downloadURL });
      
      return downloadURL;
    } catch (error) {
      throw error;
    }
  }
};

// Goals Services
const goalService = {
  // Create new goal
  async createGoal(userId, goalData) {
    try {
      const goalRef = await addDoc(collection(db, 'goals'), {
        ...goalData,
        userId,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return goalRef.id;
    } catch (error) {
      throw error;
    }
  },

  // Get user goals
  async getUserGoals(userId) {
    try {
      const q = query(
        collection(db, 'goals'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const goals = [];
      
      querySnapshot.forEach((doc) => {
        goals.push({ id: doc.id, ...doc.data() });
      });
      
      return goals;
    } catch (error) {
      throw error;
    }
  },

  // Update goal status
  async updateGoalStatus(goalId, status, dare = null) {
    try {
      const docRef = doc(db, 'goals', goalId);
      const updates = {
        status,
        updatedAt: serverTimestamp()
      };
      
      if (dare) {
        updates.dare = dare;
      }
      
      if (status === 'completed') {
        updates.completedAt = serverTimestamp();
      } else if (status === 'failed') {
        updates.failedAt = serverTimestamp();
      }
      
      await updateDoc(docRef, updates);
    } catch (error) {
      throw error;
    }
  },

  // Delete goal
  async deleteGoal(goalId) {
    try {
      await deleteDoc(doc(db, 'goals', goalId));
    } catch (error) {
      throw error;
    }
  },

  // Listen to user goals in real-time
  onUserGoalsChange(userId, callback) {
    const q = query(
      collection(db, 'goals'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const goals = [];
      querySnapshot.forEach((doc) => {
        goals.push({ id: doc.id, ...doc.data() });
      });
      callback(goals);
    });
  }
};

// Groups and Accountability Partners Services
const groupService = {
  // Create group
  async createGroup(groupData) {
    try {
      const groupRef = await addDoc(collection(db, 'groups'), {
        ...groupData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return groupRef.id;
    } catch (error) {
      throw error;
    }
  },

  // Add member to group
  async addMemberToGroup(groupId, userId, role = 'member') {
    try {
      await addDoc(collection(db, 'groups', groupId, 'members'), {
        userId,
        role,
        joinedAt: serverTimestamp()
      });
    } catch (error) {
      throw error;
    }
  },

  // Get group members
  async getGroupMembers(groupId) {
    try {
      const querySnapshot = await getDocs(collection(db, 'groups', groupId, 'members'));
      const members = [];
      
      for (const doc of querySnapshot.docs) {
        const memberData = doc.data();
        const userProfile = await userService.getUserProfile(memberData.userId);
        members.push({
          id: doc.id,
          ...memberData,
          ...userProfile
        });
      }
      
      return members;
    } catch (error) {
      throw error;
    }
  },

  // Listen to group members in real-time
  onGroupMembersChange(groupId, callback) {
    return onSnapshot(collection(db, 'groups', groupId, 'members'), async (querySnapshot) => {
      const members = [];
      
      for (const doc of querySnapshot.docs) {
        const memberData = doc.data();
        try {
          const userProfile = await userService.getUserProfile(memberData.userId);
          members.push({
            id: doc.id,
            ...memberData,
            ...userProfile
          });
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
      
      callback(members);
    });
  }
};

// Dares Services
const dareService = {
  // Assign dare to user
  async assignDare(fromUserId, toUserId, dareText, category = 'general', difficulty = 'medium', groupId = null) {
    try {
      const dareRef = await addDoc(collection(db, 'dares'), {
        fromUserId,
        toUserId,
        dareText,
        category,
        difficulty,
        groupId,
        status: 'assigned',
        assignedAt: serverTimestamp(),
        completedAt: null,
        completed: false,
        proof: null,
        rating: null,
        notes: null
      });
      
      return dareRef.id;
    } catch (error) {
      throw error;
    }
  },

  // Complete dare
  async completeDare(dareId, proof = null, rating = null, notes = null) {
    try {
      const docRef = doc(db, 'dares', dareId);
      await updateDoc(docRef, {
        status: 'completed',
        completed: true,
        completedAt: serverTimestamp(),
        proof,
        rating,
        notes
      });
    } catch (error) {
      throw error;
    }
  },

  // Fail dare
  async failDare(dareId, notes = null) {
    try {
      const docRef = doc(db, 'dares', dareId);
      await updateDoc(docRef, {
        status: 'failed',
        completed: false,
        failedAt: serverTimestamp(),
        notes
      });
    } catch (error) {
      throw error;
    }
  },

  // Get user dares
  async getUserDares(userId, status = null) {
    try {
      let q = query(
        collection(db, 'dares'),
        where('toUserId', '==', userId),
        orderBy('assignedAt', 'desc')
      );
      
      if (status) {
        q = query(
          collection(db, 'dares'),
          where('toUserId', '==', userId),
          where('status', '==', status),
          orderBy('assignedAt', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      const dares = [];
      
      querySnapshot.forEach((doc) => {
        dares.push({ id: doc.id, ...doc.data() });
      });
      
      return dares;
    } catch (error) {
      throw error;
    }
  },

  // Get all user dares (for history)
  async getUserDareHistory(userId) {
    try {
      const q = query(
        collection(db, 'dares'),
        where('toUserId', '==', userId),
        orderBy('assignedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const dares = [];
      
      querySnapshot.forEach((doc) => {
        dares.push({ id: doc.id, ...doc.data() });
      });
      
      return dares;
    } catch (error) {
      throw error;
    }
  },

  // Get dares by category
  async getDaresByCategory(userId, category) {
    try {
      const q = query(
        collection(db, 'dares'),
        where('toUserId', '==', userId),
        where('category', '==', category),
        orderBy('assignedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const dares = [];
      
      querySnapshot.forEach((doc) => {
        dares.push({ id: doc.id, ...doc.data() });
      });
      
      return dares;
    } catch (error) {
      throw error;
    }
  },

  // Get dares by difficulty
  async getDaresByDifficulty(userId, difficulty) {
    try {
      const q = query(
        collection(db, 'dares'),
        where('toUserId', '==', userId),
        where('difficulty', '==', difficulty),
        orderBy('assignedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const dares = [];
      
      querySnapshot.forEach((doc) => {
        dares.push({ id: doc.id, ...doc.data() });
      });
      
      return dares;
    } catch (error) {
      throw error;
    }
  },

  // Update dare status
  async updateDareStatus(dareId, status, updates = {}) {
    try {
      const docRef = doc(db, 'dares', dareId);
      const updateData = {
        status,
        updatedAt: serverTimestamp(),
        ...updates
      };
      
      if (status === 'completed') {
        updateData.completedAt = serverTimestamp();
        updateData.completed = true;
      } else if (status === 'failed') {
        updateData.failedAt = serverTimestamp();
        updateData.completed = false;
      }
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      throw error;
    }
  },

  // Get dare statistics
  async getDareStats(userId) {
    try {
      const dares = await this.getUserDareHistory(userId);
      
      const totalDares = dares.length;
      const completedDares = dares.filter(dare => dare.status === 'completed').length;
      const failedDares = dares.filter(dare => dare.status === 'failed').length;
      const pendingDares = dares.filter(dare => dare.status === 'assigned').length;
      
      const categoryStats = {};
      const difficultyStats = {};
      
      dares.forEach(dare => {
        // Category stats
        if (!categoryStats[dare.category]) {
          categoryStats[dare.category] = { total: 0, completed: 0, failed: 0 };
        }
        categoryStats[dare.category].total++;
        if (dare.status === 'completed') categoryStats[dare.category].completed++;
        if (dare.status === 'failed') categoryStats[dare.category].failed++;
        
        // Difficulty stats
        if (!difficultyStats[dare.difficulty]) {
          difficultyStats[dare.difficulty] = { total: 0, completed: 0, failed: 0 };
        }
        difficultyStats[dare.difficulty].total++;
        if (dare.status === 'completed') difficultyStats[dare.difficulty].completed++;
        if (dare.status === 'failed') difficultyStats[dare.difficulty].failed++;
      });
      
      return {
        totalDares,
        completedDares,
        failedDares,
        pendingDares,
        completionRate: totalDares > 0 ? Math.round((completedDares / totalDares) * 100) : 0,
        categoryStats,
        difficultyStats
      };
    } catch (error) {
      throw error;
    }
  }
};

// Streak and Statistics Services
const statsService = {
  // Calculate and update user streak
  async updateUserStreak(userId) {
    try {
      const goals = await goalService.getUserGoals(userId);
      const today = new Date().toDateString();
      
      // Check if user completed all goals today
      const todaysGoals = goals.filter(goal => {
        const goalDate = new Date(goal.createdAt?.toDate()).toDateString();
        return goalDate === today && goal.status === 'completed';
      });
      
      const allTodaysGoals = goals.filter(goal => {
        const goalDate = new Date(goal.createdAt?.toDate()).toDateString();
        return goalDate === today;
      });
      
      if (todaysGoals.length > 0 && todaysGoals.length === allTodaysGoals.length) {
        // User completed all goals today, increment streak
        const userProfile = await userService.getUserProfile(userId);
        const newStreak = userProfile.currentStreak + 1;
        
        await userService.updateUserProfile(userId, {
          currentStreak: newStreak,
          completedGoals: userProfile.completedGoals + todaysGoals.length
        });
        
        return newStreak;
      }
      
      return null;
    } catch (error) {
      throw error;
    }
  },

  // Get user statistics
  async getUserStats(userId) {
    try {
      const goals = await goalService.getUserGoals(userId);
      const userProfile = await userService.getUserProfile(userId);
      
      const totalGoals = goals.length;
      const completedGoals = goals.filter(goal => goal.status === 'completed').length;
      const failedGoals = goals.filter(goal => goal.status === 'failed').length;
      const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
      
      return {
        totalGoals,
        completedGoals,
        failedGoals,
        completionRate,
        currentStreak: userProfile.currentStreak,
        joinDate: userProfile.joinDate
      };
    } catch (error) {
      throw error;
    }
  }
};

module.exports = {
  authService,
  userService,
  goalService,
  groupService,
  dareService,
  statsService
};