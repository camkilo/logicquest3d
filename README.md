# logicquest3d
Dark fantasy 3D RPG with realistic art direction. Experience three immersive zones with physically-based puzzles, strategic combat, and atmospheric environments. Features realistic materials (aged wood, chipped stone, worn metal), dynamic lighting, and minimal UI design.

## Features

### 🎮 Gameplay
- **Three Connected Zones**: Forest Ruins, Underground Chamber, and Ritual Courtyard
- **Physical Puzzles**: Weight & pressure plates, rotation logic, energy routing, sequence levers
- **Enhanced Combat**: Three enemy types (fast melee, ranged magic, heavy guardian) with retreat behavior
- **Advanced Player Abilities**: Dodge roll and magic projectile with stamina system
- **Physical Crafting**: Combine 2-3 resources at anvils and altars only

### 🎨 Dark Fantasy Visuals
- **Art Direction**: Realistic dark fantasy aesthetic with muted color palette
- **Dynamic Lighting**: Physically-based with warm torchlight amber tones and cold stone grays
- **Atmospheric Fog**: Volumetric fog with zone-specific colors
- **Realistic Materials**: Aged wood, rough chipped stone, worn metal with high roughness values
- **Post-Processing**: Bloom, vignette, SSAO for cinematic feel

### 🎯 Game Mechanics
- **First-Person Controls**: WASD movement, mouse look, sprint, jump, dodge roll
- **Stamina System**: Manage stamina for sprinting, dodging, and magic abilities
- **Resource Collection**: Gather wood, stone, and crystals
- **Minimal UI**: Dark semi-transparent panels with serif font, fades when not in combat
- **Zone Progression**: Solve puzzles and defeat enemies to unlock new areas

## Controls

- **WASD** - Move
- **Mouse** - Look Around
- **Space** - Jump
- **E** - Interact/Collect
- **C** - Open Crafting (at anvil/altar)
- **Left Click** - Attack
- **Q** - Magic Ability
- **Shift** - Sprint / Dodge Roll (when stationary)

## Zones

1. **Forest Ruins** - Moss-covered arches, fallen pillars, overgrown paths with muted greens
2. **Underground Chamber** - Stone halls with water pools, dripping ceilings, glowing runes
3. **Ritual Courtyard** - Circular arena with broken statues and central energy altar

## Puzzle Types

1. **Weight & Pressure** - Push stone blocks onto pressure plates that sink and glow
2. **Rotation Logic** - Rotate tall stone pillars to align carved symbols
3. **Energy Routing** - Use mirrors to redirect light beams to power doors
4. **Sequence Logic** - Pull levers in correct order with reset on mistakes

## Enemy Types

- **Fast Melee** - Agile creature with quick attacks
- **Ranged Magic** - Floating enemy with projectile attacks
- **Slow Heavy Guardian** - Armored foe with powerful melee strikes

All enemies patrol, chase, attack, and retreat at low health.

## Crafting Recipes

Must be at an anvil or altar to craft:

- Wood + Wood = Wooden Sword
- Wood + Stone = Stone Sword
- Stone + Stone = Stone Armor
- Crystal + Crystal = Magic Staff
- Wood + Crystal = Magic Bow
- Stone + Crystal = Crystal Armor
- Wood + Wood + Wood = Wooden Shield
- Stone + Stone + Stone = Healing Potion

## Development

### Local Development
```bash
npm install
npm run dev
```

### Build for Production
```bash
npm run build
npm run preview
```

## Deployment

### Deploy to Vercel
1. Push this repository to GitHub
2. Import the project in Vercel
3. Deploy automatically (vercel.json is configured)

Or use Vercel CLI:
```bash
npm i -g vercel
vercel
```

### Deploy to Render
1. Push this repository to GitHub
2. Create a new Static Site in Render
3. Connect your repository
4. Use these settings:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

Or use render.yaml (included) for automatic deployment.

## Technologies

- **Three.js** - 3D graphics engine
- **Vite** - Build tool and dev server
- **postprocessing** - Advanced post-processing effects
- **Vanilla JavaScript** - No framework overhead

## Game Structure

```
src/
├── core/
│   └── Game.js                 # Main game engine
├── entities/
│   ├── Player.js              # Player character with physics
│   └── Enemy.js               # AI enemies with patterns
├── systems/
│   ├── InputManager.js        # Input handling
│   ├── UIManager.js           # UI updates
│   ├── ZoneManager.js         # Zone loading and transitions
│   ├── EnemyManager.js        # Enemy spawning and management
│   ├── ParticleSystem.js      # Visual effects
│   ├── CraftingSystem.js      # Item crafting
│   ├── PuzzleManager.js       # Puzzle logic
│   └── PostProcessingManager.js # Visual enhancements
└── main.js                    # Entry point
```

## License

MIT
