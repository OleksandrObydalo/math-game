import confetti from 'confetti';

// Game variables
let score = 0;
let timer = 60;
let timerInterval;
let currentProblem = {};
let correctAnswers = 0;
let wrongAnswers = 0;
let gameRunning = false;
let gameRecords = JSON.parse(localStorage.getItem('mathGameRecords')) || {
    easy: { highScore: 0, totalGames: 0, totalCorrect: 0, totalWrong: 0 },
    medium: { highScore: 0, totalGames: 0, totalCorrect: 0, totalWrong: 0 },
    hard: { highScore: 0, totalGames: 0, totalCorrect: 0, totalWrong: 0 }
};
let currentDifficulty = 'medium';

// Add a new array to track problems
let problemHistory = [];

// Add player progression variables
let totalPoints = parseInt(localStorage.getItem('mathGameTotalPoints')) || 0;
let playerLevel = Math.floor(totalPoints / 200) + 1;

// DOM elements
const startButton = document.getElementById('start-button');
const submitButton = document.getElementById('submit-button');
const playAgainButton = document.getElementById('play-again-button');
const timeBoostButton = document.getElementById('time-boost-button');
const answerInput = document.getElementById('answer-input');
const problemElement = document.getElementById('problem');
const feedbackElement = document.getElementById('feedback');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const finalScoreElement = document.getElementById('final-score');
const correctAnswersElement = document.getElementById('correct-answers');
const wrongAnswersElement = document.getElementById('wrong-answers');
const totalPointsElement = document.getElementById('total-points');
const playerLevelElement = document.getElementById('player-level');
const persistentTotalPointsElement = document.getElementById('persistent-total-points');
const persistentPlayerLevelElement = document.getElementById('persistent-player-level');
const persistentHighScoreElement = document.getElementById('persistent-high-score');

// Game sections
const settingsSection = document.querySelector('.settings');
const gameArea = document.querySelector('.game-area');
const resultsSection = document.querySelector('.results');

// Initialize the game
startButton.addEventListener('click', startGame);
submitButton.addEventListener('click', checkAnswer);
playAgainButton.addEventListener('click', resetGame);
timeBoostButton.addEventListener('click', useTimeBoost);

// Enter key to submit answer
answerInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter' && gameRunning) {
        checkAnswer();
    }
});

// Initialize persistent stats display
function updatePersistentStats() {
    persistentTotalPointsElement.textContent = totalPoints;
    persistentPlayerLevelElement.textContent = playerLevel;
    
    // Get current difficulty high score
    const currentHighScore = gameRecords[currentDifficulty].highScore;
    persistentHighScoreElement.textContent = currentHighScore;
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', function() {
    updatePersistentStats();
});

// Start the game
function startGame() {
    // Get selected operations
    const operations = getSelectedOperations();
    if (operations.length === 0) {
        alert('Please select at least one operation');
        return;
    }
    
    // Get current difficulty
    const difficultySelect = document.getElementById('difficulty');
    currentDifficulty = difficultySelect.value;
    
    // Reset game variables
    score = 0;
    timer = 60;
    correctAnswers = 0;
    wrongAnswers = 0;
    gameRunning = true;
    
    // Update UI
    scoreElement.textContent = score;
    timerElement.textContent = timer;
    totalPointsElement.textContent = totalPoints;
    playerLevelElement.textContent = playerLevel;
    settingsSection.style.display = 'none';
    gameArea.style.display = 'block';
    resultsSection.style.display = 'none';
    feedbackElement.textContent = '';
    feedbackElement.className = 'result-feedback';
    
    // Start timer
    timerInterval = setInterval(updateTimer, 1000);
    
    // Generate first problem
    generateProblem();
    
    // Focus on answer input
    answerInput.focus();
    
    // Update persistent stats
    updatePersistentStats();
    
    // Enable time boost button
    timeBoostButton.disabled = false;
    updateTimeBoostButton();
}

// Get selected operations
function getSelectedOperations() {
    const checkboxes = document.querySelectorAll('input[name="operation"]:checked');
    return Array.from(checkboxes).map(checkbox => checkbox.value);
}

// Update timer
function updateTimer() {
    timer--;
    timerElement.textContent = timer;
    
    if (timer <= 0) {
        endGame();
    }
}

// Generate math problem
function generateProblem() {
    const operations = getSelectedOperations();
    const operationType = operations[Math.floor(Math.random() * operations.length)];
    
    const difficultySelect = document.getElementById('difficulty');
    const difficulty = difficultySelect.value;
    
    let num1, num2, answer, operator, problem;
    
    // Set number range based on difficulty
    const maxNumber = {
        'easy': 10,
        'medium': 25,
        'hard': 100
    }[difficulty];
    
    switch (operationType) {
        case 'addition':
            num1 = Math.floor(Math.random() * maxNumber) + 1;
            num2 = Math.floor(Math.random() * maxNumber) + 1;
            answer = num1 + num2;
            operator = '+';
            break;
        case 'subtraction':
            num1 = Math.floor(Math.random() * maxNumber) + 1;
            num2 = Math.floor(Math.random() * num1) + 1; // Ensure positive result
            answer = num1 - num2;
            operator = '-';
            break;
        case 'multiplication':
            // Adjust multiplication to be easier
            num1 = Math.floor(Math.random() * Math.min(12, maxNumber)) + 1;
            num2 = Math.floor(Math.random() * Math.min(12, maxNumber)) + 1;
            answer = num1 * num2;
            operator = '×';
            break;
        case 'division':
            // Create division problems with whole number answers
            num2 = Math.floor(Math.random() * Math.min(12, maxNumber)) + 1;
            answer = Math.floor(Math.random() * Math.min(12, maxNumber)) + 1;
            num1 = num2 * answer;
            operator = '÷';
            break;
        case 'square':
            // Square operation (x²)
            num1 = Math.floor(Math.random() * Math.min(12, maxNumber)) + 1;
            num2 = null; // No second number needed
            answer = num1 * num1;
            operator = '²';
            break;
        case 'squareRoot':
            // Square root operation (√)
            answer = Math.floor(Math.random() * Math.min(10, maxNumber)) + 1;
            num1 = answer * answer; // Perfect square
            num2 = null; // No second number needed
            operator = '√';
            break;
    }
    
    // Format the problem display based on operation type
    if (operationType === 'square') {
        problem = `${num1}${operator} = ?`;
    } else if (operationType === 'squareRoot') {
        problem = `${operator}${num1} = ?`;
    } else {
        problem = `${num1} ${operator} ${num2} = ?`;
    }
    
    // Update UI
    problemElement.textContent = problem;
    answerInput.value = '';
    
    // Store current problem
    currentProblem = {
        num1,
        num2,
        operator,
        answer,
        operationType
    };
}

// Check answer
function checkAnswer() {
    if (!gameRunning) return;
    
    const userAnswer = parseInt(answerInput.value, 10);
    
    if (isNaN(userAnswer)) {
        feedbackElement.textContent = 'Please enter a number!';
        feedbackElement.className = 'result-feedback wrong';
        answerInput.focus();
        return;
    }
    
    // Create problem result object
    const problemResult = {
        problem: problemElement.textContent,
        userAnswer: userAnswer,
        correctAnswer: currentProblem.answer,
        isCorrect: userAnswer === currentProblem.answer
    };
    
    // Store problem in history
    problemHistory.push(problemResult);
    
    if (userAnswer === currentProblem.answer) {
        // Correct answer
        const pointsEarned = 10;
        score += pointsEarned;
        totalPoints += pointsEarned;
        correctAnswers++;
        
        // Check for level up
        const newLevel = Math.floor(totalPoints / 200) + 1;
        if (newLevel > playerLevel) {
            playerLevel = newLevel;
            feedbackElement.textContent = `Correct! Level Up! You are now Level ${playerLevel}! `;
            
            // Extra confetti for level up
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        } else {
            feedbackElement.textContent = 'Correct! ';
        }
        
        scoreElement.textContent = score;
        totalPointsElement.textContent = totalPoints;
        playerLevelElement.textContent = playerLevel;
        feedbackElement.className = 'result-feedback correct';
        
        // Save total points to localStorage
        localStorage.setItem('mathGameTotalPoints', totalPoints.toString());
        
        // Small confetti for correct answer
        if (newLevel === playerLevel) {
            confetti({
                particleCount: 50,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
        
        // Update persistent stats
        updatePersistentStats();
        updateTimeBoostButton();
    } else {
        // Wrong answer
        wrongAnswers++;
        feedbackElement.textContent = `Wrong. The correct answer is ${currentProblem.answer}.`;
        feedbackElement.className = 'result-feedback wrong';
    }
    
    // Generate new problem after a short delay
    setTimeout(() => {
        if (gameRunning) {
            generateProblem();
            feedbackElement.textContent = '';
        }
    }, 1500);
}

// Use time boost power-up
function useTimeBoost() {
    if (!gameRunning || totalPoints < 50) {
        return;
    }
    
    // Deduct points and add time
    totalPoints -= 50;
    timer += 10;
    
    // Update displays
    totalPointsElement.textContent = totalPoints;
    persistentTotalPointsElement.textContent = totalPoints;
    timerElement.textContent = timer;
    
    // Save total points
    localStorage.setItem('mathGameTotalPoints', totalPoints.toString());
    
    // Update button state
    updateTimeBoostButton();
    
    // Show feedback
    feedbackElement.textContent = '+10 seconds! ⚡';
    feedbackElement.className = 'result-feedback correct';
    setTimeout(() => {
        if (gameRunning) {
            feedbackElement.textContent = '';
        }
    }, 1000);
}

// Update time boost button state
function updateTimeBoostButton() {
    if (totalPoints >= 50) {
        timeBoostButton.disabled = false;
        timeBoostButton.textContent = '⚡ +10 seconds (50 points)';
    } else {
        timeBoostButton.disabled = true;
        timeBoostButton.textContent = `⚡ Need ${50 - totalPoints} more points`;
    }
}

// End the game
function endGame() {
    gameRunning = false;
    clearInterval(timerInterval);
    
    // Update stats for current difficulty
    const stats = gameRecords[currentDifficulty];
    stats.totalGames++;
    stats.totalCorrect += correctAnswers;
    stats.totalWrong += wrongAnswers;
    
    // Update high score if needed
    if (score > stats.highScore) {
        stats.highScore = score;
    }
    
    // Save to local storage
    localStorage.setItem('mathGameRecords', JSON.stringify(gameRecords));
    
    // Update results section
    finalScoreElement.textContent = score;
    correctAnswersElement.textContent = correctAnswers;
    wrongAnswersElement.textContent = wrongAnswers;
    
    // Show results section
    gameArea.style.display = 'none';
    resultsSection.style.display = 'block';
    
    // Update stats display
    updateStatsDisplay();
    
    // Create problem history display
    const problemHistoryContainer = createProblemHistoryDisplay();
    resultsSection.appendChild(problemHistoryContainer);
    
    // Celebration confetti for game completion
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
}

// Create problem history display
function createProblemHistoryDisplay() {
    const container = document.createElement('div');
    container.className = 'problem-history-container';
    
    const title = document.createElement('h3');
    title.textContent = 'Problem History';
    container.appendChild(title);
    
    const table = document.createElement('table');
    table.className = 'problem-history-table';
    
    // Create table header
    const headerRow = document.createElement('tr');
    ['Problem', 'Your Answer', 'Correct Answer', 'Result'].forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);
    
    // Add problem rows
    problemHistory.forEach(problem => {
        const row = document.createElement('tr');
        row.className = problem.isCorrect ? 'correct-row' : 'wrong-row';
        
        const problemCell = document.createElement('td');
        problemCell.textContent = problem.problem;
        
        const userAnswerCell = document.createElement('td');
        userAnswerCell.textContent = problem.userAnswer;
        
        const correctAnswerCell = document.createElement('td');
        correctAnswerCell.textContent = problem.correctAnswer;
        
        const resultCell = document.createElement('td');
        resultCell.textContent = problem.isCorrect ? '✓' : '✗';
        
        row.appendChild(problemCell);
        row.appendChild(userAnswerCell);
        row.appendChild(correctAnswerCell);
        row.appendChild(resultCell);
        
        table.appendChild(row);
    });
    
    container.appendChild(table);
    return container;
}

// Update stats display
function updateStatsDisplay() {
    const stats = gameRecords[currentDifficulty];
    document.getElementById('high-score').textContent = stats.highScore;
    document.getElementById('total-games').textContent = stats.totalGames;
    document.getElementById('total-correct').textContent = stats.totalCorrect;
    document.getElementById('total-wrong').textContent = stats.totalWrong;
    document.getElementById('accuracy').textContent = 
        stats.totalCorrect + stats.totalWrong > 0 
            ? Math.round((stats.totalCorrect / (stats.totalCorrect + stats.totalWrong)) * 100) + '%' 
            : '0%';
    document.getElementById('difficulty-label').textContent = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1);
}

// Reset game
function resetGame() {
    // Reset problem history
    problemHistory = [];
    
    // Remove existing problem history if it exists
    const existingHistoryContainer = document.querySelector('.problem-history-container');
    if (existingHistoryContainer) {
        existingHistoryContainer.remove();
    }
    
    resultsSection.style.display = 'none';
    settingsSection.style.display = 'block';
    
    // Update persistent stats
    updatePersistentStats();
}