import './styles.css';
import init, { Game } from '../rust/pkg/aviator_wasm.js';

let game;
let balance = 1000;
let currentBet = 0;
let animationFrameId = null;
let isGameRunning = false;
let lastMultiplier = 1.00;
let planeImage = null;

// DOM Elements
const multiplierDisplay = document.getElementById('multiplier');
const crashPointDisplay = document.getElementById('crash-point');
const betInput = document.getElementById('bet-amount');
const placeBetButton = document.getElementById('place-bet');
const cashOutButton = document.getElementById('cash-out');
const balanceDisplay = document.getElementById('balance');
const historyList = document.getElementById('history-list');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Plane properties
const plane = {
    x: 50,
    y: 100,
    width: 100,  // Increased width for larger plane
    height: 50,  // Increased height for larger plane
    angle: 0,
    speed: 2
};

// Load plane image
function loadPlaneImage() {
    planeImage = new Image();
    planeImage.src = 'assets/plane.png';
    planeImage.onload = () => {
        // Initial plane draw
        drawPlane();
    };
    planeImage.onerror = () => {
        console.error('Failed to load plane image');
        // Fallback to drawing a simple plane shape
        drawSimplePlane();
    };
}

// Draw a simple plane shape as fallback
function drawSimplePlane() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw ground
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 20);
    ctx.lineTo(canvas.width, canvas.height - 20);
    ctx.strokeStyle = '#666';
    ctx.stroke();
    
    // Save the current context state
    ctx.save();
    
    // Move to plane position and rotate
    ctx.translate(plane.x, plane.y);
    ctx.rotate(plane.angle);
    
    // Draw plane body
    ctx.fillStyle = '#3498db';
    ctx.fillRect(-plane.width/2, -plane.height/2, plane.width, plane.height);
    
    // Draw wings
    ctx.fillStyle = '#2980b9';
    ctx.beginPath();
    ctx.moveTo(-plane.width/2, -plane.height/2);
    ctx.lineTo(-plane.width/2 - 20, -plane.height/2 - 10);
    ctx.lineTo(-plane.width/2 + 20, -plane.height/2 - 10);
    ctx.closePath();
    ctx.fill();
    
    // Restore the context state
    ctx.restore();
}

// Draw the plane
function drawPlane() {
    if (!planeImage) {
        drawSimplePlane();
        return;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw ground
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 20);
    ctx.lineTo(canvas.width, canvas.height - 20);
    ctx.strokeStyle = '#666';
    ctx.stroke();
    
    // Save the current context state
    ctx.save();
    
    // Move to plane position and rotate
    ctx.translate(plane.x, plane.y);
    ctx.rotate(plane.angle + Math.PI/2); // Add 90 degrees (Math.PI/2) to the rotation
    
    // Draw plane image with adjusted size
    ctx.drawImage(
        planeImage,
        -plane.width/2,
        -plane.height/2,
        plane.width,
        plane.height
    );
    
    // Restore the context state
    ctx.restore();
}

// Update plane position
function updatePlane(multiplier) {
    // Calculate angle based on multiplier (adjusted for 180-degree rotation)
    plane.angle = Math.min(Math.PI / 4, (multiplier - 1) * 0.1);
    
    // Update position with smoother movement
    plane.x += plane.speed;
    plane.y = 100 - (multiplier - 1) * 15; // Reduced vertical movement for smoother flight
    
    // Keep plane within canvas bounds
    if (plane.x > canvas.width - 50) {
        plane.x = canvas.width - 50;
    }
    if (plane.y < 20) {
        plane.y = 20;
    }
    if (plane.y > canvas.height - 40) {
        plane.y = canvas.height - 40;
    }
}

// Game loop
function gameLoop() {
    if (!isGameRunning) {
        cancelAnimationFrame(animationFrameId);
        return;
    }

    const multiplier = game.update_multiplier();
    lastMultiplier = multiplier;
    updateMultiplierDisplay(multiplier);
    updatePlane(multiplier);
    drawPlane();

    if (!game.is_running()) {
        crashPointDisplay.textContent = `Crashed at ${lastMultiplier.toFixed(2)}x`;
        addToHistory(lastMultiplier, false);
        placeBetButton.disabled = false;
        cashOutButton.disabled = true;
        isGameRunning = false;
        return;
    }

    animationFrameId = requestAnimationFrame(gameLoop);
}

// Update the multiplier display
function updateMultiplierDisplay(multiplier) {
    multiplierDisplay.textContent = `${multiplier.toFixed(2)}x`;
}

// Update the balance display
function updateBalanceDisplay() {
    balanceDisplay.textContent = balance.toFixed(2);
}

// Add a result to the history
function addToHistory(multiplier, won) {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.style.color = won ? '#2ecc71' : '#e74c3c';
    historyItem.textContent = `${multiplier.toFixed(1)}x`;
    historyList.insertBefore(historyItem, historyList.firstChild);
    
    // Keep only the last 10 results
    if (historyList.children.length > 10) {
        historyList.removeChild(historyList.lastChild);
    }
}

// Initialize WebAssembly
async function initGame() {
    await init();
    game = new Game();
    updateBalanceDisplay();
    
    // Load plane image
    loadPlaneImage();
}

// Event Listeners
placeBetButton.addEventListener('click', () => {
    const betAmount = parseFloat(betInput.value);
    if (betAmount <= 0 || betAmount > balance) {
        alert('Invalid bet amount!');
        return;
    }

    currentBet = betAmount;
    balance -= betAmount;
    updateBalanceDisplay();

    // Reset plane position
    plane.x = 50;
    plane.y = 100;
    plane.angle = 0;
    lastMultiplier = 1.00;

    game.start_game();
    crashPointDisplay.textContent = '';
    placeBetButton.disabled = true;
    cashOutButton.disabled = false; // Enable cash-out button when game starts
    isGameRunning = true;

    gameLoop();
});

cashOutButton.addEventListener('click', () => {
    if (!isGameRunning) return; // Prevent cash-out if game is not running
    
    const winnings = game.cash_out(currentBet);
    balance += winnings;
    updateBalanceDisplay();
    
    addToHistory(lastMultiplier, true);
    placeBetButton.disabled = false;
    cashOutButton.disabled = true;
    isGameRunning = false;
    
    // Cancel the animation frame
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
});

// Initialize the game
initGame().catch(console.error); 