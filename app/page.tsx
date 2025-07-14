"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";

// Firebase imports
import {
  authService,
  userService,
  goalService,
  groupService,
  dareService,
  statsService,
} from "@/services/firebase";
import AuthModal from "@/components/AuthModal";

const dareOptions = [
  "Do 20 jumping jacks while shouting a motivational phrase!",
  "Perform your favorite song as if you're on stage at a concert! ",
  'Do 10 push-ups and yell "I won\'t quit!" after each one.',
  "Dance like no one's watching — full power for 30 seconds! ",
  "Tell a cringe dad joke to someone, then rate their reaction.",
  'Take a 1-minute cold shower and scream "I love discipline!" ',
  "Do 5 burpees and clap over your head each time you jump.",
  "Meditate in complete silence... or in plank position (your choice).",
  "Do 20 sit-ups while naming 5 people who inspire you.",
  "Run in place for 1 minute and pretend you're being chased by zombies! ",
  "Do walking lunges across your room while chanting \"I've got this!",
  "Hold a 30s plank while smiling the whole time",
  "10 mountain climbers while imagining you're on a volcano",
  "Stretch like you're preparing for a dance battle.",
  "Do 15 jumping jacks while spelling your name out loud!",
  "Do 10 tricep dips with a clap at the end if you're a beast.",
  "Do 20 high knees like you're sprinting to save the world!",
  "Do 10 butt kicks while singing a line of any song.",
  "Do 15 arm circles and then strike a superhero pose!",
  "Run around your house/apartment like you're late for a flight.",
  "Make a 15-second motivational speech like you're Tony Robbins.",
  "Do 10 wall sits while naming 10 countries.",
  "Do 10 star jumps while reciting the alphabet backwards.",
  "Say your goal out loud in front of a mirror. Loud and proud.",
  "Balance on one foot for 1 minute while clapping.",
];

export default function DoOrDareWebApp() {
  // Authentication state
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
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
  const [userProfile, setUserProfile] = useState(null);
  const [userGoals, setUserGoals] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [userDares, setUserDares] = useState([]);
  const [groupData, setGroupData] = useState({
    name: "TheGoalGetters",
    members: [],
  });

  // Edit profile state
  const [editingProfile, setEditingProfile] = useState({
    name: "",
    email: "",
    age: 0,
  });

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (authUser) => {
      setUser(authUser);
      setLoading(false);

      if (authUser) {
        // Load user profile and data
        await loadUserData(authUser.uid);
      } else {
        // Clear data when user signs out
        setUserProfile(null);
        setUserGoals([]);
        setGroupMembers([]);
        setUserDares([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load user data when authenticated
  const loadUserData = async (userId) => {
    try {
      // Load user profile
      const profile = await userService.getUserProfile(userId);
      setUserProfile(profile);
      setEditingProfile({
        name: profile.name || "",
        email: profile.email || "",
        age: profile.age || 0,
      });

      // Load user goals
      const goals = await goalService.getUserGoals(userId);
      setUserGoals(goals);

      // Load group members (assuming user is in a group)
      const members = await groupService.getGroupMembers("default-group");
      setGroupMembers(members);

      // Load user dares
      const dares = await dareService.getUserDares(userId);
      setUserDares(dares);

      // Update group data
      setGroupData((prev) => ({
        ...prev,
        members: members,
      }));
    } catch (error) {
      console.error("Error loading user data:", error);
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
        };

        await goalService.createGoal(user.uid, goalData);
        setNewGoal("");
        setAssignTo("self");
        setActiveTab("dashboard");
      } catch (error) {
        console.error("Error adding goal:", error);
      }
    }
  };

  // Handle goal status update
  const handleGoalStatusUpdate = async (goalId, status) => {
    try {
      await goalService.updateGoalStatus(goalId, status);

      // Update streak if goal completed
      if (status === "completed" && user) {
        await statsService.updateUserStreak(user.uid);
      }
    } catch (error) {
      console.error("Error updating goal status:", error);
    }
  };

  // Handle assign dare
  const handleAssignDare = async () => {
    if (selectedDare && dareTarget && user) {
      try {
        // Find target user ID from group members
        const targetMember = groupMembers.find(
          (member) => member.name === dareTarget
        );
        if (targetMember) {
          await dareService.assignDare(user.uid, targetMember.id, selectedDare);
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
                <p className="text-3xl font-bold text-orange-700">3</p>
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
              {groupData.members[0].goals.map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center space-x-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <Checkbox
                    checked={goal.completed}
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dares</h1>
        <p className="text-gray-600 mt-1">Fun consequences for missed goals</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-lg border-0">
          <CardHeader>
            <CardTitle>Active Dares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Zap className="h-16 w-16 text-orange-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                No Active Dares
              </h3>
              <p className="text-gray-600">
                Complete your goals to avoid dares!
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-r from-orange-50 to-red-50">
          <CardHeader>
            <CardTitle className="text-orange-700">Dare Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">3</div>
                <p className="text-sm text-gray-600">Dares This Week</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completed</span>
                  <span className="font-medium">2/3</span>
                </div>
                <div className="w-full bg-orange-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
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
      case "settings":
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

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
                  {userProfile?.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userProfile?.name}
                </p>
                <p className="text-xs text-gray-500">{userProfile?.email}</p>
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
                    <SelectItem key={index} value={dare}>
                      {dare}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                  {userProfile?.initials}
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
                  {userProfile?.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {userProfile?.name}
                </h3>
                <p className="text-gray-600">{userProfile?.email}</p>
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
                  <Input
                    value={editingProfile.name}
                    onChange={(e) =>
                      setEditingProfile({
                        ...editingProfile,
                        name: e.target.value,
                      })
                    }
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <Input
                    value={editingProfile.email}
                    onChange={(e) =>
                      setEditingProfile({
                        ...editingProfile,
                        email: e.target.value,
                      })
                    }
                    placeholder="Enter your email"
                    type="email"
                  />
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
    </div>
  );
}
