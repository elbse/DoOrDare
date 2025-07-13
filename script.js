// Mock data
const groupData = {
  name: "TheGoalGetters",
  members: [
    {
      id: 1,
      name: "Alex Chen",
      initials: "AC",
      status: "online",
      goals: [
        { id: 1, text: "Complete morning workout", completed: true, dueDate: "Today", category: "Fitness" },
        { id: 2, text: "Read 30 pages of book", completed: false, dueDate: "Today", category: "Learning" },
        { id: 3, text: "Meditate for 10 minutes", completed: true, dueDate: "Today", category: "Wellness" },
      ],
    },
    {
      id: 2,
      name: "Sarah Johnson",
      initials: "SJ",
      status: "online",
      goals: [
        { id: 4, text: "Drink 8 glasses of water", completed: false, dueDate: "Today", category: "Health" },
        { id: 5, text: "Complete project proposal", completed: true, dueDate: "Today", category: "Work" },
        { id: 6, text: "Call mom", completed: false, dueDate: "Today", category: "Personal" },
      ],
    },
    {
      id: 3,
      name: "Mike Rodriguez",
      initials: "MR",
      status: "away",
      goals: [
        { id: 7, text: "Go for evening run", completed: true, dueDate: "Today", category: "Fitness" },
        { id: 8, text: "Prepare healthy lunch", completed: true, dueDate: "Today", category: "Health" },
        { id: 9, text: "Practice guitar", completed: false, dueDate: "Today", category: "Hobbies" },
      ],
    },
    {
      id: 4,
      name: "Emma Wilson",
      initials: "EW",
      status: "offline",
      goals: [
        { id: 10, text: "Finish quarterly report", completed: false, dueDate: "Today", category: "Work" },
        { id: 11, text: "Yoga session", completed: true, dueDate: "Today", category: "Fitness" },
        { id: 12, text: "Plan weekend trip", completed: false, dueDate: "Today", category: "Personal" },
      ],
    },
  ],
}

const dareOptions = [
    "Do 20 jumping jacks while shouting a motivational phrase!",
    "Perform your favorite song as if you're on stage at a concert! ",
    "Do 10 push-ups and yell \"I won’t quit!\" after each one.",
    "Dance like no one’s watching — full power for 30 seconds! ",
    "Tell a cringe dad joke to someone, then rate their reaction.",
    "Take a 1-minute cold shower and scream “I love discipline!” ",
    "Do 5 burpees and clap over your head each time you jump.",
    "Meditate in complete silence... or in plank position (your choice).",
    "Do 20 sit-ups while naming 5 people who inspire you.",
    "Run in place for 1 minute and pretend you're being chased by zombies! ",
    "Do walking lunges across your room while chanting “I’ve got this!",
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
    "Balance on one foot for 1 minute while clapping."

]

// State management
let currentView = "dashboard"
let selectedDareTarget = ""

// DOM elements
const sidebar = document.getElementById("sidebar")
const mobileMenuBtn = document.getElementById("mobileMenuBtn")
const dareModal = document.getElementById("dareModal")
const dareTargetName = document.getElementById("dareTargetName")
const dareSelect = document.getElementById("dareSelect")
const addGoalForm = document.getElementById("addGoalForm")
const searchInput = document.getElementById("searchInput")

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  initializeNavigation()
  renderMembers()
  renderMyGoals()
  initializeSearch()
  initializeAddGoalForm()
})

// Navigation
function initializeNavigation() {
  // Desktop navigation
  const navItems = document.querySelectorAll(".nav-item")
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const tab = item.getAttribute("data-tab")
      showView(tab)
      setActiveNavItem(item)
    })
  })

  // Mobile navigation
  const mobileNavItems = document.querySelectorAll(".mobile-nav-item")
  mobileNavItems.forEach((item) => {
    item.addEventListener("click", () => {
      const tab = item.getAttribute("data-tab")
      showView(tab)
      setActiveMobileNavItem(item)
    })
  })

  // Mobile menu toggle
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", toggleMobileSidebar)
  }
}

function showView(viewName) {
  // Hide all views
  const views = document.querySelectorAll(".view")
  views.forEach((view) => view.classList.remove("active"))

  // Show selected view
  const targetView = document.getElementById(`${viewName}-view`)
  if (targetView) {
    targetView.classList.add("active")
    currentView = viewName
  }
}

function setActiveNavItem(activeItem) {
  const navItems = document.querySelectorAll(".nav-item")
  navItems.forEach((item) => item.classList.remove("active"))
  activeItem.classList.add("active")
}

function setActiveMobileNavItem(activeItem) {
  const mobileNavItems = document.querySelectorAll(".mobile-nav-item")
  mobileNavItems.forEach((item) => item.classList.remove("active"))
  activeItem.classList.add("active")
}

function toggleMobileSidebar() {
  sidebar.classList.toggle("open")
}

// Render functions
function renderMembers() {
  const membersGrid = document.getElementById("membersGrid")
  if (!membersGrid) return

  membersGrid.innerHTML = ""

  groupData.members.forEach((member) => {
    const completionRate = getCompletionRate(member)
    const memberCard = createMemberCard(member, completionRate)
    membersGrid.appendChild(memberCard)
  })
}

function createMemberCard(member, completionRate) {
  const card = document.createElement("div")
  card.className = "member-card"

  card.innerHTML = `
        <div class="member-header">
            <div class="member-info">
                <div class="member-profile">
                    <div class="member-avatar-container">
                        <div class="member-avatar">${member.initials}</div>
                        <div class="status-indicator ${member.status}"></div>
                    </div>
                    <div class="member-details">
                        <h3>${member.name}</h3>
                        <div class="member-badges">
                            <span class="badge">${completionRate}% complete</span>
                            ${completionRate === 100 ? '<svg class="trophy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55.47.98.97 1.21C12.04 18.75 13 20.24 13 22"/><path d="M14 14.66V17c0 .55-.47.98-.97 1.21C11.96 18.75 11 20.24 11 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>' : ""}
                        </div>
                        <div class="member-status">${member.status}</div>
                    </div>
                </div>
                <div class="member-actions">
                    ${
                      completionRate < 100
                        ? `<button class="dare-btn" onclick="openDareModal('${member.name}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>
                        </svg>
                        Dare
                    </button>`
                        : ""
                    }
                    <button class="more-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="1"/>
                            <circle cx="19" cy="12" r="1"/>
                            <circle cx="5" cy="12" r="1"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        <div class="member-goals">
            ${member.goals.map((goal) => createGoalItem(goal)).join("")}
        </div>
    `

  return card
}

function createGoalItem(goal) {
  return `
        <div class="goal-item">
            <div class="goal-checkbox ${goal.completed ? "checked" : ""}" onclick="toggleGoal(${goal.id})"></div>
            <div class="goal-content">
                <p class="goal-text ${goal.completed ? "completed" : ""}">${goal.text}</p>
                <div class="goal-meta">
                    <div class="goal-date">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        ${goal.dueDate}
                    </div>
                    <span class="goal-category">${goal.category}</span>
                </div>
            </div>
            ${
              goal.completed
                ? `<svg class="goal-status" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>`
                : ""
            }
        </div>
    `
}

function renderMyGoals() {
  const myGoalsList = document.getElementById("myGoalsList")
  if (!myGoalsList) return

  const myGoals = groupData.members[0].goals // Assuming first member is current user
  myGoalsList.innerHTML = ""

  myGoals.forEach((goal) => {
    const goalItem = document.createElement("div")
    goalItem.className = "my-goal-item"
    goalItem.innerHTML = `
            <div class="goal-checkbox ${goal.completed ? "checked" : ""}" onclick="toggleGoal(${goal.id})"></div>
            <div class="my-goal-content">
                <p class="my-goal-text ${goal.completed ? "completed" : ""}">${goal.text}</p>
                <div class="my-goal-meta">
                    <span class="goal-category">${goal.category}</span>
                    <span class="goal-date">${goal.dueDate}</span>
                </div>
            </div>
            ${
              goal.completed
                ? `<svg class="goal-status" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>`
                : ""
            }
        `
    myGoalsList.appendChild(goalItem)
  })
}

// Utility functions
function getCompletionRate(member) {
  const completed = member.goals.filter((goal) => goal.completed).length
  return Math.round((completed / member.goals.length) * 100)
}

function toggleGoal(goalId) {
  // Find and toggle the goal
  groupData.members.forEach((member) => {
    const goal = member.goals.find((g) => g.id === goalId)
    if (goal) {
      goal.completed = !goal.completed
    }
  })

  // Re-render affected components
  renderMembers()
  renderMyGoals()
}

// Dare modal functions
function openDareModal(memberName) {
  selectedDareTarget = memberName
  dareTargetName.textContent = memberName
  dareSelect.value = ""
  dareModal.classList.add("active")
}

function closeDareModal() {
  dareModal.classList.remove("active")
  selectedDareTarget = ""
  dareSelect.value = ""
}

function assignDare() {
  const selectedDare = dareSelect.value
  if (selectedDare && selectedDareTarget) {
    alert(`Dare "${selectedDare}" assigned to ${selectedDareTarget}!`)
    closeDareModal()
  }
}

// Search functionality
function initializeSearch() {
  if (searchInput) {
    searchInput.addEventListener("input", handleSearch)
  }
}

function handleSearch(event) {
  const query = event.target.value.toLowerCase()
  const memberCards = document.querySelectorAll(".member-card")

  memberCards.forEach((card) => {
    const memberName = card.querySelector("h3").textContent.toLowerCase()
    const goalTexts = Array.from(card.querySelectorAll(".goal-text")).map((el) => el.textContent.toLowerCase())

    const matches = memberName.includes(query) || goalTexts.some((text) => text.includes(query))

    card.style.display = matches ? "block" : "none"
  })
}

// Add goal form
function initializeAddGoalForm() {
  if (addGoalForm) {
    addGoalForm.addEventListener("submit", handleAddGoal)
  }
}

function handleAddGoal(event) {
  event.preventDefault()

  const goalDescription = document.getElementById("goalDescription").value
  const assignTo = document.getElementById("assignTo").value
  const goalCategory = document.getElementById("goalCategory").value

  if (goalDescription.trim()) {
    // In a real app, this would save to a database
    console.log("Adding goal:", {
      description: goalDescription,
      assignTo: assignTo,
      category: goalCategory,
    })

    // Reset form
    addGoalForm.reset()

    // Show success message
    alert("Goal added successfully!")

    // Navigate back to dashboard
    showView("dashboard")

    // Update navigation
    const dashboardNavItem = document.querySelector('.nav-item[data-tab="dashboard"]')
    const dashboardMobileNavItem = document.querySelector('.mobile-nav-item[data-tab="dashboard"]')
    if (dashboardNavItem) setActiveNavItem(dashboardNavItem)
    if (dashboardMobileNavItem) setActiveMobileNavItem(dashboardMobileNavItem)
  }
}

// Close modal when clicking outside
document.addEventListener("click", (event) => {
  if (event.target === dareModal) {
    closeDareModal()
  }
})

// Keyboard navigation
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeDareModal()
  }
})

// Window resize handler
window.addEventListener("resize", () => {
  if (window.innerWidth > 1024) {
    sidebar.classList.remove("open")
  }
})
