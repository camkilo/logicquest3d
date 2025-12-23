import * as THREE from 'three';
import { Player } from '../entities/Player.js';
import { InputManager } from '../systems/InputManager.js';
import { ZoneManager } from '../systems/ZoneManager.js';
import { EnemyManager } from '../systems/EnemyManager.js';
import { CraftingSystem } from '../systems/CraftingSystem.js';
import { ParticleSystem } from '../systems/ParticleSystem.js';
import { UIManager } from '../systems/UIManager.js';
import { PuzzleManager } from '../systems/PuzzleManager.js';
import { PostProcessingManager } from '../systems/PostProcessingManager.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.clock = new THREE.Clock();
        
        // Game systems
        this.inputManager = null;
        this.zoneManager = null;
        this.enemyManager = null;
        this.craftingSystem = null;
        this.particleSystem = null;
        this.uiManager = null;
        this.puzzleManager = null;
        this.postProcessing = null;
        
        // Game state
        this.isRunning = false;
        this.currentZone = 'forest';
    }
    
    init() {
        // Create scene
        this.scene = new THREE.Scene();
        // Dark fantasy fog - muted green-gray with volumetric density
        this.scene.fog = new THREE.FogExp2(0x3a4a3a, 0.025);
        
        // Dark fantasy background - cold stone gray
        const skyColor = new THREE.Color(0x4a5a5a);
        this.scene.background = skyColor;
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 1.6, 5);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        // Initialize systems
        this.inputManager = new InputManager();
        this.uiManager = new UIManager(this);
        this.particleSystem = new ParticleSystem(this.scene);
        this.craftingSystem = new CraftingSystem(this);
        this.puzzleManager = new PuzzleManager(this);
        this.zoneManager = new ZoneManager(this);
        this.enemyManager = new EnemyManager(this);
        
        // Create player
        this.player = new Player(this);
        this.scene.add(this.player.mesh);
        
        // Dark fantasy ambient light - very low intensity
        const ambientLight = new THREE.AmbientLight(0x3a4a3a, 0.2);
        this.scene.add(ambientLight);
        
        // Hemisphere light with muted cold stone gray sky and warm torchlight ground
        const hemisphereLight = new THREE.HemisphereLight(0x4a5a5a, 0x8b6f47, 0.4);
        this.scene.add(hemisphereLight);
        
        // Physically based directional light with warm torchlight amber tone
        const directionalLight = new THREE.DirectionalLight(0xd4a574, 0.8);
        directionalLight.position.set(30, 80, 40);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 4096;
        directionalLight.shadow.mapSize.height = 4096;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        directionalLight.shadow.bias = -0.0001;
        directionalLight.shadow.radius = 3;
        this.scene.add(directionalLight);
        
        // Add subtle cold rim light for depth and contrast
        const rimLight = new THREE.DirectionalLight(0x4a5a6a, 0.2);
        rimLight.position.set(-50, 50, -50);
        this.scene.add(rimLight);
        
        // Initialize first zone - Forest Ruins
        this.zoneManager.loadZone('forest_ruins');
        
        // Initialize post-processing for stunning visuals
        try {
            this.postProcessing = new PostProcessingManager(this.renderer, this.scene, this.camera);
            console.log('Post-processing enabled for enhanced visuals');
        } catch (error) {
            console.warn('Post-processing not available, using standard rendering', error);
        }
        
        console.log('Game initialized');
    }
    
    start() {
        this.isRunning = true;
        this.animate();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    animate() {
        if (!this.isRunning) return;
        
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        
        // Update all systems
        this.player.update(delta);
        this.enemyManager.update(delta);
        this.particleSystem.update(delta);
        this.puzzleManager.update(delta);
        this.zoneManager.update(delta);
        this.uiManager.updateCombatState(delta);
        
        // Update camera to follow player
        this.updateCamera();
        
        // Render scene with post-processing if available
        if (this.postProcessing) {
            this.postProcessing.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }
    
    updateCamera() {
        // First-person camera follows player
        const playerPos = this.player.mesh.position;
        this.camera.position.copy(playerPos);
        this.camera.position.y += 1.6; // Eye level
        
        // Apply player rotation to camera
        this.camera.rotation.copy(this.player.rotation);
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        if (this.postProcessing) {
            this.postProcessing.setSize(window.innerWidth, window.innerHeight);
        }
    }
    
    changeZone(zoneName) {
        this.currentZone = zoneName;
        this.zoneManager.loadZone(zoneName);
        this.uiManager.updateZoneIndicator(zoneName);
    }
}
