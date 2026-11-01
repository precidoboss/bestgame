# John: Rogue Commando 💥

An adrenaline-pumping, retro arcade side-scrolling shooter built with HTML5 Canvas, JavaScript, and Web Audio API.

Powered by the original sprite work and sound assets from **[@precidoboss](https://github.com/precidoboss)**!

---

## 🎮 Play Online

Once deployed on **GitHub Pages**, open `https://precidoboss.github.io/bestgame/` directly in your browser.

---

## 🕹️ Controls

| Action | Keyboard | Touch / Mobile |
| :--- | :--- | :--- |
| **Move Left / Right** | `A` / `D` or `ArrowLeft` / `ArrowRight` | Left / Right D-Pad Buttons |
| **Jump** | `W` / `ArrowUp` / `Space` | Green Jump Button (▲) |
| **Crouch** | `S` / `ArrowDown` | Down D-Pad Button (▼) |
| **Shoot** | `J` / `Z` / `F` or **Left Mouse Click** | Red Fire Button (💥) |
| **Reload** | `R` | Orange Reload Button (⟳) |
| **Toggle Sound** | Sound Button (HUD) | Sound Button |
| **Toggle CRT Scanlines** | CRT Button (HUD) | CRT Button |
| **Fullscreen** | Fullscreen Button (HUD) | Fullscreen Button |

---

## ✨ Features

- **Dynamic Character Animation**: Complete sprite-sheet animations for John (Idle, Running, Running while Shooting, Jumping, Crouching, Crouching while Shooting, Standing Fire, and Soul Ascent on death).
- **Parallax Environments**: Multi-layered backgrounds with cave formations, drifting clouds, jungle canopies, and platforms.
- **Weapon System**:
  - 30-round automatic rifle with muzzle flashes and ejected brass shell casings.
  - Tactical reload mechanism with reload audio cues.
  - Screen shake and spark physics on every shot.
- **Powerups**:
  - 💚 **Medkit (+35 HP)**
  - 💙 **Ammo Crate (Instant Max Ammo)**
  - ⚡ **Triple-Spread Cannon (12s of 3-way spread devastation)**
- **Enemy Roster**:
  1. **Mutant Crawlers**: Fast ground beasts that scuttle and leap.
  2. **Cyborg Troopers**: Heavy rifle soldiers who advance and return fire.
  3. **Recon Drones**: Aerial flying drones that track and bombard John with plasma bolts.
  4. **Wave 5 Mech Boss**: The Cyber-Colossus with multi-directional missile barrages, massive health bar, and epic boss battle music (`snd_boss_music.ogg`)!
- **CRT Simulation**: Built-in toggleable CRT scanline and retro arcade cabinet filter.
- **Mobile Friendly**: Integrated virtual on-screen touch D-Pad and action buttons for phones and tablets.
- **Audio System**: Dual audio engine combining original `.ogg` sound effects and Web Audio API synthesizers for zero-latency instant response.

---

## 🚀 Running Locally

You can run the game directly with any local static HTTP server:

```bash
# Using Node.js
npx serve .

# Or using Python
python3 -m http.server 8000
```
Then visit `http://localhost:8000` in your web browser.

---

## 📜 License
MIT License. Created by Precious Olaleye ([@precidoboss](https://github.com/precidoboss)).
