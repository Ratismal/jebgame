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
var debugMode = false;

var timer = 0;
var ouchCount = 0;

var isStarted = false;

var interval;
var startTime;
var audio;
var godMode = false;

var rhinoSpawnRate = 100;
var enemySpawnRate = 500;

const konami = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
var konamiIndex = 0;

var music = [{
    name: 'Brain Power - NOMA',
    artist: 'NOMA',
    url: 'music/brainpower.mp3'
}, {
    name: 'Snow Halation',
    artist: 'μ\'s',
    url: 'music/snowhalation.mp3'
}, {
    name: 'Bring Me To Life',
    artist: 'Evanescence',
    url: 'music/bringmetolife.mp3'
}, {
    name: 'Never Gonna Give You Up',
    artist: 'Rick Astley',
    url: 'music/rolls.mp3'
}]

var sfx = {
    boop: 'music/boop.ogg',
    ouch: 'music/ouch.ogg'
}
var currentSong;

var context;
var bufferLoader;
var bufferList;

var Buffers = {
    OUCH: 0,
    BOOP: 1,
    TADA: 2
}

function update() {
    // if (lives > 3) lives = 0;
    timer++;
    if (ouchCount > 0) ouchCount--;

    if (lives <= 0) {
        gameOver();
    }
    if (getRandomInt(0, rhinoSpawnRate + (timer / 5000)) >= rhinoSpawnRate) spawnRhino();
    if (timer > 3000) {
        if (getRandomInt(0, enemySpawnRate + (timer / 4000)) >= enemySpawnRate) spawnEnemy();
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
                playSound(Buffers.BOOP, 0)
            } else if (entities[i] instanceof Enemy) {
                if (!godMode)
                    lives--;
                entities.splice(i, 1);
                ouchCount = 100;
                playSound(Buffers.OUCH, 0)
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

    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
    ctx.font = "50px Comic Sans MS";

    ctx.fillText('Kidnapped Rhinos: ' + rhinoCount, 5, 50);
    ctx.fillText('Current Song: ' + music[currentSong].name, 5, 100);
    ctx.font = "30px Comic Sans MS";
    ctx.fillText(music[currentSong].artist, 347, 140);

    ctx.font = "50px Comic Sans MS";  
    
    ctx.fillText('Survived for ' + (Math.floor(moment.duration(moment() - startTime).asSeconds() * 10) / 10) + 's', 5, 200);
    if (godMode) {
        ctx.fillStyle = 'red';
        ctx.fillText('JEB IS A GOD', 5, 250);

        ctx.fillStyle = 'black';
    }
    if (debugMode) {
        ctx.fillText('Rhinos In Existence: ' + entities.length, 5, 300)
        ctx.fillText('Timer: ' + timer, 5, 350)
        ctx.fillText('Rhino Spawn Rate: ' + ((rhinoSpawnRate + (timer / 5000))).toFixed(2), 5, 400)
        ctx.fillText('Enemy Spawn Rate: ' + ((enemySpawnRate + (timer / 4000))).toFixed(2), 5, 450)
        
    };
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

function playSong() {
    if (isStarted) {
        if (music.length == 1) {
            audio.play(music[0].url);
        } else {
            var oldSong = currentSong;
            while (oldSong == currentSong) currentSong = getRandomInt(0, music.length - 1);
            audio.src = music[currentSong].url
            audio.play();
        }
    } else {
        audio.play('music/violin.mp3');
    }
}

function init() {


    canvas = document.getElementById("jebGame");
    var div = document.getElementById("canvas");
    audio = document.getElementById('audio');
    audioSfx = document.getElementById('audioSfx');
    audio.addEventListener('ended', playSong);
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
    jeb = new Jeb();

    initAudio();
}

function start() {
    startTime = moment();
    currentSong = getRandomInt(0, music.length - 1);
    var song = music[currentSong];
    audio.src = song.url
    songTitle = song.name
    audio.volume = 0.2
    audio.play();
    lives = 3;
    timer = 0;
    interval = setInterval(update, 10);
    spawnRhino();

}

function gameOver() {
    audio.src = 'music/violin.mp3'
    audio.play();
    clearInterval(interval);
    setTimeout(function () {
        ctx.fillText('Uh oh!', jeb.x + jeb.width, jeb.y - jeb.height)
    }, 40)
    setTimeout(function () {
        entities = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = "30px Comic Sans MS";

        ctx.fillText('It looks like you weren\'t enerJEBic enough.', 40, 100)
        ctx.fillText('Press \'enter\' to try again.', 40, 200);

        isStarted = false;
    }, 1000)

}

function keyDownHandler(e) {
    if (konamiIndex == konami.length) {
        switch (e.keyCode) {
            case 13:
                godMode = !godMode;
                playSound(Buffers.TADA, 0);
                break;
            case 27:
                debugMode = !debugMode;
                playSound(Buffers.TADA, 0);                
                break;
        }

    }
    if (e.keyCode == konami[konamiIndex]) {
        konamiIndex++;
    } else konamiIndex = 0;


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
        if (!width) width = rhinoRadius + getRandomInt(-20, 20);
        if (!height) height = rhinoRadius + getRandomInt(-20, 20);
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
        if (!dy) dy = 1 + (getRandomInt(-20, 40) / 20) + (timer / 10000);
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

function initAudio() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();

    bufferLoader = new BufferLoader(
        context, [
            'sfx/ouch.ogg',
            'sfx/boop.ogg',
            'sfx/tada.ogg'
        ],
        finishedLoading
    );

    bufferLoader.load();
}


function finishedLoading(bList) {
    bufferList = bList;
}

function playSound(id, time) {
    var source = context.createBufferSource();
    source.buffer = bufferList[id];
    source.connect(context.destination);
    source.start(time);
}

function BufferLoader(context, urlList, callback) {
    this.context = context;
    this.urlList = urlList;
    this.onload = callback;
    this.bufferList = new Array();
    this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function (url, index) {
    // Load buffer asynchronously
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    var loader = this;

    request.onload = function () {
        // Asynchronously decode the audio file data in request.response
        loader.context.decodeAudioData(
            request.response,
            function (buffer) {
                if (!buffer) {
                    alert('error decoding file data: ' + url);
                    return;
                }
                loader.bufferList[index] = buffer;
                if (++loader.loadCount == loader.urlList.length)
                    loader.onload(loader.bufferList);
            },
            function (error) {
                console.error('decodeAudioData error', error);
            }
        );
    }

    request.onerror = function () {
        alert('BufferLoader: XHR error');
    }

    request.send();
}

BufferLoader.prototype.load = function () {
    for (var i = 0; i < this.urlList.length; ++i)
        this.loadBuffer(this.urlList[i], i);
}