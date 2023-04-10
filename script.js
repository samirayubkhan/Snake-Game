const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const highScoresList = document.getElementById('high-scores');
const tileSize = 20;
const easyButton = document.getElementById('easy-button');
const mediumButton = document.getElementById('medium-button');
const hardButton = document.getElementById('hard-button');
let snake, food, score, highScore, gameOver, interval;

easyButton.addEventListener('click', () => {
    clearInterval(interval);
    interval = setInterval(gameLoop, 200);
    easyButton.classList.add('easy');
    mediumButton.classList.remove('medium');
    hardButton.classList.remove('hard');
});

mediumButton.addEventListener('click', () => {
    clearInterval(interval);
    interval = setInterval(gameLoop, 100);
    easyButton.classList.remove('easy');
    mediumButton.classList.add('medium');
    hardButton.classList.remove('hard');
});

hardButton.addEventListener('click', () => {
    clearInterval(interval);
    interval = setInterval(gameLoop, 50);
    easyButton.classList.remove('easy');
    mediumButton.classList.remove('medium');
    hardButton.classList.add('hard');
});

class Snake {
    constructor() {
        this.body = [
            { x: canvas.width / 2, y: canvas.height / 2 },
            { x: canvas.width / 2 - tileSize, y: canvas.height / 2 },
            { x: canvas.width / 2 - tileSize * 2, y: canvas.height / 2 },
        ];
        this.direction = 'right';
        this.newDirection = null;
    }

    update() {
        if (this.newDirection) {
            this.direction = this.newDirection;
            this.newDirection = null;
        }

        const head = { ...this.body[0] };

        switch (this.direction) {
            case 'right':
                head.x += tileSize;
                break;
            case 'left':
                head.x -= tileSize;
                break;
            case 'up':
                head.y -= tileSize;
                break;
            case 'down':
                head.y += tileSize;
                break;
        }

        this.body.unshift(head);
        this.body.pop();
    }

    changeDirection(newDirection) {
        const oppositeDirections = {
            right: 'left',
            left: 'right',
            up: 'down',
            down: 'up',
        };

        if (newDirection !== oppositeDirections[this.direction]) {
            this.newDirection = newDirection;
        }
    }

    grow() {
        const tail = { ...this.body[this.body.length - 1] };
        this.body.push(tail);
    }
}

class Food {
    constructor() {
        this.position = this.generateNewPosition();
    }

    generateNewPosition() {
        return {
            x: Math.floor(Math.random() * (canvas.width / tileSize)) * tileSize,
            y: Math.floor(Math.random() * (canvas.height / tileSize)) * tileSize,
        };
    }

    newPosition() {
        this.position = this.generateNewPosition();
    }
}

function init() {
    const startButton = document.getElementById('start-button');
    startButton.addEventListener('click', startGame);

    snake = new Snake();
    food = new Food();
    score = 0;
    highScore = parseInt(localStorage.getItem('highScore')) || 0;
    highScoreElement.innerText = highScore;
    gameOver = false;

    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowUp':
                snake.changeDirection('up');
                break;
            case 'ArrowDown':
                snake.changeDirection('down');
                break;
            case 'ArrowLeft':
                snake.changeDirection('left');
                break;
            case 'ArrowRight':
                snake.changeDirection('right');
                break;
        }
    });

    document.getElementById('play-again-button').addEventListener('click', () => {
        hideGameOverPopup();
        startGame();
    });

    draw(); // Initial draw of the snake and food
}

function startGame() {
    init();
    clearInterval(interval);
    interval = setInterval(gameLoop, 200);
}

function gameLoop() {
    snake.update();
    checkCollisions();
    draw();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'yellow';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    snake.body.forEach((segment) => {
        ctx.fillRect(segment.x, segment.y, tileSize, tileSize);
        ctx.strokeRect(segment.x, segment.y, tileSize, tileSize);
    });

    ctx.fillStyle = 'blue';
    ctx.fillRect(food.position.x, food.position.y, tileSize, tileSize);
}

function checkCollisions() {
    const head = snake.body[0];

    if (
        head.x < 0 ||
        head.x >= canvas.width ||
        head.y < 0 ||
        head.y >= canvas.height
    ) {
        gameOver = true;
    }

    for (let i = 1; i < snake.body.length; i++) {
        if (head.x === snake.body[i].x && head.y === snake.body[i].y) {
            gameOver = true;
        }
    }

    if (head.x === food.position.x && head.y === food.position.y) {
        food.newPosition();
        snake.grow();
        score++;
        scoreElement.innerText = score;
    }

    if (gameOver) {
        clearInterval(interval);
        if (score > highScore) {
            highScore = score;
            highScoreElement.innerText = highScore;
            localStorage.setItem('highScore', highScore);
            promptAndUpdateHighScores();
        }
        showGameOverPopup();
        return;
    }
}

function updateHighScoreList() {
    highScoresList.innerHTML = '';
    const highScores = loadHighScores();

    highScores.forEach((scoreObj) => {
        const li = document.createElement('li');
        li.innerText = `${scoreObj.name}: ${scoreObj.score}`;
        highScoresList.appendChild(li);
    });
}

function loadHighScores() {
    const highScoresJSON = localStorage.getItem('highScores');
    return highScoresJSON ? JSON.parse(highScoresJSON) : [];
}

function saveHighScores(highScores) {
    localStorage.setItem('highScores', JSON.stringify(highScores));
}

function promptAndUpdateHighScores() {
    const name = prompt('Congratulations! You set a new high score. Please enter your name:');
    if (!name) return;

    const highScores = loadHighScores();
    highScores.push({ name, score });
    highScores.sort((a, b) => b.score - a.score);

    if (highScores.length > 10) {
        highScores.pop(); // Limit the list to the top 10 scores
    }

    saveHighScores(highScores);
    updateHighScoreList();
}

function showGameOverPopup() {
    const gameOverPopup = document.getElementById('game-over-popup');
    gameOverPopup.style.display = 'block';
}

function hideGameOverPopup() {
    const gameOverPopup = document.getElementById('game-over-popup');
    gameOverPopup.style.display = 'none';
}

init();
updateHighScoreList();
