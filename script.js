// Get DOM elements
const goalInput = document.getElementById('goalInput');
const setGoalBtn = document.getElementById('setGoalBtn');
const goalList = document.getElementById('goalList');
const streakCounter = document.getElementById('streakcounter');

// Debug: Check if elements are found
console.log('Elements found:', {
    goalInput: goalInput,
    setGoalBtn: setGoalBtn,
    goalList: goalList,
    streakCounter: streakCounter
});

// Initialize variables
let streak = 0;
let goals = [];
let dares = [
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


    
];

// Load data from localStorage
function loadData() {
    console.log('Loading data...');
    const savedStreak = localStorage.getItem('streak');
    const savedGoals = localStorage.getItem('goals');
    const lastDate = localStorage.getItem('lastDate');
    
    if (savedStreak) streak = parseInt(savedStreak);
    if (savedGoals) goals = JSON.parse(savedGoals);
    
    // Check if it's a new day
    const today = new Date().toDateString();
    if (lastDate !== today) {
        // Reset goals for new day
        goals = [];
        localStorage.setItem('goals', JSON.stringify(goals));
        localStorage.setItem('lastDate', today);
    }
    
    updateStreakDisplay();
    renderGoals();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('streak', streak.toString());
    localStorage.setItem('goals', JSON.stringify(goals));
}

// Update streak display
function updateStreakDisplay() {
    streakCounter.querySelector('h3').textContent = `Streaks: ${streak} days`;
}

// Get random dare
function getRandomDare() {
    return dares[Math.floor(Math.random() * dares.length)];
}

// Create goal card element
function createGoalCard(goal, index) {
    const goalCard = document.createElement('div');
    goalCard.className = 'goal-card';
    goalCard.dataset.index = index;
    
    const goalContent = document.createElement('div');
    goalContent.className = 'goal-card-content';
    goalContent.textContent = goal.text;
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';
    
    // Add delete button for all goal states
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.className = 'delete-btn';
    deleteBtn.title = 'Delete goal';
    deleteBtn.onclick = () => deleteGoal(index);
    buttonContainer.appendChild(deleteBtn);
    
    if (goal.status === 'pending') {
        const didItBtn = document.createElement('button');
        didItBtn.textContent = 'I did it';
        didItBtn.className = 'success-btn';
        didItBtn.onclick = () => markGoalComplete(index);
        
        const failedBtn = document.createElement('button');
        failedBtn.textContent = 'I failed';
        failedBtn.className = 'fail-btn';
        failedBtn.onclick = () => markGoalFailed(index);
        
        buttonContainer.appendChild(didItBtn);
        buttonContainer.appendChild(failedBtn);
    } else if (goal.status === 'failed') {
        const dareText = document.createElement('div');
        dareText.className = 'dare-text';
        dareText.textContent = `Dare: ${goal.dare}`;
        
        const completedDareBtn = document.createElement('button');
        completedDareBtn.textContent = 'Dare Completed';
        completedDareBtn.className = 'dare-complete-btn';
        completedDareBtn.onclick = () => completeDare(index);
        
        buttonContainer.appendChild(dareText);
        buttonContainer.appendChild(completedDareBtn);
    } else if (goal.status === 'completed') {
        const completedText = document.createElement('div');
        completedText.className = 'completed-text';
        completedText.textContent = '✅ Completed';
        
        buttonContainer.appendChild(completedText);
    }
    
    goalCard.appendChild(goalContent);
    goalCard.appendChild(buttonContainer);
    
    return goalCard;
}

// Render all goals
function renderGoals() {
    console.log('Rendering goals:', goals);
    // Clear existing goals (except the h3 title)
    const existingCards = goalList.querySelectorAll('.goal-card');
    existingCards.forEach(card => card.remove());
    
    // Add each goal
    goals.forEach((goal, index) => {
        const goalCard = createGoalCard(goal, index);
        goalList.appendChild(goalCard);
    });
}

// Add new goal
function addGoal() {
    console.log('addGoal function called');
    const goalText = goalInput.value.trim();
    console.log('Goal text:', goalText);
    
    if (goalText) {
        const newGoal = {
            text: goalText,
            status: 'pending',
            date: new Date().toDateString()
        };
        
        goals.push(newGoal);
        console.log('Goals after adding:', goals);
        saveData();
        renderGoals();
        
        goalInput.value = '';
        goalInput.focus();
    }
}

// Mark goal as completed
function markGoalComplete(index) {
    goals[index].status = 'completed';
    goals[index].completedAt = new Date().toISOString();
    
    // Check if all goals are completed for today
    const allCompleted = goals.every(goal => goal.status === 'completed');
    if (allCompleted && goals.length > 0) {
        streak++;
        saveData();
        updateStreakDisplay();
    }
    
    saveData();
    renderGoals();
}

//ahhhhh
// Mark goal as failed
function markGoalFailed(index) {
    goals[index].status = 'failed';
    goals[index].dare = getRandomDare();
    goals[index].failedAt = new Date().toISOString();
    
    saveData();
    renderGoals();
}

// Complete dare
function completeDare(index) {
    goals[index].status = 'dare-completed';
    goals[index].dareCompletedAt = new Date().toISOString();
    
    saveData();
    renderGoals();
}

// Delete goal
function deleteGoal(index) {
    if (confirm('Are you sure you want to delete this goal?')) {
        goals.splice(index, 1);
        saveData();
        renderGoals();
    }
}

// Event listeners
console.log('Setting up event listeners...');
setGoalBtn.addEventListener('click', addGoal);
console.log('Click event listener added to setGoalBtn');

goalInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addGoal();
    }
});
console.log('Keypress event listener added to goalInput');

// Initialize the app
console.log('Initializing app...');
loadData();
