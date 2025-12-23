# logicquest3d
Cinematic 3D fantasy prototype with realistic art direction. Experience three handcrafted zones featuring sculpted environments, physically-based puzzles, strategic combat, and atmospheric lighting. Built with smooth, organic geometry and modern PBR materials for a high-quality visual experience.

## Features

### 🎮 Gameplay
- **Three Handcrafted Zones**: Forest Ruins with curved stone arches, Underground Chamber with carved halls, and Ritual Courtyard with ancient altars
- **Physical Puzzles**: Irregular stone slabs on pressure plates, rotating cylindrical pillars with engraved symbols, light beam redirection, sequence levers
- **Cinematic Combat**: Three enemy types (agile creatures, floating magic entities, armored sentinels) with intelligent AI
- **Advanced Player Abilities**: Dodge roll and magic projectiles with stamina management
- **Physical Crafting**: Combine 2-3 resources at anvils and altars

### 🎨 Realistic Fantasy Visuals
- **Art Direction**: Modern cinematic fantasy with sculpted, organic meshes - NO voxels, cubes, or low-poly geometry
- **Smooth Geometry**: High polygon counts (32+ segments) for all curved surfaces with vertex displacement for natural detail
- **PBR Materials**: Physically-based rendering with normal maps, high roughness values (0.95-1.0 for stone), metalness variation
- **Dynamic Lighting**: Baked + dynamic shadows, warm torchlight amber tones, cold stone grays, volumetric fog
- **Atmospheric Effects**: Zone-specific fog colors, post-processing with bloom, vignette, and SSAO
- **Realistic Materials**: Aged wood with bark texture, rough chipped stone with erosion, worn metal with corrosion patterns

### 🎯 Game Mechanics
- **Third-Person Camera**: Over-the-shoulder perspective with smooth camera follow and cinematic framing
- **WASD Movement**: Responsive controls with sprint, jump, and dodge mechanics
- **Stamina System**: Manage stamina for sprinting, dodging, and magic abilities
- **Resource Collection**: Gather organic wood branches, rough stone chunks, and faceted crystals
- **Minimal UI**: Dark semi-transparent panels with serif font, dynamically fades when not in combat
- **Zone Progression**: Solve physical puzzles and defeat enemies to unlock new handcrafted areas

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

1. **Forest Ruins** - Moss-covered curved arches, fallen cylindrical pillars with fractures, overgrown dirt paths blending into sculpted terrain
2. **Underground Chamber** - Carved stone halls with irregular rock faces, reflective water pools, glowing runes embedded in weathered walls
3. **Ritual Courtyard** - Circular arena with broken statues, worn metal pillars, central energy altar with carved rings

## Puzzle Types

1. **Weight & Pressure** - Push irregular stone slabs onto pressure plates that sink and glow when activated
2. **Rotation Logic** - Rotate tall cylindrical stone pillars to align engraved stone ring symbols
3. **Energy Routing** - Use angled mirrors to redirect light beams and power ancient mechanisms
4. **Sequence Logic** - Pull levers in correct order with visual feedback and reset on mistakes

## Enemy Types

- **Agile Creature** - Fast melee attacker with organic cone-shaped body
- **Floating Magic Entity** - Ranged projectile attacks with spherical form
- **Armored Sentinel** - Slow heavy guardian with realistic humanoid proportions

All enemies feature intelligent AI with patrol, chase, attack, and tactical retreat behaviors.

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
