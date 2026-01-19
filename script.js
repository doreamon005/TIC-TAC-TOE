// Game State Management
let gameState = {
    board: ['', '', '', '', '', '', '', '', ''],
    currentPlayer: 'X',
    gameActive: true,
    gameMode: 'pvp', // Player vs Player
    winningCombinations: [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6] // Diagonals
    ]
};

// User Data Management
let userData = {
    name: '',
    stats: {
        matchesPlayed: 0,
        matchesWon: 0,
        matchesLost: 0,
        matchesDraw: 0
    }
};

// DOM Elements
const pages = {
    home: document.getElementById('homePage'),
    login: document.getElementById('loginPage'),
    game: document.getElementById('gamePage'),
    profile: document.getElementById('profilePage')
};

const gameElements = {
    board: document.getElementById('gameBoard'),
    cells: document.querySelectorAll('.cell'),
    currentPlayerDisplay: document.getElementById('currentPlayerDisplay'),
    gameStatus: document.getElementById('gameStatus')
};

const profileElements = {
    profileName: document.getElementById('profileName'),
    profileAvatar: document.getElementById('profileAvatar'),
    matchesPlayed: document.getElementById('matchesPlayed'),
    matchesWon: document.getElementById('matchesWon'),
    matchesLost: document.getElementById('matchesLost'),
    winPercentage: document.getElementById('winPercentage')
};

const modal = {
    container: document.getElementById('messageModal'),
    title: document.getElementById('modalTitle'),
    message: document.getElementById('modalMessage')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    loadUserData();
    setupEventListeners();
    checkLoginStatus();
    createFloatingParticles();
}

// Load User Data from LocalStorage
function loadUserData() {
    const savedData = localStorage.getItem('ticTacToeUserData');
    if (savedData) {
        userData = JSON.parse(savedData);
    }
}

// Save User Data to LocalStorage
function saveUserData() {
    localStorage.setItem('ticTacToeUserData', JSON.stringify(userData));
}

// Check Login Status
function checkLoginStatus() {
    if (userData.name) {
        showPage('profilePage');
        updateProfileDisplay();
    } else {
        showPage('homePage');
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Game board cells
    gameElements.cells.forEach((cell, index) => {
        cell.addEventListener('click', () => handleCellClick(index));
    });

    // Modal close on background click
    modal.container.addEventListener('click', (e) => {
        if (e.target === modal.container) {
            closeModal();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// Page Navigation
function showPage(pageId) {
    // Hide all pages
    Object.values(pages).forEach(page => {
        page.classList.remove('active');
    });

    // Show selected page
    const targetPage = pages[pageId.replace('Page', '')];
    if (targetPage) {
        setTimeout(() => {
            targetPage.classList.add('active');
        }, 50);
    }

    // Update game display if showing game page
    if (pageId === 'gamePage') {
        updateGameDisplay();
    }
}

// Login Functions
function handleGoogleLogin() {
    showModal('Google Login', 'Simulating Google login...');
    
    setTimeout(() => {
        const name = prompt('Enter your name for the game:');
        if (name && name.trim()) {
            userData.name = name.trim();
            userData.stats = {
                matchesPlayed: 0,
                matchesWon: 0,
                matchesLost: 0,
                matchesDraw: 0
            };
            saveUserData();
            updateProfileDisplay();
            showPage('profilePage');
            showModal('Welcome!', `Welcome to Neon Tic Tac Toe, ${userData.name}!`);
        } else {
            showModal('Login Cancelled', 'Please enter a valid name to continue.');
        }
    }, 1000);
}

function handleGuestLogin() {
    const name = prompt('Enter your name to play as guest:');
    if (name && name.trim()) {
        userData.name = name.trim() + ' (Guest)';
        userData.stats = {
            matchesPlayed: 0,
            matchesWon: 0,
            matchesLost: 0,
            matchesDraw: 0
        };
        saveUserData();
        updateProfileDisplay();
        showPage('profilePage');
        showModal('Welcome Guest!', `Welcome to Neon Tic Tac Toe, ${userData.name}!`);
    } else {
        showModal('Guest Login Cancelled', 'Please enter a valid name to continue.');
    }
}

function handleLogout() {
    if (confirm('Are you sure you want to logout? Your stats will be saved.')) {
        userData.name = '';
        userData.stats = {
            matchesPlayed: 0,
            matchesWon: 0,
            matchesLost: 0,
            matchesDraw: 0
        };
        saveUserData();
        resetGame();
        showPage('homePage');
        showModal('Logged Out', 'You have been successfully logged out.');
    }
}

// Profile Display Functions
function updateProfileDisplay() {
    if (!userData.name) return;

    profileElements.profileName.textContent = userData.name;
    profileElements.profileAvatar.textContent = userData.name.charAt(0).toUpperCase();
    
    profileElements.matchesPlayed.textContent = userData.stats.matchesPlayed;
    profileElements.matchesWon.textContent = userData.stats.matchesWon;
    profileElements.matchesLost.textContent = userData.stats.matchesLost;
    
    // Calculate win percentage
    const winPercentage = userData.stats.matchesPlayed > 0 
        ? Math.round((userData.stats.matchesWon / userData.stats.matchesPlayed) * 100)
        : 0;
    profileElements.winPercentage.textContent = winPercentage + '%';
}

// Game Logic Functions
function handleCellClick(index) {
    // Check if move is valid
    if (gameState.board[index] !== '' || !gameState.gameActive) {
        return;
    }

    // Make move
    gameState.board[index] = gameState.currentPlayer;
    updateCell(index);
    
    // Check for winner
    const result = checkGameResult();
    if (result.winner) {
        handleGameEnd(result.winner, result.combination);
    } else if (result.draw) {
        handleGameEnd('draw');
    } else {
        // Switch player
        gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
        updateGameDisplay();
    }
}

function updateCell(index) {
    const cell = gameElements.cells[index];
    cell.textContent = gameState.board[index];
    cell.classList.add(gameState.board[index] === 'X' ? 'cell-x' : 'cell-o');
}

function checkGameResult() {
    // Check for winner
    for (let combination of gameState.winningCombinations) {
        const [a, b, c] = combination;
        if (gameState.board[a] && 
            gameState.board[a] === gameState.board[b] && 
            gameState.board[a] === gameState.board[c]) {
            return {
                winner: gameState.board[a],
                combination: combination
            };
        }
    }

    // Check for draw
    if (!gameState.board.includes('')) {
        return { draw: true };
    }

    return { winner: null, draw: false };
}

function handleGameEnd(result, combination) {
    gameState.gameActive = false;
    
    // Update stats
    userData.stats.matchesPlayed++;
    
    if (result === 'draw') {
        userData.stats.matchesDraw++;
        gameElements.gameStatus.textContent = 'It\'s a Draw!';
        gameElements.gameStatus.style.color = '#ffd700';
        showModal('Game Over', 'The game ended in a draw!');
    } else {
        if (result === 'X') {
            userData.stats.matchesWon++;
            gameElements.gameStatus.textContent = 'Player X Wins!';
            gameElements.gameStatus.style.color = '#00ffff';
            showModal('Victory!', 'Player X has won the game!');
        } else {
            userData.stats.matchesLost++;
            gameElements.gameStatus.textContent = 'Player O Wins!';
            gameElements.gameStatus.style.color = '#ff00ff';
            showModal('Victory!', 'Player O has won the game!');
        }
        
        // Highlight winning combination
        if (combination) {
            highlightWinningCells(combination);
        }
    }
    
    saveUserData();
    updateProfileDisplay();
}

function highlightWinningCells(combination) {
    combination.forEach(index => {
        gameElements.cells[index].classList.add('winning-cell');
    });
}

function updateGameDisplay() {
    gameElements.currentPlayerDisplay.textContent = gameState.currentPlayer;
    gameElements.currentPlayerDisplay.style.color = gameState.currentPlayer === 'X' ? '#00ffff' : '#ff00ff';
    
    if (gameState.gameActive) {
        gameElements.gameStatus.textContent = 'Game in Progress';
        gameElements.gameStatus.style.color = '#ff00ff';
    }
}

function resetGame() {
    gameState.board = ['', '', '', '', '', '', '', '', ''];
    gameState.currentPlayer = 'X';
    gameState.gameActive = true;
    
    // Clear board display
    gameElements.cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('cell-x', 'cell-o', 'winning-cell');
    });
    
    updateGameDisplay();
}

function restartGame() {
    if (confirm('Are you sure you want to restart the current game?')) {
        resetGame();
        showModal('Game Restarted', 'A new game has begun!');
    }
}

// Modal Functions
function showModal(title, message) {
    modal.title.textContent = title;
    modal.message.textContent = message;
    modal.container.classList.add('active');
}

function closeModal() {
    modal.container.classList.remove('active');
}

// Visual Effects
function createFloatingParticles() {
    const particlesContainer = document.querySelector('.floating-particles');
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 3 + 1}px;
            height: ${Math.random() * 3 + 1}px;
            background: ${getRandomNeonColor()};
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            animation: float ${Math.random() * 10 + 10}s linear infinite;
            animation-delay: ${Math.random() * 5}s;
            box-shadow: 0 0 ${Math.random() * 10 + 5}px currentColor;
        `;
        particlesContainer.appendChild(particle);
    }
}

function getRandomNeonColor() {
    const colors = ['#00ffff', '#ff00ff', '#00ff00', '#ffff00', '#ff0066'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Utility Functions
function preventDefaultBehavior(e) {
    e.preventDefault();
}

// Add smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in';
        document.body.style.opacity = '1';
    }, 100);
});

// Add resize handler for responsive adjustments
window.addEventListener('resize', () => {
    // Adjust game board size for mobile
    if (window.innerWidth <= 480) {
        document.querySelector('.game-board').style.transform = 'scale(0.9)';
    } else {
        document.querySelector('.game-board').style.transform = 'scale(1)';
    }
});

// Add touch support for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        // Can add swipe navigation here if needed
        console.log('Swipe detected');
    }
}

// Performance optimization
let rafId;
function optimizedAnimation() {
    // Add any performance-critical animations here
    rafId = requestAnimationFrame(optimizedAnimation);
}

// Start optimized animations
optimizedAnimation();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (rafId) {
        cancelAnimationFrame(rafId);
    }
    saveUserData();
});

// Export functions for global access
window.showPage = showPage;
window.handleGoogleLogin = handleGoogleLogin;
window.handleGuestLogin = handleGuestLogin;
window.handleLogout = handleLogout;
window.restartGame = restartGame;
window.closeModal = closeModal;
