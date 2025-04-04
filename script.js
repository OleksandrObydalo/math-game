import confetti from 'confetti';

// Game variables
let score = 0;
let timer = 60;
let timerInterval;
let currentProblem = {};
let correctAnswers = 0;
let wrongAnswers = 0;
let gameRunning = false;

// DOM elements
const startButton = document.getElementById('start-button');
const submitButton = document.getElementById('submit-button');
const playAgainButton = document.getElementById('play-again-button');
const answerInput = document.getElementById('answer-input');
const problemElement = document.getElementById('problem');
const feedbackElement = document.getElementById('feedback');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const finalScoreElement = document.getElementById('final-score');
const correctAnswersElement = document.getElementById('correct-answers');
const wrongAnswersElement = document.getElementById('wrong-answers');

// Game sections
const settingsSection = document.querySelector('.settings');
const gameArea = document.querySelector('.game-area');
const resultsSection = document.querySelector('.results');

// Initialize the game
startButton.addEventListener('click', startGame);
submitButton.addEventListener('click', checkAnswer);
playAgainButton.addEventListener('click', resetGame);

// Enter key to submit answer
answerInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter' && gameRunning) {
        checkAnswer();
    }
});

// Start the game
function startGame() {
    // Get selected operations
    const operations = getSelectedOperations();
    if (operations.length === 0) {
        alert('Please select at least one operation');
        return;
    }

    // Reset game variables
    score = 0;
    timer = 60;
    correctAnswers = 0;
    wrongAnswers = 0;
    gameRunning = true;
    
    // Update UI
    scoreElement.textContent = score;
    timerElement.textContent = timer;
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
    }
    
    problem = `${num1} ${operator} ${num2} = ?`;
    
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
    
    if (userAnswer === currentProblem.answer) {
        // Correct answer
        score += 10;
        correctAnswers++;
        scoreElement.textContent = score;
        feedbackElement.textContent = 'Correct! 🎉';
        feedbackElement.className = 'result-feedback correct';
        
        // Small confetti for correct answer
        confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 }
        });
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

// End the game
function endGame() {
    gameRunning = false;
    clearInterval(timerInterval);
    
    // Update results section
    finalScoreElement.textContent = score;
    correctAnswersElement.textContent = correctAnswers;
    wrongAnswersElement.textContent = wrongAnswers;
    
    // Show results section
    gameArea.style.display = 'none';
    resultsSection.style.display = 'block';
    
    // Celebration confetti for game completion
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
}

// Reset game
function resetGame() {
    resultsSection.style.display = 'none';
    settingsSection.style.display = 'block';
}

