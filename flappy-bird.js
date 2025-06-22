const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GRAVITY = 0.5;
const JUMP_STRENGTH = -8;
const PIPE_WIDTH = 80;
const PIPE_GAP = 150;
const PIPE_SPEED = 3;
const BIRD_SIZE = 30;

let gameState = 'start';
let score = 0;
let highScore = localStorage.getItem('flappyHighScore') || 0;

const bird = {
    x: 100,
    y: canvas.height / 2,
    velocity: 0,
    rotation: 0
};

let pipes = [];
let frameCount = 0;

const ground = {
    x: 0,
    y: canvas.height - 60,
    height: 60
};

document.getElementById('highScore').textContent = highScore;

function drawBird() {
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(bird.rotation);
    
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(0, 0, BIRD_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.arc(5, -5, BIRD_SIZE / 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(8, -5, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#FF6347';
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(20, 0);
    ctx.lineTo(15, 5);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}

function drawPipe(pipe) {
    const gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
    gradient.addColorStop(0, '#74BF2E');
    gradient.addColorStop(0.5, '#5DA024');
    gradient.addColorStop(1, '#478020');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
    ctx.fillRect(pipe.x, pipe.topHeight + PIPE_GAP, PIPE_WIDTH, canvas.height - pipe.topHeight - PIPE_GAP - ground.height);
    
    ctx.fillStyle = '#5DA024';
    ctx.fillRect(pipe.x - 5, pipe.topHeight - 30, PIPE_WIDTH + 10, 30);
    ctx.fillRect(pipe.x - 5, pipe.topHeight + PIPE_GAP, PIPE_WIDTH + 10, 30);
    
    ctx.strokeStyle = '#3A5F1F';
    ctx.lineWidth = 2;
    ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
    ctx.strokeRect(pipe.x, pipe.topHeight + PIPE_GAP, PIPE_WIDTH, canvas.height - pipe.topHeight - PIPE_GAP - ground.height);
}

function drawGround() {
    ctx.fillStyle = '#DED895';
    ctx.fillRect(0, ground.y, canvas.width, ground.height);
    
    ctx.fillStyle = '#E4D4A1';
    for (let i = 0; i < canvas.width; i += 20) {
        ctx.fillRect(i, ground.y, 10, 10);
    }
    
    ground.x -= PIPE_SPEED;
    if (ground.x <= -20) {
        ground.x = 0;
    }
}

function drawBackground() {
    const cloudY = [50, 100, 150];
    const cloudX = [(frameCount * 0.5) % (canvas.width + 100), (frameCount * 0.3 + 200) % (canvas.width + 100), (frameCount * 0.4 + 400) % (canvas.width + 100)];
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    cloudX.forEach((x, i) => {
        ctx.beginPath();
        ctx.arc(x - 100, cloudY[i], 25, 0, Math.PI * 2);
        ctx.arc(x - 70, cloudY[i], 35, 0, Math.PI * 2);
        ctx.arc(x - 40, cloudY[i], 25, 0, Math.PI * 2);
        ctx.fill();
    });
}

function updateBird() {
    bird.velocity += GRAVITY;
    bird.y += bird.velocity;
    
    bird.rotation = Math.min(Math.max(bird.velocity * 0.1, -0.5), 0.5);
    
    if (bird.y < BIRD_SIZE / 2) {
        bird.y = BIRD_SIZE / 2;
        bird.velocity = 0;
    }
}

function updatePipes() {
    if (frameCount % 90 === 0) {
        const topHeight = Math.random() * (canvas.height - PIPE_GAP - ground.height - 100) + 50;
        pipes.push({
            x: canvas.width,
            topHeight: topHeight,
            passed: false
        });
    }
    
    pipes.forEach((pipe, index) => {
        pipe.x -= PIPE_SPEED;
        
        if (!pipe.passed && pipe.x + PIPE_WIDTH < bird.x) {
            pipe.passed = true;
            score++;
            document.getElementById('score').textContent = score;
        }
        
        if (pipe.x + PIPE_WIDTH < 0) {
            pipes.splice(index, 1);
        }
    });
}

function checkCollision() {
    if (bird.y + BIRD_SIZE / 2 > ground.y) {
        return true;
    }
    
    for (let pipe of pipes) {
        if (bird.x + BIRD_SIZE / 2 > pipe.x && bird.x - BIRD_SIZE / 2 < pipe.x + PIPE_WIDTH) {
            if (bird.y - BIRD_SIZE / 2 < pipe.topHeight || bird.y + BIRD_SIZE / 2 > pipe.topHeight + PIPE_GAP) {
                return true;
            }
        }
    }
    
    return false;
}

function jump() {
    if (gameState === 'playing') {
        bird.velocity = JUMP_STRENGTH;
    }
}

function startGame() {
    gameState = 'playing';
    score = 0;
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    frameCount = 0;
    document.getElementById('score').textContent = score;
    document.getElementById('startScreen').classList.remove('show');
    document.getElementById('gameOver').classList.remove('show');
}

function gameOver() {
    gameState = 'over';
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('flappyHighScore', highScore);
        document.getElementById('highScore').textContent = highScore;
    }
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').classList.add('show');
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBackground();
    
    if (gameState === 'playing') {
        updateBird();
        updatePipes();
        
        if (checkCollision()) {
            gameOver();
        }
    }
    
    pipes.forEach(drawPipe);
    drawGround();
    drawBird();
    
    frameCount++;
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'start') {
            startGame();
        } else {
            jump();
        }
    }
});

canvas.addEventListener('click', () => {
    if (gameState === 'start') {
        startGame();
    } else {
        jump();
    }
});

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);

document.getElementById('startScreen').classList.add('show');

gameLoop();