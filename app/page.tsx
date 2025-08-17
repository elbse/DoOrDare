"use client";

import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Checkbox } from "../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import {
  Users,
  Target,
  Settings,
  Plus,
  CheckCircle2,
  Zap,
  Trophy,
  Calendar,
  Home,
  TrendingUp,
  Bell,
  LogOut,
  Search,
  MoreHorizontal,
  XCircle,
} from "lucide-react";

// Firebase imports
const {
  authService,
  userService,
  goalService,
  groupService,
  dareService,
  statsService,
} = require("../services/firebase");
import AuthModal from "../components/AuthModal";
import { auth, db } from "../firebase-config.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

const dareOptions = [
  // Fitness Dares
  {
    text: "Do 20 jumping jacks while shouting a motivational phrase!",
    category: "fitness",
    difficulty: "easy",
  },
  {
    text: 'Do 10 push-ups and yell "I won\'t quit!" after each one.',
    category: "fitness",
    difficulty: "medium",
  },
  {
    text: "Do 5 burpees and clap over your head each time you jump.",
    category: "fitness",
    difficulty: "hard",
  },
  {
    text: "Do 20 sit-ups while naming 5 people who inspire you.",
    category: "fitness",
    difficulty: "easy",
  },
  {
    text: 'Do walking lunges across your room while chanting "I\'ve got this!"',
    category: "fitness",
    difficulty: "medium",
  },
  {
    text: "Hold a 30s plank while smiling the whole time",
    category: "fitness",
    difficulty: "medium",
  },
  {
    text: "10 mountain climbers while imagining you're on a volcano",
    category: "fitness",
    difficulty: "easy",
  },
  {
    text: "Do 15 jumping jacks while spelling your name out loud!",
    category: "fitness",
    difficulty: "easy",
  },
  {
    text: "Do 10 tricep dips with a clap at the end if you're a beast.",
    category: "fitness",
    difficulty: "hard",
  },
  {
    text: "Do 20 high knees like you're sprinting to save the world!",
    category: "fitness",
    difficulty: "medium",
  },
  {
    text: "Do 10 butt kicks while singing a line of any song.",
    category: "fitness",
    difficulty: "easy",
  },
  {
    text: "Do 15 arm circles and then strike a superhero pose!",
    category: "fitness",
    difficulty: "easy",
  },
  {
    text: "Run around your house/apartment like you're late for a flight.",
    category: "fitness",
    difficulty: "medium",
  },
  {
    text: "Do 10 wall sits while naming 10 countries.",
    category: "fitness",
    difficulty: "medium",
  },
  {
    text: "Do 10 star jumps while reciting the alphabet backwards.",
    category: "fitness",
    difficulty: "hard",
  },
  {
    text: "Balance on one foot for 1 minute while clapping.",
    category: "fitness",
    difficulty: "medium",
  },

  // Social Dares
  {
    text: "Tell a cringe dad joke to someone, then rate their reaction.",
    category: "social",
    difficulty: "easy",
  },
  {
    text: "Make a 15-second motivational speech like you're Tony Robbins.",
    category: "social",
    difficulty: "medium",
  },
  {
    text: "Say your goal out loud in front of a mirror. Loud and proud.",
    category: "social",
    difficulty: "easy",
  },
  {
    text: "Call a friend and tell them one thing you're grateful for today.",
    category: "social",
    difficulty: "easy",
  },
  {
    text: "Compliment 3 strangers today (safely and respectfully).",
    category: "social",
    difficulty: "medium",
  },
  {
    text: "Share your biggest fear with someone you trust.",
    category: "social",
    difficulty: "hard",
  },
  {
    text: "Ask someone for help with something you're struggling with.",
    category: "social",
    difficulty: "medium",
  },
  {
    text: "Give a genuine compliment to someone you don't know well.",
    category: "social",
    difficulty: "medium",
  },

  // Creative Dares
  {
    text: "Perform your favorite song as if you're on stage at a concert!",
    category: "creative",
    difficulty: "medium",
  },
  {
    text: "Dance like no one's watching — full power for 30 seconds!",
    category: "creative",
    difficulty: "easy",
  },
  {
    text: "Stretch like you're preparing for a dance battle.",
    category: "creative",
    difficulty: "easy",
  },
  {
    text: "Draw a self-portrait with your non-dominant hand.",
    category: "creative",
    difficulty: "medium",
  },
  {
    text: "Write a 4-line poem about your biggest goal.",
    category: "creative",
    difficulty: "medium",
  },
  {
    text: "Create a 30-second dance routine to your favorite song.",
    category: "creative",
    difficulty: "hard",
  },
  {
    text: "Take a photo from an unusual angle and share it.",
    category: "creative",
    difficulty: "easy",
  },
  {
    text: "Write a letter to your future self.",
    category: "creative",
    difficulty: "medium",
  },

  // Mental/Discipline Dares
  {
    text: 'Take a 1-minute cold shower and scream "I love discipline!"',
    category: "discipline",
    difficulty: "hard",
  },
  {
    text: "Meditate in complete silence... or in plank position (your choice).",
    category: "discipline",
    difficulty: "medium",
  },
  {
    text: "Read a book for 30 minutes instead of using your phone.",
    category: "discipline",
    difficulty: "medium",
  },
  {
    text: "Write down 10 things you're grateful for.",
    category: "discipline",
    difficulty: "easy",
  },
  {
    text: "Go 24 hours without complaining about anything.",
    category: "discipline",
    difficulty: "hard",
  },
  {
    text: "Wake up 30 minutes earlier than usual tomorrow.",
    category: "discipline",
    difficulty: "medium",
  },
  {
    text: "Practice a skill you're bad at for 20 minutes.",
    category: "discipline",
    difficulty: "medium",
  },
  {
    text: "Delete one social media app for 48 hours.",
    category: "discipline",
    difficulty: "hard",
  },
];

interface GroupMember {
  id: string;
  name: string;
  displayName: string;
  email: string;
  photoURL?: string;
  initials: string;
  status: string;
  goals: any[];
}

interface Dare {
  id: string;
  fromUserId: string;
  toUserId: string;
  dareText: string;
  category: string;
  difficulty: string;
  groupId?: string;
  status: string;
  assignedAt: Timestamp;
  completedAt?: Timestamp;
  completed: boolean;
  proof?: string;
  rating?: number;
  notes?: string;
  failedAt?: Timestamp;
}

interface DareStats {
  total: number;
  completed: number;
  failed: number;
  successRate: number;
}

export default function DoOrDareWebApp() {
  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  // App state
  const [activeTab, setActiveTab] = useState("dashboard");
  const [newGoal, setNewGoal] = useState("");
  const [assignTo, setAssignTo] = useState("self");
  const [selectedDare, setSelectedDare] = useState("");
  const [dareTarget, setDareTarget] = useState("");
  const [showDareModal, setShowDareModal] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Data state
  const [userProfile, setUserProfile] = useState<{
    displayName: string;
    email: string;
    photoURL: string;
    goals: any[];
    groups: any[];
    name?: string;
    initials?: string;
    age?: number;
  } | null>(null);
  const [userGoals, setUserGoals] = useState<any[]>([]);
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [userDares, setUserDares] = useState<Dare[]>([]);
  const [groupData, setGroupData] = useState<{
    name: string;
    members: GroupMember[];
  }>({
    name: "TheGoalGetters",
    members: [],
  });

  // Edit profile state
  const [editingProfile, setEditingProfile] = useState({
    name: "",
    email: "",
    age: 0,
  });

  // Enhanced dare system state
  const [dareCategory, setDareCategory] = useState("all");
  const [dareDifficulty, setDareDifficulty] = useState("all");
  const [dareHistory, setDareHistory] = useState<Dare[]>([]);
  const [dareStats, setDareStats] = useState<DareStats | null>(null);
  const [showDareHistoryModal, setShowDareHistoryModal] = useState(false);
  const [showDareCompletionModal, setShowDareCompletionModal] = useState(false);
  const [selectedDareForCompletion, setSelectedDareForCompletion] =
    useState<Dare | null>(null);
  const [dareCompletionProof, setDareCompletionProof] = useState("");
  const [dareCompletionRating, setDareCompletionRating] = useState(3);
  const [dareCompletionNotes, setDareCompletionNotes] = useState("");

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(
      async (authUser: User | null) => {
        setUser(authUser);
        setLoading(false);

        if (authUser) {
          // Load user profile and data
          await loadUserData(authUser);
        } else {
          // Clear data when user signs out
          setUserProfile(null);
          setUserGoals([]);
          setGroupMembers([]);
          setUserDares([]);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // Update profile with user data when user state changes
  useEffect(() => {
    if (user && userProfile) {
      // Update profile with user data if profile is missing information
      const updatedProfile = {
        ...userProfile,
        name:
          userProfile.name ||
          user.displayName ||
          user.email?.split("@")[0] ||
          "User",
        email: userProfile.email || user.email || "",
        initials:
          userProfile.initials ||
          (user.displayName || user.email?.split("@")[0] || "U")
            .split(" ")
            .map((name: string) => name.charAt(0).toUpperCase())
            .join("")
            .slice(0, 2),
      };

      if (
        updatedProfile.name !== userProfile.name ||
        updatedProfile.email !== userProfile.email ||
        updatedProfile.initials !== userProfile.initials
      ) {
        console.log("Updating profile with user data:", updatedProfile);
        setUserProfile(updatedProfile);
        setEditingProfile({
          name: updatedProfile.name || "",
          email: updatedProfile.email || "",
          age: updatedProfile.age || 0,
        });
      }
    }
  }, [user, userProfile]);

  // Load user data when authenticated
  const loadUserData = async (authUser: User) => {
    try {
      const userDoc = await getDoc(doc(db, "users", authUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfile({
          displayName: userData.displayName || "",
          email: userData.email || "",
          photoURL: userData.photoURL || "",
          goals: userData.goals || [],
          groups: userData.groups || [],
        });
      }

      // Load user's goals
      const userGoals = await goalService.getUserGoals(authUser.uid);
      setUserGoals(userGoals);

      // Load user's groups (placeholder for now)
      setUserGroups([]);

      // Load user's dares
      const userDares = await dareService.getUserDares(authUser.uid);
      setUserDares(userDares);

      // Load dare history and stats
      const history = await dareService.getUserDareHistory(authUser.uid);
      setDareHistory(history);

      const stats = await dareService.getDareStats(authUser.uid);
      setDareStats(stats);

      // Create sample data if none exists
      if (userGoals.length === 0) {
        await createSampleGoals(authUser.uid);
        const updatedGoals = await goalService.getUserGoals(authUser.uid);
        setUserGoals(updatedGoals);
      }

      if (userDares.length === 0) {
        await createSampleDares(authUser.uid);
        // Reload dares after creating samples
        const updatedDares = await dareService.getUserDares(authUser.uid);
        setUserDares(updatedDares);
        const updatedHistory = await dareService.getUserDareHistory(
          authUser.uid
        );
        setDareHistory(updatedHistory);
        const updatedStats = await dareService.getDareStats(authUser.uid);
        setDareStats(updatedStats);
      }

      // Initialize sample group data
      setGroupData({
        name: "TheGoalGetters",
        members: [
          {
            id: authUser.uid,
            name:
              authUser.displayName || authUser.email?.split("@")[0] || "You",
            displayName:
              authUser.displayName || authUser.email?.split("@")[0] || "You",
            email: authUser.email || "",
            photoURL: "",
            initials: (
              authUser.displayName ||
              authUser.email?.split("@")[0] ||
              "U"
            )
              .split(" ")
              .map((name: string) => name.charAt(0).toUpperCase())
              .join("")
              .slice(0, 2),
            status: "online",
            goals: userGoals,
          },
        ],
      });
      setGroupMembers([
        {
          id: authUser.uid,
          name: authUser.displayName || authUser.email?.split("@")[0] || "You",
          displayName:
            authUser.displayName || authUser.email?.split("@")[0] || "You",
          email: authUser.email || "",
          photoURL: "",
          initials: (
            authUser.displayName ||
            authUser.email?.split("@")[0] ||
            "U"
          )
            .split(" ")
            .map((name: string) => name.charAt(0).toUpperCase())
            .join("")
            .slice(0, 2),
          status: "online",
          goals: userGoals,
        },
      ]);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  // Create sample goals for testing
  const createSampleGoals = async (userId: string) => {
    try {
      const sampleGoals = [
        {
          text: "Complete morning workout routine",
          category: "Fitness",
          dueDate: new Date().toDateString(),
          assignedTo: userId,
          completed: false,
          status: "pending",
        },
        {
          text: "Read 30 minutes of a book",
          category: "Learning",
          dueDate: new Date().toDateString(),
          assignedTo: userId,
          completed: false,
          status: "pending",
        },
        {
          text: "Call a friend or family member",
          category: "Social",
          dueDate: new Date().toDateString(),
          assignedTo: userId,
          completed: false,
          status: "pending",
        },
      ];

      for (const goal of sampleGoals) {
        await goalService.createGoal(userId, goal);
      }
    } catch (error) {
      console.error("Error creating sample goals:", error);
    }
  };

  // Create sample dares for testing
  const createSampleDares = async (userId: string) => {
    try {
      // Create some sample dares for testing
      const sampleDares = [
        {
          text: "Do 20 jumping jacks while shouting a motivational phrase!",
          category: "fitness",
          difficulty: "easy",
        },
        {
          text: "Call a friend and tell them a joke",
          category: "social",
          difficulty: "medium",
        },
        {
          text: "Draw a picture of your dream house",
          category: "creative",
          difficulty: "easy",
        },
      ];

      for (const dare of sampleDares) {
        await dareService.assignDare(
          userId,
          userId,
          dare.text,
          dare.category,
          dare.difficulty
        );
      }
    } catch (error) {
      console.error("Error creating sample dares:", error);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await authService.signOut();
      setActiveTab("dashboard");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Handle add goal
  const handleAddGoal = async () => {
    if (newGoal.trim() && user) {
      try {
        const goalData = {
          text: newGoal,
          category: "Personal",
          dueDate: new Date().toDateString(),
          assignedTo: assignTo === "self" ? user.uid : assignTo,
          completed: false,
          status: "pending",
        };

        await goalService.createGoal(user.uid, goalData);

        // Refresh user goals
        const updatedGoals = await goalService.getUserGoals(user.uid);
        setUserGoals(updatedGoals);

        // Reset form and go back to dashboard
        setNewGoal("");
        setAssignTo("self");
        setActiveTab("dashboard");

        // Show success message
        alert("Goal added successfully!");
      } catch (error) {
        console.error("Error adding goal:", error);
        alert("Error adding goal. Please try again.");
      }
    } else {
      alert("Please enter a goal description.");
    }
  };

  // Handle goal status update
  const handleGoalStatusUpdate = async (goalId: string, completed: boolean) => {
    try {
      const status = completed ? "completed" : "pending";
      await goalService.updateGoalStatus(goalId, status);

      // Update streak if goal completed
      if (completed && user) {
        await statsService.updateUserStreak(user.uid);
      }

      // Refresh user goals
      if (user) {
        const updatedGoals = await goalService.getUserGoals(user.uid);
        setUserGoals(updatedGoals);
      }
    } catch (error) {
      console.error("Error updating the goal status:", error);
      alert("Error updating goal status. Please try again.");
    }
  };

  // Handle assign dare
  const handleAssignDare = async () => {
    if (selectedDare && dareTarget && user) {
      try {
        const targetMember = groupMembers.find(
          (member: GroupMember) => member.name === dareTarget
        );
        if (targetMember) {
          const selectedDareObj = dareOptions.find(
            (dare) => dare.text === selectedDare
          );
          const category = selectedDareObj?.category || "general";
          const difficulty = selectedDareObj?.difficulty || "medium";

          await dareService.assignDare(
            user.uid,
            targetMember.id,
            selectedDare,
            category,
            difficulty
          );

          // Refresh dare data
          const updatedDares = await dareService.getUserDares(user.uid);
          setUserDares(updatedDares);
          const updatedHistory = await dareService.getUserDareHistory(user.uid);
          setDareHistory(updatedHistory);
          const updatedStats = await dareService.getDareStats(user.uid);
          setDareStats(updatedStats);

          setShowDareModal(false);
          setSelectedDare("");
          setDareTarget("");
        }
      } catch (error) {
        console.error("Error assigning dare:", error);
      }
    }
  };

  // Handle profile update
  const handleProfileUpdate = async () => {
    if (user) {
      try {
        await userService.updateUserProfile(user.uid, editingProfile);
        setUserProfile((prev) => ({ ...prev, ...editingProfile }));
        setShowUserProfileModal(false);
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }
  };

  // Handle dare completion
  const handleDareCompletion = async () => {
    if (selectedDareForCompletion && user) {
      try {
        await dareService.completeDare(
          selectedDareForCompletion.id,
          dareCompletionProof,
          dareCompletionRating,
          dareCompletionNotes
        );

        setShowDareCompletionModal(false);
        setSelectedDareForCompletion(null);
        setDareCompletionProof("");
        setDareCompletionRating(3);
        setDareCompletionNotes("");

        // Refresh dare data
        const dares = await dareService.getUserDares(user.uid);
        setUserDares(dares);
        const dareHistory = await dareService.getUserDareHistory(user.uid);
        setDareHistory(dareHistory);
        const stats = await dareService.getDareStats(user.uid);
        setDareStats(stats);
      } catch (error) {
        console.error("Error completing dare:", error);
      }
    }
  };

  // Handle dare failure
  const handleDareFailure = async (dareId: string, notes: string = "") => {
    if (user) {
      try {
        await dareService.failDare(dareId, notes);

        // Refresh dare data
        const dares = await dareService.getUserDares(user.uid);
        setUserDares(dares);
        const dareHistory = await dareService.getUserDareHistory(user.uid);
        setDareHistory(dareHistory);
        const stats = await dareService.getDareStats(user.uid);
        setDareStats(stats);
      } catch (error) {
        console.error("Error failing dare:", error);
      }
    }
  };

  // Filter dares by category and difficulty
  const getFilteredDares = () => {
    let filtered = dareHistory;

    if (dareCategory !== "all") {
      filtered = filtered.filter((dare) => dare.category === dareCategory);
    }

    if (dareDifficulty !== "all") {
      filtered = filtered.filter((dare) => dare.difficulty === dareDifficulty);
    }

    return filtered;
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "fitness":
        return "bg-blue-100 text-blue-800";
      case "social":
        return "bg-purple-100 text-purple-800";
      case "creative":
        return "bg-pink-100 text-pink-800";
      case "learning":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCompletionRate = (member) => {
    const completed =
      member.goals?.filter((goal) => goal.status === "completed").length || 0;
    const total = member.goals?.length || 0;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      default:
        return "bg-gray-400";
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show authentication modal if not logged in
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              DoOrDare
            </h1>
            <p className="text-gray-600">Stay accountable together 💪</p>
          </div>
          <Button
            onClick={() => setShowAuthModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Get Started
          </Button>
        </div>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={() => setShowAuthModal(false)}
        />
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {groupData.name}
          </h1>
          <p className="text-gray-600 mt-1">Stay accountable together 💪</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search goals or members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button
            onClick={() => setActiveTab("add-goal")}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">
                  Total Members
                </p>
                <p className="text-3xl font-bold text-blue-700">
                  {groupData.members.length}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">
                  Avg. Completion
                </p>
                <p className="text-3xl font-bold text-green-700">
                  {Math.round(
                    groupData.members.reduce(
                      (acc, member) => acc + getCompletionRate(member),
                      0
                    ) / groupData.members.length
                  )}
                  %
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">
                  Total Goals
                </p>
                <p className="text-3xl font-bold text-purple-700">
                  {groupData.members.reduce(
                    (acc, member) => acc + member.goals.length,
                    0
                  )}
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">
                  Active Dares
                </p>
                <p className="text-3xl font-bold text-orange-700">
                  {
                    userDares.filter((dare) => dare.status === "assigned")
                      .length
                  }
                </p>
              </div>
              <Zap className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {groupData.members.map((member) => (
          <Card
            key={member.id}
            className="shadow-lg border-0 overflow-hidden hover:shadow-xl transition-shadow"
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar className="h-14 w-14 ring-2 ring-purple-100">
                      <AvatarImage src={member.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-lg">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(
                        member.status
                      )}`}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {member.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {getCompletionRate(member)}% complete
                      </Badge>
                      {getCompletionRate(member) === 100 && (
                        <Trophy className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className="text-xs text-gray-500 capitalize">
                        {member.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getCompletionRate(member) < 100 && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-orange-600 border-orange-200 hover:bg-orange-50 bg-transparent"
                      onClick={() => {
                        setDareTarget(member.name);
                        setShowDareModal(true);
                      }}
                    >
                      <Zap className="h-4 w-4 mr-1" />
                      Dare
                    </Button>
                  )}
                  <Button size="sm" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {member.goals.map((goal) => (
                  <div
                    key={goal.id}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <Checkbox
                      checked={goal.completed}
                      onCheckedChange={(checked) =>
                        handleGoalStatusUpdate(goal.id, checked === true)
                      }
                      className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${
                          goal.completed
                            ? "line-through text-gray-500"
                            : "text-gray-900"
                        }`}
                      >
                        {goal.text}
                      </p>
                      <div className="flex items-center space-x-3 mt-1">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {goal.dueDate}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {goal.category}
                        </Badge>
                      </div>
                    </div>
                    {goal.completed && (
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderMyGoals = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Goals</h1>
          <p className="text-gray-600 mt-1">Track your personal progress</p>
        </div>
        <Button
          onClick={() => setActiveTab("add-goal")}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-600" />
              <span>Today's Goals</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {groupData.members[0]?.goals?.map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center space-x-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <Checkbox
                    checked={goal.completed}
                    onCheckedChange={(checked) =>
                      handleGoalStatusUpdate(goal.id, checked === true)
                    }
                    className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                  />
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        goal.completed
                          ? "line-through text-gray-500"
                          : "text-gray-900"
                      }`}
                    >
                      {goal.text}
                    </p>
                    <div className="flex items-center space-x-3 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {goal.category}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {goal.dueDate}
                      </span>
                    </div>
                  </div>
                  {goal.completed && (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Progress Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">67%</div>
                <p className="text-sm text-gray-600">Completion Rate</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Completed</span>
                  <span className="font-medium">2/3</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: "67%" }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAddGoal = () => (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Add New Goal</h1>
        <p className="text-gray-600 mt-1">Set a goal and stay accountable</p>
      </div>

      <Card className="shadow-lg border-0">
        <CardContent className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Goal Description
            </label>
            <Textarea
              placeholder="What do you want to accomplish?"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              className="resize-none min-h-[100px]"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Assign To
              </label>
              <Select value={assignTo} onValueChange={setAssignTo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="self">Myself</SelectItem>
                  {groupData.members.map((member) => (
                    <SelectItem key={member.id} value={member.name}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Category
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fitness">Fitness</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="hobbies">Hobbies</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={() => setActiveTab("dashboard")}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddGoal}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={!newGoal.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDares = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dares</h1>
          <p className="text-gray-600 mt-1">
            Fun consequences for missed goals
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowDareHistoryModal(true)}
            variant="outline"
            className="border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Dare History
          </Button>
          <Button
            onClick={() => setActiveTab("add-goal")}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
        </div>
      </div>

      {/* Dare Statistics */}
      {dareStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">
                    Total Dares
                  </p>
                  <p className="text-3xl font-bold text-blue-700">
                    {dareStats.total}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">
                    Completed
                  </p>
                  <p className="text-3xl font-bold text-green-700">
                    {dareStats.completed}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-50 to-red-100 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">Failed</p>
                  <p className="text-3xl font-bold text-red-700">
                    {dareStats.failed}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">
                    Success Rate
                  </p>
                  <p className="text-3xl font-bold text-purple-700">
                    {dareStats.successRate}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Dares */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-orange-500" />
              <span>Active Dares</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userDares.filter((dare) => dare.status === "assigned").length >
            0 ? (
              <div className="space-y-4">
                {userDares
                  .filter((dare) => dare.status === "assigned")
                  .map((dare) => (
                    <div
                      key={dare.id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-2">
                            {dare.dareText}
                          </p>
                          <div className="flex items-center space-x-3 mb-3">
                            <Badge className={getCategoryColor(dare.category)}>
                              {dare.category}
                            </Badge>
                            <Badge
                              className={getDifficultyColor(dare.difficulty)}
                            >
                              {dare.difficulty}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {dare.assignedAt?.toDate?.()
                                ? new Date(
                                    dare.assignedAt.toDate()
                                  ).toLocaleDateString()
                                : "Recently"}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedDareForCompletion(dare);
                              setShowDareCompletionModal(true);
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDareFailure(dare.id)}
                            className="border-red-200 text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Fail
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Zap className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                  No Active Dares
                </h3>
                <p className="text-gray-600">
                  Complete your goals to avoid dares!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dare Categories & Difficulty */}
        <div className="space-y-6">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Dare Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dareStats?.categoryStats &&
                  Object.entries(dareStats.categoryStats).map(
                    ([category, stats]) => (
                      <div
                        key={category}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <Badge className={getCategoryColor(category)}>
                            {category}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {stats.total}
                          </div>
                          <div className="text-xs text-gray-500">
                            {stats.completed}/{stats.total} completed
                          </div>
                        </div>
                      </div>
                    )
                  )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Difficulty Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dareStats?.difficultyStats &&
                  Object.entries(dareStats.difficultyStats).map(
                    ([difficulty, stats]) => (
                      <div
                        key={difficulty}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <Badge className={getDifficultyColor(difficulty)}>
                            {difficulty}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {stats.total}
                          </div>
                          <div className="text-xs text-gray-500">
                            {stats.completed}/{stats.total} completed
                          </div>
                        </div>
                      </div>
                    )
                  )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Customize your experience</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <span className="text-gray-900 font-medium">
                  Push Notifications
                </span>
                <p className="text-sm text-gray-600">
                  Receive notifications for goal reminders
                </p>
              </div>
              <Checkbox />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <span className="text-gray-900 font-medium">
                  Daily Reminders
                </span>
                <p className="text-sm text-gray-600">
                  Get reminded about your daily goals
                </p>
              </div>
              <Checkbox />
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <span className="text-gray-900 font-medium">Group Updates</span>
                <p className="text-sm text-gray-600">
                  Stay updated on group activities
                </p>
              </div>
              <Checkbox />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <span className="text-gray-900 font-medium">
                  Share Progress
                </span>
                <p className="text-sm text-gray-600">
                  Allow others to see your progress
                </p>
              </div>
              <Checkbox />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <span className="text-gray-900 font-medium">
                  Public Profile
                </span>
                <p className="text-sm text-gray-600">
                  Make your profile visible to others
                </p>
              </div>
              <Checkbox />
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <span className="text-gray-900 font-medium">
                  Activity Status
                </span>
                <p className="text-sm text-gray-600">Show when you're online</p>
              </div>
              <Checkbox />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "my-goals":
        return renderMyGoals();
      case "add-goal":
        return renderAddGoal();
      case "dares":
        return renderDares();
      case "dare-history":
        return renderDareHistory();
      case "settings":
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  const renderDareHistory = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dare History</h1>
          <p className="text-gray-600 mt-1">
            View your past dares and completions
          </p>
        </div>
        <Button
          onClick={() => setActiveTab("dares")}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Dare
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center space-x-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Category
              </label>
              <Select value={dareCategory} onValueChange={setDareCategory}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="fitness">Fitness</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="discipline">Discipline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Difficulty
              </label>
              <Select value={dareDifficulty} onValueChange={setDareDifficulty}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Status
              </label>
              <Select>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-gray-500">
              {getFilteredDares().length} of {dareHistory.length} dares
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dare History List */}
      <div className="space-y-4">
        {getFilteredDares().length > 0 ? (
          getFilteredDares().map((dare) => (
            <div
              key={dare.id}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-2">
                    {dare.dareText}
                  </p>
                  <div className="flex items-center space-x-3 mb-3">
                    <Badge className={getCategoryColor(dare.category)}>
                      {dare.category}
                    </Badge>
                    <Badge className={getDifficultyColor(dare.difficulty)}>
                      {dare.difficulty}
                    </Badge>
                    <Badge
                      variant={
                        dare.status === "completed" ? "default" : "secondary"
                      }
                      className={
                        dare.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : dare.status === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {dare.status}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {dare.assignedAt?.toDate?.()
                        ? new Date(
                            dare.assignedAt.toDate()
                          ).toLocaleDateString()
                        : "Recently"}
                    </span>
                  </div>

                  {/* Dare details */}
                  {dare.status === "completed" && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          Completed
                        </span>
                      </div>
                      {dare.proof && (
                        <p className="text-sm text-green-700 mb-2">
                          <strong>Proof:</strong> {dare.proof}
                        </p>
                      )}
                      {dare.rating && (
                        <p className="text-sm text-green-700 mb-2">
                          <strong>Difficulty Rating:</strong> {dare.rating}/5
                        </p>
                      )}
                      {dare.notes && (
                        <p className="text-sm text-green-700">
                          <strong>Notes:</strong> {dare.notes}
                        </p>
                      )}
                    </div>
                  )}

                  {dare.status === "failed" && dare.notes && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">
                          Failed
                        </span>
                      </div>
                      <p className="text-sm text-red-700">
                        <strong>Notes:</strong> {dare.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2 text-lg">
              No Dares Found
            </h3>
            <p className="text-gray-600">
              No dares match your current filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-lg">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-6 py-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  DoOrDare
                </h1>
                <p className="text-xs text-gray-500">Stay Accountable</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {[
              { id: "dashboard", icon: Home, label: "Dashboard" },
              { id: "my-goals", icon: Target, label: "My Goals" },
              { id: "add-goal", icon: Plus, label: "Add Goal" },
              { id: "dares", icon: Zap, label: "Dares" },
              { id: "dare-history", icon: Calendar, label: "Dare History" },
              { id: "settings", icon: Settings, label: "Settings" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-r-2 border-purple-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* User Profile */}
          <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200">
            <div
              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
              onClick={() => setShowUserProfileModal(true)}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={userProfile?.avatar} />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  {userProfile?.initials ||
                    (user?.displayName || user?.email?.split("@")[0] || "U")
                      .split(" ")
                      .map((name) => name.charAt(0).toUpperCase())
                      .join("")
                      .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userProfile?.name ||
                    user?.displayName ||
                    user?.email?.split("@")[0] ||
                    "User"}
                </p>
                <p className="text-xs text-gray-500">
                  {userProfile?.email || user?.email}
                </p>
              </div>
              <Button size="sm" variant="ghost" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              DoOrDare
            </h1>
            <Button size="sm" variant="ghost">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8">{renderContent()}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around items-center py-2">
          {[
            { id: "dashboard", icon: Home, label: "Dashboard" },
            { id: "my-goals", icon: Target, label: "My Goals" },
            { id: "add-goal", icon: Plus, label: "Add Goal" },
            { id: "dares", icon: Zap, label: "Dares" },
            { id: "dare-history", icon: Calendar, label: "History" },
            { id: "settings", icon: Settings, label: "Settings" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? "text-purple-600 bg-purple-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dare Assignment Modal */}
      <Dialog open={showDareModal} onOpenChange={setShowDareModal}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-orange-500" />
              <span>Assign Dare</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Assign a fun dare to{" "}
              <span className="font-semibold">{dareTarget}</span> for not
              completing their goals!
            </p>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Choose a Dare
              </label>
              <Select value={selectedDare} onValueChange={setSelectedDare}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a dare..." />
                </SelectTrigger>
                <SelectContent>
                  {dareOptions.map((dare, index) => (
                    <SelectItem key={index} value={dare.text}>
                      <div className="flex items-center space-x-2">
                        <span>{dare.text}</span>
                        <div className="flex space-x-1">
                          <Badge
                            className={`text-xs ${getCategoryColor(
                              dare.category
                            )}`}
                          >
                            {dare.category}
                          </Badge>
                          <Badge
                            className={`text-xs ${getDifficultyColor(
                              dare.difficulty
                            )}`}
                          >
                            {dare.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedDare && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Selected Dare:</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedDare}
                </p>
                {(() => {
                  const selectedDareObj = dareOptions.find(
                    (dare) => dare.text === selectedDare
                  );
                  if (selectedDareObj) {
                    return (
                      <div className="flex space-x-2 mt-2">
                        <Badge
                          className={getCategoryColor(selectedDareObj.category)}
                        >
                          {selectedDareObj.category}
                        </Badge>
                        <Badge
                          className={getDifficultyColor(
                            selectedDareObj.difficulty
                          )}
                        >
                          {selectedDareObj.difficulty}
                        </Badge>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowDareModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignDare}
                disabled={!selectedDare}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                Assign Dare
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Profile Modal */}
      <Dialog
        open={showUserProfileModal}
        onOpenChange={setShowUserProfileModal}
      >
        <DialogContent className="max-w-2xl mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userProfile?.avatar} />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  {userProfile?.initials ||
                    (user?.displayName || user?.email?.split("@")[0] || "U")
                      .split(" ")
                      .map((name) => name.charAt(0).toUpperCase())
                      .join("")
                      .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span>User Profile</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <Avatar className="h-16 w-16">
                <AvatarImage src={userProfile?.avatar} />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl">
                  {userProfile?.initials ||
                    (user?.displayName || user?.email?.split("@")[0] || "U")
                      .split(" ")
                      .map((name) => name.charAt(0).toUpperCase())
                      .join("")
                      .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {userProfile?.name ||
                    user?.displayName ||
                    user?.email?.split("@")[0] ||
                    "User"}
                </h3>
                <p className="text-gray-600">
                  {userProfile?.email || user?.email}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <div
                    className={`w-2 h-2 rounded-full ${getStatusColor(
                      userProfile?.status
                    )}`}
                  />
                  <span className="text-sm text-gray-500 capitalize">
                    {userProfile?.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {userProfile?.totalGoals}
                </div>
                <div className="text-sm text-gray-600">Total Goals</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {userProfile?.completedGoals}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {userProfile?.currentStreak}
                </div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </div>
            </div>

            {/* Edit Profile Form */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Edit Profile</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <div className="py-2 px-3 bg-gray-50 rounded text-gray-900">
                    {userProfile?.name ||
                      user?.displayName ||
                      user?.email?.split("@")?.[0] ||
                      "User"}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="py-2 px-3 bg-gray-50 rounded text-gray-900">
                    {userProfile?.email || user?.email}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Age
                  </label>
                  <Input
                    value={editingProfile.age}
                    onChange={(e) =>
                      setEditingProfile({
                        ...editingProfile,
                        age: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="Enter your age"
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Join Date
                  </label>
                  <Input
                    value={userProfile?.joinDate}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Accountability Partners */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">
                Accountability Partners
              </h4>
              <div className="space-y-3">
                {userProfile?.accountabilityPartners?.map((partner) => (
                  <div
                    key={partner.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-green-500 text-white text-sm">
                          {partner.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">
                          {partner.name}
                        </p>
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-2 h-2 rounded-full ${getStatusColor(
                              partner.status
                            )}`}
                          />
                          <span className="text-sm text-gray-500 capitalize">
                            {partner.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      View Profile
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setShowUserProfileModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleProfileUpdate}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dare Completion Modal */}
      <Dialog
        open={showDareCompletionModal}
        onOpenChange={setShowDareCompletionModal}
      >
        <DialogContent className="max-w-2xl mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Complete Dare</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {selectedDareForCompletion && (
              <>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-2">
                    Dare to Complete:
                  </h3>
                  <p className="text-green-700">
                    {selectedDareForCompletion.dareText}
                  </p>
                  <div className="flex space-x-2 mt-2">
                    <Badge
                      className={getCategoryColor(
                        selectedDareForCompletion.category
                      )}
                    >
                      {selectedDareForCompletion.category}
                    </Badge>
                    <Badge
                      className={getDifficultyColor(
                        selectedDareForCompletion.difficulty
                      )}
                    >
                      {selectedDareForCompletion.difficulty}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Proof of Completion (Optional)
                    </label>
                    <Textarea
                      placeholder="Describe how you completed the dare, or share a photo/video description..."
                      value={dareCompletionProof}
                      onChange={(e) => setDareCompletionProof(e.target.value)}
                      className="resize-none min-h-[100px]"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      How difficult was it? (1-5)
                    </label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setDareCompletionRating(rating)}
                          className={`w-10 h-10 rounded-full border-2 transition-colors ${
                            dareCompletionRating === rating
                              ? "border-green-500 bg-green-100 text-green-700"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Notes (Optional)
                    </label>
                    <Textarea
                      placeholder="Any additional thoughts or feelings about completing this dare..."
                      value={dareCompletionNotes}
                      onChange={(e) => setDareCompletionNotes(e.target.value)}
                      className="resize-none min-h-[80px]"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => setShowDareCompletionModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDareCompletion}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Complete Dare
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dare History Modal */}
      <Dialog
        open={showDareHistoryModal}
        onOpenChange={setShowDareHistoryModal}
      >
        <DialogContent className="max-w-4xl mx-auto max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              <span>Dare History</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex space-x-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Category
                </label>
                <Select value={dareCategory} onValueChange={setDareCategory}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="fitness">Fitness</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="discipline">Discipline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Difficulty
                </label>
                <Select
                  value={dareDifficulty}
                  onValueChange={setDareDifficulty}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dare History List */}
            <div className="space-y-4">
              {getFilteredDares().length > 0 ? (
                getFilteredDares().map((dare) => (
                  <div
                    key={dare.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-2">
                          {dare.dareText}
                        </p>
                        <div className="flex items-center space-x-3 mb-3">
                          <Badge className={getCategoryColor(dare.category)}>
                            {dare.category}
                          </Badge>
                          <Badge
                            className={getDifficultyColor(dare.difficulty)}
                          >
                            {dare.difficulty}
                          </Badge>
                          <Badge
                            variant={
                              dare.status === "completed"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              dare.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : dare.status === "failed"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {dare.status}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {dare.assignedAt?.toDate?.()
                              ? new Date(
                                  dare.assignedAt.toDate()
                                ).toLocaleDateString()
                              : "Recently"}
                          </span>
                        </div>

                        {/* Dare details */}
                        {dare.status === "completed" && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">
                                Completed
                              </span>
                            </div>
                            {dare.proof && (
                              <p className="text-sm text-green-700 mb-2">
                                <strong>Proof:</strong> {dare.proof}
                              </p>
                            )}
                            {dare.rating && (
                              <p className="text-sm text-green-700 mb-2">
                                <strong>Difficulty Rating:</strong>{" "}
                                {dare.rating}/5
                              </p>
                            )}
                            {dare.notes && (
                              <p className="text-sm text-green-700">
                                <strong>Notes:</strong> {dare.notes}
                              </p>
                            )}
                          </div>
                        )}

                        {dare.status === "failed" && dare.notes && (
                          <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <XCircle className="h-4 w-4 text-red-600" />
                              <span className="text-sm font-medium text-red-800">
                                Failed
                              </span>
                            </div>
                            <p className="text-sm text-red-700">
                              <strong>Notes:</strong> {dare.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                    No Dares Found
                  </h3>
                  <p className="text-gray-600">
                    No dares match your current filters.
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
