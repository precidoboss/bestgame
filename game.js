// =========================================================================
// JOHN: ROGUE COMMANDO - FULLSCREEN OPEN WORLD CYBER SHOOTER
// Dynamic Viewport, True Edge-to-Edge Fullscreen, Space Shooting, Sprites & AI
// =========================================================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

// Dynamic Fullscreen Canvas Resize
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  camera.width = canvas.width;
  camera.height = canvas.height;
  ctx.imageSmoothingEnabled = false;
}
window.addEventListener("resize", resizeCanvas);

// --------------------------------------------------
// AUDIO & SOUND ENGINE
// --------------------------------------------------
let soundEnabled = true;
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

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
  try {
    if (audioFiles[type]) {
      const clone = audioFiles[type].cloneNode();
      clone.volume = (type === "shot") ? 0.45 : (type === "step") ? 0.25 : 0.6;
      clone.play().catch(() => playSynth(type));
      return;
    }
  } catch (e) {}
  playSynth(type);
}

function playSynth(type) {
  if (!soundEnabled || !audioCtx) return;
  const now = audioCtx.currentTime;

  if (type === "shot" || type === "rifle") {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.12);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  } else if (type === "shotgun") {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.22);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  } else if (type === "railgun") {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.25);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  } else if (type === "rocket") {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(400, now + 0.15);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  } else if (type === "dash") {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  } else if (type === "explosion") {
    const bufferSize = audioCtx.sampleRate * 0.4;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.1));
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(500, now);
    filter.frequency.linearRampToValueAtTime(80, now + 0.4);
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.45, now);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start(now);
  } else if (type === "pickup") {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(523, now);
    osc.frequency.setValueAtTime(784, now + 0.08);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  } else if (type === "hit") {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.07);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  }
}

// --------------------------------------------------
// ASSET MANAGEMENT & SPRITES
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
  gameOverBanner: "GameOverScreen.png",

  // Additional Generated Assets
  bossMech: "boss_mech.png",
  enemyTrooper: "enemy_trooper.png",
  enemyArachnid: "enemy_arachnid.png",
  enemyDrone: "enemy_drone.png",
  crateLoot: "crate_loot.png",
  medkit: "medkit.png",
  shieldOrb: "shield_orb.png"
};

for (const [key, src] of Object.entries(assetSources)) {
  const img = new Image();
  img.src = src;
  assets[key] = img;
}

// --------------------------------------------------
// GAME STATE & PERSISTENCE
// --------------------------------------------------
let gameState = "MAIN_MENU"; // MAIN_MENU, PLAYING, ARMORY, WORLD_MAP, LORE, SETTINGS, PAUSED, GAMEOVER, VICTORY
let previousState = "MAIN_MENU";

let scrap = parseInt(localStorage.getItem("john_scrap") || "120");
let highScore = parseInt(localStorage.getItem("john_highscore") || "0");
let discoveredZones = JSON.parse(localStorage.getItem("john_discovered_zones") || '["Delta Outpost"]');
let currentZoneName = "Delta Outpost";
let zoneBannerTimer = 0;

// Weapons
const weapons = {
  rifle: {
    name: "Viper Assault Rifle",
    damage: 32,
    fireRate: 0.12,
    magSize: 30,
    ammo: 30,
    maxAmmo: 30,
    unlocked: true,
    level: 1,
    color: "#58a6ff"
  },
  shotgun: {
    name: "Hydra Plasma Shotgun",
    damage: 22,
    pellets: 5,
    fireRate: 0.45,
    magSize: 8,
    ammo: 8,
    maxAmmo: 8,
    unlocked: true,
    level: 1,
    color: "#f0883e"
  },
  railgun: {
    name: "Zeus Pierce Railgun",
    damage: 130,
    fireRate: 0.65,
    magSize: 4,
    ammo: 4,
    maxAmmo: 4,
    unlocked: false,
    cost: 150,
    level: 1,
    color: "#a371f7"
  },
  rocket: {
    name: "Titan Rocket Launcher",
    damage: 220,
    fireRate: 0.85,
    magSize: 3,
    ammo: 3,
    maxAmmo: 3,
    unlocked: false,
    cost: 250,
    level: 1,
    color: "#f85149"
  }
};

let currentWeaponKey = "rifle";

// --------------------------------------------------
// OPEN WORLD CONSTANTS & CAMERA
// --------------------------------------------------
const WORLD_WIDTH = 4200;
const WORLD_HEIGHT = 800;

const camera = {
  x: 0,
  y: 0,
  width: window.innerWidth,
  height: window.innerHeight,
  shake: 0
};

// Initial resize call
resizeCanvas();

// Open-World Biomes
const ZONES = [
  { name: "Delta Outpost (Safe Zone)", startX: 0, endX: 950, color: "#161b22" },
  { name: "Toxic Jungle & Overgrown Canopy", startX: 950, endX: 2000, color: "#0d2818" },
  { name: "Subterranean Crystal Vaults", startX: 2000, endX: 3050, color: "#1c1427" },
  { name: "The Cyber-Citadel (Boss Arena)", startX: 3050, endX: 4200, color: "#2d0a0a" }
];

// Fast Travel Checkpoints
const checkpoints = [
  { id: "cp1", name: "Outpost Command Hub", x: 140, y: 580, active: true, zone: "Delta Outpost" },
  { id: "cp2", name: "Jungle Ruins Outpost", x: 1200, y: 580, active: false, zone: "Toxic Jungle" },
  { id: "cp3", name: "Crystal Mine Elevator", x: 2250, y: 580, active: false, zone: "Crystal Vaults" },
  { id: "cp4", name: "Citadel Front Gate", x: 3150, y: 580, active: false, zone: "The Cyber-Citadel" }
];

let lastActiveCheckpoint = checkpoints[0];

// Dynamic Platforms across World
const worldPlatforms = [
  // Ground layers across entire map
  { x: 0, y: 640, w: 1000, h: 160, type: "ground" },
  { x: 1000, y: 640, w: 1100, h: 160, type: "ground" },
  { x: 2100, y: 640, w: 1000, h: 160, type: "ground" },
  { x: 3100, y: 640, w: 1100, h: 160, type: "ground" },

  // Zone 1 Platforms
  { x: 220, y: 540, w: 180, h: 20 },
  { x: 480, y: 460, w: 170, h: 20 },
  { x: 740, y: 530, w: 150, h: 20 },

  // Zone 2 Platforms (Jungle)
  { x: 1020, y: 530, w: 160, h: 20 },
  { x: 1260, y: 440, w: 220, h: 22 },
  { x: 1580, y: 360, w: 200, h: 22 },
  { x: 1840, y: 500, w: 150, h: 20 },

  // Zone 3 Platforms (Crystal Caverns)
  { x: 2180, y: 530, w: 180, h: 20 },
  { x: 2420, y: 440, w: 190, h: 20 },
  { x: 2680, y: 520, w: 160, h: 20 },
  { x: 2900, y: 440, w: 160, h: 20 },

  // Zone 4 Platforms (Citadel)
  { x: 3200, y: 530, w: 190, h: 20 },
  { x: 3480, y: 450, w: 240, h: 22 },
  { x: 3800, y: 520, w: 190, h: 20 }
];

// Open-World Supply Crates
let lootCrates = [
  { x: 340, y: 510, w: 32, h: 32, health: 30, opened: false, reward: "scrap", amount: 30 },
  { x: 1350, y: 410, w: 32, h: 32, health: 30, opened: false, reward: "railgun_unlock", amount: 1 },
  { x: 1700, y: 610, w: 32, h: 32, health: 30, opened: false, reward: "scrap", amount: 60 },
  { x: 2500, y: 410, w: 32, h: 32, health: 30, opened: false, reward: "rocket_unlock", amount: 1 },
  { x: 2950, y: 410, w: 32, h: 32, health: 30, opened: false, reward: "scrap", amount: 80 }
];

// --------------------------------------------------
// PLAYER DEFINITION
// --------------------------------------------------
const player = {
  x: 140,
  y: 570,
  vx: 0,
  vy: 0,
  width: 26 * 2.2,
  height: 22 * 2.2,
  speed: 4.8,
  jumpStrength: -11.6,
  facing: 1,
  grounded: false,
  crouched: false,

  // Health & Shield
  health: 100,
  maxHealth: 100,
  shield: 50,
  maxShield: 50,
  shieldRegenTimer: 0,

  // Tactical Dash
  dashCooldown: 0,
  dashCooldownMax: 1.5,
  isDashing: false,
  dashTimer: 0,

  // Combat
  shootCooldown: 0,
  reloading: false,
  reloadTimer: 0,
  invulnerableTimer: 0,
  soulY: 0,

  // Animation
  animState: "idle",
  frameIndex: 0,
  frameTimer: 0,
  frameSpeed: 0.08
};

// World Entities
let bullets = [];
let enemyBullets = [];
let enemies = [];
let particles = [];
let pickups = [];
let floatingTexts = [];

// --------------------------------------------------
// INPUT CONTROLLER (SPACE FOR SHOOTING!)
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

  // Spacebar SHOOTS!
  if (e.code === "Space") {
    keys.shoot = true;
    e.preventDefault();
  }

  // W or ArrowUp JUMPS!
  if (e.code === "KeyW" || e.code === "ArrowUp") {
    keys.up = true;
    e.preventDefault();
  }

  if (e.code === "KeyA" || e.code === "ArrowLeft") keys.left = true;
  if (e.code === "KeyD" || e.code === "ArrowRight") keys.right = true;
  if (e.code === "KeyS" || e.code === "ArrowDown") keys.down = true;

  // Additional shoot bindings
  if (e.code === "KeyJ" || e.code === "KeyZ" || e.code === "KeyF") keys.shoot = true;
  if (e.code === "KeyR") keys.reload = true;
  if (e.code === "ShiftLeft" || e.code === "ShiftRight") triggerDash();

  // Weapon Switch
  if (e.code === "KeyQ") switchWeapon(-1);
  if (e.code === "KeyE") switchWeapon(1);
  if (e.code === "Digit1") selectWeapon("rifle");
  if (e.code === "Digit2") selectWeapon("shotgun");
  if (e.code === "Digit3" && weapons.railgun.unlocked) selectWeapon("railgun");
  if (e.code === "Digit4" && weapons.rocket.unlocked) selectWeapon("rocket");

  // Menu / Pause
  if (e.code === "KeyM" || e.code === "Escape") {
    if (gameState === "PLAYING") gameState = "PAUSED";
    else if (gameState === "PAUSED") gameState = "PLAYING";
    else if (gameState !== "MAIN_MENU") gameState = "MAIN_MENU";
  }
});

window.addEventListener("keyup", (e) => {
  if (e.code === "Space") keys.shoot = false;
  if (e.code === "KeyW" || e.code === "ArrowUp") keys.up = false;
  if (e.code === "KeyA" || e.code === "ArrowLeft") keys.left = false;
  if (e.code === "KeyD" || e.code === "ArrowRight") keys.right = false;
  if (e.code === "KeyS" || e.code === "ArrowDown") keys.down = false;
  if (e.code === "KeyJ" || e.code === "KeyZ" || e.code === "KeyF") keys.shoot = false;
  if (e.code === "KeyR") keys.reload = false;
});

canvas.addEventListener("mousedown", (e) => {
  initAudio();
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  if (gameState === "MAIN_MENU") {
    handleMenuClick(mx, my);
    return;
  }
  if (gameState === "ARMORY") {
    handleArmoryClick(mx, my);
    return;
  }
  if (gameState === "WORLD_MAP") {
    handleWorldMapClick(mx, my);
    return;
  }
  if (gameState === "LORE" || gameState === "SETTINGS" || gameState === "PAUSED" || gameState === "GAMEOVER") {
    handleOverlayClick(mx, my);
    return;
  }

  if (e.button === 0 && gameState === "PLAYING") {
    keys.shoot = true;
  }
});

canvas.addEventListener("mouseup", (e) => {
  if (e.button === 0) keys.shoot = false;
});

// Setup Mobile Touch Controls
function setupTouch(id, action) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = (e) => {
    e.preventDefault();
    initAudio();
    if (action === "dash") triggerDash();
    else if (action === "switch") switchWeapon(1);
    else keys[action] = true;
  };
  const end = (e) => {
    e.preventDefault();
    if (action !== "dash" && action !== "switch") keys[action] = false;
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
setupTouch("touchDash", "dash");
setupTouch("touchSwitch", "switch");
setupTouch("touchShoot", "shoot");
setupTouch("touchReload", "reload");

// UI Button Handlers
document.getElementById("btnSound").addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  document.getElementById("btnSound").textContent = soundEnabled ? "🔊 Sound" : "🔇 Muted";
  if (!soundEnabled && audioFiles.bossMusic) audioFiles.bossMusic.pause();
});

document.getElementById("btnCrt").addEventListener("click", () => {
  const crt = document.getElementById("crtOverlay");
  crt.classList.toggle("disabled");
  document.getElementById("btnCrt").textContent = crt.classList.contains("disabled") ? "📺 CRT: OFF" : "📺 CRT";
});

document.getElementById("btnFullscreen").addEventListener("click", () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen();
  }
});

// --------------------------------------------------
// WEAPON SWITCH & DASH
// --------------------------------------------------
function switchWeapon(direction) {
  const weaponKeys = Object.keys(weapons).filter(k => weapons[k].unlocked);
  let idx = weaponKeys.indexOf(currentWeaponKey);
  idx = (idx + direction + weaponKeys.length) % weaponKeys.length;
  currentWeaponKey = weaponKeys[idx];
  playSound("select");
  addFloatingText(`EQUIPPED: ${weapons[currentWeaponKey].name}`, player.x + player.width / 2, player.y - 15, weapons[currentWeaponKey].color);
}

function selectWeapon(key) {
  if (weapons[key] && weapons[key].unlocked) {
    currentWeaponKey = key;
    playSound("select");
  }
}

function triggerDash() {
  if (player.dashCooldown > 0 || player.isDashing) return;
  player.isDashing = true;
  player.dashTimer = 0.22;
  player.dashCooldown = player.dashCooldownMax;
  player.invulnerableTimer = 0.25;
  playSound("dash");

  for (let i = 0; i < 8; i++) {
    particles.push({
      x: player.x + Math.random() * player.width,
      y: player.y + Math.random() * player.height,
      vx: -player.facing * (2 + Math.random() * 4),
      vy: (Math.random() - 0.5) * 2,
      size: 4,
      color: "#a371f7",
      alpha: 0.9,
      decay: 0.05
    });
  }
}

// --------------------------------------------------
// SHOOTING ENGINE
// --------------------------------------------------
function shootWeapon() {
  const wp = weapons[currentWeaponKey];
  if (player.reloading || player.shootCooldown > 0) return;
  if (wp.ammo <= 0) {
    startReload();
    return;
  }

  wp.ammo--;
  player.shootCooldown = wp.fireRate;
  playSound(currentWeaponKey);
  camera.shake = Math.max(camera.shake, currentWeaponKey === "rocket" ? 8 : currentWeaponKey === "railgun" ? 6 : 3);

  const gunY = player.crouched ? player.y + 28 : player.y + 22;
  const startX = player.x + (player.facing === 1 ? player.width : 0);

  // Shell Ejection
  particles.push({
    x: player.x + player.width / 2,
    y: gunY,
    vx: -player.facing * (2 + Math.random() * 2),
    vy: -3 - Math.random() * 2,
    size: 2.5,
    isShell: true,
    color: "#ffd700",
    alpha: 1,
    decay: 0.02
  });

  if (currentWeaponKey === "rifle") {
    bullets.push({
      x: startX,
      y: gunY,
      vx: player.facing * 15,
      vy: 0,
      damage: wp.damage,
      type: "rifle",
      color: "#ffe066",
      life: 55
    });
  } else if (currentWeaponKey === "shotgun") {
    [-0.18, -0.09, 0, 0.09, 0.18].forEach(angle => {
      bullets.push({
        x: startX,
        y: gunY,
        vx: Math.cos(angle) * 14 * player.facing,
        vy: Math.sin(angle) * 14,
        damage: wp.damage,
        type: "shotgun",
        color: "#f0883e",
        life: 30
      });
    });
  } else if (currentWeaponKey === "railgun") {
    bullets.push({
      x: startX,
      y: gunY,
      vx: player.facing * 24,
      vy: 0,
      damage: wp.damage,
      pierce: 4,
      type: "railgun",
      color: "#a371f7",
      life: 60
    });
  } else if (currentWeaponKey === "rocket") {
    bullets.push({
      x: startX,
      y: gunY,
      vx: player.facing * 10,
      vy: 0,
      damage: wp.damage,
      isRocket: true,
      type: "rocket",
      color: "#f85149",
      life: 80
    });
  }
}

function startReload() {
  const wp = weapons[currentWeaponKey];
  if (player.reloading || wp.ammo === wp.maxAmmo) return;
  player.reloading = true;
  player.reloadTimer = 1.1;
  playSound("reload");
  addFloatingText("RELOADING...", player.x + player.width / 2, player.y - 12, "#f0883e");
}

// --------------------------------------------------
// ADVANCED ENEMIES
// --------------------------------------------------
function initWorldEnemies() {
  enemies = [
    createEnemy("drone", 650, 420),
    createEnemy("arachnid", 1250, 600),
    createEnemy("arachnid", 1550, 600),
    createEnemy("drone", 1450, 380),
    createEnemy("arachnid", 1850, 600),
    createEnemy("trooper", 2250, 590),
    createEnemy("sniper", 2550, 400),
    createEnemy("trooper", 2750, 590),
    createEnemy("drone", 2850, 400),
    createEnemy("trooper", 3250, 590),
    createEnemy("sniper", 3550, 410),
    createEnemy("boss", 3750, 460)
  ];
}

function createEnemy(type, x, y) {
  if (type === "arachnid") {
    return {
      type: "arachnid",
      name: "Bio-Mutant Stalker",
      x, y,
      vx: 2.2,
      vy: 0,
      width: 46,
      height: 32,
      health: 80,
      maxHealth: 80,
      scoreValue: 120,
      scrapValue: 12
    };
  } else if (type === "trooper") {
    return {
      type: "trooper",
      name: "Cyborg Heavy Trooper",
      x, y,
      vx: 1.4,
      vy: 0,
      width: 36,
      height: 54,
      health: 160,
      maxHealth: 160,
      shootTimer: 1.8,
      scoreValue: 220,
      scrapValue: 20
    };
  } else if (type === "drone") {
    return {
      type: "drone",
      name: "Aerial Recon Gunship",
      x, y,
      vx: 2.0,
      vy: 0,
      baseY: y,
      time: Math.random() * 10,
      width: 42,
      height: 28,
      health: 70,
      maxHealth: 70,
      shootTimer: 2.0,
      scoreValue: 160,
      scrapValue: 15
    };
  } else if (type === "sniper") {
    return {
      type: "sniper",
      name: "Citadel Beam Sniper",
      x, y,
      vx: 0,
      vy: 0,
      width: 34,
      height: 44,
      health: 90,
      maxHealth: 90,
      chargeTimer: 2.5,
      isAiming: false,
      scoreValue: 240,
      scrapValue: 25
    };
  } else if (type === "boss") {
    return {
      type: "boss",
      name: "APEX CYBER-COLOSSUS",
      x, y,
      vx: 1.2,
      vy: 0,
      width: 150,
      height: 190,
      health: 1800,
      maxHealth: 1800,
      phase: 1,
      attackTimer: 2.2,
      active: false,
      scoreValue: 5000,
      scrapValue: 200
    };
  }
}

function createExplosion(x, y, count = 25, color = "#ffaa00") {
  playSound("explosion");
  camera.shake = Math.max(camera.shake, 12);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 6;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 3 + Math.random() * 5,
      color: (i % 2 === 0) ? color : "#ffffff",
      alpha: 1,
      decay: 0.02 + Math.random() * 0.03
    });
  }
}

function addFloatingText(text, x, y, color = "#fff") {
  floatingTexts.push({
    text, x, y,
    color,
    alpha: 1,
    vy: -1.2
  });
}

// --------------------------------------------------
// UPDATE LOOP
// --------------------------------------------------
let lastTime = performance.now();

function update(dt) {
  if (camera.shake > 0) {
    camera.shake -= dt * 25;
    if (camera.shake < 0) camera.shake = 0;
  }

  // Floating text
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const t = floatingTexts[i];
    t.y += t.vy;
    t.alpha -= dt * 0.9;
    if (t.alpha <= 0) floatingTexts.splice(i, 1);
  }

  // Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    if (p.isShell) {
      p.vy += 22 * dt;
      if (p.y >= 638) {
        p.y = 638;
        p.vy = -p.vy * 0.4;
        p.vx *= 0.7;
      }
    }
    p.alpha -= p.decay;
    if (p.alpha <= 0) particles.splice(i, 1);
  }

  if (gameState !== "PLAYING") return;

  // Player Timers
  if (player.invulnerableTimer > 0) player.invulnerableTimer -= dt;
  if (player.shootCooldown > 0) player.shootCooldown -= dt;
  if (player.dashCooldown > 0) player.dashCooldown -= dt;

  if (player.isDashing) {
    player.dashTimer -= dt;
    player.vx = player.facing * 12;
    if (player.dashTimer <= 0) {
      player.isDashing = false;
      player.vx = 0;
    }
  }

  // Shield Regen
  player.shieldRegenTimer -= dt;
  if (player.shieldRegenTimer <= 0 && player.shield < player.maxShield) {
    player.shield = Math.min(player.maxShield, player.shield + dt * 15);
  }

  // Reloading
  if (player.reloading) {
    player.reloadTimer -= dt;
    if (player.reloadTimer <= 0) {
      player.reloading = false;
      weapons[currentWeaponKey].ammo = weapons[currentWeaponKey].maxAmmo;
      addFloatingText("READY!", player.x + player.width / 2, player.y - 12, "#3fb950");
    }
  }

  if (keys.reload && !player.reloading && weapons[currentWeaponKey].ammo < weapons[currentWeaponKey].maxAmmo) {
    startReload();
  }

  // Horizontal Movement
  if (!player.isDashing) {
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
      playSound("step");
    }
  }

  // Gravity
  player.vy += 23 * dt;
  player.x += player.vx;
  player.y += player.vy;

  // Bounds
  if (player.x < 10) player.x = 10;
  if (player.x + player.width > WORLD_WIDTH - 10) player.x = WORLD_WIDTH - 10 - player.width;

  // Platform collision
  player.grounded = false;
  worldPlatforms.forEach(p => {
    if (
      player.vy >= 0 &&
      player.x + player.width * 0.7 > p.x &&
      player.x + player.width * 0.3 < p.x + p.w &&
      player.y + player.height >= p.y &&
      player.y + player.height <= p.y + 18
    ) {
      player.y = p.y - player.height;
      player.vy = 0;
      player.grounded = true;
    }
  });

  // Shoot
  if (keys.shoot) {
    shootWeapon();
  }

  // Animations
  if (!player.grounded) {
    player.animState = "jump";
  } else if (player.crouched) {
    player.animState = keys.shoot ? "crouch_shoot" : "crouch";
  } else if (Math.abs(player.vx) > 0.4) {
    player.animState = keys.shoot ? "run_shoot" : "run";
  } else {
    player.animState = keys.shoot ? "stand_shoot" : "idle";
  }

  player.frameTimer += dt;
  if (player.frameTimer >= player.frameSpeed) {
    player.frameTimer = 0;
    player.frameIndex++;
  }

  // Checkpoints
  checkpoints.forEach(cp => {
    if (Math.abs(player.x - cp.x) < 50 && Math.abs(player.y - cp.y) < 80) {
      if (!cp.active) {
        cp.active = true;
        lastActiveCheckpoint = cp;
        playSound("pickup");
        addFloatingText(`CHECKPOINT DISCOVERED: ${cp.name}`, cp.x, cp.y - 30, "#3fb950");
        if (!discoveredZones.includes(cp.zone)) {
          discoveredZones.push(cp.zone);
          localStorage.setItem("john_discovered_zones", JSON.stringify(discoveredZones));
        }
      }
    }
  });

  // Zones
  ZONES.forEach(z => {
    if (player.x >= z.startX && player.x < z.endX) {
      if (currentZoneName !== z.name) {
        currentZoneName = z.name;
        zoneBannerTimer = 3.5;
        addFloatingText(`ENTERED: ${z.name.toUpperCase()}`, player.x + player.width / 2, player.y - 40, "#58a6ff");
        if (z.name.includes("Citadel") && soundEnabled && audioFiles.bossMusic) {
          audioFiles.bossMusic.currentTime = 0;
          audioFiles.bossMusic.play().catch(() => {});
        }
      }
    }
  });

  if (zoneBannerTimer > 0) zoneBannerTimer -= dt;

  // Bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.vx;
    b.y += b.vy;
    b.life--;

    if (b.x < camera.x - 100 || b.x > camera.x + canvas.width + 100 || b.life <= 0) {
      bullets.splice(i, 1);
      continue;
    }

    lootCrates.forEach(crate => {
      if (!crate.opened && b.x > crate.x && b.x < crate.x + crate.w && b.y > crate.y && b.y < crate.y + crate.h) {
        crate.health -= b.damage;
        createExplosion(crate.x + crate.w / 2, crate.y + crate.h / 2, 8, "#e3b341");
        if (crate.health <= 0) {
          crate.opened = true;
          if (crate.reward === "scrap") {
            scrap += crate.amount;
            localStorage.setItem("john_scrap", scrap);
            addFloatingText(`+${crate.amount} SCRAP!`, crate.x, crate.y - 10, "#ffd700");
          } else if (crate.reward === "railgun_unlock") {
            weapons.railgun.unlocked = true;
            addFloatingText("⚡ ZEUS RAILGUN UNLOCKED!", crate.x, crate.y - 15, "#a371f7");
          } else if (crate.reward === "rocket_unlock") {
            weapons.rocket.unlocked = true;
            addFloatingText("🚀 TITAN ROCKET UNLOCKED!", crate.x, crate.y - 15, "#f85149");
          }
        }
        b.life = 0;
      }
    });

    for (let j = enemies.length - 1; j >= 0; j--) {
      const e = enemies[j];
      if (b.x > e.x && b.x < e.x + e.width && b.y > e.y && b.y < e.y + e.height) {
        if (e.type === "boss" && !e.active) e.active = true;
        e.health -= b.damage;
        playSound("hit");

        if (b.isRocket) {
          createExplosion(b.x, b.y, 35, "#ff4444");
        } else {
          for (let p = 0; p < 4; p++) {
            particles.push({
              x: b.x, y: b.y,
              vx: (Math.random() - 0.5) * 5,
              vy: (Math.random() - 0.5) * 5,
              size: 2.5,
              color: b.color,
              alpha: 1,
              decay: 0.05
            });
          }
        }

        if (e.health <= 0) {
          createExplosion(e.x + e.width / 2, e.y + e.height / 2, e.type === "boss" ? 70 : 25);
          scrap += e.scrapValue;
          localStorage.setItem("john_scrap", scrap);
          addFloatingText(`+${e.scrapValue} SCRAP`, e.x + e.width / 2, e.y, "#ffd700");
          if (e.type === "boss") {
            if (audioFiles.bossMusic) audioFiles.bossMusic.pause();
            gameState = "VICTORY";
          }
          enemies.splice(j, 1);
        }

        if (!b.pierce) {
          bullets.splice(i, 1);
          break;
        } else {
          b.pierce--;
          if (b.pierce <= 0) {
            bullets.splice(i, 1);
            break;
          }
        }
      }
    }
  }

  // Enemy Bullets
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const eb = enemyBullets[i];
    eb.x += eb.vx;
    eb.y += eb.vy;

    if (eb.x < camera.x - 100 || eb.x > camera.x + canvas.width + 100) {
      enemyBullets.splice(i, 1);
      continue;
    }

    if (
      player.invulnerableTimer <= 0 &&
      !player.isDashing &&
      eb.x > player.x &&
      eb.x < player.x + player.width &&
      eb.y > player.y &&
      eb.y < player.y + player.height
    ) {
      applyDamageToPlayer(eb.damage || 15);
      enemyBullets.splice(i, 1);
    }
  }

  // Enemy AI
  enemies.forEach(e => {
    const dist = player.x - e.x;

    if (e.type === "arachnid") {
      if (Math.abs(dist) < 360) {
        e.vx = Math.sign(dist) * 3.4;
      }
      e.x += e.vx;
      if (e.x < 1000 || e.x > 1980) e.vx = -e.vx;
    } else if (e.type === "trooper") {
      if (Math.abs(dist) > 220) {
        e.x += Math.sign(dist) * e.vx;
      }
      e.shootTimer -= dt;
      if (e.shootTimer <= 0 && Math.abs(dist) < 480) {
        e.shootTimer = 2.2;
        for (let b = 0; b < 3; b++) {
          setTimeout(() => {
            enemyBullets.push({
              x: e.x + (Math.sign(dist) === 1 ? e.width : 0),
              y: e.y + 22,
              vx: Math.sign(dist) * 8.5,
              vy: 0,
              damage: 14
            });
          }, b * 100);
        }
      }
    } else if (e.type === "drone") {
      e.time += dt * 2.2;
      e.x += e.vx;
      e.y = e.baseY + Math.sin(e.time) * 30;
      if (e.x < 1000 || e.x > 3000) e.vx = -e.vx;

      e.shootTimer -= dt;
      if (e.shootTimer <= 0 && Math.abs(dist) < 420) {
        e.shootTimer = 2.5;
        const angle = Math.atan2((player.y + player.height / 2) - e.y, (player.x + player.width / 2) - e.x);
        enemyBullets.push({
          x: e.x + e.width / 2,
          y: e.y + e.height / 2,
          vx: Math.cos(angle) * 7,
          vy: Math.sin(angle) * 7,
          damage: 16
        });
      }
    } else if (e.type === "sniper") {
      if (Math.abs(dist) < 650) {
        e.isAiming = true;
        e.chargeTimer -= dt;
        if (e.chargeTimer <= 0) {
          e.chargeTimer = 3.2;
          enemyBullets.push({
            x: e.x,
            y: e.y + 16,
            vx: Math.sign(dist) * 18,
            vy: 0,
            damage: 35
          });
          playSound("railgun");
        }
      } else {
        e.isAiming = false;
        e.chargeTimer = 3.2;
      }
    } else if (e.type === "boss" && e.active) {
      e.x += e.vx;
      if (e.x < 3300 || e.x + e.width > 4100) e.vx = -e.vx;

      e.attackTimer -= dt;
      if (e.attackTimer <= 0) {
        e.attackTimer = 2.4;
        for (let a = -0.45; a <= 0.46; a += 0.22) {
          enemyBullets.push({
            x: e.x + (e.vx > 0 ? e.width : 0),
            y: e.y + 60,
            vx: -Math.cos(a) * 8.5,
            vy: Math.sin(a) * 8.5,
            damage: 22
          });
        }
        createExplosion(e.x + e.width / 2, e.y + 60, 12, "#ff4444");
      }
    }

    if (
      player.invulnerableTimer <= 0 &&
      !player.isDashing &&
      player.x + player.width > e.x &&
      player.x < e.x + e.width &&
      player.y + player.height > e.y &&
      player.y < e.y + e.height
    ) {
      applyDamageToPlayer(20);
    }
  });

  // Dynamic Camera Center
  const targetCamX = player.x - canvas.width / 2;
  const targetCamY = player.y - canvas.height / 2;
  camera.x += (targetCamX - camera.x) * 0.1;
  camera.y += (targetCamY - camera.y) * 0.1;

  camera.x = Math.max(0, Math.min(WORLD_WIDTH - canvas.width, camera.x));
  camera.y = Math.max(0, Math.min(WORLD_HEIGHT - canvas.height, camera.y));
}

function applyDamageToPlayer(amount) {
  player.shieldRegenTimer = 4.0;
  player.invulnerableTimer = 0.8;
  camera.shake = 8;
  playSound("hit");

  if (player.shield > 0) {
    player.shield -= amount;
    if (player.shield < 0) {
      player.health += player.shield;
      player.shield = 0;
    }
  } else {
    player.health -= amount;
  }

  if (player.health <= 0) {
    player.health = 0;
    gameState = "GAMEOVER";
    playSound("explosion");
  }
}

// --------------------------------------------------
// RENDER ENGINE
// --------------------------------------------------
function render() {
  ctx.save();

  if (camera.shake > 0) {
    const rx = (Math.random() - 0.5) * camera.shake;
    const ry = (Math.random() - 0.5) * camera.shake;
    ctx.translate(rx, ry);
  }

  if (gameState === "MAIN_MENU") {
    renderMainMenu();
    ctx.restore();
    return;
  }
  if (gameState === "ARMORY") {
    renderArmory();
    ctx.restore();
    return;
  }
  if (gameState === "WORLD_MAP") {
    renderWorldMap();
    ctx.restore();
    return;
  }
  if (gameState === "LORE") {
    renderLoreScreen();
    ctx.restore();
    return;
  }
  if (gameState === "SETTINGS") {
    renderSettingsScreen();
    ctx.restore();
    return;
  }

  // World Rendering with Camera Translation
  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  // Parallax Cave & Sky Backdrop
  if (assets.caveBg.complete) {
    for (let bx = 0; bx < WORLD_WIDTH; bx += 800) {
      ctx.drawImage(assets.caveBg, bx, 0, 800, WORLD_HEIGHT);
    }
  } else {
    ctx.fillStyle = "#0c1017";
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  }

  // Clouds
  if (assets.clouds.complete) {
    const t = Date.now() * 0.02;
    for (let cx = 0; cx < WORLD_WIDTH; cx += 600) {
      ctx.drawImage(assets.clouds, cx + Math.sin(t * 0.01 + cx) * 40, 70, 220, 55);
    }
  }

  // Trees in Jungle Zone
  if (assets.tree1.complete && assets.tree2.complete) {
    for (let tx = 1050; tx < 1950; tx += 180) {
      ctx.drawImage(assets.tree1, tx, 520, 90, 120);
      ctx.drawImage(assets.tree2, tx + 90, 520, 80, 120);
    }
  }

  // Checkpoints
  checkpoints.forEach(cp => {
    ctx.save();
    ctx.fillStyle = cp.active ? "#3fb950" : "#8b949e";
    ctx.fillRect(cp.x - 4, cp.y - 45, 8, 55);
    const pulse = Math.sin(Date.now() * 0.008) * 4;
    ctx.beginPath();
    ctx.arc(cp.x, cp.y - 50 + pulse, cp.active ? 10 : 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = cp.active ? "#3fb950" : "#c9d1d9";
    ctx.font = "bold 11px Courier New";
    ctx.textAlign = "center";
    ctx.fillText(cp.active ? "CHECKPOINT ACTIVE" : "DISCOVER BEACON", cp.x, cp.y - 64);
    ctx.restore();
  });

  // Supply Crates
  lootCrates.forEach(crate => {
    if (!crate.opened) {
      if (assets.crateLoot && assets.crateLoot.complete && assets.crateLoot.naturalWidth > 0) {
        ctx.drawImage(assets.crateLoot, crate.x, crate.y, crate.w, crate.h);
      } else {
        ctx.fillStyle = "#8b6508";
        ctx.fillRect(crate.x, crate.y, crate.w, crate.h);
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 2;
        ctx.strokeRect(crate.x, crate.y, crate.w, crate.h);
        ctx.fillStyle = "#ffd700";
        ctx.font = "bold 10px Courier New";
        ctx.fillText("CRATE", crate.x + 2, crate.y + 19);
      }
    }
  });

  // Platforms & Ground
  worldPlatforms.forEach(p => {
    if (assets.platformTile.complete) {
      const tileW = 48;
      for (let tx = p.x; tx < p.x + p.w; tx += tileW) {
        const rw = Math.min(tileW, p.x + p.w - tx);
        ctx.drawImage(assets.platformTile, 0, 0, 48, 40, tx, p.y, rw, p.h);
      }
    } else {
      ctx.fillStyle = p.type === "ground" ? "#161b22" : "#21262d";
      ctx.fillRect(p.x, p.y, p.w, p.h);
    }
    ctx.strokeStyle = "#30363d";
    ctx.lineWidth = 2;
    ctx.strokeRect(p.x, p.y, p.w, p.h);
  });

  // Enemies Rendering (Image sprite or high-detail pixel art fallback)
  enemies.forEach(e => {
    ctx.save();
    if (e.type === "arachnid") {
      if (assets.enemyArachnid && assets.enemyArachnid.complete && assets.enemyArachnid.naturalWidth > 0) {
        ctx.drawImage(assets.enemyArachnid, e.x, e.y, e.width, e.height);
      } else {
        ctx.fillStyle = "#2ea043";
        ctx.fillRect(e.x + 8, e.y + 6, e.width - 16, e.height - 12);
        ctx.fillStyle = "#ff7b72";
        ctx.fillRect(e.vx > 0 ? e.x + e.width - 8 : e.x + 4, e.y + 8, 4, 4);
        ctx.strokeStyle = "#238636";
        ctx.lineWidth = 3;
        const legBob = Math.sin(Date.now() * 0.02) * 5;
        ctx.beginPath();
        ctx.moveTo(e.x + 4, e.y + e.height - 4);
        ctx.lineTo(e.x - 4, e.y + e.height + legBob);
        ctx.moveTo(e.x + e.width - 4, e.y + e.height - 4);
        ctx.lineTo(e.x + e.width + 4, e.y + e.height - legBob);
        ctx.stroke();
      }
    } else if (e.type === "trooper") {
      if (assets.enemyTrooper && assets.enemyTrooper.complete && assets.enemyTrooper.naturalWidth > 0) {
        ctx.drawImage(assets.enemyTrooper, e.x, e.y, e.width, e.height);
      } else {
        ctx.fillStyle = "#30363d";
        ctx.fillRect(e.x, e.y, e.width, e.height);
        ctx.fillStyle = "#f85149";
        ctx.fillRect(e.x + 4, e.y + 8, e.width - 8, 6);
        ctx.fillStyle = "#161b22";
        ctx.fillRect(e.x - 6, e.y + 22, e.width + 12, 6);
      }
    } else if (e.type === "drone") {
      if (assets.enemyDrone && assets.enemyDrone.complete && assets.enemyDrone.naturalWidth > 0) {
        ctx.drawImage(assets.enemyDrone, e.x, e.y, e.width, e.height);
      } else {
        ctx.fillStyle = "#6e7681";
        ctx.beginPath();
        ctx.arc(e.x + e.width / 2, e.y + e.height / 2, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#58a6ff";
        ctx.beginPath();
        ctx.arc(e.x + e.width / 2, e.y + e.height / 2, 6, 0, Math.PI * 2);
        ctx.fill();
        const bladeW = Math.sin(Date.now() * 0.05) * 16;
        ctx.strokeStyle = "#8b949e";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(e.x + e.width / 2 - bladeW, e.y - 2);
        ctx.lineTo(e.x + e.width / 2 + bladeW, e.y - 2);
        ctx.stroke();
      }
    } else if (e.type === "sniper") {
      ctx.fillStyle = "#1f242c";
      ctx.fillRect(e.x, e.y, e.width, e.height);
      ctx.fillStyle = "#a371f7";
      ctx.fillRect(e.x + 6, e.y + 6, e.width - 12, 6);

      if (e.isAiming) {
        ctx.strokeStyle = "rgba(248, 81, 73, 0.6)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(e.x, e.y + 16);
        ctx.lineTo(player.x + player.width / 2, player.y + player.height / 2);
        ctx.stroke();
      }
    } else if (e.type === "boss") {
      if (assets.bossMech && assets.bossMech.complete && assets.bossMech.naturalWidth > 0) {
        ctx.drawImage(assets.bossMech, e.x, e.y, e.width, e.height);
      } else {
        ctx.fillStyle = "#161b22";
        ctx.fillRect(e.x, e.y, e.width, e.height);
        ctx.strokeStyle = "#f85149";
        ctx.lineWidth = 4;
        ctx.strokeRect(e.x, e.y, e.width, e.height);

        const pulse = 12 + Math.sin(Date.now() * 0.008) * 4;
        ctx.fillStyle = "#ff7b72";
        ctx.beginPath();
        ctx.arc(e.x + e.width / 2, e.y + 70, pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#f85149";
        ctx.fillRect(e.x + 20, e.y + 20, e.width - 40, 16);
      }

      // Boss Health Bar
      const bW = e.width;
      ctx.fillStyle = "rgba(0,0,0,0.8)";
      ctx.fillRect(e.x, e.y - 22, bW, 10);
      ctx.fillStyle = "#f85149";
      ctx.fillRect(e.x, e.y - 22, bW * Math.max(0, e.health / e.maxHealth), 10);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1;
      ctx.strokeRect(e.x, e.y - 22, bW, 10);
    }

    if (e.type !== "boss" && e.health < e.maxHealth) {
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(e.x, e.y - 8, e.width, 4);
      ctx.fillStyle = "#3fb950";
      ctx.fillRect(e.x, e.y - 8, e.width * (e.health / e.maxHealth), 4);
    }
    ctx.restore();
  });

  // Bullets
  bullets.forEach(b => {
    ctx.fillStyle = b.color;
    if (b.type === "railgun") {
      ctx.fillRect(b.x - 15, b.y - 2, 30, 4);
    } else if (b.type === "rocket") {
      ctx.fillRect(b.x - 8, b.y - 4, 16, 8);
    } else {
      ctx.fillRect(b.x - 4, b.y - 3, 10, 6);
    }
  });

  enemyBullets.forEach(eb => {
    ctx.fillStyle = "#f85149";
    ctx.beginPath();
    ctx.arc(eb.x, eb.y, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  // Particles
  particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
    ctx.restore();
  });

  // Player ("John")
  ctx.save();
  if (player.invulnerableTimer > 0 && Math.floor(Date.now() / 80) % 2 === 0) {
    ctx.globalAlpha = 0.35;
  }

  ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
  if (player.facing === -1) ctx.scale(-1, 1);

  let sprite = assets.johnIdle;
  let frameCount = 5;
  let frameWidth = 26;
  let frameHeight = 22;

  if (player.animState === "jump") {
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
      currentFrame * frameWidth, 0,
      frameWidth, frameHeight,
      -player.width / 2, -player.height / 2,
      player.width, player.height
    );
  }

  if (player.shield > 0) {
    ctx.strokeStyle = `rgba(56, 139, 253, ${0.4 + (player.shield / player.maxShield) * 0.4})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, player.width * 0.65, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // Floating text
  floatingTexts.forEach(t => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, t.alpha);
    ctx.fillStyle = t.color;
    ctx.font = "bold 13px 'Courier New', monospace";
    ctx.fillText(t.text, t.x, t.y);
    ctx.restore();
  });

  ctx.restore(); // End camera translation

  // Fixed HUD & Minimap
  renderHUD();

  if (gameState === "PAUSED") renderPauseOverlay();
  if (gameState === "GAMEOVER") renderGameOverOverlay();
  if (gameState === "VICTORY") renderVictoryOverlay();

  ctx.restore();
}

// --------------------------------------------------
// HUD & MINIMAP RENDERER
// --------------------------------------------------
function renderHUD() {
  ctx.fillStyle = "rgba(13, 17, 23, 0.88)";
  ctx.fillRect(0, 0, canvas.width, 50);
  ctx.strokeStyle = "#30363d";
  ctx.strokeRect(0, 0, canvas.width, 50);

  // Health
  ctx.fillStyle = "#c9d1d9";
  ctx.font = "bold 11px Courier New";
  ctx.fillText("HP", 14, 20);
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(36, 10, 110, 12);
  ctx.fillStyle = player.health > 30 ? "#3fb950" : "#f85149";
  ctx.fillRect(36, 10, 110 * (player.health / player.maxHealth), 12);

  // Shield
  ctx.fillStyle = "#58a6ff";
  ctx.fillText("SHD", 14, 38);
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(36, 28, 110, 10);
  ctx.fillStyle = "#388bfd";
  ctx.fillRect(36, 28, 110 * (player.shield / player.maxShield), 10);

  // Weapon
  const wp = weapons[currentWeaponKey];
  ctx.fillStyle = wp.color;
  ctx.font = "bold 13px Courier New";
  ctx.fillText(wp.name.toUpperCase(), 165, 22);
  ctx.fillStyle = player.reloading ? "#f0883e" : wp.ammo <= 3 ? "#f85149" : "#fff";
  ctx.fillText(player.reloading ? "RELOADING..." : `AMMO: ${wp.ammo}/${wp.maxAmmo}`, 165, 38);

  // Scrap
  ctx.fillStyle = "#ffd700";
  ctx.fillText(`⚙️ SCRAP: ${scrap}`, 370, 26);

  ctx.fillStyle = "#8b949e";
  ctx.font = "11px Courier New";
  ctx.fillText(`ZONE: ${currentZoneName}`, 370, 40);

  // Dash
  const dashReady = player.dashCooldown <= 0;
  ctx.fillStyle = dashReady ? "#a371f7" : "#484f58";
  ctx.fillText(dashReady ? "⚡ DASH [SHIFT]" : `⚡ DASH: ${(player.dashCooldown).toFixed(1)}s`, 550, 26);

  // Minimap (Top Right)
  const mapW = 140;
  const mapH = 40;
  const mapX = canvas.width - mapW - 140;
  const mapY = 5;

  ctx.fillStyle = "rgba(10, 14, 20, 0.9)";
  ctx.fillRect(mapX, mapY, mapW, mapH);
  ctx.strokeStyle = "#58a6ff";
  ctx.lineWidth = 1;
  ctx.strokeRect(mapX, mapY, mapW, mapH);

  const pNormX = player.x / WORLD_WIDTH;
  ctx.fillStyle = "#3fb950";
  ctx.fillRect(mapX + pNormX * mapW - 2, mapY + mapH / 2 - 2, 4, 4);

  enemies.forEach(e => {
    const eNormX = e.x / WORLD_WIDTH;
    ctx.fillStyle = e.type === "boss" ? "#f85149" : "#ff7b72";
    ctx.fillRect(mapX + eNormX * mapW - 1, mapY + mapH / 2 - 1, e.type === "boss" ? 4 : 2, e.type === "boss" ? 4 : 2);
  });

  checkpoints.forEach(cp => {
    const cpNormX = cp.x / WORLD_WIDTH;
    ctx.fillStyle = cp.active ? "#58a6ff" : "#484f58";
    ctx.fillRect(mapX + cpNormX * mapW - 1, mapY + 4, 3, 3);
  });
}

// --------------------------------------------------
// MAIN MENU
// --------------------------------------------------
function renderMainMenu() {
  ctx.fillStyle = "#090d16";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (assets.titleBg.complete) {
    ctx.drawImage(assets.titleBg, 0, 0, canvas.width, canvas.height);
  }

  ctx.fillStyle = "rgba(10, 14, 22, 0.78)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (assets.titleLogo.complete) {
    ctx.drawImage(assets.titleLogo, canvas.width / 2 - 140, 30, 280, 146);
  } else {
    ctx.fillStyle = "#58a6ff";
    ctx.font = "bold 36px Courier New";
    ctx.textAlign = "center";
    ctx.fillText("JOHN: ROGUE COMMANDO", canvas.width / 2, 100);
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#c9d1d9";
  ctx.font = "14px Courier New";
  ctx.fillText("FULLSCREEN OPEN-WORLD CYBER INFILTRATION SHOOTER", canvas.width / 2, 190);

  const menuItems = [
    { text: "▶ ENTER OPEN WORLD", y: 240 },
    { text: "⚙ CYBER-ARMORY (UPGRADES & WEAPONS)", y: 290 },
    { text: "🗺 WORLD MAP & FAST TRAVEL", y: 340 },
    { text: "📖 MISSION INTEL & LORE", y: 390 },
    { text: "⚙ SETTINGS & CONTROLS", y: 440 }
  ];

  menuItems.forEach((item, idx) => {
    ctx.fillStyle = "rgba(33, 38, 45, 0.85)";
    ctx.fillRect(canvas.width / 2 - 220, item.y - 20, 440, 36);
    ctx.strokeStyle = "#30363d";
    ctx.strokeRect(canvas.width / 2 - 220, item.y - 20, 440, 36);

    ctx.fillStyle = idx === 0 ? "#58a6ff" : "#e6edf3";
    ctx.font = "bold 15px Courier New";
    ctx.fillText(item.text, canvas.width / 2, item.y + 4);
  });

  ctx.textAlign = "left";
}

function handleMenuClick(mx, my) {
  const cx = canvas.width / 2;
  if (mx > cx - 220 && mx < cx + 220) {
    if (my > 220 && my < 256) {
      if (enemies.length === 0) initWorldEnemies();
      gameState = "PLAYING";
      playSound("select");
    } else if (my > 270 && my < 306) {
      gameState = "ARMORY";
      playSound("select");
    } else if (my > 320 && my < 356) {
      gameState = "WORLD_MAP";
      playSound("select");
    } else if (my > 370 && my < 406) {
      gameState = "LORE";
      playSound("select");
    } else if (my > 420 && my < 456) {
      gameState = "SETTINGS";
      playSound("select");
    }
  }
}

// --------------------------------------------------
// ARMORY
// --------------------------------------------------
function renderArmory() {
  ctx.fillStyle = "#0d1117";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#58a6ff";
  ctx.font = "bold 24px Courier New";
  ctx.textAlign = "center";
  ctx.fillText("CYBER-ARMORY & WEAPON UPGRADES", canvas.width / 2, 45);

  ctx.fillStyle = "#ffd700";
  ctx.font = "bold 15px Courier New";
  ctx.fillText(`AVAILABLE SCRAP: ⚙️ ${scrap}`, canvas.width / 2, 75);

  const weaponList = Object.entries(weapons);
  weaponList.forEach(([key, wp], idx) => {
    const x = canvas.width / 2 - 380 + (idx % 2) * 390;
    const y = 110 + Math.floor(idx / 2) * 160;

    ctx.fillStyle = "rgba(22, 27, 34, 0.9)";
    ctx.fillRect(x, y, 370, 140);
    ctx.strokeStyle = wp.unlocked ? wp.color : "#30363d";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 370, 140);

    ctx.fillStyle = wp.color;
    ctx.font = "bold 15px Courier New";
    ctx.textAlign = "left";
    ctx.fillText(wp.name, x + 16, y + 26);

    ctx.fillStyle = "#8b949e";
    ctx.font = "12px Courier New";
    ctx.fillText(`Damage: ${wp.damage} | Mag: ${wp.maxAmmo} | FireRate: ${wp.fireRate}s`, x + 16, y + 54);
    ctx.fillText(`Current Level: ${wp.level}`, x + 16, y + 74);

    const btnX = x + 16;
    const btnY = y + 92;
    const upgradeCost = wp.level * 60;

    if (!wp.unlocked) {
      ctx.fillStyle = scrap >= wp.cost ? "#238636" : "#484f58";
      ctx.fillRect(btnX, btnY, 180, 32);
      ctx.fillStyle = "#fff";
      ctx.fillText(`UNLOCK (⚙️ ${wp.cost})`, btnX + 16, btnY + 20);
    } else {
      ctx.fillStyle = scrap >= upgradeCost ? "#1f6feb" : "#484f58";
      ctx.fillRect(btnX, btnY, 180, 32);
      ctx.fillStyle = "#fff";
      ctx.fillText(`UPGRADE (⚙️ ${upgradeCost})`, btnX + 16, btnY + 20);
    }
  });

  renderBackButton();
}

function handleArmoryClick(mx, my) {
  if (mx > 30 && mx < 130 && my > canvas.height - 50 && my < canvas.height - 15) {
    gameState = "MAIN_MENU";
    playSound("select");
    return;
  }

  const weaponList = Object.entries(weapons);
  weaponList.forEach(([key, wp], idx) => {
    const x = canvas.width / 2 - 380 + (idx % 2) * 390;
    const y = 110 + Math.floor(idx / 2) * 160;
    const btnX = x + 16;
    const btnY = y + 92;

    if (mx > btnX && mx < btnX + 180 && my > btnY && my < btnY + 32) {
      if (!wp.unlocked && scrap >= wp.cost) {
        scrap -= wp.cost;
        wp.unlocked = true;
        localStorage.setItem("john_scrap", scrap);
        playSound("pickup");
      } else if (wp.unlocked && scrap >= wp.level * 60) {
        scrap -= wp.level * 60;
        wp.level++;
        wp.damage = Math.floor(wp.damage * 1.25);
        wp.maxAmmo += 4;
        wp.ammo = wp.maxAmmo;
        localStorage.setItem("john_scrap", scrap);
        playSound("pickup");
      }
    }
  });
}

// --------------------------------------------------
// WORLD MAP
// --------------------------------------------------
function renderWorldMap() {
  ctx.fillStyle = "#090d16";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#58a6ff";
  ctx.font = "bold 24px Courier New";
  ctx.textAlign = "center";
  ctx.fillText("HOLOGRAPHIC WORLD MAP & FAST TRAVEL", canvas.width / 2, 45);

  ZONES.forEach((z, i) => {
    const y = 100 + i * 85;
    ctx.fillStyle = "rgba(22, 27, 34, 0.85)";
    ctx.fillRect(canvas.width / 2 - 350, y, 700, 70);
    ctx.strokeStyle = "#30363d";
    ctx.strokeRect(canvas.width / 2 - 350, y, 700, 70);

    ctx.fillStyle = z.color === "#2d0a0a" ? "#f85149" : "#58a6ff";
    ctx.font = "bold 15px Courier New";
    ctx.textAlign = "left";
    ctx.fillText(`ZONE ${i + 1}: ${z.name.toUpperCase()}`, canvas.width / 2 - 330, y + 28);

    const cp = checkpoints[i];
    if (cp && cp.active) {
      ctx.fillStyle = "#238636";
      ctx.fillRect(canvas.width / 2 + 160, y + 18, 160, 32);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px Courier New";
      ctx.textAlign = "center";
      ctx.fillText("FAST TRAVEL ✈", canvas.width / 2 + 240, y + 38);
    } else {
      ctx.fillStyle = "#484f58";
      ctx.font = "12px Courier New";
      ctx.textAlign = "right";
      ctx.fillText("BEACON UNDISCOVERED 🔒", canvas.width / 2 + 320, y + 40);
    }
  });

  renderBackButton();
}

function handleWorldMapClick(mx, my) {
  if (mx > 30 && mx < 130 && my > canvas.height - 50 && my < canvas.height - 15) {
    gameState = "MAIN_MENU";
    playSound("select");
    return;
  }

  ZONES.forEach((z, i) => {
    const y = 100 + i * 85;
    const btnX = canvas.width / 2 + 160;
    const btnY = y + 18;
    if (mx > btnX && mx < btnX + 160 && my > btnY && my < btnY + 32) {
      const cp = checkpoints[i];
      if (cp && cp.active) {
        player.x = cp.x;
        player.y = cp.y - 40;
        player.vx = 0;
        player.vy = 0;
        if (enemies.length === 0) initWorldEnemies();
        gameState = "PLAYING";
        playSound("pickup");
      }
    }
  });
}

// --------------------------------------------------
// LORE & SETTINGS SCREENS
// --------------------------------------------------
function renderLoreScreen() {
  ctx.fillStyle = "#0d1117";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#58a6ff";
  ctx.font = "bold 22px Courier New";
  ctx.textAlign = "center";
  ctx.fillText("TOP SECRET DOSSIER: OPERATION CYBER-STORM", canvas.width / 2, 50);

  ctx.textAlign = "left";
  ctx.fillStyle = "#c9d1d9";
  ctx.font = "13px Courier New";

  const lines = [
    "OPERATIVE: Commander John",
    "STATUS: Active Infiltration",
    "OBJECTIVE: Penetrate the Apex Cyber-Citadel and neutralize the Titan Mech.",
    "",
    "--- CONTROLS ---",
    "• SPACE or LEFT CLICK: Fire Weapon",
    "• W / ArrowUp: Jump",
    "• A / D: Move Left / Right",
    "• S / ArrowDown: Crouch",
    "• SHIFT: Tactical Dash (Invulnerable dodge burst)",
    "• Q / E / 1-4: Switch Weapons",
    "• R: Tactical Reload",
    "",
    "--- THREAT INTEL ---",
    "• Mutant Arachnids: Fast-moving biological horrors inhabiting the Toxic Jungle.",
    "• Heavy Troopers: Mechanized infantry equipped with burst rifles.",
    "• Gunship Drones: Flying scouts with twin plasma pulses.",
    "• Beam Snipers: Citadel guardians charging lethal rail slugs with warning laser sights.",
    "• The Apex Colossus: Fortress boss armed with missile barrages and laser sweeps."
  ];

  lines.forEach((line, i) => {
    ctx.fillText(line, canvas.width / 2 - 320, 95 + i * 22);
  });

  renderBackButton();
}

function renderSettingsScreen() {
  ctx.fillStyle = "#0d1117";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#58a6ff";
  ctx.font = "bold 22px Courier New";
  ctx.textAlign = "center";
  ctx.fillText("SETTINGS & CONTROLS", canvas.width / 2, 50);

  ctx.textAlign = "left";
  ctx.fillStyle = "#c9d1d9";
  ctx.font = "14px Courier New";

  const settingsLines = [
    `🔊 Master Sound: ${soundEnabled ? "ENABLED" : "MUTED"}`,
    "📺 CRT Retro Scanlines: Toggle via top bar button",
    "💥 Primary Shoot: SPACEBAR or Left Click",
    "▲ Jump: W or Arrow Up",
    "⚡ Dash: Left Shift or Right Shift",
    "📱 Mobile Touch: Full on-screen touch D-Pad and action buttons active",
    "💾 Progress: Automatically saved in browser localStorage"
  ];

  settingsLines.forEach((l, i) => {
    ctx.fillText(l, canvas.width / 2 - 320, 120 + i * 36);
  });

  renderBackButton();
}

function renderBackButton() {
  ctx.fillStyle = "#21262d";
  ctx.fillRect(30, canvas.height - 50, 100, 35);
  ctx.strokeStyle = "#30363d";
  ctx.strokeRect(30, canvas.height - 50, 100, 35);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 13px Courier New";
  ctx.textAlign = "center";
  ctx.fillText("◀ BACK", 80, canvas.height - 28);
  ctx.textAlign = "left";
}

function handleOverlayClick(mx, my) {
  if (mx > 30 && mx < 130 && my > canvas.height - 50 && my < canvas.height - 15) {
    gameState = "MAIN_MENU";
    playSound("select");
  }
}

// --------------------------------------------------
// OVERLAYS (PAUSE, GAMEOVER, VICTORY)
// --------------------------------------------------
function renderPauseOverlay() {
  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#58a6ff";
  ctx.font = "bold 32px Courier New";
  ctx.textAlign = "center";
  ctx.fillText("MISSION PAUSED", canvas.width / 2, canvas.height / 2 - 40);

  ctx.fillStyle = "#c9d1d9";
  ctx.font = "16px Courier New";
  ctx.fillText("Press [ESC] or [M] to Resume", canvas.width / 2, canvas.height / 2 + 10);
  ctx.fillText("Click anywhere to Return to Main Menu", canvas.width / 2, canvas.height / 2 + 45);
  ctx.textAlign = "left";
}

function renderGameOverOverlay() {
  ctx.fillStyle = "rgba(0,0,0,0.85)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#f85149";
  ctx.font = "bold 40px Courier New";
  ctx.textAlign = "center";
  ctx.fillText("COMMANDER DOWN", canvas.width / 2, canvas.height / 2 - 50);

  ctx.fillStyle = "#c9d1d9";
  ctx.font = "16px Courier New";
  ctx.fillText("Respawn at latest active checkpoint?", canvas.width / 2, canvas.height / 2 + 10);

  ctx.fillStyle = "#3fb950";
  ctx.font = "bold 18px Courier New";
  ctx.fillText("▶ PRESS SPACE OR CLICK TO RESPAWN ◀", canvas.width / 2, canvas.height / 2 + 60);
  ctx.textAlign = "left";
}

function renderVictoryOverlay() {
  ctx.fillStyle = "rgba(0,0,0,0.88)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ffd700";
  ctx.font = "bold 38px Courier New";
  ctx.textAlign = "center";
  ctx.fillText("CITADEL DESTROYED!", canvas.width / 2, canvas.height / 2 - 60);

  ctx.fillStyle = "#3fb950";
  ctx.font = "20px Courier New";
  ctx.fillText("VICTORY! The Cyber-Colossus has fallen.", canvas.width / 2, canvas.height / 2 - 10);

  ctx.fillStyle = "#c9d1d9";
  ctx.font = "15px Courier New";
  ctx.fillText(`Total Scrap Collected: ⚙️ ${scrap}`, canvas.width / 2, canvas.height / 2 + 35);

  ctx.fillStyle = "#58a6ff";
  ctx.font = "bold 18px Courier New";
  ctx.fillText("▶ PRESS SPACE OR CLICK TO RETURN TO MAIN MENU ◀", canvas.width / 2, canvas.height / 2 + 90);
  ctx.textAlign = "left";
}

window.addEventListener("click", () => {
  if (gameState === "GAMEOVER") {
    player.health = player.maxHealth;
    player.shield = player.maxShield;
    player.x = lastActiveCheckpoint.x;
    player.y = lastActiveCheckpoint.y - 40;
    player.vx = 0;
    player.vy = 0;
    gameState = "PLAYING";
  } else if (gameState === "VICTORY") {
    gameState = "MAIN_MENU";
  } else if (gameState === "PAUSED") {
    gameState = "MAIN_MENU";
  }
});

// --------------------------------------------------
// GAME LOOP
// --------------------------------------------------
function gameLoop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  update(dt);
  render();

  requestAnimationFrame(gameLoop);
}

initWorldEnemies();
requestAnimationFrame(gameLoop);
