// THE CANVAS ELEMENT AND CONTEXT
const canva = document.querySelector("#canva");
const ctx = canva.getContext("2d");

// GAME STATE
const MAX_LEVELS = 2;
let LEVEL = 1;
let LIFE = 3;
let SCORE = 0;
let GAME_OVER = false;

// PADDLE SIZES
const PADDLE_WIDTH = 110;
const PADDLE_HEIGHT = 25;
const PADDING_BOTTOM = 90; // distance between bottom of canvas and the paddle

// GAME SOUNDS
const gameOverAudio = new Audio();
gameOverAudio.src = "sounds/game-over.wav";
const hitWallAudio = new Audio();
hitWallAudio.src = "sounds/hitwall.wav";
const hitBrick = new Audio();
hitBrick.src = "sounds/hitBrick.wav";
const newLevel = new Audio();
newLevel.src = "sounds/successt.mp3";
const winner = new Audio();
winner.src = "sounds/Victory.m4a";


// COMPONENTS OF THE GAME
// the paddle
const paddle = {
    x: (canva.width-PADDLE_WIDTH)/2,
    y: canva.height-(PADDING_BOTTOM + PADDLE_HEIGHT),
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    color: "crimson",
    dx: 10
}
// the ball 
const ball = {
    x: paddle.x + paddle.width/2,
    y: paddle.y - 15,
    width: 15,
    height: 15,
    radius: 15,
    speed: 5,
    velocityX: 5*(Math.random()*4-1),
    velocityY: 5,
    color: "skyblue"
}
// the brick
const brick = {
    width: 60,
    height: 20,
    row: 3, 
    column: 6,
    fillColor: "darkblue",
    strokeColor: "white",
    marginTop: 40,
    offsetTop: 20,
    offsetLeft: 20,
}

// DRAW THE BRICKS

// DRAW THE BALL & PADDLE INTO THE CANVAS
// draw the ball
const drawCircle = (x, y, r, width, height, color)=>{
    ctx.fillStyle = color;
    ctx.strokeStyle = "gold";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2, width, height);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
};
// draw the paddle
const drawRect = (x, y, width, height, color)=>{
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = "gold";
    ctx.strokeRect(x, y, width, height);
};

// MAKE BRICKS
let bricks = [];
const makeBricks = ()=>{
    for(let r = 0; r < brick.row; r++){
        bricks[r] = [];
        for(let c = 0; c < brick.column; c++){
            bricks[r][c] = {
                x: brick.offsetLeft + c*(brick.width + brick.offsetLeft),
                y: brick.marginTop + brick.offsetTop + r*(brick.offsetTop + brick.height),
                status: true
            };
        }
    }
}
makeBricks();

// DRAW BRICKS
const drawBricks = ()=>{
    for(let r = 0; r < brick.row; r++){
        for(let c = 0; c < brick.column; c++){
            let b = bricks[r][c];
            if(b.status){
                drawRect(bricks[r][c].x, bricks[r][c].y, brick.width, brick.height, "white"); 
            }
        }
    }
}

// COLLISION DETECTION
// detect collision between the paddle & the ball
const ballPaddleCollision = ()=>{
    if(ball.y > paddle.y && ball.y < paddle.y + paddle.height && ball.x > paddle.x && ball.x < paddle.x + paddle.width){
        let collidePoint = ball.x - (paddle.x + paddle.width/2);
        collidePoint = collidePoint/(paddle.width/2);
        let angle = collidePoint*(Math.PI/3);

        ball.velocityX = ball.speed*Math.sin(angle);
        ball.velocityY = -ball.speed*Math.cos(angle);
    }
}
// detect collision between the bricks & the ball
const ballBrickCollision = ()=>{
    for(let r = 0; r < brick.row; r++){
        for(let c = 0; c < brick.column; c++){
            let b = bricks[r][c];
            if(b.status){
                if(ball.x + ball.radius > b.x && ball.x + ball.radius < b.x + brick.width && ball.y + ball.radius > b.y && ball.y - ball.radius < b.y + brick.height){
                    hitBrick.play();
                    b.status = false;
                    ball.velocityY = -ball.velocityY;
                    SCORE += 5;

                }
            }
        }
    }
}

// LEVEL UP
const levelUp = ()=>{
    let isLevelDone = true;
    for(let r = 0; r < brick.row; r++){
        for(let c = 0; c < brick.column; c++){
            isLevelDone = isLevelDone && !bricks[r][c].status;
        }
    }
    if(isLevelDone){
        if(LEVEL >= MAX_LEVELS){
            winner.play();
            document.querySelector(".game-winned").style.opacity = "0.8";
            GAME_OVER = true;
            return;
        }
        newLevel.play();
        brick.row++;
        makeBricks();
        ball.speed += 0.1;
        resetBall();
        LEVEL++;
    }
}

// CHECKING IF THE GAME IS OVER
const gameOver = ()=>{
    if(LIFE <= 0){
        gameOverAudio.play();
        document.querySelector(".game-over").style.opacity = "0.8";
        GAME_OVER = true;
    }
}

// RESET THE BALL
const resetBall = ()=>{
    ball.x = paddle.x + paddle.width/2;
    ball.y = paddle.y - 15;
    ball.velocityX = 5 * (Math.random()*4-1);
    ball.velocityY = -5;
    ball.speed = 5;
}

// DETECT COLLISION BETWEEN THE PADDLE & THE BALL
const ballWallCollision = ()=>{
    if(ball.x + ball.radius > canva.width || ball.x - ball.radius < 0){
        hitWallAudio.play();
        ball.velocityX = -ball.velocityX;
    }
    if(ball.y - ball.radius < 0){
        hitWallAudio.play();
        ball.velocityY = -ball.velocityY;
    }
    if(ball.y + ball.radius > canva.height){
        LIFE--;
        resetBall();
    }
}

// MOVING THE PADDLE
let leftArrow = false;
let rightArrow = false;
document.addEventListener("keydown", (e)=>{
    if(e.keyCode === 37){
        leftArrow = true;
    }
    if(e.keyCode === 39){
        rightArrow = true;
    }
});
document.addEventListener("keyup", (e)=>{
    if(e.keyCode === 37){
        leftArrow = false;
    }
    if(e.keyCode === 39){
        rightArrow = false;
    }
});

const movePaddle = ()=>{
    if(leftArrow && paddle.x > 0){
        paddle.x -= paddle.dx;
    }
    if(rightArrow && paddle.x + paddle.width < canva.width){
        paddle.x += paddle.dx;
    }
}

// MOVING THE BALL
const moveBall = ()=>{
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
}

// DRAW GAME STATE
const drawText = (text, x, y, color)=>{
    ctx.fillStyle = color;
    ctx.font = "27px monospace";
    ctx.fillText(text, x, y);
} 

// DRAW IMAGES
const scoreImg = new Image();
scoreImg.src = "images/score.png";
const levelImg = new Image();
levelImg.src = "images/flag.png";
const lifeImg = new Image();
lifeImg.src = "images/heart-icon.png";

const drawImg = (img, x, y)=>{
    ctx.drawImage(img, x, y, 25, 25);
}

// RENDER ELEMENTS TO THE CANVAS
const render = ()=>{
    drawRect(paddle.x, paddle.y, paddle.width, paddle.height, paddle.color);
    drawCircle(ball.x, ball.y, ball.radius, ball.width, ball.height, ball.color);
    drawBricks();
    drawText(SCORE, 35, 35, "white");
    drawText(LIFE, canva.width - 30, 35, "white");
    drawText(LEVEL, canva.width/2 +10, 32, "white");
    drawImg(scoreImg, 8, 12);
    drawImg(levelImg, canva.width/2-15, 12);
    drawImg(lifeImg, canva.width-55, 12);
};

// UPDATE THE BALL COORDINATES
const update = ()=>{
    moveBall();
    movePaddle();
    ballWallCollision();
    ballPaddleCollision();
    ballBrickCollision();
    gameOver();
    levelUp();
}

let moveStart = Date.now();
const loop = ()=>{
    drawRect(0, 0, canva.width, canva.height, "#2196F3");
    update();
    render();
    let now = Date.now();
    let delta = now - moveStart;
    if(delta > 1000){
        moveStart = Date.now();
    }
    if(!GAME_OVER){
        requestAnimationFrame(loop);
    }
}
loop();
