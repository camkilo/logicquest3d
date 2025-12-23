import * as THREE from 'three';

export class PuzzleManager {
    constructor(game) {
        this.game = game;
        this.puzzles = [];
        this.activePuzzle = null;
        
        this.createPuzzles();
    }
    
    createPuzzles() {
        // Color sequence puzzle
        this.puzzles.push(new ColorSequencePuzzle(this.game));
        
        // Pressure plate puzzle
        this.puzzles.push(new PressurePlatePuzzle(this.game));
    }
    
    tryInteract(playerPosition, playerRotation) {
        for (const puzzle of this.puzzles) {
            if (puzzle.isNearby(playerPosition) && !puzzle.isSolved) {
                puzzle.interact(playerRotation);
            }
        }
    }
    
    update(delta) {
        for (const puzzle of this.puzzles) {
            puzzle.update(delta);
        }
    }
}

class ColorSequencePuzzle {
    constructor(game) {
        this.game = game;
        this.isSolved = false;
        this.sequence = ['red', 'blue', 'green', 'yellow'];
        this.currentIndex = 0;
        this.position = new THREE.Vector3(10, 0, 10);
        this.buttons = [];
        
        this.createPuzzle();
    }
    
    createPuzzle() {
        const colors = {
            red: 0xff0000,
            blue: 0x0000ff,
            green: 0x00ff00,
            yellow: 0xffff00
        };
        
        const buttonNames = ['red', 'blue', 'green', 'yellow'];
        buttonNames.forEach((name, index) => {
            const geometry = new THREE.BoxGeometry(1, 0.5, 1);
            const material = new THREE.MeshStandardMaterial({
                color: colors[name],
                emissive: colors[name],
                emissiveIntensity: 0.3,
                metalness: 0.5,
                roughness: 0.5
            });
            
            const button = new THREE.Mesh(geometry, material);
            button.position.set(
                this.position.x + (index - 1.5) * 1.5,
                0.25,
                this.position.z
            );
            button.castShadow = true;
            button.receiveShadow = true;
            button.userData.color = name;
            button.userData.isPuzzleButton = true;
            
            this.game.scene.add(button);
            this.buttons.push(button);
        });
    }
    
    isNearby(position) {
        return position.distanceTo(this.position) < 5;
    }
    
    interact(playerRotation) {
        // Check which button player is looking at
        const forward = new THREE.Vector3(0, 0, -1).applyEuler(
            new THREE.Euler(0, playerRotation.y, 0)
        );
        
        for (const button of this.buttons) {
            const toButton = new THREE.Vector3()
                .subVectors(button.position, this.game.player.mesh.position)
                .normalize();
            const dot = forward.dot(toButton);
            
            if (dot > 0.8) {
                this.pressButton(button);
                return;
            }
        }
    }
    
    pressButton(button) {
        const expectedColor = this.sequence[this.currentIndex];
        
        // Flash button
        button.material.emissiveIntensity = 1.0;
        setTimeout(() => {
            if (!this.isSolved) {
                button.material.emissiveIntensity = 0.3;
            }
        }, 200);
        
        if (button.userData.color === expectedColor) {
            this.currentIndex++;
            this.game.particleSystem.createMagicEffect(button.position, 0x00ff00);
            
            if (this.currentIndex >= this.sequence.length) {
                this.solve();
            }
        } else {
            // Wrong button, reset
            this.currentIndex = 0;
            this.game.uiManager.showMessage('Wrong sequence! Try again.');
            this.game.particleSystem.createHitEffect(button.position);
        }
    }
    
    solve() {
        this.isSolved = true;
        this.game.uiManager.showMessage('Puzzle solved! Cave unlocked!');
        
        // Visual feedback
        this.buttons.forEach(button => {
            button.material.emissiveIntensity = 1.0;
        });
        
        // Unlock cave zone
        this.game.zoneManager.unlockZone('cave');
        
        // Reward player
        this.game.player.addToInventory('crystal');
        this.game.particleSystem.createExplosionEffect(this.position);
    }
    
    update(delta) {
        if (!this.isSolved) {
            // Show hint if player is nearby
            if (this.isNearby(this.game.player.mesh.position)) {
                this.game.uiManager.showMessage('Puzzle: Press the colors in the correct sequence');
            }
        }
    }
}

class PressurePlatePuzzle {
    constructor(game) {
        this.game = game;
        this.isSolved = false;
        this.position = new THREE.Vector3(-15, 0, -15);
        this.plates = [];
        this.activatedPlates = 0;
        this.requiredPlates = 3;
        
        this.createPuzzle();
    }
    
    createPuzzle() {
        for (let i = 0; i < this.requiredPlates; i++) {
            const geometry = new THREE.CylinderGeometry(1, 1, 0.2, 16);
            const material = new THREE.MeshStandardMaterial({
                color: 0x888888,
                metalness: 0.8,
                roughness: 0.2
            });
            
            const plate = new THREE.Mesh(geometry, material);
            const angle = (i / this.requiredPlates) * Math.PI * 2;
            const radius = 5;
            plate.position.set(
                this.position.x + Math.cos(angle) * radius,
                0.1,
                this.position.z + Math.sin(angle) * radius
            );
            plate.userData.isActivated = false;
            plate.userData.isPressurePlate = true;
            
            this.game.scene.add(plate);
            this.plates.push(plate);
        }
    }
    
    isNearby(position) {
        for (const plate of this.plates) {
            if (position.distanceTo(plate.position) < 1.5) {
                return true;
            }
        }
        return false;
    }
    
    interact(playerRotation) {
        // Interaction handled in update
    }
    
    update(delta) {
        if (this.isSolved) return;
        
        let activeCount = 0;
        
        for (const plate of this.plates) {
            const distance = this.game.player.mesh.position.distanceTo(plate.position);
            
            if (distance < 1.5) {
                if (!plate.userData.isActivated) {
                    plate.userData.isActivated = true;
                    plate.material.color.setHex(0x00ff00);
                    plate.material.emissive.setHex(0x00ff00);
                    plate.material.emissiveIntensity = 0.5;
                    this.game.particleSystem.createMagicEffect(plate.position, 0x00ff00);
                }
                activeCount++;
            }
        }
        
        if (activeCount === this.requiredPlates) {
            this.solve();
        }
    }
    
    solve() {
        this.isSolved = true;
        this.game.uiManager.showMessage('Pressure plate puzzle solved! Ruins unlocked!');
        
        // Unlock ruins zone
        this.game.zoneManager.unlockZone('ruins');
        
        // Reward player
        this.game.player.addToInventory('crystal');
        this.game.player.addToInventory('stone');
        
        // Visual celebration
        for (const plate of this.plates) {
            this.game.particleSystem.createExplosionEffect(plate.position);
        }
    }
}
