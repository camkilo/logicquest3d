import * as THREE from 'three';

export class PuzzleManager {
    constructor(game) {
        this.game = game;
        this.puzzles = [];
        this.activePuzzle = null;
        
        this.createPuzzles();
    }
    
    createPuzzles() {
        // Weight & Pressure puzzle
        this.puzzles.push(new PressurePlatePuzzle(this.game));
        
        // Rotation Logic puzzle
        this.puzzles.push(new RotationPillarPuzzle(this.game));
        
        // Energy Routing puzzle
        this.puzzles.push(new EnergyRoutingPuzzle(this.game));
        
        // Sequence Logic puzzle
        this.puzzles.push(new SequenceLeverPuzzle(this.game));
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

// Weight & Pressure Puzzle - Push blocks onto pressure plates
class PressurePlatePuzzle {
    constructor(game) {
        this.game = game;
        this.isSolved = false;
        this.position = new THREE.Vector3(-15, 0, -15);
        this.plates = [];
        this.blocks = [];
        this.requiredPlates = 3;
        
        this.createPuzzle();
    }
    
    createPuzzle() {
        // Create pressure plates
        for (let i = 0; i < this.requiredPlates; i++) {
            const geometry = new THREE.CylinderGeometry(1, 1, 0.2, 16);
            const material = new THREE.MeshStandardMaterial({
                color: 0x5a5a4a,
                metalness: 0.3,
                roughness: 0.9,
                emissive: 0x3a3a2a,
                emissiveIntensity: 0
            });
            
            const plate = new THREE.Mesh(geometry, material);
            const angle = (i / this.requiredPlates) * Math.PI * 2;
            const radius = 6;
            plate.position.set(
                this.position.x + Math.cos(angle) * radius,
                0.1,
                this.position.z + Math.sin(angle) * radius
            );
            plate.userData.isActivated = false;
            plate.userData.isPressurePlate = true;
            plate.receiveShadow = true;
            
            this.game.scene.add(plate);
            this.plates.push(plate);
        }
        
        // Create movable irregular stone slabs (not cubes)
        for (let i = 0; i < this.requiredPlates; i++) {
            // Create irregular stone slab using cylinder with displacement
            const geometry = new THREE.CylinderGeometry(0.8, 0.9, 1.2, 32);
            
            // Add irregular, weathered surface to make it look like ancient stone
            const positions = geometry.attributes.position.array;
            for (let j = 0; j < positions.length; j += 3) {
                const noise = (Math.random() - 0.5) * 0.12;
                positions[j] += noise;
                positions[j + 2] += noise;
            }
            geometry.computeVertexNormals();
            
            const material = new THREE.MeshStandardMaterial({
                color: 0x6a6a5a,
                roughness: 0.95,
                metalness: 0.1
            });
            
            const block = new THREE.Mesh(geometry, material);
            block.position.set(
                this.position.x + (i - 1) * 3,
                0.75,
                this.position.z - 10
            );
            block.castShadow = true;
            block.receiveShadow = true;
            block.userData.isMovable = true;
            
            this.game.scene.add(block);
            this.blocks.push(block);
        }
    }
    
    isNearby(position) {
        return position.distanceTo(this.position) < 15;
    }
    
    interact(playerRotation) {
        // Player can push blocks
        const player = this.game.player;
        
        for (const block of this.blocks) {
            const distance = player.mesh.position.distanceTo(block.position);
            if (distance < 2.5) {
                // Push block in direction player is facing
                const forward = new THREE.Vector3(0, 0, -1).applyEuler(
                    new THREE.Euler(0, playerRotation.y, 0)
                );
                block.position.add(forward.multiplyScalar(0.2));
            }
        }
    }
    
    update(delta) {
        if (this.isSolved) return;
        
        let activatedCount = 0;
        
        // Check which plates are pressed by blocks
        for (const plate of this.plates) {
            let isPressed = false;
            
            for (const block of this.blocks) {
                const distance = plate.position.distanceTo(block.position);
                if (distance < 1.5) {
                    isPressed = true;
                    break;
                }
            }
            
            if (isPressed && !plate.userData.isActivated) {
                // Activate plate - sink and glow
                plate.position.y = -0.1;
                plate.material.emissiveIntensity = 0.5;
                plate.userData.isActivated = true;
                this.game.particleSystem.createMagicEffect(plate.position, 0x6a9a6a);
            } else if (!isPressed && plate.userData.isActivated) {
                // Deactivate plate
                plate.position.y = 0.1;
                plate.material.emissiveIntensity = 0;
                plate.userData.isActivated = false;
            }
            
            if (plate.userData.isActivated) {
                activatedCount++;
            }
        }
        
        // Check if puzzle is solved
        if (activatedCount === this.requiredPlates && !this.isSolved) {
            this.solve();
        }
    }
    
    solve() {
        this.isSolved = true;
        this.game.uiManager.showMessage('Pressure Puzzle Solved! Underground Chamber unlocked!');
        this.game.zoneManager.unlockZone('underground_chamber');
        this.game.particleSystem.createExplosionEffect(this.position);
    }
}

// Rotation Logic Puzzle - Rotate pillars to align symbols
class RotationPillarPuzzle {
    constructor(game) {
        this.game = game;
        this.isSolved = false;
        this.position = new THREE.Vector3(15, 0, 15);
        this.pillars = [];
        this.correctRotations = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
        
        this.createPuzzle();
    }
    
    createPuzzle() {
        for (let i = 0; i < 4; i++) {
            const group = new THREE.Group();
            
            // Create tall cylindrical stone pillar with high detail
            const pillarGeometry = new THREE.CylinderGeometry(0.5, 0.6, 4, 32);
            
            // Add carved texture and weathering to pillar
            const positions = pillarGeometry.attributes.position.array;
            for (let j = 0; j < positions.length; j += 3) {
                const y = positions[j + 1];
                const angle = Math.atan2(positions[j + 2], positions[j]);
                // Carved rings and wear patterns
                const carving = Math.sin(y * 4) * 0.02 + Math.cos(angle * 8) * 0.015;
                const noise = (Math.random() - 0.5) * 0.03;
                positions[j] += carving + noise;
                positions[j + 2] += carving + noise;
            }
            pillarGeometry.computeVertexNormals();
            
            const pillarMaterial = new THREE.MeshStandardMaterial({
                color: 0x6a6a5a,
                roughness: 0.95,
                metalness: 0.1
            });
            const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
            pillar.position.y = 2;
            pillar.castShadow = true;
            pillar.receiveShadow = true;
            group.add(pillar);
            
            // Add engraved symbol (not a box, but a carved ring shape)
            const symbolGeometry = new THREE.TorusGeometry(0.3, 0.08, 16, 32);
            const symbolMaterial = new THREE.MeshStandardMaterial({
                color: 0x7a8a9a,
                emissive: 0x5a6a7a,
                emissiveIntensity: 0.5,
                roughness: 0.5,
                metalness: 0.5
            });
            const symbol = new THREE.Mesh(symbolGeometry, symbolMaterial);
            symbol.position.set(0, 2.5, 0);
            symbol.rotation.x = Math.PI / 2;
            group.add(symbol);
            
            // Position pillar
            const angle = (i / 4) * Math.PI * 2;
            const radius = 5;
            group.position.set(
                this.position.x + Math.cos(angle) * radius,
                0,
                this.position.z + Math.sin(angle) * radius
            );
            
            // Random initial rotation
            group.rotation.y = Math.random() * Math.PI * 2;
            group.userData.isRotatable = true;
            group.userData.correctRotation = this.correctRotations[i];
            group.userData.pillarIndex = i;
            
            this.game.scene.add(group);
            this.pillars.push(group);
        }
    }
    
    isNearby(position) {
        return position.distanceTo(this.position) < 12;
    }
    
    interact(playerRotation) {
        const player = this.game.player;
        
        // Find closest pillar
        let closestPillar = null;
        let minDistance = Infinity;
        
        for (const pillar of this.pillars) {
            const distance = player.mesh.position.distanceTo(pillar.position);
            if (distance < 3 && distance < minDistance) {
                closestPillar = pillar;
                minDistance = distance;
            }
        }
        
        if (closestPillar) {
            // Rotate pillar by 90 degrees
            closestPillar.rotation.y += Math.PI / 2;
            this.game.particleSystem.createMagicEffect(closestPillar.position, 0x7a8a9a);
        }
    }
    
    update(delta) {
        if (this.isSolved) return;
        
        let correctCount = 0;
        
        for (const pillar of this.pillars) {
            // Normalize rotation
            const normalizedRotation = ((pillar.rotation.y % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
            const correctRotation = pillar.userData.correctRotation;
            
            // Check if rotation is correct (within tolerance)
            const diff = Math.abs(normalizedRotation - correctRotation);
            const isCorrect = diff < 0.2 || diff > (Math.PI * 2 - 0.2);
            
            // Update glow based on correctness
            const symbol = pillar.children[1];
            if (isCorrect) {
                symbol.material.emissiveIntensity = 0.8;
                correctCount++;
            } else {
                symbol.material.emissiveIntensity = 0.3;
            }
        }
        
        if (correctCount === this.pillars.length) {
            this.solve();
        }
    }
    
    solve() {
        this.isSolved = true;
        this.game.uiManager.showMessage('Rotation Puzzle Solved! Ritual Courtyard unlocked!');
        this.game.zoneManager.unlockZone('ritual_courtyard');
        
        for (const pillar of this.pillars) {
            this.game.particleSystem.createExplosionEffect(pillar.position);
        }
    }
}

// Energy Routing Puzzle - Redirect light beams with mirrors
class EnergyRoutingPuzzle {
    constructor(game) {
        this.game = game;
        this.isSolved = false;
        this.position = new THREE.Vector3(20, 0, -20);
        this.crystal = null;
        this.mirrors = [];
        this.target = null;
        
        this.createPuzzle();
    }
    
    createPuzzle() {
        // Create energy source (glowing crystal)
        const crystalGeometry = new THREE.OctahedronGeometry(0.8);
        const crystalMaterial = new THREE.MeshStandardMaterial({
            color: 0xd4a574,
            emissive: 0xd4a574,
            emissiveIntensity: 2.0,
            metalness: 0.9,
            roughness: 0.1
        });
        this.crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
        this.crystal.position.copy(this.position);
        this.crystal.position.y = 1.5;
        
        const light = new THREE.PointLight(0xd4a574, 3, 15);
        this.crystal.add(light);
        
        this.game.scene.add(this.crystal);
        
        // Create rotatable mirrors
        for (let i = 0; i < 2; i++) {
            const mirrorGeometry = new THREE.BoxGeometry(0.1, 2, 2);
            const mirrorMaterial = new THREE.MeshStandardMaterial({
                color: 0x8a9aaa,
                metalness: 0.9,
                roughness: 0.1
            });
            const mirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
            mirror.position.set(
                this.position.x + (i + 1) * 5,
                1,
                this.position.z + (i - 0.5) * 3
            );
            mirror.rotation.y = Math.PI / 4;
            mirror.userData.isRotatable = true;
            mirror.castShadow = true;
            mirror.receiveShadow = true;
            
            this.game.scene.add(mirror);
            this.mirrors.push(mirror);
        }
        
        // Create target (door or bridge to activate)
        const targetGeometry = new THREE.CylinderGeometry(1, 1, 0.3, 16);
        const targetMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a5a5a,
            emissive: 0x3a3a3a,
            emissiveIntensity: 0,
            metalness: 0.5,
            roughness: 0.5
        });
        this.target = new THREE.Mesh(targetGeometry, targetMaterial);
        this.target.position.set(
            this.position.x + 10,
            0.15,
            this.position.z
        );
        this.target.rotation.x = Math.PI / 2;
        this.target.receiveShadow = true;
        
        this.game.scene.add(this.target);
    }
    
    isNearby(position) {
        return position.distanceTo(this.position) < 15;
    }
    
    interact(playerRotation) {
        const player = this.game.player;
        
        // Find closest mirror
        for (const mirror of this.mirrors) {
            const distance = player.mesh.position.distanceTo(mirror.position);
            if (distance < 3) {
                // Rotate mirror by 45 degrees
                mirror.rotation.y += Math.PI / 4;
                this.game.particleSystem.createMagicEffect(mirror.position, 0x8a9aaa);
                break;
            }
        }
    }
    
    update(delta) {
        if (this.isSolved) return;
        
        // Simplified beam simulation - check if mirrors are approximately aligned
        // In a full implementation, this would ray trace the light beam
        const mirror1Aligned = Math.abs(Math.cos(this.mirrors[0].rotation.y)) < 0.3;
        const mirror2Aligned = Math.abs(Math.sin(this.mirrors[1].rotation.y)) < 0.3;
        
        if (mirror1Aligned && mirror2Aligned) {
            // Light reaches target
            this.target.material.emissiveIntensity = 1.0;
            this.target.material.emissive.setHex(0xd4a574);
            
            if (!this.isSolved) {
                this.solve();
            }
        } else {
            this.target.material.emissiveIntensity = 0;
        }
    }
    
    solve() {
        this.isSolved = true;
        this.game.uiManager.showMessage('Energy Routing Puzzle Solved!');
        this.game.player.addToInventory('crystal');
        this.game.particleSystem.createExplosionEffect(this.target.position);
    }
}

// Sequence Logic Puzzle - Pull levers in correct order
class SequenceLeverPuzzle {
    constructor(game) {
        this.game = game;
        this.isSolved = false;
        this.position = new THREE.Vector3(-20, 0, 20);
        this.levers = [];
        this.correctSequence = [0, 2, 1, 3];
        this.currentSequence = [];
        
        this.createPuzzle();
    }
    
    createPuzzle() {
        for (let i = 0; i < 4; i++) {
            const group = new THREE.Group();
            
            // Lever base
            const baseGeometry = new THREE.BoxGeometry(0.5, 1, 0.5);
            const baseMaterial = new THREE.MeshStandardMaterial({
                color: 0x5a5a4a,
                roughness: 0.9,
                metalness: 0.2
            });
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            base.position.y = 0.5;
            base.castShadow = true;
            base.receiveShadow = true;
            group.add(base);
            
            // Lever handle
            const handleGeometry = new THREE.BoxGeometry(0.2, 1.5, 0.2);
            const handleMaterial = new THREE.MeshStandardMaterial({
                color: 0x7a6a5a,
                roughness: 0.85,
                metalness: 0.3
            });
            const handle = new THREE.Mesh(handleGeometry, handleMaterial);
            handle.position.y = 1.5;
            handle.rotation.z = -Math.PI / 6;
            handle.castShadow = true;
            group.add(handle);
            
            group.position.set(
                this.position.x + (i - 1.5) * 3,
                0,
                this.position.z
            );
            group.userData.leverIndex = i;
            group.userData.isPulled = false;
            group.userData.handle = handle;
            
            this.game.scene.add(group);
            this.levers.push(group);
        }
    }
    
    isNearby(position) {
        return position.distanceTo(this.position) < 10;
    }
    
    interact(playerRotation) {
        const player = this.game.player;
        
        // Find closest lever
        for (const lever of this.levers) {
            const distance = player.mesh.position.distanceTo(lever.position);
            if (distance < 2.5 && !lever.userData.isPulled) {
                this.pullLever(lever);
                break;
            }
        }
    }
    
    pullLever(lever) {
        lever.userData.isPulled = true;
        lever.userData.handle.rotation.z = Math.PI / 6;
        this.currentSequence.push(lever.userData.leverIndex);
        
        this.game.particleSystem.createMagicEffect(lever.position, 0x7a8a7a);
        
        // Check if sequence is correct so far
        const isCorrect = this.currentSequence.every((val, idx) => 
            val === this.correctSequence[idx]
        );
        
        if (!isCorrect) {
            // Wrong sequence - reset with animation
            this.game.uiManager.showMessage('Wrong order! Resetting...');
            this.game.particleSystem.createHitEffect(lever.position);
            
            setTimeout(() => {
                this.resetLevers();
            }, 1000);
        } else if (this.currentSequence.length === this.correctSequence.length) {
            // Correct sequence completed
            this.solve();
        }
    }
    
    resetLevers() {
        for (const lever of this.levers) {
            lever.userData.isPulled = false;
            lever.userData.handle.rotation.z = -Math.PI / 6;
        }
        this.currentSequence = [];
    }
    
    update(delta) {
        // Lever animation could go here
    }
    
    solve() {
        this.isSolved = true;
        this.game.uiManager.showMessage('Sequence Puzzle Solved!');
        this.game.player.addToInventory('stone');
        this.game.player.addToInventory('crystal');
        
        for (const lever of this.levers) {
            this.game.particleSystem.createExplosionEffect(lever.position);
        }
    }
}
