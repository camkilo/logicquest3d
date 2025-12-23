import * as THREE from 'three';

export class Enemy {
    constructor(game, position, type = 'basic') {
        this.game = game;
        this.scene = game.scene;
        this.type = type;
        this.health = 50;
        this.maxHealth = 50;
        this.speed = 2;
        this.attackRange = 2;
        this.attackDamage = 10;
        this.attackCooldown = 0;
        this.attackDuration = 2;
        this.isDead = false;
        
        // AI state
        this.state = 'patrol'; // patrol, chase, attack
        this.patrolPoints = [];
        this.currentPatrolIndex = 0;
        this.detectionRange = 10;
        
        // Movement pattern
        this.patternTime = 0;
        this.patternDuration = 3;
        
        // Create mesh
        this.createMesh(position);
        this.generatePatrolPoints(position);
    }
    
    createMesh(position) {
        // Create enemy geometry
        const geometry = new THREE.ConeGeometry(0.5, 1.5, 6);
        const material = new THREE.MeshStandardMaterial({
            color: 0xff3333,
            metalness: 0.4,
            roughness: 0.6,
            emissive: 0x330000,
            emissiveIntensity: 0.5
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        // Add glowing eyes
        const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const eyeMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            emissive: 0xff0000
        });
        
        const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye1.position.set(-0.2, 0.3, 0.4);
        this.mesh.add(eye1);
        
        const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye2.position.set(0.2, 0.3, 0.4);
        this.mesh.add(eye2);
        
        this.scene.add(this.mesh);
    }
    
    generatePatrolPoints(center) {
        // Generate random patrol points around spawn
        const numPoints = 4;
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            const radius = 5;
            this.patrolPoints.push(new THREE.Vector3(
                center.x + Math.cos(angle) * radius,
                center.y,
                center.z + Math.sin(angle) * radius
            ));
        }
    }
    
    update(delta) {
        if (this.isDead) return;
        
        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= delta;
        }
        
        // Pattern-based behavior timing
        this.patternTime += delta;
        if (this.patternTime >= this.patternDuration) {
            this.patternTime = 0;
        }
        
        const player = this.game.player;
        const distanceToPlayer = this.mesh.position.distanceTo(player.mesh.position);
        
        // State machine
        if (distanceToPlayer < this.attackRange) {
            this.state = 'attack';
        } else if (distanceToPlayer < this.detectionRange) {
            this.state = 'chase';
        } else {
            this.state = 'patrol';
        }
        
        // Execute behavior based on state
        switch (this.state) {
            case 'patrol':
                this.patrol(delta);
                break;
            case 'chase':
                this.chase(delta, player);
                break;
            case 'attack':
                this.attack(delta, player);
                break;
        }
        
        // Animate with pattern-based movement
        this.animate(delta);
    }
    
    patrol(delta) {
        if (this.patrolPoints.length === 0) return;
        
        const target = this.patrolPoints[this.currentPatrolIndex];
        const direction = new THREE.Vector3()
            .subVectors(target, this.mesh.position)
            .normalize();
        
        // Move towards patrol point
        this.mesh.position.add(direction.multiplyScalar(this.speed * 0.5 * delta));
        
        // Look at patrol point
        this.mesh.lookAt(target);
        
        // Check if reached patrol point
        if (this.mesh.position.distanceTo(target) < 1) {
            this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
        }
    }
    
    chase(delta, player) {
        // Pattern-based chase - zigzag approach
        const toPlayer = new THREE.Vector3()
            .subVectors(player.mesh.position, this.mesh.position);
        
        // Add pattern movement
        const perpendicular = new THREE.Vector3(-toPlayer.z, 0, toPlayer.x).normalize();
        const zigzag = Math.sin(this.patternTime * 3) * 2;
        
        const direction = toPlayer.normalize();
        direction.add(perpendicular.multiplyScalar(zigzag));
        direction.normalize();
        
        // Move towards player with pattern
        this.mesh.position.add(direction.multiplyScalar(this.speed * delta));
        
        // Look at player
        this.mesh.lookAt(player.mesh.position);
    }
    
    attack(delta, player) {
        // Look at player
        this.mesh.lookAt(player.mesh.position);
        
        // Attack on cooldown
        if (this.attackCooldown <= 0) {
            this.attackCooldown = this.attackDuration;
            
            // Damage player
            player.takeDamage(this.attackDamage);
            
            // Visual feedback
            this.mesh.material.emissiveIntensity = 1.0;
            setTimeout(() => {
                if (!this.isDead) {
                    this.mesh.material.emissiveIntensity = 0.5;
                }
            }, 200);
            
            // Attack particle effect
            this.game.particleSystem.createAttackEffect(this.mesh.position);
        }
    }
    
    animate(delta) {
        // Bob up and down
        const bobAmount = Math.sin(this.patternTime * 4) * 0.1;
        this.mesh.position.y = 1 + bobAmount;
        
        // Rotate slightly
        this.mesh.rotation.y += delta * 0.5;
    }
    
    takeDamage(amount) {
        if (this.isDead) return;
        
        this.health -= amount;
        
        // Visual feedback
        this.mesh.material.color.setHex(0xffaaaa);
        setTimeout(() => {
            if (!this.isDead) {
                this.mesh.material.color.setHex(0xff3333);
            }
        }, 100);
        
        // Particle effect
        this.game.particleSystem.createHitEffect(this.mesh.position);
        
        if (this.health <= 0) {
            this.die();
        }
    }
    
    die() {
        this.isDead = true;
        
        // Death effect
        this.game.particleSystem.createExplosionEffect(this.mesh.position);
        
        // Remove from scene after delay
        setTimeout(() => {
            this.scene.remove(this.mesh);
        }, 500);
        
        // Chance to drop loot
        if (Math.random() > 0.5) {
            this.dropLoot();
        }
    }
    
    dropLoot() {
        const lootTypes = ['wood', 'stone', 'crystal'];
        const lootType = lootTypes[Math.floor(Math.random() * lootTypes.length)];
        
        const geometry = new THREE.SphereGeometry(0.3, 8, 8);
        const material = new THREE.MeshStandardMaterial({
            color: lootType === 'crystal' ? 0x00ffff : lootType === 'stone' ? 0x888888 : 0x8b4513,
            metalness: 0.8,
            roughness: 0.2,
            emissive: lootType === 'crystal' ? 0x0088ff : 0x000000
        });
        
        const loot = new THREE.Mesh(geometry, material);
        loot.position.copy(this.mesh.position);
        loot.castShadow = true;
        loot.userData.itemType = lootType;
        
        this.scene.add(loot);
        
        // Add to zone collectibles
        if (this.game.zoneManager.currentZoneObj) {
            this.game.zoneManager.currentZoneObj.collectibles.push(loot);
        }
    }
}
