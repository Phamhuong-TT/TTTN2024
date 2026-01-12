// requestAnimationFrame
window.requestAnimationFrame =
  window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame;

// ================== CANVAS ==================
var canva = document.getElementById("universe");
var universe = canva.getContext("2d");

var width, height;
var starDensity = 0.00025;
var starCount;
var stars = [];

var giantColor = "180,184,240";
var cometColor = "226,225,224";

// ================== COLOR ==================
function randomStarColor() {
  const colors = [
    "255,255,255",   // trắng
    "255,159,243",   // hồng
    "72,219,251",    // xanh dương
    "254,202,87",    // vàng
    "29,209,161",    // xanh ngọc
    "95,39,205"      // tím
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// ================== STAR ==================
function Star() {
  this.reset();
}

Star.prototype.reset = function () {
  this.giant = getProbability(3);
  this.comet = this.giant ? false : getProbability(10);

  this.x = Math.random() * width;
  this.y = Math.random() * height;
  this.r = Math.random() * 1.5 + 0.5;

  this.dx = Math.random() * 0.2;
  this.dy = Math.random() * 0.2;

  this.opacity = Math.random();
  this.fadingOut = false;

  this.color = randomStarColor(); // 🌈 màu riêng
};

Star.prototype.draw = function () {
  universe.beginPath();

  if (this.giant) {
    universe.fillStyle = "rgba(" + giantColor + "," + this.opacity + ")";
    universe.arc(this.x, this.y, 2, 0, 2 * Math.PI);

  } else if (this.comet) {
    universe.fillStyle = "rgba(" + cometColor + "," + this.opacity + ")";
    universe.arc(this.x, this.y, 1.5, 0, 2 * Math.PI);

    // comet tail
    for (var i = 0; i < 30; i++) {
      universe.fillStyle =
        "rgba(" +
        cometColor +
        "," +
        (this.opacity - (this.opacity / 20) * i) +
        ")";
      universe.fillRect(
        this.x - (this.dx / 4) * i,
        this.y - (this.dy / 4) * i,
        2,
        2
      );
    }

  } else {
    // 🌈 sao thường đa màu
    universe.fillStyle = `rgba(${this.color}, ${this.opacity})`;
    universe.fillRect(this.x, this.y, this.r, this.r);
  }

  universe.closePath();
};

Star.prototype.move = function () {
  this.x += this.dx;
  this.y += this.dy;

  if (!this.fadingOut) {
    this.reset();
  }

  if (this.x > width || this.y < 0) {
    this.fadingOut = true;
  }
};

// ================== UTILS ==================
function getProbability(percents) {
  return Math.floor(Math.random() * 1000) + 1 < percents * 10;
}

function getRandInterval(min, max) {
  return Math.random() * (max - min) + min;
}

// ================== RESIZE ==================
function windowResizeHandler() {
  width = window.innerWidth;
  height = window.innerHeight;
  starCount = width * starDensity;

  canva.width = width;
  canva.height = height;
}
window.addEventListener("resize", windowResizeHandler);

// ================== INIT ==================
function createUniverse() {
  windowResizeHandler();
  stars = [];

  for (var i = 0; i < starCount; i++) {
    stars.push(new Star());
  }
}

// ================== ANIMATE ==================
function animate() {
  universe.clearRect(0, 0, width, height);

  for (var i = 0; i < stars.length; i++) {
    stars[i].draw();
    stars[i].move();
  }

  requestAnimationFrame(animate);
}

// ================== START ==================
createUniverse();
animate();
