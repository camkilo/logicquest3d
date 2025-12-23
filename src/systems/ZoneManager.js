import * as THREE from 'three';

export class ZoneManager {
    constructor(game) {
        this.game = game;
        this.currentZoneObj = null;
        this.currentZoneName = null;
        this.zones = {};
        
        // Zone unlock status
        this.unlockedZones = ['forest'];
    }
    
    loadZone(zoneName) {
        // Clear current zone
        if (this.currentZoneObj) {
            this.clearZone();
        }
        
        this.currentZoneName = zoneName;
        
        // Create zone based on name
        switch (zoneName) {
            case 'forest':
                this.currentZoneObj = this.createForestZone();
                break;
            case 'cave':
                this.currentZoneObj = this.createCaveZone();
                break;
            case 'ruins':
                this.currentZoneObj = this.createRuinsZone();
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
    
    createForestZone() {
        const zone = {
            name: 'forest',
            collectibles: []
        };
        
        // Create ground with improved material
        const groundGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
        
        // Add vertex displacement for terrain variation
        const positions = groundGeometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 2] += Math.random() * 0.3 - 0.15; // Add slight height variation
        }
        groundGeometry.computeVertexNormals();
        
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d5016,
            roughness: 0.95,
            metalness: 0.05,
            envMapIntensity: 0.5
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.game.scene.add(ground);
        zone.ground = ground;
        
        // Create trees
        zone.trees = [];
        for (let i = 0; i < 30; i++) {
            const tree = this.createTree();
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
        
        // Add collectible resources
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
        
        // Add some crystals
        for (let i = 0; i < 3; i++) {
            const item = this.createCollectible('crystal');
            const angle = Math.random() * Math.PI * 2;
            const radius = 10 + Math.random() * 15;
            item.position.set(
                Math.cos(angle) * radius,
                0.5,
                Math.sin(angle) * radius
            );
            this.game.scene.add(item);
            zone.collectibles.push(item);
        }
        
        // Change fog color for forest with atmospheric settings
        this.game.scene.fog = new THREE.FogExp2(0x87ceeb, 0.012);
        this.game.scene.background = new THREE.Color(0x87ceeb);
        
        // Create zone portal to cave
        const portal = this.createPortal('cave', new THREE.Vector3(20, 1, 20));
        this.game.scene.add(portal);
        zone.portal = portal;
        
        return zone;
    }
    
    createCaveZone() {
        const zone = {
            name: 'cave',
            collectibles: []
        };
        
        // Create ground with rough cave floor
        const groundGeometry = new THREE.PlaneGeometry(80, 80, 40, 40);
        
        // Add rocky displacement
        const positions = groundGeometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 2] += (Math.random() - 0.5) * 0.8;
        }
        groundGeometry.computeVertexNormals();
        
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 1.0,
            metalness: 0.3,
            envMapIntensity: 0.3
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.game.scene.add(ground);
        zone.ground = ground;
        
        // Create cave walls
        zone.walls = [];
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const wall = this.createCaveWall();
            wall.position.set(
                Math.cos(angle) * 35,
                5,
                Math.sin(angle) * 35
            );
            wall.lookAt(0, 5, 0);
            this.game.scene.add(wall);
            zone.walls.push(wall);
        }
        
        // Add glowing crystals for light
        for (let i = 0; i < 15; i++) {
            const crystal = this.createGlowingCrystal();
            const angle = Math.random() * Math.PI * 2;
            const radius = 10 + Math.random() * 20;
            crystal.position.set(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            );
            this.game.scene.add(crystal);
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
        
        // Dark fog with volumetric feel
        this.game.scene.fog = new THREE.FogExp2(0x111122, 0.035);
        this.game.scene.background = new THREE.Color(0x0a0a15);
        
        // Portal to ruins
        const portal = this.createPortal('ruins', new THREE.Vector3(-25, 1, -25));
        this.game.scene.add(portal);
        zone.portal = portal;
        
        return zone;
    }
    
    createRuinsZone() {
        const zone = {
            name: 'ruins',
            collectibles: []
        };
        
        // Create ancient ground with weathered texture
        const groundGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
        
        // Add ruins ground variation
        const positions = groundGeometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 2] += Math.sin(positions[i] * 0.3) * 0.2 + Math.random() * 0.2;
        }
        groundGeometry.computeVertexNormals();
        
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b7355,
            roughness: 0.85,
            metalness: 0.15,
            envMapIntensity: 0.4
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.game.scene.add(ground);
        zone.ground = ground;
        
        // Create ancient pillars
        zone.pillars = [];
        for (let i = 0; i < 12; i++) {
            const pillar = this.createPillar();
            const angle = (i / 12) * Math.PI * 2;
            const radius = 15;
            pillar.position.set(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            );
            this.game.scene.add(pillar);
            zone.pillars.push(pillar);
        }
        
        // Create broken walls
        zone.walls = [];
        for (let i = 0; i < 6; i++) {
            const wall = this.createRuinWall();
            const angle = Math.random() * Math.PI * 2;
            const radius = 20 + Math.random() * 15;
            wall.position.set(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            );
            wall.rotation.y = Math.random() * Math.PI;
            this.game.scene.add(wall);
            zone.walls.push(wall);
        }
        
        // Add mixed resources
        const resources = ['wood', 'stone', 'crystal'];
        for (let i = 0; i < 20; i++) {
            const resourceType = resources[Math.floor(Math.random() * resources.length)];
            const item = this.createCollectible(resourceType);
            const angle = Math.random() * Math.PI * 2;
            const radius = 5 + Math.random() * 30;
            item.position.set(
                Math.cos(angle) * radius,
                0.5,
                Math.sin(angle) * radius
            );
            this.game.scene.add(item);
            zone.collectibles.push(item);
        }
        
        // Golden fog with mystical atmosphere
        this.game.scene.fog = new THREE.FogExp2(0xccaa66, 0.018);
        this.game.scene.background = new THREE.Color(0xddbb77);
        
        // Portal back to forest
        const portal = this.createPortal('forest', new THREE.Vector3(0, 1, 30));
        this.game.scene.add(portal);
        zone.portal = portal;
        
        return zone;
    }
    
    createTree() {
        const group = new THREE.Group();
        
        // Trunk with better material
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 4, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3728,
            roughness: 0.95,
            metalness: 0.05
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 2;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        group.add(trunk);
        
        // Foliage with enhanced material
        const foliageGeometry = new THREE.SphereGeometry(2, 8, 8);
        const foliageMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d5016,
            roughness: 0.9,
            metalness: 0.0,
            emissive: 0x0a1505,
            emissiveIntensity: 0.1
        });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.y = 5;
        foliage.scale.set(1, 1.2, 1);
        foliage.castShadow = true;
        foliage.receiveShadow = true;
        group.add(foliage);
        
        return group;
    }
    
    createCaveWall() {
        const geometry = new THREE.BoxGeometry(10, 12, 2);
        const material = new THREE.MeshStandardMaterial({
            color: 0x444444,
            roughness: 1,
            metalness: 0.1
        });
        const wall = new THREE.Mesh(geometry, material);
        wall.castShadow = true;
        wall.receiveShadow = true;
        return wall;
    }
    
    createPillar() {
        const geometry = new THREE.CylinderGeometry(0.8, 1, 8, 8);
        const material = new THREE.MeshStandardMaterial({
            color: 0xccaa88,
            roughness: 0.9,
            metalness: 0.1
        });
        const pillar = new THREE.Mesh(geometry, material);
        pillar.position.y = 4;
        pillar.castShadow = true;
        pillar.receiveShadow = true;
        return pillar;
    }
    
    createRuinWall() {
        const geometry = new THREE.BoxGeometry(8, 5, 1);
        const material = new THREE.MeshStandardMaterial({
            color: 0x998877,
            roughness: 0.9
        });
        const wall = new THREE.Mesh(geometry, material);
        wall.position.y = 2.5;
        wall.castShadow = true;
        wall.receiveShadow = true;
        return wall;
    }
    
    createGlowingCrystal() {
        const geometry = new THREE.OctahedronGeometry(0.5);
        const material = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 2.0,
            metalness: 0.9,
            roughness: 0.1,
            transparent: true,
            opacity: 0.9
        });
        const crystal = new THREE.Mesh(geometry, material);
        
        // Add bright point light
        const light = new THREE.PointLight(0x00ffff, 2, 15);
        light.castShadow = true;
        crystal.add(light);
        
        crystal.castShadow = true;
        return crystal;
    }
    
    createCollectible(type) {
        let geometry, material;
        
        switch (type) {
            case 'wood':
                geometry = new THREE.BoxGeometry(0.5, 0.5, 1);
                material = new THREE.MeshStandardMaterial({
                    color: 0x8b4513,
                    roughness: 0.8
                });
                break;
            case 'stone':
                geometry = new THREE.DodecahedronGeometry(0.4);
                material = new THREE.MeshStandardMaterial({
                    color: 0x888888,
                    roughness: 0.9,
                    metalness: 0.3
                });
                break;
            case 'crystal':
                geometry = new THREE.OctahedronGeometry(0.4);
                material = new THREE.MeshStandardMaterial({
                    color: 0x00ffff,
                    emissive: 0x0088ff,
                    emissiveIntensity: 0.5,
                    metalness: 0.9,
                    roughness: 0.1
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
            color: 0x8800ff,
            emissive: 0x8800ff,
            emissiveIntensity: 2.0,
            metalness: 0.9,
            roughness: 0.1,
            transparent: true,
            opacity: 0.8
        });
        const portal = new THREE.Mesh(geometry, material);
        portal.position.copy(position);
        portal.rotation.y = Math.PI / 4;
        portal.userData.targetZone = targetZone;
        portal.userData.isPortal = true;
        
        // Add portal light
        const portalLight = new THREE.PointLight(0x8800ff, 3, 10);
        portal.add(portalLight);
        
        // Add portal particle effect
        this.game.particleSystem.createMagicEffect(position, 0x8800ff);
        
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
        
        if (this.currentZoneObj.trees) {
            this.currentZoneObj.trees.forEach(removeObjects);
        }
        if (this.currentZoneObj.walls) {
            this.currentZoneObj.walls.forEach(removeObjects);
        }
        if (this.currentZoneObj.pillars) {
            this.currentZoneObj.pillars.forEach(removeObjects);
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
            forest: 'Collect resources and defeat enemies to unlock the cave',
            cave: 'Explore the dark cave and find rare crystals to access the ruins',
            ruins: 'Discover the secrets of the ancient ruins and craft powerful items'
        };
        
        this.game.uiManager.updateQuest(quests[zoneName] || 'Explore and survive!');
    }
}
