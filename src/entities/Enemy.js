import * as THREE from 'three';

export class Enemy {
    constructor(game, position, type = 'fast_melee') {
        this.game = game;
        this.scene = game.scene;
        this.type = type;
        
        // Type-specific properties
        this.setupTypeProperties();
        
        // AI state
        this.state = 'patrol'; // patrol, chase, attack, retreat
        this.patrolPoints = [];
        this.currentPatrolIndex = 0;
        
        // Movement pattern
        this.patternTime = 0;
        this.patternDuration = 3;
        
        // Create mesh
        this.createMesh(position);
        this.generatePatrolPoints(position);
    }
    
    setupTypeProperties() {
        switch (this.type) {
            case 'fast_melee':
                this.health = 40;
                this.maxHealth = 40;
                this.speed = 4;
                this.attackRange = 2.5;
                this.attackDamage = 8;
                this.attackCooldown = 0;
                this.attackDuration = 1.0;
                this.detectionRange = 12;
                this.retreatHealthPercent = 0.3;
                break;
            case 'ranged_magic':
                this.health = 30;
                this.maxHealth = 30;
                this.speed = 2;
                this.attackRange = 10;
                this.attackDamage = 12;
                this.attackCooldown = 0;
                this.attackDuration = 2.5;
                this.detectionRange = 15;
                this.retreatHealthPercent = 0.4;
                break;
            case 'slow_heavy':
                this.health = 80;
                this.maxHealth = 80;
                this.speed = 1.5;
                this.attackRange = 3;
                this.attackDamage = 20;
                this.attackCooldown = 0;
                this.attackDuration = 3.0;
                this.detectionRange = 10;
                this.retreatHealthPercent = 0.2;
                break;
            default:
                this.health = 40;
                this.maxHealth = 40;
                this.speed = 3;
                this.attackRange = 2.5;
                this.attackDamage = 10;
                this.attackCooldown = 0;
                this.attackDuration = 2.0;
                this.detectionRange = 10;
                this.retreatHealthPercent = 0.3;
        }
        
        this.isDead = false;
    }
    
    createMesh(position) {
        let geometry, color, size;
        
        // Create enemy geometry based on type
        switch (this.type) {
            case 'fast_melee':
                // Small, agile creature
                geometry = new THREE.ConeGeometry(0.4, 1.2, 6);
                color = 0xaa3333;
                size = 0.9;
                break;
            case 'ranged_magic':
                // Floating magical enemy
                geometry = new THREE.OctahedronGeometry(0.6);
                color = 0x6633aa;
                size = 1.0;
                break;
            case 'slow_heavy':
                // Large guardian
                geometry = new THREE.BoxGeometry(1, 2, 1);
                color = 0x555555;
                size = 1.3;
                break;
            default:
                geometry = new THREE.ConeGeometry(0.5, 1.5, 6);
                color = 0xff3333;
                size = 1.0;
        }
        
        const material = new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.4,
            roughness: 0.6,
            emissive: color,
            emissiveIntensity: 0.3
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        this.mesh.scale.set(size, size, size);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        // Add glowing eyes for all types with higher detail
        const eyeGeometry = new THREE.SphereGeometry(0.08, 16, 16);
        const eyeMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            emissive: 0xff0000
        });
        
        if (this.type !== 'ranged_magic') {
            const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye1.position.set(-0.15, 0.3, 0.35);
            this.mesh.add(eye1);
            
            const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye2.position.set(0.15, 0.3, 0.35);
            this.mesh.add(eye2);
        }
        
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
        
        // Check if should retreat (low health)
        const healthPercent = this.health / this.maxHealth;
        if (healthPercent < this.retreatHealthPercent) {
            this.state = 'retreat';
        } else if (distanceToPlayer < this.attackRange) {
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
            case 'retreat':
                this.retreat(delta, player);
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
            
            // Different attack behavior based on type
            if (this.type === 'ranged_magic') {
                // Ranged magic attack - create projectile
                const projectilePos = this.mesh.position.clone().add(new THREE.Vector3(0, 0.5, 0));
                const direction = new THREE.Vector3()
                    .subVectors(player.mesh.position, this.mesh.position)
                    .normalize();
                
                this.game.particleSystem.createEnemyMagicProjectile(
                    projectilePos, 
                    direction, 
                    this.attackDamage,
                    player
                );
            } else {
                // Melee attack - damage player directly if in range
                const distance = this.mesh.position.distanceTo(player.mesh.position);
                if (distance < this.attackRange) {
                    player.takeDamage(this.attackDamage);
                }
            }
            
            // Visual feedback
            this.mesh.material.emissiveIntensity = 0.8;
            setTimeout(() => {
                if (!this.isDead) {
                    this.mesh.material.emissiveIntensity = 0.3;
                }
            }, 200);
            
            // Attack particle effect
            this.game.particleSystem.createAttackEffect(this.mesh.position);
        }
    }
    
    retreat(delta, player) {
        // Move away from player
        const awayFromPlayer = new THREE.Vector3()
            .subVectors(this.mesh.position, player.mesh.position)
            .normalize();
        
        // Move backward faster than normal chase
        this.mesh.position.add(awayFromPlayer.multiplyScalar(this.speed * 1.5 * delta));
        
        // Look at player while retreating
        this.mesh.lookAt(player.mesh.position);
        
        // Visual indicator (darker emissive)
        this.mesh.material.emissiveIntensity = 0.15;
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
        
        // Higher detail sphere for smooth loot
        const geometry = new THREE.SphereGeometry(0.3, 32, 32);
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
