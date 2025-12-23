import * as THREE from 'three';

export class ZoneManager {
    constructor(game) {
        this.game = game;
        this.currentZoneObj = null;
        this.currentZoneName = null;
        this.zones = {};
        
        // Zone unlock status
        this.unlockedZones = ['forest_ruins'];
    }
    
    loadZone(zoneName) {
        // Clear current zone
        if (this.currentZoneObj) {
            this.clearZone();
        }
        
        this.currentZoneName = zoneName;
        
        // Create zone based on name
        switch (zoneName) {
            case 'forest_ruins':
                this.currentZoneObj = this.createForestRuinsZone();
                break;
            case 'underground_chamber':
                this.currentZoneObj = this.createUndergroundChamberZone();
                break;
            case 'ritual_courtyard':
                this.currentZoneObj = this.createRitualCourtyardZone();
                break;
        }
        
        // Spawn enemies
        this.game.enemyManager.spawnEnemiesInZone(zoneName, 3);
        
        // Create ambient particles
        this.game.particleSystem.createAmbientParticles(zoneName);
        
        // Reset player position
        this.game.player.mesh.position.set(0, 1, 0);
        
        // Update quest
        this.updateQuestForZone(zoneName);
    }
    
    createForestRuinsZone() {
        const zone = {
            name: 'forest_ruins',
            collectibles: []
        };
        
        // Create ground with muted green moss-covered appearance
        const groundGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
        
        // Add vertex displacement for overgrown terrain
        const positions = groundGeometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 2] += Math.random() * 0.5 - 0.25; // Height variation
        }
        groundGeometry.computeVertexNormals();
        
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a4a2a, // Muted dark green
            roughness: 0.98,
            metalness: 0.02,
            envMapIntensity: 0.3
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.game.scene.add(ground);
        zone.ground = ground;
        
        // Create moss-covered stone arches
        zone.arches = [];
        for (let i = 0; i < 6; i++) {
            const arch = this.createMossCoveredArch();
            const angle = (i / 6) * Math.PI * 2;
            const radius = 20 + Math.random() * 10;
            arch.position.set(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            );
            arch.rotation.y = angle;
            this.game.scene.add(arch);
            zone.arches.push(arch);
        }
        
        // Create fallen pillars
        zone.pillars = [];
        for (let i = 0; i < 8; i++) {
            const pillar = this.createFallenPillar();
            const angle = Math.random() * Math.PI * 2;
            const radius = 10 + Math.random() * 20;
            pillar.position.set(
                Math.cos(angle) * radius,
                0.5,
                Math.sin(angle) * radius
            );
            pillar.rotation.z = Math.PI / 2 + (Math.random() - 0.5) * 0.5;
            pillar.rotation.y = Math.random() * Math.PI;
            this.game.scene.add(pillar);
            zone.pillars.push(pillar);
        }
        
        // Create aged trees with overgrown paths
        zone.trees = [];
        for (let i = 0; i < 25; i++) {
            const tree = this.createAgedTree();
            const angle = Math.random() * Math.PI * 2;
            const radius = 15 + Math.random() * 30;
            tree.position.set(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            );
            this.game.scene.add(tree);
            zone.trees.push(tree);
        }
        
        // Add collectible wood resources (aged appearance)
        for (let i = 0; i < 10; i++) {
            const item = this.createCollectible('wood');
            const angle = Math.random() * Math.PI * 2;
            const radius = 5 + Math.random() * 20;
            item.position.set(
                Math.cos(angle) * radius,
                0.5,
                Math.sin(angle) * radius
            );
            this.game.scene.add(item);
            zone.collectibles.push(item);
        }
        
        // Muted green fog for dark fantasy atmosphere
        this.game.scene.fog = new THREE.FogExp2(0x3a4a3a, 0.025);
        this.game.scene.background = new THREE.Color(0x4a5a5a);
        
        // Create zone portal to underground chamber
        const portal = this.createPortal('underground_chamber', new THREE.Vector3(25, 1, 25));
        this.game.scene.add(portal);
        zone.portal = portal;
        
        return zone;
    }
    
    createUndergroundChamberZone() {
        const zone = {
            name: 'underground_chamber',
            collectibles: []
        };
        
        // Create rough stone hall floor
        const groundGeometry = new THREE.PlaneGeometry(80, 80, 40, 40);
        
        // Add rocky displacement for ancient mechanisms
        const positions = groundGeometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 2] += (Math.random() - 0.5) * 1.0;
        }
        groundGeometry.computeVertexNormals();
        
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a, // Cold stone gray
            roughness: 1.0,
            metalness: 0.1,
            envMapIntensity: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.game.scene.add(ground);
        zone.ground = ground;
        
        // Create stone hall walls with rough texture
        zone.walls = [];
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const wall = this.createChippedStoneWall();
            wall.position.set(
                Math.cos(angle) * 35,
                6,
                Math.sin(angle) * 35
            );
            wall.lookAt(0, 6, 0);
            this.game.scene.add(wall);
            zone.walls.push(wall);
        }
        
        // Create water pools
        zone.waterPools = [];
        for (let i = 0; i < 4; i++) {
            const pool = this.createWaterPool();
            const angle = Math.random() * Math.PI * 2;
            const radius = 10 + Math.random() * 15;
            pool.position.set(
                Math.cos(angle) * radius,
                0.1,
                Math.sin(angle) * radius
            );
            this.game.scene.add(pool);
            zone.waterPools.push(pool);
        }
        
        // Add glowing runes embedded in walls
        zone.runes = [];
        for (let i = 0; i < 12; i++) {
            const rune = this.createGlowingRune();
            const angle = (i / 12) * Math.PI * 2;
            const radius = 34;
            rune.position.set(
                Math.cos(angle) * radius,
                3 + Math.random() * 4,
                Math.sin(angle) * radius
            );
            rune.lookAt(0, rune.position.y, 0);
            this.game.scene.add(rune);
            zone.runes.push(rune);
        }
        
        // Add ancient mechanisms (stone blocks)
        zone.mechanisms = [];
        for (let i = 0; i < 6; i++) {
            const mechanism = this.createAncientMechanism();
            const angle = Math.random() * Math.PI * 2;
            const radius = 8 + Math.random() * 12;
            mechanism.position.set(
                Math.cos(angle) * radius,
                1,
                Math.sin(angle) * radius
            );
            this.game.scene.add(mechanism);
            zone.mechanisms.push(mechanism);
        }
        
        // Add stone collectibles
        for (let i = 0; i < 15; i++) {
            const item = this.createCollectible('stone');
            const angle = Math.random() * Math.PI * 2;
            const radius = 5 + Math.random() * 25;
            item.position.set(
                Math.cos(angle) * radius,
                0.5,
                Math.sin(angle) * radius
            );
            this.game.scene.add(item);
            zone.collectibles.push(item);
        }
        
        // Very dark fog with cold stone atmosphere
        this.game.scene.fog = new THREE.FogExp2(0x1a1a2a, 0.04);
        this.game.scene.background = new THREE.Color(0x0a0a15);
        
        // Portal to ritual courtyard
        const portal = this.createPortal('ritual_courtyard', new THREE.Vector3(-28, 1, -28));
        this.game.scene.add(portal);
        zone.portal = portal;
        
        return zone;
    }
    
    createRitualCourtyardZone() {
        const zone = {
            name: 'ritual_courtyard',
            collectibles: []
        };
        
        // Create circular stone arena ground
        const groundGeometry = new THREE.CircleGeometry(40, 64);
        
        // Add slight height variation for aged stone
        const positions = groundGeometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const z = (Math.random() - 0.5) * 0.3;
            positions.setZ(i, z);
        }
        groundGeometry.computeVertexNormals();
        
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a5a4a, // Cold stone gray with slight warmth
            roughness: 0.95,
            metalness: 0.1,
            envMapIntensity: 0.3
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.game.scene.add(ground);
        zone.ground = ground;
        
        // Create broken statues around the arena
        zone.statues = [];
        for (let i = 0; i < 8; i++) {
            const statue = this.createBrokenStatue();
            const angle = (i / 8) * Math.PI * 2;
            const radius = 30;
            statue.position.set(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            );
            statue.rotation.y = angle + Math.PI;
            this.game.scene.add(statue);
            zone.statues.push(statue);
        }
        
        // Create central altar powered by light/energy
        zone.altar = this.createCentralAltar();
        zone.altar.position.set(0, 0, 0);
        this.game.scene.add(zone.altar);
        
        // Add energy crystals around altar
        zone.energyCrystals = [];
        for (let i = 0; i < 6; i++) {
            const crystal = this.createEnergyCrystal();
            const angle = (i / 6) * Math.PI * 2;
            const radius = 8;
            crystal.position.set(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            );
            this.game.scene.add(crystal);
            zone.energyCrystals.push(crystal);
        }
        
        // Add worn metal pillars
        zone.pillars = [];
        for (let i = 0; i < 12; i++) {
            const pillar = this.createWornMetalPillar();
            const angle = (i / 12) * Math.PI * 2;
            const radius = 20;
            pillar.position.set(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            );
            this.game.scene.add(pillar);
            zone.pillars.push(pillar);
        }
        
        // Add mixed resources (this is the final area)
        const resources = ['wood', 'stone', 'crystal'];
        for (let i = 0; i < 20; i++) {
            const resourceType = resources[Math.floor(Math.random() * resources.length)];
            const item = this.createCollectible(resourceType);
            const angle = Math.random() * Math.PI * 2;
            const radius = 10 + Math.random() * 25;
            item.position.set(
                Math.cos(angle) * radius,
                0.5,
                Math.sin(angle) * radius
            );
            this.game.scene.add(item);
            zone.collectibles.push(item);
        }
        
        // Warm torchlight amber fog with mystical atmosphere
        this.game.scene.fog = new THREE.FogExp2(0x6a5a3a, 0.022);
        this.game.scene.background = new THREE.Color(0x5a4a3a);
        
        // Portal back to forest ruins
        const portal = this.createPortal('forest_ruins', new THREE.Vector3(0, 1, 35));
        this.game.scene.add(portal);
        zone.portal = portal;
        
        return zone;
    }
    
    createAgedTree() {
        const group = new THREE.Group();
        
        // Aged trunk with worn material
        const trunkGeometry = new THREE.CylinderGeometry(0.35, 0.45, 5, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a2a1a, // Darker aged wood
            roughness: 0.98,
            metalness: 0.02
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 2.5;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        group.add(trunk);
        
        // Foliage with muted green
        const foliageGeometry = new THREE.SphereGeometry(2.2, 8, 8);
        const foliageMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a4a2a, // Muted green
            roughness: 0.95,
            metalness: 0.0
        });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.y = 6;
        foliage.scale.set(1, 1.3, 1);
        foliage.castShadow = true;
        foliage.receiveShadow = true;
        group.add(foliage);
        
        return group;
    }
    
    createMossCoveredArch() {
        const group = new THREE.Group();
        
        // Create arch using torus and pillars
        const archGeometry = new THREE.TorusGeometry(3, 0.4, 8, 16, Math.PI);
        const archMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a5a4a, // Cold stone with moss tint
            roughness: 0.98,
            metalness: 0.05
        });
        const arch = new THREE.Mesh(archGeometry, archMaterial);
        arch.position.y = 4;
        arch.rotation.x = Math.PI / 2;
        arch.castShadow = true;
        arch.receiveShadow = true;
        group.add(arch);
        
        // Left pillar
        const pillarGeometry = new THREE.CylinderGeometry(0.4, 0.5, 4, 8);
        const leftPillar = new THREE.Mesh(pillarGeometry, archMaterial);
        leftPillar.position.set(-3, 2, 0);
        leftPillar.castShadow = true;
        leftPillar.receiveShadow = true;
        group.add(leftPillar);
        
        // Right pillar
        const rightPillar = new THREE.Mesh(pillarGeometry, archMaterial);
        rightPillar.position.set(3, 2, 0);
        rightPillar.castShadow = true;
        rightPillar.receiveShadow = true;
        group.add(rightPillar);
        
        return group;
    }
    
    createFallenPillar() {
        const geometry = new THREE.CylinderGeometry(0.6, 0.7, 6, 8);
        const material = new THREE.MeshStandardMaterial({
            color: 0x5a5a4a, // Cold stone gray
            roughness: 0.97,
            metalness: 0.08
        });
        const pillar = new THREE.Mesh(geometry, material);
        pillar.castShadow = true;
        pillar.receiveShadow = true;
        return pillar;
    }
    
    createChippedStoneWall() {
        const geometry = new THREE.BoxGeometry(12, 14, 2.5);
        const material = new THREE.MeshStandardMaterial({
            color: 0x3a3a3a, // Rough chipped stone
            roughness: 1.0,
            metalness: 0.05
        });
        const wall = new THREE.Mesh(geometry, material);
        wall.castShadow = true;
        wall.receiveShadow = true;
        return wall;
    }
    
    createWaterPool() {
        const geometry = new THREE.CircleGeometry(3, 32);
        const material = new THREE.MeshStandardMaterial({
            color: 0x1a3a4a,
            roughness: 0.1,
            metalness: 0.9,
            transparent: true,
            opacity: 0.8
        });
        const pool = new THREE.Mesh(geometry, material);
        pool.rotation.x = -Math.PI / 2;
        pool.receiveShadow = true;
        return pool;
    }
    
    createGlowingRune() {
        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.MeshStandardMaterial({
            color: 0x6a9aaa,
            emissive: 0x4a7a8a,
            emissiveIntensity: 1.5,
            roughness: 0.3,
            metalness: 0.5
        });
        const rune = new THREE.Mesh(geometry, material);
        
        // Add point light for glow
        const light = new THREE.PointLight(0x6a9aaa, 1.5, 8);
        rune.add(light);
        
        return rune;
    }
    
    createAncientMechanism() {
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshStandardMaterial({
            color: 0x4a4a3a,
            roughness: 0.9,
            metalness: 0.2
        });
        const mechanism = new THREE.Mesh(geometry, material);
        mechanism.castShadow = true;
        mechanism.receiveShadow = true;
        return mechanism;
    }
    
    createBrokenStatue() {
        const group = new THREE.Group();
        
        // Base pedestal
        const pedestalGeometry = new THREE.CylinderGeometry(1, 1.2, 2, 8);
        const stoneMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a5a4a,
            roughness: 0.95,
            metalness: 0.1
        });
        const pedestal = new THREE.Mesh(pedestalGeometry, stoneMaterial);
        pedestal.position.y = 1;
        pedestal.castShadow = true;
        pedestal.receiveShadow = true;
        group.add(pedestal);
        
        // Broken statue part (partial column)
        const statueGeometry = new THREE.CylinderGeometry(0.5, 0.6, 3, 8);
        const statue = new THREE.Mesh(statueGeometry, stoneMaterial);
        statue.position.y = 3.5;
        statue.rotation.z = 0.3; // Tilted as if broken
        statue.castShadow = true;
        statue.receiveShadow = true;
        group.add(statue);
        
        return group;
    }
    
    createCentralAltar() {
        const group = new THREE.Group();
        
        // Altar base
        const baseGeometry = new THREE.CylinderGeometry(3, 4, 1.5, 8);
        const stoneMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a5a4a,
            roughness: 0.9,
            metalness: 0.15
        });
        const base = new THREE.Mesh(baseGeometry, stoneMaterial);
        base.position.y = 0.75;
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);
        
        // Energy orb on top
        const orbGeometry = new THREE.SphereGeometry(0.8, 16, 16);
        const orbMaterial = new THREE.MeshStandardMaterial({
            color: 0xd4a574, // Warm torchlight amber
            emissive: 0xd4a574,
            emissiveIntensity: 2.0,
            roughness: 0.2,
            metalness: 0.8,
            transparent: true,
            opacity: 0.9
        });
        const orb = new THREE.Mesh(orbGeometry, orbMaterial);
        orb.position.y = 2.5;
        
        // Add bright light source
        const light = new THREE.PointLight(0xd4a574, 4, 25);
        orb.add(light);
        
        group.add(orb);
        group.userData.isAltar = true;
        
        return group;
    }
    
    createEnergyCrystal() {
        const geometry = new THREE.OctahedronGeometry(0.6);
        const material = new THREE.MeshStandardMaterial({
            color: 0xd4a574, // Warm amber
            emissive: 0xd4a574,
            emissiveIntensity: 1.5,
            metalness: 0.9,
            roughness: 0.1,
            transparent: true,
            opacity: 0.9
        });
        const crystal = new THREE.Mesh(geometry, material);
        
        // Add point light
        const light = new THREE.PointLight(0xd4a574, 2, 12);
        crystal.add(light);
        
        crystal.castShadow = true;
        crystal.position.y = 0.6;
        return crystal;
    }
    
    createWornMetalPillar() {
        const geometry = new THREE.CylinderGeometry(0.4, 0.5, 6, 8);
        const material = new THREE.MeshStandardMaterial({
            color: 0x6a5a4a, // Worn metal/bronze
            roughness: 0.85,
            metalness: 0.6
        });
        const pillar = new THREE.Mesh(geometry, material);
        pillar.position.y = 3;
        pillar.castShadow = true;
        pillar.receiveShadow = true;
        return pillar;
    }
    
    createCollectible(type) {
        let geometry, material;
        
        switch (type) {
            case 'wood':
                geometry = new THREE.BoxGeometry(0.5, 0.5, 1);
                material = new THREE.MeshStandardMaterial({
                    color: 0x4a3a2a, // Aged wood
                    roughness: 0.95,
                    metalness: 0.02
                });
                break;
            case 'stone':
                geometry = new THREE.DodecahedronGeometry(0.4);
                material = new THREE.MeshStandardMaterial({
                    color: 0x5a5a5a, // Rough chipped stone
                    roughness: 0.98,
                    metalness: 0.05
                });
                break;
            case 'crystal':
                geometry = new THREE.OctahedronGeometry(0.4);
                material = new THREE.MeshStandardMaterial({
                    color: 0x7a9aaa,
                    emissive: 0x5a7a8a,
                    emissiveIntensity: 0.8,
                    metalness: 0.8,
                    roughness: 0.2
                });
                break;
        }
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.userData.itemType = type;
        
        // Animate collectibles
        mesh.userData.rotationSpeed = 0.5 + Math.random();
        mesh.userData.bobSpeed = 1 + Math.random();
        
        return mesh;
    }
    
    createPortal(targetZone, position) {
        const geometry = new THREE.TorusGeometry(1.5, 0.3, 16, 32);
        const material = new THREE.MeshStandardMaterial({
            color: 0x6a5a8a, // Muted purple for dark fantasy
            emissive: 0x6a5a8a,
            emissiveIntensity: 1.5,
            metalness: 0.8,
            roughness: 0.2,
            transparent: true,
            opacity: 0.85
        });
        const portal = new THREE.Mesh(geometry, material);
        portal.position.copy(position);
        portal.rotation.y = Math.PI / 4;
        portal.userData.targetZone = targetZone;
        portal.userData.isPortal = true;
        
        // Add portal light with muted color
        const portalLight = new THREE.PointLight(0x6a5a8a, 2, 10);
        portal.add(portalLight);
        
        // Add portal particle effect
        this.game.particleSystem.createMagicEffect(position, 0x6a5a8a);
        
        return portal;
    }
    
    update(delta) {
        if (!this.currentZoneObj) return;
        
        // Animate collectibles
        if (this.currentZoneObj.collectibles) {
            this.currentZoneObj.collectibles.forEach(item => {
                item.rotation.y += delta * item.userData.rotationSpeed;
                item.position.y += Math.sin(Date.now() * 0.001 * item.userData.bobSpeed) * 0.001;
            });
        }
        
        // Animate portal
        if (this.currentZoneObj.portal) {
            this.currentZoneObj.portal.rotation.z += delta;
            
            // Check if player is near portal
            const distance = this.game.player.mesh.position.distanceTo(this.currentZoneObj.portal.position);
            if (distance < 2) {
                const targetZone = this.currentZoneObj.portal.userData.targetZone;
                if (this.unlockedZones.includes(targetZone)) {
                    this.game.uiManager.showMessage(`Press E to enter ${targetZone}`);
                    
                    if (this.game.inputManager.isKeyPressed('e')) {
                        this.game.changeZone(targetZone);
                    }
                } else {
                    this.game.uiManager.showMessage(`${targetZone} is locked!`);
                }
            }
        }
    }
    
    clearZone() {
        if (!this.currentZoneObj) return;
        
        // Remove all zone objects
        const removeObjects = (obj) => {
            if (obj) this.game.scene.remove(obj);
        };
        
        removeObjects(this.currentZoneObj.ground);
        removeObjects(this.currentZoneObj.portal);
        removeObjects(this.currentZoneObj.altar);
        
        if (this.currentZoneObj.trees) {
            this.currentZoneObj.trees.forEach(removeObjects);
        }
        if (this.currentZoneObj.arches) {
            this.currentZoneObj.arches.forEach(removeObjects);
        }
        if (this.currentZoneObj.walls) {
            this.currentZoneObj.walls.forEach(removeObjects);
        }
        if (this.currentZoneObj.pillars) {
            this.currentZoneObj.pillars.forEach(removeObjects);
        }
        if (this.currentZoneObj.statues) {
            this.currentZoneObj.statues.forEach(removeObjects);
        }
        if (this.currentZoneObj.waterPools) {
            this.currentZoneObj.waterPools.forEach(removeObjects);
        }
        if (this.currentZoneObj.runes) {
            this.currentZoneObj.runes.forEach(removeObjects);
        }
        if (this.currentZoneObj.mechanisms) {
            this.currentZoneObj.mechanisms.forEach(removeObjects);
        }
        if (this.currentZoneObj.energyCrystals) {
            this.currentZoneObj.energyCrystals.forEach(removeObjects);
        }
        if (this.currentZoneObj.collectibles) {
            this.currentZoneObj.collectibles.forEach(removeObjects);
        }
        
        this.currentZoneObj = null;
    }
    
    unlockZone(zoneName) {
        if (!this.unlockedZones.includes(zoneName)) {
            this.unlockedZones.push(zoneName);
            this.game.uiManager.showMessage(`${zoneName} zone unlocked!`);
        }
    }
    
    updateQuestForZone(zoneName) {
        const quests = {
            forest_ruins: 'Explore the overgrown ruins and solve puzzles to unlock the underground chamber',
            underground_chamber: 'Navigate the dark stone halls and discover the path to the ritual courtyard',
            ritual_courtyard: 'Uncover the secrets of the ancient altar and complete your quest'
        };
        
        this.game.uiManager.updateQuest(quests[zoneName] || 'Explore and survive!');
    }
}
