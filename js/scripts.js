/**
 * Created by ratismal
 */
var canvas;
var ctx;

var entities = [];

var rhinoRadius = 100;
var lives = 3;

var jeb;
var rhinoCount = 0;

var rightPressed = false;
var leftPressed = false;
var debugMode = true;

var timer = 0;
var ouchCount = 0;

var isStarted = false;

function update() {
    if (lives > 3) lives = 0;
    timer++;
    if (ouchCount > 0) ouchCount--;

    if (lives == 0) {
        lives--;
        alert("It looks like you weren't enerJEBic enough.");
        document.location.reload();
    }
    if (getRandomInt(0, 100 + (timer / 1000)) == 10) spawnRhino();
    if (timer > 3000) {
        if (getRandomInt(0, 500 + (timer / 800)) == 10) spawnEnemy();
    }
    jeb.update();
    //   console.log('Jeb: ', 'x1', jeb.x, 'y1', jeb.y, 'x2', jeb.x + jeb.width, 'y2', jeb.y + jeb.height)

    for (var i = 0; i < entities.length; i++) {
        //   console.log('Rhino: ', 'x1', entities[i].x, 'y1', entities[i].y, 'x2', entities[i].x + entities[i].width, 'y2', entities[i].y + entities[i].height)
        if (entities[i].update().y > canvas.height) {
            entities.splice(i, 1);
        } else if (jeb.checkCollision(entities[i])) {
            if (entities[i] instanceof Rhino) {
                rhinoCount++;
                entities.splice(i, 1);
            } else if (entities[i] instanceof Enemy) {
                lives--;
                entities.splice(i, 1);
                ouchCount = 100;
            }
        }
    }

    if (rightPressed && jeb.x < canvas.width - jeb.width) {
        jeb.dx = 6;
    } else if (leftPressed && jeb.x > 0) {
        jeb.dx = -6;
    } else {
        jeb.dx = 0;
    }

    draw()
}

function draw() {
    ctx.font = "50px Comic Sans MS";

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillText('Kidnapped Rhinos: ' + rhinoCount, 5, 50);

    if (debugMode) {
        ctx.fillText('Rhinos In Existence: ' + entities.length, 5, 100)
        ctx.fillText('Timer: ' + timer, 5, 150)
        
    };
    if (ouchCount > 0) {
        ctx.font = "80px Comic Sans MS";

        ctx.fillText('Ouch!', jeb.x + jeb.width, jeb.y + jeb.height / 2)
    }
    for (var i = 0; i < entities.length; i++) {
        entities[i].draw();
    }
    for (let i = 0; i < lives; i++) {
        ctx.drawImage(imgLife, canvas.width - (i * 120 + 120), 15, 100, 100);
    }
    jeb.draw();

    ctx.strokeRect(0, 0, 50, 50)
    ctx.strokeRect(0, 50, 50, 50)

}

function checkPosition() {
    if (y + dy < rhinoRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - rhinoRadius) {
        if (x > jebX && x < jebX + jeb.width) {
            dy = -dy;
        } else {
            // alert("GAME OVER");
            // document.location.reload();
        }
    }
}

function init() {
    canvas = document.getElementById("jebGame");
    var div = document.getElementById("canvas");
    canvas.width = div.clientWidth;
    canvas.height = div.clientHeight;
    ctx = canvas.getContext("2d");
    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    ctx.font = "30px Comic Sans MS";
    ctx.fillText('Your name is Jeb.', 40, 50)
    ctx.fillText('You have an insatiable rhino addiction.', 40, 100);
    ctx.fillText('Get as many as you can, but don\'t get caught by b1nzy!', 40, 150);
    ctx.fillText('Press \'enter\' to begin.', 40, 200);

}

function start() {
    jeb = new Jeb();
    setInterval(update, 10);
    spawnRhino();
}

function keyDownHandler(e) {
    if (e.keyCode == 13 && !isStarted) {
        isStarted = true;
        start();
    }
    if (e.keyCode == 39) {
        rightPressed = true;
    } else if (e.keyCode == 37) {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.keyCode == 39) {
        rightPressed = false;
    } else if (e.keyCode == 37) {
        leftPressed = false;
    }
}


function spawnRhino() {
    entities.push(new Rhino())
}

function spawnEnemy() {
    entities.push(new Enemy())
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class GameObject {
    constructor(x, y, width, height, dx, dy, img) {
        this.x = x;
        this.y = y;
        this.dy = dy;
        this.dx = dx;
        this.width = width;
        this.height = height;
        this.img = img;
    }

    update() {
        this.y += this.dy;
        this.x += this.dx;
        return {
            x: this.x,
            y: this.y
        };
    }

    draw() {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        if (debugMode === true) {
            ctx.strokeStyle = '#ff0000';
            ctx.strokeRect(this.x, this.y, this.width, this.height)
        }
    }

    checkCollision(gameObject) {
        var collides = false;
        if (gameObject instanceof GameObject) {
            if ((gameObject.y + gameObject.height >= this.y) &&
                ((gameObject.x >= this.x && gameObject.x <= this.x + this.width) ||
                    (gameObject.x + gameObject.width >= this.x &&
                        gameObject.x + gameObject.width <= this.x + this.width)))
                collides = true
        }
        return collides;
    }
}

class Jeb extends GameObject {
    constructor(x, y, width, height, dx, dy, img) {
        if (!width) width = 90 * 2;
        if (!height) height = 82 * 2;
        if (!x) x = (canvas.width - width) / 2;
        if (!y) y = canvas.height - height;
        if (!dy) dy = 0;
        if (!dx) dx = 0;

        if (!img) img = imgJeb;
        super(x, y, width, height, dx, dy, img)
    }

    update() {
        super.update();
    }

    draw() {
        super.draw();
    }
}

class Rhino extends GameObject {
    constructor(x, y, width, height, dx, dy, img) {
        //
        if (!dy) dy = 2 + (getRandomInt(-10, 10) / 20);
        if (!dx) dx = 0;
        if (!width) width = rhinoRadius + getRandomInt(-10, 10);
        if (!height) height = rhinoRadius + getRandomInt(-10, 10);
        if (!img) img = imgRhino;
        if (!x) x = getRandomInt(0 + width, canvas.width - width);
        if (!y) y = -50;
        super(x, y, width, height, dx, dy, img);
    }

    update() {
        return super.update();
    }

    draw() {
        super.draw();
    }

}

class Enemy extends GameObject {
    constructor(x, y, width, height, dx, dy, img) {
        if (!dy) dy = 1 + (getRandomInt(-20, 40) / 20);
        if (!dx) dx = 0;
        if (!width) width = rhinoRadius + getRandomInt(-10, 10);
        if (!height) height = rhinoRadius + getRandomInt(-10, 10);
        if (!img) img = imgEnemy;
        if (!x) x = getRandomInt(0 + width, canvas.width - width);
        if (!y) y = -50;
        super(x, y, width, height, dx, dy, img);
    }

    update() {
        return super.update();
    }

    draw() {
        super.draw();
    }

}