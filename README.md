# logicquest3d
3D cinematic RPG with small immersive zones. Fully animated characters, realistic textures, dynamic lighting, and particle effects. Players explore, solve logic-based environmental puzzles, craft items by combining 2–3 resources, and fight simple AI enemies with pattern-based behavior. Physics-driven interactions, unlockable zones, and more

## Features

### 🎮 Gameplay
- **Three Immersive Zones**: Forest, Cave, and Ancient Ruins
- **Logic-Based Puzzles**: Color sequence puzzles and pressure plate challenges
- **Crafting System**: Combine 2-3 resources to create weapons, armor, and potions
- **Combat System**: Fight enemies with pattern-based AI behavior
- **Zone Progression**: Unlock new areas by solving puzzles and defeating enemies

### 🎨 Visually Stunning Graphics
- **Post-Processing Effects**: Bloom, vignette, SSAO, SMAA, chromatic aberration
- **Dynamic Lighting**: Realistic sun, hemisphere lighting, and rim lights
- **Particle Systems**: Magic effects, explosions, combat trails, ambient particles
- **PBR Materials**: Physically-based rendering with metalness and roughness
- **Atmospheric Effects**: Zone-specific fog and environmental ambiance

### 🎯 Game Mechanics
- **First-Person Controls**: WASD movement, mouse look, sprint, and jump
- **Resource Collection**: Gather wood, stone, and crystals
- **Inventory System**: 9-slot inventory with visual feedback
- **Health System**: Combat with damage, healing, and visual feedback
- **Portal System**: Magical portals for zone transitions

## Controls

- **WASD** - Move
- **Mouse** - Look Around
- **Space** - Jump
- **E** - Interact/Collect
- **C** - Open Crafting
- **Left Click** - Attack
- **Shift** - Sprint

## Crafting Recipes

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
