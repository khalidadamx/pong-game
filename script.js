const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const playerScoreEl = document.getElementById('playerScore');
const computerScoreEl = document.getElementById('computerScore');

const keys = {
  ArrowUp: false,
  ArrowDown: false,
};

const leftPaddle = {
  x: 24,
  y: canvas.height / 2 - 50,
  width: 14,
  height: 100,
  speed: 7,
  score: 0,
  mouseActive: false,
  mouseY: 0,
};

const rightPaddle = {
  x: canvas.width - 38,
  y: canvas.height / 2 - 50,
  width: 14,
  height: 100,
  speed: 5.5,
  score: 0,
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 9,
  speed: 6,
  vx: 5,
  vy: 4,
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function resetBall(direction) {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.speed = 6;

  const angle = randomBetween(-1.2, 1.2);
  ball.vx = direction * (Math.cos(angle) * ball.speed + 1.2);
  ball.vy = Math.sin(angle) * ball.speed;
}

function updateScoreboard() {
  playerScoreEl.textContent = leftPaddle.score;
  computerScoreEl.textContent = rightPaddle.score;
}

function updateLeftPaddle() {
  const moveDir = (keys.ArrowUp ? -1 : 0) + (keys.ArrowDown ? 1 : 0);

  if (leftPaddle.mouseActive) {
    leftPaddle.y = leftPaddle.mouseY - leftPaddle.height / 2;
    leftPaddle.mouseActive = false;
  }

  if (moveDir !== 0) {
    leftPaddle.y += moveDir * leftPaddle.speed;
  }

  leftPaddle.y = clamp(leftPaddle.y, 0, canvas.height - leftPaddle.height);
}

function updateRightPaddle() {
  const paddleCenter = rightPaddle.y + rightPaddle.height / 2;
  const ballCenter = ball.y;

  if (ballCenter > paddleCenter) {
    rightPaddle.y += rightPaddle.speed;
  } else if (ballCenter < paddleCenter) {
    rightPaddle.y -= rightPaddle.speed;
  }

  rightPaddle.y = clamp(rightPaddle.y, 0, canvas.height - rightPaddle.height);
}

function handleBallCollision() {
  if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
    ball.vy *= -1;
    ball.y = clamp(ball.y, ball.radius, canvas.height - ball.radius);
  }

  const leftCollision =
    ball.x - ball.radius <= leftPaddle.x + leftPaddle.width &&
    ball.x - ball.radius >= leftPaddle.x &&
    ball.y >= leftPaddle.y &&
    ball.y <= leftPaddle.y + leftPaddle.height;

  const rightCollision =
    ball.x + ball.radius >= rightPaddle.x &&
    ball.x + ball.radius <= rightPaddle.x + rightPaddle.width &&
    ball.y >= rightPaddle.y &&
    ball.y <= rightPaddle.y + rightPaddle.height;

  if (leftCollision) {
    ball.x = leftPaddle.x + leftPaddle.width + ball.radius;
    const hitPos = (ball.y - (leftPaddle.y + leftPaddle.height / 2)) / (leftPaddle.height / 2);
    const bounceAngle = hitPos * 1.1;
    ball.vx = Math.abs(Math.cos(bounceAngle) * ball.speed + 1.2);
    ball.vy = Math.sin(bounceAngle) * ball.speed;
  }

  if (rightCollision) {
    ball.x = rightPaddle.x - ball.radius;
    const hitPos = (ball.y - (rightPaddle.y + rightPaddle.height / 2)) / (rightPaddle.height / 2);
    const bounceAngle = hitPos * 1.1;
    ball.vx = -Math.abs(Math.cos(bounceAngle) * ball.speed + 1.2);
    ball.vy = Math.sin(bounceAngle) * ball.speed;
  }
}

function update() {
  updateLeftPaddle();
  updateRightPaddle();

  ball.x += ball.vx;
  ball.y += ball.vy;

  handleBallCollision();

  if (ball.x < 0) {
    rightPaddle.score += 1;
    updateScoreboard();
    resetBall(1);
  }

  if (ball.x > canvas.width) {
    leftPaddle.score += 1;
    updateScoreboard();
    resetBall(-1);
  }
}

function drawPaddle(x, y, width, height) {
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(x, y, width, height);
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#fbbf24';
  ctx.fill();
  ctx.closePath();
}

function drawCenterLine() {
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.setLineDash([16, 18]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCenterLine();
  drawPaddle(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
  drawPaddle(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);
  drawBall();
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (event) => {
  if (event.key in keys) {
    keys[event.key] = true;
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key in keys) {
    keys[event.key] = false;
  }
});

canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseY = ((event.clientY - rect.top) / rect.height) * canvas.height;
  leftPaddle.mouseY = mouseY;
  leftPaddle.mouseActive = true;
});

updateScoreboard();
resetBall(1);
requestAnimationFrame(gameLoop);

