// =========================================================================
// JOHN: ROGUE COMMANDO - Complete Arcade Shooter Engine
// Assets & sprites powered by precidoboss/JOHNSHOOTINGGAME
// =========================================================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Disable image smoothing for ultra crisp retro pixel art
ctx.imageSmoothingEnabled = false;

// Audio context & sound master
let soundEnabled = true;
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

// --------------------------------------------------
// SOUND EFFECTS & SYNTHESIS (Zero latency + OGG Audio)
// --------------------------------------------------
const audioFiles = {
  shot: new Audio("snd_rifle_shot.ogg"),
  reload: new Audio("snd_reload_clip.ogg"),
  step: new Audio("snd_step1.ogg"),
  select: new Audio("snd_select.ogg"),
  bossMusic: new Audio("snd_boss_music.ogg")
};

audioFiles.bossMusic.loop = true;

function playSound(type) {
  if (!soundEnabled) return;
  initAudio();

  // Try playing preloaded audio element
  try {
    if (audioFiles[type]) {
      const clone = audioFiles[type].cloneNode();
      clone.volume = (type === "shot") ? 0.45 : (type === "step") ? 0.25 : 0.6;
      clone.play().catch(() => playSynth(type));
      return;
    }
  } catch (e) {
    // Fallback to synth below
  }

  playSynth(type);
}

// Web Audio API Procedural Synthesizer (Reliable instant feedback)
function playSynth(type) {
  if (!soundEnabled || !audioCtx) return;
  const now = audioCtx.currentTime;

  if (type === "shot") {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  } else if (type === "explosion") {
    // White noise explosion
    const bufferSize = audioCtx.sampleRate * 0.35;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.08));
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.linearRampToValueAtTime(100, now + 0.35);
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start(now);
  } else if (type === "hit") {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.08);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  } else if (type === "pickup") {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(880, now + 0.08);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  } else if (type === "jump") {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.15);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }
}

// --------------------------------------------------
// ASSET LOADER
// --------------------------------------------------
const assets = {};
const assetSources = {
  johnIdle: "john_idle.png",
  johnRun: "john_run.png",
  johnRunShoot: "john_run_shoot.png",
  johnJump: "john_jump.png",
  johnCrouch: "john_crouch.png",
  johnCrouchShoot: "john_crouch_shoot.png",
  johnStandShoot: "john_stand_shooting.png",
  johnSoul: "john_dead_soul.png",
  bullet: "weapon_bullet.png",
  caveBg: "background_cave.png",
  clouds: "clouds1.png",
  platformTile: "tile_cave_blob_1.png",
  tree1: "jungle_tree1.png",
  tree2: "jungle_tree2.png",
  titleBg: "main_title_bg.png",
  titleLogo: "main_title_title.png",
  gameOverBanner: "GameOverScreen.png"
};

let assetsLoaded = 0;
const totalAssets = Object.keys(assetSources).length;

for (const [key, src] of Object.entries(assetSources)) {
  const img = new Image();
  img.src = src;
  img.onload = () => {
    assetsLoaded++;
  };
  assets[key] = img;
}

// --------------------------------------------------
// INPUT HANDLER
// --------------------------------------------------
const keys = {
  left: false,
  right: false,
  up: false,
  down: false,
  shoot: false,
  reload: false
};

window.addEventListener("keydown", (e) => {
  initAudio();
  if (e.code === "KeyA" || e.code === "ArrowLeft") keys.left = true;
  if (e.code === "KeyD" || e.code === "ArrowRight") keys.right = true;
  if (e.code === "KeyW" || e.code === "ArrowUp" || e.code === "Space") {
    keys.up = true;
    if (gameState === "TITLE") startGame();
    if (gameState === "GAMEOVER") restartGame();
  }
  if (e.code === "KeyS" || e.code === "ArrowDown") keys.down = true;
  if (e.code === "KeyJ" || e.code === "KeyZ" || e.code === "KeyF") keys.shoot = true;
  if (e.code === "KeyR") keys.reload = true;
});

window.addEventListener("keyup", (e) => {
  if (e.code === "KeyA" || e.code === "ArrowLeft") keys.left = false;
  if (e.code === "KeyD" || e.code === "ArrowRight") keys.right = false;
  if (e.code === "KeyW" || e.code === "ArrowUp" || e.code === "Space") keys.up = false;
  if (e.code === "KeyS" || e.code === "ArrowDown") keys.down = false;
  if (e.code === "KeyJ" || e.code === "KeyZ" || e.code === "KeyF") keys.shoot = false;
  if (e.code === "KeyR") keys.reload = false;
});

canvas.addEventListener("mousedown", (e) => {
  initAudio();
  if (gameState === "TITLE") {
    startGame();
    return;
  }
  if (gameState === "GAMEOVER") {
    restartGame();
    return;
  }
  if (e.button === 0) keys.shoot = true;
});

canvas.addEventListener("mouseup", (e) => {
  if (e.button === 0) keys.shoot = false;
});

// Virtual Touch Controls setup
function setupTouch(id, keyName) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = (e) => {
    e.preventDefault();
    initAudio();
    if (gameState === "TITLE") startGame();
    if (gameState === "GAMEOVER") restartGame();
    keys[keyName] = true;
  };
  const end = (e) => {
    e.preventDefault();
    keys[keyName] = false;
  };
  el.addEventListener("touchstart", start, { passive: false });
  el.addEventListener("touchend", end, { passive: false });
  el.addEventListener("mousedown", start);
  el.addEventListener("mouseup", end);
}

setupTouch("touchLeft", "left");
setupTouch("touchRight", "right");
setupTouch("touchDown", "down");
setupTouch("touchJump", "up");
setupTouch("touchShoot", "shoot");
setupTouch("touchReload", "reload");

// UI Button Handlers
document.getElementById("btnSound").addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  document.getElementById("btnSound").textContent = soundEnabled ? "🔊 Sound: ON" : "🔇 Sound: OFF";
  if (!soundEnabled && audioFiles.bossMusic) {
    audioFiles.bossMusic.pause();
  }
});

document.getElementById("btnCrt").addEventListener("click", () => {
  const crt = document.getElementById("crtOverlay");
  crt.classList.toggle("disabled");
  const isOff = crt.classList.contains("disabled");
  document.getElementById("btnCrt").textContent = isOff ? "📺 CRT: OFF" : "📺 CRT: ON";
});

document.getElementById("btnFullscreen").addEventListener("click", () => {
  if (!document.fullscreenElement) {
    document.querySelector(".game-wrapper").requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen();
  }
});

// --------------------------------------------------
// LEVEL PLATFORMS
// --------------------------------------------------
const platforms = [
  { x: 0, y: 400, w: 800, h: 80, isGround: true }, // Main Ground
  { x: 120, y: 310, w: 160, h: 20 },
  { x: 520, y: 310, w: 160, h: 20 },
  { x: 310, y: 220, w: 180, h: 20 },
  { x: 80, y: 150, w: 130, h: 20 },
  { x: 590, y: 150, w: 130, h: 20 }
];

// --------------------------------------------------
// GAME STATE
// --------------------------------------------------
let gameState = "TITLE"; // TITLE, PLAYING, GAMEOVER, VICTORY
let score = 0;
let highScore = parseInt(localStorage.getItem("john_shooter_highscore") || "0");
let wave = 1;
let waveTimer = 0;
let waveSpawnCount = 0;
let waveSpawnMax = 8;
let bossActive = false;
let screenShake = 0;

// Player definition
const player = {
  x: 200,
  y: 300,
  vx: 0,
  vy: 0,
  width: 26 * 2.2,
  height: 22 * 2.2,
  speed: 4.6,
  jumpStrength: -11.5,
  facing: 1, // 1: right, -1: left
  grounded: false,
  crouched: false,
  health: 100,
  maxHealth: 100,
  ammo: 30,
  maxAmmo: 30,
  reloading: false,
  reloadTimer: 0,
  shootCooldown: 0,
  invulnerableTimer: 0,
  powerupTimer: 0,
  powerupType: null, // "triple", "rapid"
  soulY: 0,

  // Animation controller
  animState: "idle",
  frameIndex: 0,
  frameTimer: 0,
  frameSpeed: 0.08
};

// Entities
let bullets = [];
let enemyBullets = [];
let enemies = [];
let particles = [];
let pickups = [];
let floatingTexts = [];

// --------------------------------------------------
// PARTICLES & COMBAT POPUPS
// --------------------------------------------------
function createExplosion(x, y, count = 22, color = "#ffaa00") {
  playSound("explosion");
  screenShake = Math.max(screenShake, 10);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 5.5;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 3 + Math.random() * 4,
      color: (i % 2 === 0) ? color : "#ffffff",
      alpha: 1,
      decay: 0.02 + Math.random() * 0.03
    });
  }
}

function createSparks(x, y, count = 8, color = "#ffe066") {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 4;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      size: 2,
      color: color,
      alpha: 1,
      decay: 0.04 + Math.random() * 0.03
    });
  }
}

function spawnShell(x, y, dir) {
  particles.push({
    x,
    y,
    vx: -dir * (1.5 + Math.random() * 2),
    vy: -2.5 - Math.random() * 1.5,
    size: 2.5,
    isShell: true,
    color: "#ffd700",
    alpha: 1,
    decay: 0.015
  });
}

function addFloatingText(text, x, y, color = "#fff") {
  floatingTexts.push({
    text,
    x,
    y,
    color,
    alpha: 1,
    vy: -1.2
  });
}

// --------------------------------------------------
// SHOOTING & WEAPONS
// --------------------------------------------------
function shootWeapon() {
  if (player.reloading || player.shootCooldown > 0) return;
  if (player.ammo <= 0) {
    startReload();
    return;
  }

  player.ammo--;
  player.shootCooldown = (player.powerupType === "rapid") ? 0.06 : 0.13;
  playSound("shot");
  screenShake = Math.max(screenShake, 3);

  const gunOffsetY = player.crouched ? 28 : 22;
  const startX = player.x + (player.facing === 1 ? player.width : 0);
  const startY = player.y + gunOffsetY;

  spawnShell(player.x + player.width / 2, startY, player.facing);

  // Muzzle flash particle
  particles.push({
    x: startX,
    y: startY,
    vx: player.facing * 0.5,
    vy: 0,
    size: 6,
    color: "#fff8b3",
    alpha: 1,
    decay: 0.2
  });

  if (player.powerupType === "triple") {
    // 3-way spread
    [-0.15, 0, 0.15].forEach(angleOffset => {
      bullets.push({
        x: startX,
        y: startY,
        vx: Math.cos(angleOffset) * 14 * player.facing,
        vy: Math.sin(angleOffset) * 14,
        damage: 25,
        life: 60
      });
    });
  } else {
    // Normal single shot
    bullets.push({
      x: startX,
      y: startY,
      vx: 14 * player.facing,
      vy: 0,
      damage: 34,
      life: 60
    });
  }
}

function startReload() {
  if (player.reloading || player.ammo === player.maxAmmo) return;
  player.reloading = true;
  player.reloadTimer = 1.1; // 1.1 seconds reload
  playSound("reload");
  addFloatingText("RELOADING...", player.x + player.width / 2, player.y - 10, "#f0883e");
}

// --------------------------------------------------
// ENEMY SPAWNER
// --------------------------------------------------
function spawnEnemy(type) {
  const spawnSide = Math.random() > 0.5 ? 1 : -1;
  const startX = spawnSide === 1 ? -40 : canvas.width + 40;

  if (type === "crawler") {
    // Fast cave mutant / crawler
    enemies.push({
      type: "crawler",
      x: startX,
      y: 360,
      vx: (spawnSide === 1 ? 1 : -1) * (2.2 + Math.random() * 1.5),
      vy: 0,
      width: 32,
      height: 24,
      health: 40,
      maxHealth: 40,
      scoreValue: 100,
      animTimer: 0
    });
  } else if (type === "trooper") {
    // Ranged cyborg soldier with rifle
    enemies.push({
      type: "trooper",
      x: startX,
      y: 350,
      vx: (spawnSide === 1 ? 1 : -1) * 1.4,
      vy: 0,
      width: 28,
      height: 48,
      health: 65,
      maxHealth: 65,
      shootTimer: 1.5 + Math.random() * 1.5,
      scoreValue: 180,
      animTimer: 0
    });
  } else if (type === "drone") {
    // Aerial hovering drone
    enemies.push({
      type: "drone",
      x: startX,
      y: 90 + Math.random() * 150,
      vx: (spawnSide === 1 ? 1 : -1) * 2.0,
      vy: 0,
      baseY: 90 + Math.random() * 150,
      time: Math.random() * 10,
      width: 30,
      height: 26,
      health: 35,
      maxHealth: 35,
      shootTimer: 2.0,
      scoreValue: 150
    });
  } else if (type === "boss") {
    // Heavy Mechanical Boss
    bossActive = true;
    enemies.push({
      type: "boss",
      x: canvas.width - 160,
      y: 200,
      vx: -1.2,
      vy: 0,
      width: 110,
      height: 140,
      health: 800,
      maxHealth: 800,
      attackTimer: 2.0,
      phase: 1,
      scoreValue: 2500
    });
    if (soundEnabled && audioFiles.bossMusic) {
      audioFiles.bossMusic.currentTime = 0;
      audioFiles.bossMusic.play().catch(() => {});
    }
    addFloatingText("⚠️ WARNING: BOSS INCOMING! ⚠️", canvas.width / 2, 100, "#f85149");
  }
}

// --------------------------------------------------
// GAME LOOP & STATE MANAGEMENT
// --------------------------------------------------
function startGame() {
  gameState = "PLAYING";
  score = 0;
  wave = 1;
  waveTimer = 0;
  waveSpawnCount = 0;
  waveSpawnMax = 7;
  bossActive = false;
  enemies = [];
  bullets = [];
  enemyBullets = [];
  pickups = [];
  particles = [];
  floatingTexts = [];

  player.health = 100;
  player.ammo = player.maxAmmo;
  player.reloading = false;
  player.powerupTimer = 0;
  player.powerupType = null;
  player.x = 200;
  player.y = 300;
  player.vx = 0;
  player.vy = 0;
  player.soulY = 0;
}

function restartGame() {
  if (audioFiles.bossMusic) {
    audioFiles.bossMusic.pause();
  }
  startGame();
}

let lastTime = performance.now();

function gameLoop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  update(dt);
  render();

  requestAnimationFrame(gameLoop);
}

// --------------------------------------------------
// UPDATE
// --------------------------------------------------
function update(dt) {
  // Screen shake decay
  if (screenShake > 0) {
    screenShake -= dt * 25;
    if (screenShake < 0) screenShake = 0;
  }

  // Floating text update
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const t = floatingTexts[i];
    t.y += t.vy;
    t.alpha -= dt * 0.9;
    if (t.alpha <= 0) floatingTexts.splice(i, 1);
  }

  // Particles update
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    if (p.isShell) {
      p.vy += 9.8 * dt * 30; // Gravity on shells
      if (p.y >= 398) {
        p.y = 398;
        p.vy = -p.vy * 0.4;
        p.vx *= 0.7;
      }
    }
    p.alpha -= p.decay;
    if (p.alpha <= 0) particles.splice(i, 1);
  }

  if (gameState !== "PLAYING") {
    // If dead, animate soul floating up
    if (player.health <= 0) {
      player.soulY -= 35 * dt;
    }
    return;
  }

  // 1. Player updates
  if (player.invulnerableTimer > 0) player.invulnerableTimer -= dt;
  if (player.shootCooldown > 0) player.shootCooldown -= dt;

  if (player.powerupTimer > 0) {
    player.powerupTimer -= dt;
    if (player.powerupTimer <= 0) {
      player.powerupType = null;
      addFloatingText("POWERUP EXPIRED", player.x + player.width / 2, player.y - 10, "#8b949e");
    }
  }

  // Reload timer
  if (player.reloading) {
    player.reloadTimer -= dt;
    if (player.reloadTimer <= 0) {
      player.reloading = false;
      player.ammo = player.maxAmmo;
      addFloatingText("READY!", player.x + player.width / 2, player.y - 10, "#3fb950");
    }
  }

  if (keys.reload && !player.reloading && player.ammo < player.maxAmmo) {
    startReload();
  }

  // Horizontal Movement
  player.crouched = keys.down && player.grounded;

  if (player.crouched) {
    player.vx = 0;
  } else {
    if (keys.left) {
      player.vx = -player.speed;
      player.facing = -1;
    } else if (keys.right) {
      player.vx = player.speed;
      player.facing = 1;
    } else {
      player.vx *= 0.65;
      if (Math.abs(player.vx) < 0.2) player.vx = 0;
    }
  }

  // Jump
  if (keys.up && player.grounded && !player.crouched) {
    player.vy = player.jumpStrength;
    player.grounded = false;
    playSound("jump");
  }

  // Gravity
  player.vy += 22 * dt;
  player.x += player.vx;
  player.y += player.vy;

  // Collision with boundaries
  if (player.x < 10) player.x = 10;
  if (player.x + player.width > canvas.width - 10) player.x = canvas.width - 10 - player.width;

  // Platform collision
  player.grounded = false;
  platforms.forEach(p => {
    // Landing on top of platform
    if (
      player.vy >= 0 &&
      player.x + player.width * 0.7 > p.x &&
      player.x + player.width * 0.3 < p.x + p.w &&
      player.y + player.height >= p.y &&
      player.y + player.height <= p.y + 16
    ) {
      player.y = p.y - player.height;
      player.vy = 0;
      player.grounded = true;
    }
  });

  // Shoot trigger
  if (keys.shoot) {
    shootWeapon();
  }

  // Animation state determination
  if (!player.grounded) {
    player.animState = "jump";
  } else if (player.crouched) {
    player.animState = keys.shoot ? "crouch_shoot" : "crouch";
  } else if (Math.abs(player.vx) > 0.4) {
    player.animState = keys.shoot ? "run_shoot" : "run";
  } else {
    player.animState = keys.shoot ? "stand_shoot" : "idle";
  }

  // Update animation frame timer
  player.frameTimer += dt;
  if (player.frameTimer >= player.frameSpeed) {
    player.frameTimer = 0;
    player.frameIndex++;
  }

  // 2. Bullets update
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.vx;
    b.y += b.vy;
    b.life--;

    // Out of bounds
    if (b.x < 0 || b.x > canvas.width || b.life <= 0) {
      bullets.splice(i, 1);
      continue;
    }

    // Hit enemies
    let bulletRemoved = false;
    for (let j = enemies.length - 1; j >= 0; j--) {
      const e = enemies[j];
      if (
        b.x > e.x &&
        b.x < e.x + e.width &&
        b.y > e.y &&
        b.y < e.y + e.height
      ) {
        e.health -= b.damage;
        createSparks(b.x, b.y, 6, "#fffa9e");
        playSound("hit");

        if (e.health <= 0) {
          // Enemy defeated
          createExplosion(e.x + e.width / 2, e.y + e.height / 2, e.type === "boss" ? 60 : 25);
          score += e.scoreValue;
          addFloatingText(`+${e.scoreValue}`, e.x + e.width / 2, e.y, "#58a6ff");

          // Random item drop chance (25%)
          if (Math.random() < 0.28 && e.type !== "boss") {
            const dropType = Math.random() < 0.45 ? "health" : Math.random() < 0.75 ? "ammo" : "triple";
            pickups.push({
              type: dropType,
              x: e.x + e.width / 2 - 10,
              y: e.y + e.height / 2,
              vy: -3,
              width: 20,
              height: 20
            });
          }

          if (e.type === "boss") {
            bossActive = false;
            if (audioFiles.bossMusic) audioFiles.bossMusic.pause();
            addFloatingText("BOSS DEFEATED!", canvas.width / 2, 180, "#3fb950");
            score += 5000;
            setTimeout(() => {
              wave++;
              waveSpawnCount = 0;
              waveSpawnMax += 4;
            }, 2500);
          }

          enemies.splice(j, 1);
        }

        bullets.splice(i, 1);
        bulletRemoved = true;
        break;
      }
    }
  }

  // 3. Enemy bullets update
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const eb = enemyBullets[i];
    eb.x += eb.vx;
    eb.y += eb.vy;

    if (eb.x < -20 || eb.x > canvas.width + 20 || eb.y < -20 || eb.y > canvas.height + 20) {
      enemyBullets.splice(i, 1);
      continue;
    }

    // Check hit player
    if (
      player.invulnerableTimer <= 0 &&
      eb.x > player.x &&
      eb.x < player.x + player.width &&
      eb.y > player.y &&
      eb.y < player.y + player.height
    ) {
      player.health -= eb.damage || 15;
      player.invulnerableTimer = 0.8;
      createSparks(player.x + player.width / 2, player.y + player.height / 2, 10, "#f85149");
      playSound("hit");
      screenShake = 6;
      enemyBullets.splice(i, 1);

      if (player.health <= 0) {
        player.health = 0;
        gameOver();
      }
    }
  }

  // 4. Enemies update
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];

    if (e.type === "crawler") {
      e.x += e.vx;
      // Reverse at screen edges
      if (e.x < 10 || e.x + e.width > canvas.width - 10) e.vx = -e.vx;
    } else if (e.type === "trooper") {
      // Moves towards player until within shooting range
      const dist = (player.x + player.width / 2) - (e.x + e.width / 2);
      if (Math.abs(dist) > 220) {
        e.x += Math.sign(dist) * 1.5;
      }

      e.shootTimer -= dt;
      if (e.shootTimer <= 0) {
        e.shootTimer = 2.2 + Math.random() * 0.8;
        const dir = Math.sign(dist);
        enemyBullets.push({
          x: e.x + (dir === 1 ? e.width : 0),
          y: e.y + 18,
          vx: dir * 7.5,
          vy: 0,
          damage: 16
        });
        createSparks(e.x + e.width / 2, e.y + 18, 3, "#f85149");
      }
    } else if (e.type === "drone") {
      e.time += dt * 2.5;
      e.x += e.vx;
      e.y = e.baseY + Math.sin(e.time) * 35;
      if (e.x < 10 || e.x + e.width > canvas.width - 10) e.vx = -e.vx;

      e.shootTimer -= dt;
      if (e.shootTimer <= 0) {
        e.shootTimer = 2.4;
        // Fire directed bullet at player
        const dx = (player.x + player.width / 2) - (e.x + e.width / 2);
        const dy = (player.y + player.height / 2) - (e.y + e.height / 2);
        const angle = Math.atan2(dy, dx);
        enemyBullets.push({
          x: e.x + e.width / 2,
          y: e.y + e.height / 2,
          vx: Math.cos(angle) * 6,
          vy: Math.sin(angle) * 6,
          damage: 14
        });
      }
    } else if (e.type === "boss") {
      // Boss pattern
      e.x += e.vx;
      if (e.x < 420 || e.x + e.width > canvas.width - 20) {
        e.vx = -e.vx;
      }

      e.attackTimer -= dt;
      if (e.attackTimer <= 0) {
        e.attackTimer = 2.0;
        // Boss spread attack
        for (let a = -0.4; a <= 0.41; a += 0.2) {
          enemyBullets.push({
            x: e.x,
            y: e.y + e.height * 0.45,
            vx: -Math.cos(a) * 7.5,
            vy: Math.sin(a) * 7.5,
            damage: 20
          });
        }
        createExplosion(e.x, e.y + e.height * 0.45, 10, "#ff4444");
      }
    }

    // Direct collision with player
    if (
      player.invulnerableTimer <= 0 &&
      player.x + player.width > e.x &&
      player.x < e.x + e.width &&
      player.y + player.height > e.y &&
      player.y < e.y + e.height
    ) {
      player.health -= 25;
      player.invulnerableTimer = 1.0;
      createSparks(player.x + player.width / 2, player.y + player.height / 2, 12, "#f85149");
      playSound("hit");
      screenShake = 8;
      if (player.health <= 0) {
        player.health = 0;
        gameOver();
      }
    }
  }

  // 5. Pickups update
  for (let i = pickups.length - 1; i >= 0; i--) {
    const item = pickups[i];
    item.vy += 12 * dt;
    item.y += item.vy;

    // Land on ground
    if (item.y > 380) {
      item.y = 380;
      item.vy = 0;
    }

    // Check collision with player
    if (
      player.x + player.width > item.x &&
      player.x < item.x + item.width &&
      player.y + player.height > item.y &&
      player.y < item.y + item.height
    ) {
      playSound("pickup");
      if (item.type === "health") {
        player.health = Math.min(player.maxHealth, player.health + 35);
        addFloatingText("+35 HP", item.x, item.y, "#3fb950");
      } else if (item.type === "ammo") {
        player.ammo = player.maxAmmo;
        player.reloading = false;
        addFloatingText("AMMO FULL", item.x, item.y, "#58a6ff");
      } else if (item.type === "triple") {
        player.powerupType = "triple";
        player.powerupTimer = 12.0;
        addFloatingText("TRIPLE SPREAD!", item.x, item.y, "#f0883e");
      }
      pickups.splice(i, 1);
    }
  }

  // 6. Wave Progression & Spawning
  waveTimer += dt;
  if (!bossActive && waveTimer >= 1.8 && waveSpawnCount < waveSpawnMax) {
    waveTimer = 0;
    waveSpawnCount++;

    const rand = Math.random();
    if (wave >= 3 && rand < 0.35) {
      spawnEnemy("drone");
    } else if (rand < 0.55) {
      spawnEnemy("trooper");
    } else {
      spawnEnemy("crawler");
    }
  }

  // Check if wave is cleared
  if (!bossActive && waveSpawnCount >= waveSpawnMax && enemies.length === 0) {
    if (wave % 5 === 0) {
      // Boss wave!
      spawnEnemy("boss");
    } else {
      wave++;
      waveSpawnCount = 0;
      waveSpawnMax += 3;
      addFloatingText(`WAVE ${wave}`, canvas.width / 2, 140, "#58a6ff");
      player.ammo = player.maxAmmo;
    }
  }

  // High score tracking
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("john_shooter_highscore", highScore);
  }
}

function gameOver() {
  gameState = "GAMEOVER";
  playSound("explosion");
  if (audioFiles.bossMusic) {
    audioFiles.bossMusic.pause();
  }
}

// --------------------------------------------------
// RENDER ENGINE
// --------------------------------------------------
function render() {
  ctx.save();

  // Screen shake effect
  if (screenShake > 0) {
    const rx = (Math.random() - 0.5) * screenShake;
    const ry = (Math.random() - 0.5) * screenShake;
    ctx.translate(rx, ry);
  }

  // 1. Draw Parallax Backgrounds
  if (assets.caveBg.complete) {
    // Parallax scrolling
    const bgOffset = (Date.now() * 0.015) % canvas.width;
    ctx.drawImage(assets.caveBg, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Clouds layer
  if (assets.clouds.complete) {
    const cloudOffset = (Date.now() * 0.02) % (canvas.width + 200);
    ctx.drawImage(assets.clouds, canvas.width - cloudOffset, 30, 180, 42);
    ctx.drawImage(assets.clouds, canvas.width - (cloudOffset + 350) % (canvas.width + 200), 70, 140, 32);
  }

  // Jungle Trees
  if (assets.tree1.complete && assets.tree2.complete) {
    ctx.drawImage(assets.tree1, 40, 290, 80, 110);
    ctx.drawImage(assets.tree2, 700, 290, 70, 110);
    ctx.drawImage(assets.tree1, 440, 110, 70, 110);
  }

  // 2. Draw Platforms & Ground
  platforms.forEach(p => {
    if (assets.platformTile.complete) {
      // Repeat platform tile horizontally
      const tileW = 48;
      const tileH = p.h;
      for (let tx = p.x; tx < p.x + p.w; tx += tileW) {
        const renderW = Math.min(tileW, p.x + p.w - tx);
        ctx.drawImage(assets.platformTile, 0, 0, 48, 40, tx, p.y, renderW, tileH);
      }
    } else {
      ctx.fillStyle = p.isGround ? "#1d2430" : "#2d3748";
      ctx.fillRect(p.x, p.y, p.w, p.h);
    }

    // Platform highlight border
    ctx.strokeStyle = "#4a5568";
    ctx.lineWidth = 2;
    ctx.strokeRect(p.x, p.y, p.w, p.h);
  });

  // 3. Render Pickups
  pickups.forEach(item => {
    ctx.save();
    ctx.translate(item.x + item.width / 2, item.y + item.height / 2);
    // Bobbing animation
    const bob = Math.sin(Date.now() * 0.008) * 3;
    ctx.translate(0, bob);

    if (item.type === "health") {
      ctx.fillStyle = "#238636";
      ctx.fillRect(-10, -10, 20, 20);
      ctx.fillStyle = "#fff";
      ctx.fillRect(-2, -7, 4, 14);
      ctx.fillRect(-7, -2, 14, 4);
    } else if (item.type === "ammo") {
      ctx.fillStyle = "#1f6feb";
      ctx.fillRect(-10, -10, 20, 20);
      ctx.fillStyle = "#ffd700";
      ctx.fillRect(-5, -6, 10, 12);
    } else if (item.type === "triple") {
      ctx.fillStyle = "#d29922";
      ctx.fillRect(-10, -10, 20, 20);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px Courier New";
      ctx.fillText("3X", -7, 4);
    }
    ctx.restore();
  });

  // 4. Render Enemies
  enemies.forEach(e => {
    ctx.save();
    if (e.type === "crawler") {
      // Fast crawling cyber-mutant
      ctx.fillStyle = "#da3633";
      ctx.fillRect(e.x, e.y + 6, e.width, e.height - 6);
      // Eye & legs
      ctx.fillStyle = "#ffff00";
      const eyeX = e.vx > 0 ? e.x + e.width - 8 : e.x + 4;
      ctx.fillRect(eyeX, e.y + 10, 5, 5);
      // Legs
      ctx.strokeStyle = "#8e1515";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(e.x + 4, e.y + e.height);
      ctx.lineTo(e.x, e.y + e.height + 4);
      ctx.moveTo(e.x + e.width - 4, e.y + e.height);
      ctx.lineTo(e.x + e.width, e.y + e.height + 4);
      ctx.stroke();
    } else if (e.type === "trooper") {
      // Soldier with armor
      ctx.fillStyle = "#30363d";
      ctx.fillRect(e.x, e.y, e.width, e.height);
      // Visor
      ctx.fillStyle = "#f85149";
      ctx.fillRect(e.x + 4, e.y + 8, e.width - 8, 6);
      // Gun
      ctx.fillStyle = "#161b22";
      ctx.fillRect(e.x - 6, e.y + 20, e.width + 12, 6);
    } else if (e.type === "drone") {
      // Flying drone
      ctx.fillStyle = "#6e7681";
      ctx.beginPath();
      ctx.arc(e.x + e.width / 2, e.y + e.height / 2, 14, 0, Math.PI * 2);
      ctx.fill();
      // Glowing core
      ctx.fillStyle = "#58a6ff";
      ctx.beginPath();
      ctx.arc(e.x + e.width / 2, e.y + e.height / 2, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (e.type === "boss") {
      // Giant Mech Boss
      ctx.fillStyle = "#21262d";
      ctx.fillRect(e.x, e.y, e.width, e.height);
      ctx.strokeStyle = "#f85149";
      ctx.lineWidth = 4;
      ctx.strokeRect(e.x, e.y, e.width, e.height);

      // Boss cockpit visor
      ctx.fillStyle = "#f85149";
      ctx.fillRect(e.x + 15, e.y + 25, e.width - 30, 20);

      // Cannons
      ctx.fillStyle = "#8b949e";
      ctx.fillRect(e.x - 14, e.y + 60, 20, 16);
      ctx.fillRect(e.x - 14, e.y + 90, 20, 16);

      // Boss Health Bar above head
      const barW = e.width;
      const barH = 10;
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(e.x, e.y - 18, barW, barH);
      const healthPct = Math.max(0, e.health / e.maxHealth);
      ctx.fillStyle = "#f85149";
      ctx.fillRect(e.x, e.y - 18, barW * healthPct, barH);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1;
      ctx.strokeRect(e.x, e.y - 18, barW, barH);
    }

    // Standard enemy health bar
    if (e.type !== "boss" && e.health < e.maxHealth) {
      const bw = e.width;
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(e.x, e.y - 8, bw, 4);
      ctx.fillStyle = "#3fb950";
      ctx.fillRect(e.x, e.y - 8, bw * (e.health / e.maxHealth), 4);
    }
    ctx.restore();
  });

  // 5. Render Bullets
  bullets.forEach(b => {
    if (assets.bullet.complete) {
      ctx.drawImage(assets.bullet, b.x, b.y - 4, 18, 8);
    } else {
      ctx.fillStyle = "#ffe066";
      ctx.fillRect(b.x, b.y - 3, 14, 6);
    }
  });

  enemyBullets.forEach(eb => {
    ctx.fillStyle = "#f85149";
    ctx.beginPath();
    ctx.arc(eb.x, eb.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffa198";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  // 6. Render Particles
  particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
    ctx.restore();
  });

  // 7. Render Player ("John")
  if (gameState === "PLAYING" || gameState === "GAMEOVER") {
    ctx.save();

    // Invulnerability blink
    if (player.invulnerableTimer > 0 && Math.floor(Date.now() / 80) % 2 === 0) {
      ctx.globalAlpha = 0.35;
    }

    // Translate to player center for flipping
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    if (player.facing === -1) {
      ctx.scale(-1, 1);
    }

    // Select sprite & frame
    let sprite = assets.johnIdle;
    let frameCount = 5;
    let frameWidth = 26;
    let frameHeight = 22;

    if (player.health <= 0) {
      sprite = assets.johnSoul;
      frameCount = 2;
      frameWidth = 26;
      frameHeight = 30;
      ctx.translate(0, player.soulY);
    } else if (player.animState === "jump") {
      sprite = assets.johnJump;
      frameCount = 9;
    } else if (player.animState === "run_shoot") {
      sprite = assets.johnRunShoot;
      frameCount = 10;
    } else if (player.animState === "run") {
      sprite = assets.johnRun;
      frameCount = 10;
    } else if (player.animState === "crouch_shoot") {
      sprite = assets.johnCrouchShoot;
      frameCount = 2;
      frameHeight = 26;
    } else if (player.animState === "crouch") {
      sprite = assets.johnCrouch;
      frameCount = 2;
      frameHeight = 26;
    } else if (player.animState === "stand_shoot") {
      sprite = assets.johnStandShoot;
      frameCount = 2;
    }

    const currentFrame = player.frameIndex % frameCount;

    if (sprite && sprite.complete) {
      ctx.drawImage(
        sprite,
        currentFrame * frameWidth,
        0,
        frameWidth,
        frameHeight,
        -player.width / 2,
        -player.height / 2,
        player.width,
        player.height
      );
    } else {
      // Fallback geometric soldier
      ctx.fillStyle = "#58a6ff";
      ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
    }

    ctx.restore();
  }

  // 8. Floating Texts
  floatingTexts.forEach(t => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, t.alpha);
    ctx.fillStyle = t.color;
    ctx.font = "bold 14px 'Courier New', monospace";
    ctx.shadowColor = "#000";
    ctx.shadowBlur = 4;
    ctx.fillText(t.text, t.x, t.y);
    ctx.restore();
  });

  // 9. HUD (Heads-Up Display)
  renderHUD();

  // 10. Title / Game Over Overlays
  if (gameState === "TITLE") {
    renderTitleScreen();
  } else if (gameState === "GAMEOVER") {
    renderGameOverScreen();
  }

  ctx.restore();
}

// --------------------------------------------------
// HUD RENDERER
// --------------------------------------------------
function renderHUD() {
  // Top HUD Bar Background
  ctx.fillStyle = "rgba(13, 17, 23, 0.85)";
  ctx.fillRect(0, 0, canvas.width, 42);
  ctx.strokeStyle = "#30363d";
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, canvas.width, 42);

  // Health Bar
  ctx.fillStyle = "#c9d1d9";
  ctx.font = "bold 13px 'Courier New', monospace";
  ctx.fillText("HP", 14, 26);

  const hpBarW = 140;
  const hpBarH = 16;
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(40, 13, hpBarW, hpBarH);

  const healthPct = Math.max(0, player.health / player.maxHealth);
  ctx.fillStyle = (player.health > 40) ? "#3fb950" : (player.health > 20) ? "#d29922" : "#f85149";
  ctx.fillRect(40, 13, hpBarW * healthPct, hpBarH);
  ctx.strokeStyle = "#484f58";
  ctx.strokeRect(40, 13, hpBarW, hpBarH);

  // Ammo Display
  ctx.fillStyle = "#c9d1d9";
  ctx.fillText("AMMO", 200, 26);
  ctx.fillStyle = player.reloading ? "#f0883e" : (player.ammo <= 5) ? "#f85149" : "#58a6ff";
  ctx.fillText(player.reloading ? "RELOADING" : `${player.ammo}/${player.maxAmmo}`, 246, 26);

  // Wave & Score
  ctx.fillStyle = "#ffd700";
  ctx.fillText(`WAVE: ${wave}`, 390, 26);

  ctx.fillStyle = "#fff";
  ctx.fillText(`SCORE: ${score}`, 530, 26);

  ctx.fillStyle = "#8b949e";
  ctx.fillText(`HI: ${highScore}`, 680, 26);

  // Powerup active indicator
  if (player.powerupType) {
    ctx.fillStyle = "#f0883e";
    ctx.font = "bold 12px 'Courier New', monospace";
    ctx.fillText(`⚡ ${player.powerupType.toUpperCase()}: ${Math.ceil(player.powerupTimer)}s`, 20, 64);
  }
}

// --------------------------------------------------
// TITLE & GAME OVER SCREENS
// --------------------------------------------------
function renderTitleScreen() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (assets.titleLogo.complete) {
    ctx.drawImage(assets.titleLogo, canvas.width / 2 - 130, 80, 260, 136);
  } else {
    ctx.fillStyle = "#58a6ff";
    ctx.font = "bold 38px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText("JOHN: ROGUE COMMANDO", canvas.width / 2, 140);
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#c9d1d9";
  ctx.font = "16px 'Courier New', monospace";
  ctx.fillText("Arcade Side-Scrolling Retro Shooter", canvas.width / 2, 250);

  // Pulsing start prompt
  const alpha = 0.5 + Math.sin(Date.now() * 0.006) * 0.5;
  ctx.fillStyle = `rgba(88, 166, 255, ${alpha})`;
  ctx.font = "bold 20px 'Courier New', monospace";
  ctx.fillText("▶ PRESS SPACE OR CLICK TO START ◀", canvas.width / 2, 320);

  ctx.fillStyle = "#8b949e";
  ctx.font = "13px 'Courier New', monospace";
  ctx.fillText("Controls: [A/D] Move  [W] Jump  [S] Crouch  [J/Click] Shoot  [R] Reload", canvas.width / 2, 390);
  ctx.fillText(`All-time High Score: ${highScore}`, canvas.width / 2, 420);
  ctx.textAlign = "left";
}

function renderGameOverScreen() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.82)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (assets.gameOverBanner.complete) {
    ctx.drawImage(assets.gameOverBanner, canvas.width / 2 - 240, 80, 480, 70);
  } else {
    ctx.fillStyle = "#f85149";
    ctx.font = "bold 44px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText("MISSION FAILED", canvas.width / 2, 130);
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#fff";
  ctx.font = "22px 'Courier New', monospace";
  ctx.fillText(`FINAL SCORE: ${score}`, canvas.width / 2, 210);

  ctx.fillStyle = "#ffd700";
  ctx.font = "17px 'Courier New', monospace";
  ctx.fillText(`WAVES SURVIVED: ${wave - 1}`, canvas.width / 2, 245);
  ctx.fillText(`HIGH SCORE: ${highScore}`, canvas.width / 2, 275);

  const alpha = 0.5 + Math.sin(Date.now() * 0.006) * 0.5;
  ctx.fillStyle = `rgba(63, 185, 80, ${alpha})`;
  ctx.font = "bold 19px 'Courier New', monospace";
  ctx.fillText("▶ PRESS SPACE OR CLICK TO RETRY ◀", canvas.width / 2, 350);
  ctx.textAlign = "left";
}

// Kick off game loop
requestAnimationFrame(gameLoop);
