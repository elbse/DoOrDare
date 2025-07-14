import { 
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
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  onAuthStateChanged 
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase-config';

// User Authentication Services
export const authService = {
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
        status: 'online'
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
export const userService = {
  // Create user profile
  async createUserProfile(userId, userData) {
    try {
      await setDoc(doc(db, 'users', userId), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
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
export const goalService = {
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
export const groupService = {
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
export const dareService = {
  // Assign dare to user
  async assignDare(fromUserId, toUserId, dareText, groupId = null) {
    try {
      const dareRef = await addDoc(collection(db, 'dares'), {
        fromUserId,
        toUserId,
        dareText,
        groupId,
        status: 'assigned',
        assignedAt: serverTimestamp(),
        completedAt: null
      });
      
      return dareRef.id;
    } catch (error) {
      throw error;
    }
  },

  // Complete dare
  async completeDare(dareId) {
    try {
      const docRef = doc(db, 'dares', dareId);
      await updateDoc(docRef, {
        status: 'completed',
        completedAt: serverTimestamp()
      });
    } catch (error) {
      throw error;
    }
  },

  // Get user dares
  async getUserDares(userId) {
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
  }
};

// Streak and Statistics Services
export const statsService = {
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