/*
 * Settings
 */
var settings = {
  particles: {
    length: 500,       // maximum amount of particles
    duration: 2,       // particle duration in sec
    velocity: 100,     // particle velocity in pixels/sec
    effect: -0.75,     // play with this for a nice effect
    size: 30           // particle size in pixels
  }
};

/*
 * RequestAnimationFrame polyfill
 */
(function () {
  var lastTime = 0;
  var vendors = ["ms", "moz", "webkit", "o"];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
    window.cancelAnimationFrame =
      window[vendors[x] + "CancelAnimationFrame"] ||
      window[vendors[x] + "CancelRequestAnimationFrame"];
  }
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (callback) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function () {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function (id) {
      clearTimeout(id);
    };
  }
})();

/*
 * Point class
 */
function Point(x, y) {
  this.x = x || 0;
  this.y = y || 0;
}
Point.prototype.clone = function () {
  return new Point(this.x, this.y);
};
Point.prototype.length = function (length) {
  if (length === undefined)
    return Math.sqrt(this.x * this.x + this.y * this.y);
  this.normalize();
  this.x *= length;
  this.y *= length;
  return this;
};
Point.prototype.normalize = function () {
  var length = this.length();
  this.x /= length;
  this.y /= length;
  return this;
};

/*
 * Particle class
 */
function Particle() {
  this.position = new Point();
  this.velocity = new Point();
  this.acceleration = new Point();
  this.age = 0;
  this.image = null;
}
Particle.prototype.initialize = function (x, y, dx, dy, image) {
  this.position.x = x;
  this.position.y = y;
  this.velocity.x = dx;
  this.velocity.y = dy;
  this.acceleration.x = dx * settings.particles.effect;
  this.acceleration.y = dy * settings.particles.effect;
  this.age = 0;
  this.image = image;
};
Particle.prototype.update = function (deltaTime) {
  this.position.x += this.velocity.x * deltaTime;
  this.position.y += this.velocity.y * deltaTime;
  this.velocity.x += this.acceleration.x * deltaTime;
  this.velocity.y += this.acceleration.y * deltaTime;
  this.age += deltaTime;
};
Particle.prototype.draw = function (context) {
  function ease(t) {
    return --t * t * t + 1;
  }
  var size =
    this.image.width *
    ease(this.age / settings.particles.duration);
  context.globalAlpha =
    1 - this.age / settings.particles.duration;
  context.drawImage(
    this.image,
    this.position.x - size / 2,
    this.position.y - size / 2,
    size,
    size
  );
};

/*
 * ParticlePool
 */
function ParticlePool(length) {
  this.particles = new Array(length);
  for (var i = 0; i < length; i++)
    this.particles[i] = new Particle();

  this.firstActive = 0;
  this.firstFree = 0;
  this.duration = settings.particles.duration;
}
ParticlePool.prototype.add = function (x, y, dx, dy, image) {
  this.particles[this.firstFree].initialize(x, y, dx, dy, image);

  this.firstFree++;
  if (this.firstFree === this.particles.length) this.firstFree = 0;
  if (this.firstActive === this.firstFree) this.firstActive++;
  if (this.firstActive === this.particles.length) this.firstActive = 0;
};
ParticlePool.prototype.update = function (deltaTime) {
  var i;

  if (this.firstActive < this.firstFree) {
    for (i = this.firstActive; i < this.firstFree; i++)
      this.particles[i].update(deltaTime);
  }
  if (this.firstFree < this.firstActive) {
    for (i = this.firstActive; i < this.particles.length; i++)
      this.particles[i].update(deltaTime);
    for (i = 0; i < this.firstFree; i++)
      this.particles[i].update(deltaTime);
  }

  while (
    this.particles[this.firstActive].age >= this.duration &&
    this.firstActive !== this.firstFree
  ) {
    this.firstActive++;
    if (this.firstActive === this.particles.length)
      this.firstActive = 0;
  }
};
ParticlePool.prototype.draw = function (context) {
  var i;
  if (this.firstActive < this.firstFree) {
    for (i = this.firstActive; i < this.firstFree; i++)
      this.particles[i].draw(context);
  }
  if (this.firstFree < this.firstActive) {
    for (i = this.firstActive; i < this.particles.length; i++)
      this.particles[i].draw(context);
    for (i = 0; i < this.firstFree; i++)
      this.particles[i].draw(context);
  }
};

/*
 * Main
 */
(function (canvas) {
  var context = canvas.getContext("2d");
  var particles = new ParticlePool(settings.particles.length);
  var particleRate =
    settings.particles.length / settings.particles.duration;
  var time;

  function pointOnHeart(t) {
    return new Point(
      160 * Math.pow(Math.sin(t), 3),
      130 * Math.cos(t) -
        50 * Math.cos(2 * t) -
        20 * Math.cos(3 * t) -
        10 * Math.cos(4 * t) +
        25
    );
  }

  function createHeartImage(hue) {
    var c = document.createElement("canvas");
    var ctx = c.getContext("2d");
    c.width = settings.particles.size;
    c.height = settings.particles.size;

    function to(t) {
      var p = pointOnHeart(t);
      p.x =
        settings.particles.size / 2 +
        (p.x * settings.particles.size) / 350;
      p.y =
        settings.particles.size / 2 -
        (p.y * settings.particles.size) / 350;
      return p;
    }

    ctx.beginPath();
    var t = -Math.PI;
    var p = to(t);
    ctx.moveTo(p.x, p.y);
    while (t < Math.PI) {
      t += 0.01;
      p = to(t);
      ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();

    ctx.fillStyle = `hsl(${hue}, 100%, 70%)`;
    ctx.fill();

    var img = new Image();
    img.src = c.toDataURL();
    return img;
  }

  function render() {
    requestAnimationFrame(render);

    var newTime = new Date().getTime() / 1000;
    var deltaTime = newTime - (time || newTime);
    time = newTime;

    context.clearRect(0, 0, canvas.width, canvas.height);

    var amount = particleRate * deltaTime;
    for (var i = 0; i < amount; i++) {
      var pos = pointOnHeart(Math.PI - 2 * Math.PI * Math.random());
      var dir = pos.clone().length(settings.particles.velocity);
      var hue = Math.random() * 360;
      var img = createHeartImage(hue);

      particles.add(
        canvas.width / 2 + pos.x,
        canvas.height / 2 - pos.y,
        dir.x,
        -dir.y,
        img
      );
    }

    particles.update(deltaTime);
    particles.draw(context);
  }

  function onResize() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }
  window.onresize = onResize;

  setTimeout(function () {
    onResize();
    render();
  }, 10);
})(document.getElementById("pinkboard"));
