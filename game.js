'use strict';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = 800;
const H = 600;

// ── Input ─────────────────────────────────────────────────────────────────────
const keys = {};
const justPressed = {};

window.addEventListener('keydown', e => {
  justPressed[e.code] = !keys[e.code];
  keys[e.code] = true;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code))
    e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

function pressed(code) {
  const val = justPressed[code];
  justPressed[code] = false;
  return val;
}

// ── Utils ─────────────────────────────────────────────────────────────────────
const wrap  = (v, max) => ((v % max) + max) % max;
const dist  = (a, b)   => Math.hypot(a.x - b.x, a.y - b.y);
const rand  = (min, max) => min + Math.random() * (max - min);
const randInt = (min, max) => Math.floor(rand(min, max + 1));

// ── Skins ─────────────────────────────────────────────────────────────────────
const SKINS = [
  {
    name: 'CLÁSICA',
    color: '#fff',
    thrustColor: 'rgba(255, 130, 0, 0.85)',
    draw(ctx, thrusting) {
      ctx.strokeStyle = this.color;
      ctx.lineWidth   = 1.5;
      ctx.lineJoin    = 'round';
      ctx.beginPath();
      ctx.moveTo( 20,  0);
      ctx.lineTo(-12, -9);
      ctx.lineTo( -7,  0);
      ctx.lineTo(-12,  9);
      ctx.closePath();
      ctx.stroke();
      if (thrusting && Math.random() > 0.35) {
        ctx.beginPath();
        ctx.moveTo(-8, -4);
        ctx.lineTo(-8 - rand(6, 14), 0);
        ctx.lineTo(-8,  4);
        ctx.strokeStyle = this.thrustColor;
        ctx.stroke();
      }
    },
  },
  {
    name: 'DARD',
    color: '#0ff',
    thrustColor: 'rgba(0, 255, 255, 0.85)',
    draw(ctx, thrusting) {
      ctx.strokeStyle = this.color;
      ctx.lineWidth   = 1.5;
      ctx.lineJoin    = 'round';
      ctx.beginPath();
      ctx.moveTo( 24,  0);
      ctx.lineTo( -4, -6);
      ctx.lineTo(-10, -3);
      ctx.lineTo(-14,  0);
      ctx.lineTo(-10,  3);
      ctx.lineTo( -4,  6);
      ctx.closePath();
      ctx.stroke();
      if (thrusting && Math.random() > 0.35) {
        ctx.beginPath();
        ctx.moveTo(-12, -3);
        ctx.lineTo(-12 - rand(5, 11), 0);
        ctx.lineTo(-12,  3);
        ctx.strokeStyle = this.thrustColor;
        ctx.stroke();
      }
    },
  },
  {
    name: 'DELTA',
    color: '#0f0',
    thrustColor: 'rgba(0, 255, 100, 0.85)',
    draw(ctx, thrusting) {
      ctx.strokeStyle = this.color;
      ctx.lineWidth   = 1.5;
      ctx.lineJoin    = 'round';
      ctx.beginPath();
      ctx.moveTo( 22,  0);
      ctx.lineTo( -8,-12);
      ctx.lineTo( -4, -4);
      ctx.lineTo( -8,  4);
      ctx.lineTo( -8, 12);
      ctx.closePath();
      ctx.stroke();
      if (thrusting && Math.random() > 0.35) {
        ctx.beginPath();
        ctx.moveTo(-6, -3);
        ctx.lineTo(-6 - rand(6, 13), 0);
        ctx.lineTo(-6,  3);
        ctx.strokeStyle = this.thrustColor;
        ctx.stroke();
      }
    },
  },
  {
    name: 'HEX',
    color: '#f0f',
    thrustColor: 'rgba(255, 0, 255, 0.85)',
    draw(ctx, thrusting) {
      ctx.strokeStyle = this.color;
      ctx.lineWidth   = 1.5;
      ctx.lineJoin    = 'round';
      ctx.beginPath();
      ctx.moveTo( 18,  0);
      ctx.lineTo( 10, -8);
      ctx.lineTo( -6,-10);
      ctx.lineTo(-14, -2);
      ctx.lineTo(-14,  2);
      ctx.lineTo( -6, 10);
      ctx.lineTo( 10,  8);
      ctx.closePath();
      ctx.stroke();
      if (thrusting && Math.random() > 0.35) {
        ctx.beginPath();
        ctx.moveTo(-10, -3);
        ctx.lineTo(-10 - rand(5, 11), 0);
        ctx.lineTo(-10,  3);
        ctx.strokeStyle = this.thrustColor;
        ctx.stroke();
      }
    },
  },
];

// ── Bullet ────────────────────────────────────────────────────────────────────
class Bullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    const SPEED = 520;
    this.vx = Math.cos(angle) * SPEED;
    this.vy = Math.sin(angle) * SPEED;
    this.ttl  = 1.1;
    this.radius = 2;
    this.dead = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Asteroid ──────────────────────────────────────────────────────────────────
const RADII  = [0, 16, 30, 50];   // por tamaño 1, 2, 3
const SPEEDS = [0, 85, 55, 32];   // velocidad base por tamaño
const POINTS = [0, 100, 50, 20];  // puntos por tamaño

class Asteroid {
  constructor(x, y, size = 3) {
    this.x    = x;
    this.y    = y;
    this.size = size;
    this.radius = RADII[size];
    this.dead = false;

    const angle = rand(0, Math.PI * 2);
    const speed = SPEEDS[size] + rand(-15, 15);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.rotSpeed = rand(-1.2, 1.2);
    this.rot = rand(0, Math.PI * 2);

    // Polígono irregular
    const n = randInt(8, 13);
    this.verts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = this.radius * rand(0.6, 1.0);
      this.verts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
  }

  update(dt) {
    this.x   = wrap(this.x + this.vx * dt, W);
    this.y   = wrap(this.y + this.vy * dt, H);
    this.rot += this.rotSpeed * dt;
  }

  split() {
    if (this.size <= 1) return [];
    return [
      new Asteroid(this.x, this.y, this.size - 1),
      new Asteroid(this.x, this.y, this.size - 1),
    ];
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    ctx.moveTo(this.verts[0][0], this.verts[0][1]);
    for (let i = 1; i < this.verts.length; i++)
      ctx.lineTo(this.verts[i][0], this.verts[i][1]);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

// ── Estrella Fugaz ────────────────────────────────────────────────────────────
class ShootingStar {
  constructor() {
    this.dead = false;
    this.radius = 36;
    this.life = rand(4, 6);
    this.ttl = this.life;
    this.hue = 320;

    // Spawn en borde aleatorio, se mueve en dirección diagonal
    const side = randInt(0, 3);
    if (side === 0) { this.x = 0;  this.y = rand(0, H); }         // izquierda
    else if (side === 1) { this.x = W; this.y = rand(0, H); }     // derecha
    else if (side === 2) { this.x = rand(0, W); this.y = 0; }     // arriba
    else { this.x = rand(0, W); this.y = H; }                     // abajo

    const angle = rand(0, Math.PI * 2);
    const speed = rand(200, 280);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    // Cola: últimas 15 posiciones
    this.trail = [];
    this.maxTrail = 15;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;

    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrail) this.trail.shift();
  }

  draw() {
    const alpha = Math.min(1, this.ttl / 1.5);
    const headAlpha = alpha * 0.95;

    // Cola
    for (let i = 0; i < this.trail.length; i++) {
      const t = this.trail[i];
      const progress = i / this.trail.length;
      const a = progress * 0.7 * alpha;
      const r = 4 + progress * 6;
      ctx.fillStyle = `hsla(${this.hue}, 100%, 65%, ${a.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(t.x, t.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Glow de la cabeza
    ctx.save();
    ctx.shadowColor = `hsla(${this.hue}, 100%, 70%, 1)`;
    ctx.shadowBlur = 18;
    ctx.strokeStyle = `hsla(${this.hue}, 100%, 75%, ${headAlpha.toFixed(2)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Núcleo brillante
    ctx.strokeStyle = `hsla(${this.hue}, 100%, 90%, ${(headAlpha * 0.9).toFixed(2)})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// ── Ship ──────────────────────────────────────────────────────────────────────
class Ship {
  constructor() { this.reset(); }

  reset() {
    this.x      = W / 2;
    this.y      = H / 2;
    this.angle  = -Math.PI / 2;
    this.vx     = 0;
    this.vy     = 0;
    this.radius = 12;
    this.thrusting     = false;
    this.invincible    = 3;
    this.shootCooldown = 0;
    this.dead          = false;
    const saved = parseInt(localStorage.getItem('asteroids_skin'), 10);
    this.skinIndex = Number.isInteger(saved) && saved >= 0 && saved < SKINS.length ? saved : 0;
  }

  update(dt) {
    if (this.dead) return;
    if (this.invincible    > 0) this.invincible    -= dt;
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
    if (speedTimer > 0) speedTimer -= dt;
    if (tripleTimer > 0) tripleTimer -= dt;

    const ROT   = 3.5;   // rad/s
    const THRUST = speedTimer > 0 ? 520 : 260;  // px/s² (doble con power-up)
    const DRAG   = 0.987;

    if (keys['ArrowLeft'])  this.angle -= ROT * dt;
    if (keys['ArrowRight']) this.angle += ROT * dt;

    this.thrusting = !!keys['ArrowUp'];
    if (this.thrusting) {
      this.vx += Math.cos(this.angle) * THRUST * dt;
      this.vy += Math.sin(this.angle) * THRUST * dt;
    }

    this.vx *= DRAG;
    this.vy *= DRAG;
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
  }

  tryShoot() {
    if (this.shootCooldown > 0 || this.dead) return [];
    this.shootCooldown = 0.2;
    const NOSE = 21;
    const ox = this.x + Math.cos(this.angle) * NOSE;
    const oy = this.y + Math.sin(this.angle) * NOSE;
    if (tripleTimer > 0) {
      return [
        new Bullet(ox, oy, this.angle - 0.12),
        new Bullet(ox, oy, this.angle),
        new Bullet(ox, oy, this.angle + 0.12),
      ];
    }
    return [new Bullet(ox, oy, this.angle)];
  }

  draw() {
    if (this.dead) return;
    if (this.invincible > 0 && Math.floor(this.invincible * 8) % 2 === 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    SKINS[this.skinIndex].draw(ctx, this.thrusting);
    ctx.restore();

    // Escudo visual
    if (shieldActive) {
      const pulse = 0.3 + 0.2 * Math.sin(Date.now() * 0.008);
      ctx.strokeStyle = `rgba(0, 200, 255, ${pulse.toFixed(2)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = `rgba(0, 200, 255, ${(pulse * 0.12).toFixed(2)})`;
      ctx.fill();
    }
  }
}

// ── Partículas (explosión) ────────────────────────────────────────────────────
class Particle {
  constructor(x, y) {
    this.x  = x;
    this.y  = y;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(30, 130);
    this.vx   = Math.cos(angle) * speed;
    this.vy   = Math.sin(angle) * speed;
    this.life = rand(0.4, 1.1);
    this.ttl  = this.life;
    this.dead = false;
  }

  update(dt) {
    this.x  += this.vx * dt;
    this.y  += this.vy * dt;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    const alpha = this.ttl / this.life;
    ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx * 0.05, this.y - this.vy * 0.05);
    ctx.stroke();
  }
}

// ── PowerUp ───────────────────────────────────────────────────────────────────
class PowerUp {
  constructor(x, y, type = 'speed') {
    this.x = x;
    this.y = y;
    this.type = type;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(20, 50);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.radius = 10;
    this.ttl = 8;
    this.dead = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    const alpha = Math.min(1, this.ttl / 2);
    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.type === 'speed') {
      // Diamante cyan
      ctx.strokeStyle = `rgba(0, 255, 255, ${alpha.toFixed(2)})`;
      ctx.fillStyle = `rgba(0, 255, 255, ${(alpha * 0.25).toFixed(2)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -this.radius);
      ctx.lineTo(this.radius, 0);
      ctx.lineTo(0, this.radius);
      ctx.lineTo(-this.radius, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // Hexágono verde con cruz de escudo
      ctx.strokeStyle = `rgba(0, 255, 100, ${alpha.toFixed(2)})`;
      ctx.fillStyle = `rgba(0, 255, 100, ${(alpha * 0.25).toFixed(2)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const method = i === 0 ? 'moveTo' : 'lineTo';
        ctx[method](Math.cos(a) * this.radius, Math.sin(a) * this.radius);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Cruz interior
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.lineTo(0, 5);
      ctx.moveTo(-5, 0);
      ctx.lineTo(5, 0);
      ctx.stroke();
    }

    ctx.restore();
  }
}

// ── PowerUp (Triple Shot) ─────────────────────────────────────────────────────
class TripleShotPowerUp {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(20, 50);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.radius = 10;
    this.ttl = 8;
    this.dead = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    const alpha = Math.min(1, this.ttl / 2);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.strokeStyle = `rgba(255, 50, 150, ${alpha.toFixed(2)})`;
    ctx.fillStyle = `rgba(255, 50, 150, ${(alpha * 0.25).toFixed(2)})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -this.radius);
    ctx.lineTo(this.radius, this.radius * 0.7);
    ctx.lineTo(-this.radius, this.radius * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

// ── Estado del juego ──────────────────────────────────────────────────────────
let ship, bullets, asteroids, particles, powerups, shootingStars;
let score, lives, level;
let state;      // 'menu' | 'playing' | 'dead' | 'gameover'
let deadTimer;
let speedTimer = 0;
let tripleTimer = 0;
let shieldActive = false;
let shieldTimer = 0;
const SHIELD_DURATION = 5;
let shootingStarTimer;
let levelTime;

function spawnAsteroids(count) {
  const SAFE_DIST = 130;
  for (let i = 0; i < count; i++) {
    let x, y;
    do {
      x = rand(0, W);
      y = rand(0, H);
    } while (Math.hypot(x - W / 2, y - H / 2) < SAFE_DIST);
    asteroids.push(new Asteroid(x, y, 3));
  }
}

function spawnShootingStar() {
  shootingStars.push(new ShootingStar());
}

function getShootingStarInterval() {
  return Math.max(2, 8 - level * 0.5 - levelTime * 0.08);
}

function initGame() {
  ship          = new Ship();
  bullets   = [];
  asteroids = [];
  particles = [];
  powerups  = [];
  shootingStars = [];
  score  = 0;
  lives  = 3;
  level  = 1;
  state  = 'playing';
  speedTimer = 0;
  tripleTimer = 0;
  shieldActive = false;
  shieldTimer = 0;
  levelTime = 0;
  shootingStarTimer = 5;
  spawnAsteroids(4);
}

function startMenu() {
  ship = new Ship();
  bullets = [];
  asteroids = [];
  particles = [];
  powerups = [];
  shootingStars = [];
  score = 0;
  lives = 3;
  level = 1;
  state = 'menu';
}

function nextLevel() {
  level++;
  bullets   = [];
  particles = [];
  powerups  = [];
  shootingStars = [];
  speedTimer = 0;
  tripleTimer = 0;
  shieldActive = false;
  shieldTimer = 0;
  levelTime = 0;
  shootingStarTimer = 5;
  ship.reset();
  spawnAsteroids(3 + level);
}

function explode(x, y, count = 8) {
  for (let i = 0; i < count; i++) particles.push(new Particle(x, y));
}

function killShip() {
  explode(ship.x, ship.y, 14);
  ship.dead = true;
  lives--;
  if (lives <= 0) {
    state = 'gameover';
  } else {
    state     = 'dead';
    deadTimer = 2;
  }
}

// ── Update ────────────────────────────────────────────────────────────────────
function update(dt) {
  if (state === 'menu') {
    if (pressed('ArrowLeft'))  ship.skinIndex = (ship.skinIndex - 1 + SKINS.length) % SKINS.length;
    if (pressed('ArrowRight')) ship.skinIndex = (ship.skinIndex + 1) % SKINS.length;
    if (pressed('Space')) {
      localStorage.setItem('asteroids_skin', ship.skinIndex);
      initGame();
    }
    return;
  }

  if (state === 'gameover') {
    if (pressed('Space')) initGame();
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    shootingStars.forEach(s => s.update(dt));
    shootingStars = shootingStars.filter(s => !s.dead);
    return;
  }

  if (state === 'dead') {
    deadTimer -= dt;
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    asteroids.forEach(a => a.update(dt));
    shootingStars.forEach(s => s.update(dt));
    shootingStars = shootingStars.filter(s => !s.dead);
    if (deadTimer <= 0) { state = 'playing'; ship.reset(); }
    return;
  }

  // Disparar
  if (pressed('Space')) {
    bullets.push(...ship.tryShoot());
  }

  // Cambiar skin con Tab
  if (pressed('Tab')) {
    ship.skinIndex = (ship.skinIndex + 1) % SKINS.length;
    localStorage.setItem('asteroids_skin', ship.skinIndex);
  }

  ship.update(dt);

  // Estrella fugaz: timer
  levelTime += dt;
  shootingStarTimer -= dt;
  if (shootingStarTimer <= 0) {
    spawnShootingStar();
    shootingStarTimer = getShootingStarInterval();
  }

  bullets.forEach(b => b.update(dt));
  asteroids.forEach(a => a.update(dt));
  particles.forEach(p => p.update(dt));

  bullets   = bullets.filter(b => !b.dead);
  particles = particles.filter(p => !p.dead);

  // Bala vs asteroide
  const newAsteroids = [];
  for (const b of bullets) {
    for (const a of asteroids) {
      if (!a.dead && !b.dead && dist(b, a) < a.radius) {
        b.dead = true;
        a.dead = true;
        score += POINTS[a.size];
        explode(a.x, a.y, a.size * 5);
        newAsteroids.push(...a.split());
        if (Math.random() < 0.15) {
          const type = Math.random() < 0.5 ? 'speed' : 'shield';
          powerups.push(new PowerUp(a.x, a.y, type));
        }
        else if (Math.random() < 0.33) powerups.push(new TripleShotPowerUp(a.x, a.y));
      }
    }
  }
  asteroids = asteroids.filter(a => !a.dead).concat(newAsteroids);
  bullets   = bullets.filter(b => !b.dead);

  // Nave vs asteroide
  if (ship.invincible <= 0 && !shieldActive) {
    for (const a of asteroids) {
      if (dist(ship, a) < ship.radius + a.radius * 0.82) {
        killShip();
        break;
      }
    }
  }

  // Power-ups
  powerups.forEach(p => p.update(dt));
  powerups = powerups.filter(p => !p.dead);

  // Nave vs power-up
  for (const p of powerups) {
    if (!p.dead && dist(ship, p) < ship.radius + p.radius) {
      p.dead = true;
      if (p instanceof TripleShotPowerUp) {
        tripleTimer = 5;
      } else if (p.type === 'speed') {
        speedTimer = 5;
      } else if (p.type === 'shield') {
        shieldActive = true;
        shieldTimer = SHIELD_DURATION;
      }
    }
  }

  // Estrellas fugaces
  shootingStars.forEach(s => s.update(dt));
  shootingStars = shootingStars.filter(s => !s.dead);

  // Bala vs estrella fugaz
  for (const b of bullets) {
    for (const s of shootingStars) {
      if (!s.dead && !b.dead && dist(b, s) < s.radius) {
        b.dead = true;
        s.dead = true;
        score += 200;
        explode(s.x, s.y, 12);
      }
    }
  }
  bullets = bullets.filter(b => !b.dead);

  // Nave vs estrella fugaz
  if (ship.invincible <= 0 && !shieldActive) {
    for (const s of shootingStars) {
      if (!s.dead && dist(ship, s) < ship.radius + s.radius) {
        killShip();
        break;
      }
    }
  }

  // Nivel completado
  if (asteroids.length === 0) nextLevel();

  // Timer del escudo
  if (shieldActive) {
    shieldTimer -= dt;
    if (shieldTimer <= 0) {
      shieldActive = false;
    }
  }
}

// ── Draw ──────────────────────────────────────────────────────────────────────
function drawLifeIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-Math.PI / 2);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth   = 1.2;
  ctx.lineJoin    = 'round';
  ctx.beginPath();
  ctx.moveTo( 9,  0);
  ctx.lineTo(-6, -5);
  ctx.lineTo(-3,  0);
  ctx.lineTo(-6,  5);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawMenu() {
  const skin = SKINS[ship.skinIndex];

  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 42px monospace';
  ctx.fillText('ASTEROIDS', W / 2, H / 2 - 100);

  // Preview de la nave
  ctx.save();
  ctx.translate(W / 2, H / 2 - 15);
  ctx.rotate(-Math.PI / 2);
  skin.draw(ctx, false);
  ctx.restore();

  ctx.fillStyle = skin.color;
  ctx.font = 'bold 20px monospace';
  ctx.fillText(skin.name, W / 2, H / 2 + 40);

  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '14px monospace';
  ctx.fillText('\u2190 \u2192  PARA CAMBIAR   \u00b7   ESPACIO PARA JUGAR', W / 2, H / 2 + 80);
}

function drawHUD() {
  ctx.fillStyle = '#fff';
  ctx.font = '15px monospace';

  ctx.textAlign = 'left';
  ctx.fillText(`SCORE  ${score}`, 14, 26);

  ctx.textAlign = 'center';
  ctx.fillText(`NIVEL ${level}`, W / 2, 26);

  for (let i = 0; i < lives; i++)
    drawLifeIcon(W - 16 - i * 22, 18);

  if (speedTimer > 0) {
    ctx.fillStyle = '#0ff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`VELOCIDAD ${speedTimer.toFixed(1)}s`, W / 2, 50);
  }

  if (tripleTimer > 0) {
    ctx.fillStyle = '#ff3296';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`TRIPLE SHOT ${tripleTimer.toFixed(1)}s`, W / 2, speedTimer > 0 ? 68 : 50);
  }

  if (shieldActive) {
    ctx.fillStyle = '#0cf';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`ESCUDO ${shieldTimer.toFixed(1)}s`, W / 2, 50 + (speedTimer > 0 ? 18 : 0) + (tripleTimer > 0 ? 18 : 0));
  }

  ctx.fillStyle = SKINS[ship.skinIndex].color;
  ctx.font = '12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(SKINS[ship.skinIndex].name, W / 2, H - 12);
}

function drawOverlay(title, sub) {
  ctx.textAlign   = 'center';
  ctx.fillStyle   = '#fff';
  ctx.font        = 'bold 46px monospace';
  ctx.fillText(title, W / 2, H / 2 - 18);
  ctx.font        = '18px monospace';
  ctx.fillStyle   = 'rgba(255,255,255,0.65)';
  ctx.fillText(sub, W / 2, H / 2 + 22);
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  if (state === 'menu') {
    drawMenu();
    return;
  }

  particles.forEach(p => p.draw());
  asteroids.forEach(a => a.draw());
  shootingStars.forEach(s => s.draw());
  bullets.forEach(b => b.draw());
  powerups.forEach(p => p.draw());
  ship.draw();

  drawHUD();

  if (state === 'gameover')
    drawOverlay('GAME OVER', `PUNTAJE: ${score}   —   ESPACIO PARA REINICIAR`);
}

// ── Loop principal ────────────────────────────────────────────────────────────
let lastTime = null;

function loop(ts) {
  const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

startMenu();
requestAnimationFrame(loop);
