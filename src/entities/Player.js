import * as THREE from 'three';

export class Player {
    constructor(game) {
        this.game = game;
        this.scene = game.scene;
        this.inputManager = game.inputManager;
        
        // Player properties
        this.health = 100;
        this.maxHealth = 100;
        this.inventory = [];
        this.maxInventorySize = 9;
        
        // Movement properties
        this.speed = 5;
        this.sprintMultiplier = 1.5;
        this.jumpForce = 8;
        this.gravity = -20;
        
        // Physics
        this.velocity = new THREE.Vector3();
        this.isGrounded = false;
        
        // Rotation
        this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
        this.mouseSensitivity = 0.002;
        
        // Combat
        this.attackCooldown = 0;
        this.attackDuration = 0.5;
        
        // Create player mesh
        this.createMesh();
        
        // Setup controls
        this.setupControls();
    }
    
    createMesh() {
        // Create a simple capsule for the player
        const geometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
        const material = new THREE.MeshStandardMaterial({
            color: 0x4488ff,
            metalness: 0.3,
            roughness: 0.7
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.position.set(0, 1, 0);
        
        // Add a weapon indicator
        const weaponGeometry = new THREE.BoxGeometry(0.1, 0.5, 0.8);
        const weaponMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.8,
            roughness: 0.2
        });
        this.weapon = new THREE.Mesh(weaponGeometry, weaponMaterial);
        this.weapon.position.set(0.3, 0, -0.5);
        this.mesh.add(this.weapon);
    }
    
    setupControls() {
        // Mouse movement
        document.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement === this.game.canvas) {
                this.rotation.y -= e.movementX * this.mouseSensitivity;
                this.rotation.x -= e.movementY * this.mouseSensitivity;
                
                // Clamp vertical rotation
                this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));
            }
        });
        
        // Mouse click for attack
        document.addEventListener('mousedown', (e) => {
            if (e.button === 0 && document.pointerLockElement === this.game.canvas) {
                this.attack();
            }
        });
        
        // Keyboard interactions
        document.addEventListener('keydown', (e) => {
            if (e.key === 'e' || e.key === 'E') {
                this.interact();
            }
            if (e.key === 'c' || e.key === 'C') {
                this.game.craftingSystem.toggleCraftingPanel();
            }
        });
    }
    
    update(delta) {
        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= delta;
        }
        
        // Get input
        const input = this.inputManager.getInput();
        
        // Calculate movement direction
        const direction = new THREE.Vector3();
        
        if (input.forward) direction.z -= 1;
        if (input.backward) direction.z += 1;
        if (input.left) direction.x -= 1;
        if (input.right) direction.x += 1;
        
        // Normalize direction
        if (direction.length() > 0) {
            direction.normalize();
        }
        
        // Apply rotation to movement direction
        direction.applyEuler(new THREE.Euler(0, this.rotation.y, 0));
        
        // Calculate speed with sprint
        const currentSpeed = input.sprint ? this.speed * this.sprintMultiplier : this.speed;
        
        // Apply horizontal movement
        this.velocity.x = direction.x * currentSpeed;
        this.velocity.z = direction.z * currentSpeed;
        
        // Apply gravity
        this.velocity.y += this.gravity * delta;
        
        // Jump
        if (input.jump && this.isGrounded) {
            this.velocity.y = this.jumpForce;
            this.isGrounded = false;
        }
        
        // Update position
        this.mesh.position.x += this.velocity.x * delta;
        this.mesh.position.y += this.velocity.y * delta;
        this.mesh.position.z += this.velocity.z * delta;
        
        // Ground check and collision
        this.checkGround();
        this.checkCollisions();
        
        // Apply rotation to mesh
        this.mesh.rotation.y = this.rotation.y;
    }
    
    checkGround() {
        // Simple ground check
        if (this.mesh.position.y <= 1) {
            this.mesh.position.y = 1;
            this.velocity.y = 0;
            this.isGrounded = true;
        }
    }
    
    checkCollisions() {
        // Keep player within bounds
        const bounds = 50;
        this.mesh.position.x = Math.max(-bounds, Math.min(bounds, this.mesh.position.x));
        this.mesh.position.z = Math.max(-bounds, Math.min(bounds, this.mesh.position.z));
        
        // Check collision with enemies
        const enemies = this.game.enemyManager.enemies;
        for (const enemy of enemies) {
            if (!enemy.isDead) {
                const distance = this.mesh.position.distanceTo(enemy.mesh.position);
                if (distance < 1.5) {
                    // Push player away
                    const pushDir = new THREE.Vector3()
                        .subVectors(this.mesh.position, enemy.mesh.position)
                        .normalize();
                    this.mesh.position.add(pushDir.multiplyScalar(0.1));
                }
            }
        }
    }
    
    attack() {
        if (this.attackCooldown > 0) return;
        
        this.attackCooldown = this.attackDuration;
        
        // Animate weapon
        this.weapon.rotation.x = -Math.PI / 4;
        setTimeout(() => {
            this.weapon.rotation.x = 0;
        }, 200);
        
        // Create attack particles
        this.game.particleSystem.createAttackEffect(
            this.mesh.position.clone().add(new THREE.Vector3(0, 1, -1))
        );
        
        // Check for hits
        const attackRange = 3;
        const enemies = this.game.enemyManager.enemies;
        
        for (const enemy of enemies) {
            if (!enemy.isDead) {
                const distance = this.mesh.position.distanceTo(enemy.mesh.position);
                
                // Check if enemy is in front of player
                const toEnemy = new THREE.Vector3()
                    .subVectors(enemy.mesh.position, this.mesh.position)
                    .normalize();
                const forward = new THREE.Vector3(0, 0, -1)
                    .applyEuler(new THREE.Euler(0, this.rotation.y, 0));
                const dot = toEnemy.dot(forward);
                
                if (distance < attackRange && dot > 0.5) {
                    enemy.takeDamage(25);
                }
            }
        }
    }
    
    interact() {
        // Check for nearby interactable objects
        const interactRange = 3;
        
        // Check for collectibles in zone
        const zone = this.game.zoneManager.currentZoneObj;
        if (zone && zone.collectibles) {
            for (let i = zone.collectibles.length - 1; i >= 0; i--) {
                const item = zone.collectibles[i];
                const distance = this.mesh.position.distanceTo(item.position);
                
                if (distance < interactRange) {
                    // Collect item
                    this.addToInventory(item.userData.itemType);
                    this.game.scene.remove(item);
                    zone.collectibles.splice(i, 1);
                    
                    // Show message
                    this.game.uiManager.showMessage(`Collected ${item.userData.itemType}!`);
                    
                    // Particle effect
                    this.game.particleSystem.createCollectEffect(item.position);
                }
            }
        }
        
        // Check for puzzle interaction
        this.game.puzzleManager.tryInteract(this.mesh.position, this.rotation);
    }
    
    addToInventory(itemType) {
        if (this.inventory.length < this.maxInventorySize) {
            this.inventory.push(itemType);
            this.game.uiManager.updateInventory(this.inventory);
            return true;
        }
        return false;
    }
    
    removeFromInventory(itemType) {
        const index = this.inventory.indexOf(itemType);
        if (index > -1) {
            this.inventory.splice(index, 1);
            this.game.uiManager.updateInventory(this.inventory);
            return true;
        }
        return false;
    }
    
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        this.game.uiManager.updateHealth(this.health, this.maxHealth);
        
        // Flash effect
        this.mesh.material.emissive.setHex(0xff0000);
        setTimeout(() => {
            this.mesh.material.emissive.setHex(0x000000);
        }, 100);
        
        if (this.health <= 0) {
            this.die();
        }
    }
    
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        this.game.uiManager.updateHealth(this.health, this.maxHealth);
    }
    
    die() {
        console.log('Player died! Game Over');
        this.game.uiManager.showMessage('Game Over! Refreshing...', 3000);
        setTimeout(() => {
            location.reload();
        }, 3000);
    }
}
