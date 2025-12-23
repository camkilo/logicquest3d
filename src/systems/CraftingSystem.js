import * as THREE from 'three';

export class CraftingSystem {
    constructor(game) {
        this.game = game;
        this.craftingPanel = document.getElementById('crafting-panel');
        this.craftButton = document.getElementById('craft-button');
        this.closeButton = document.getElementById('close-craft');
        this.craftSlots = [
            document.getElementById('craft-slot-1'),
            document.getElementById('craft-slot-2'),
            document.getElementById('craft-slot-3')
        ];
        
        this.selectedItems = [];
        this.craftingStations = []; // Anvils and altars
        this.nearCraftingStation = false;
        
        // Simplified crafting recipes: 2-3 items only
        this.recipes = {
            'wood,wood': 'wooden_sword',
            'wood,stone': 'stone_sword',
            'stone,stone': 'stone_armor',
            'crystal,crystal': 'magic_staff',
            'wood,crystal': 'magic_bow',
            'stone,crystal': 'crystal_armor',
            'wood,wood,wood': 'wooden_shield',
            'stone,stone,stone': 'healing_potion'
        };
        
        this.setupEventListeners();
        this.createCraftingStations();
    }
    
    createCraftingStations() {
        // Create anvil in Forest Ruins
        const anvil = this.createAnvil(new THREE.Vector3(8, 0, -8));
        this.craftingStations.push(anvil);
        
        // Create altar in Underground Chamber  
        const altar = this.createAltar(new THREE.Vector3(-10, 0, -10));
        this.craftingStations.push(altar);
        
        // Create altar in Ritual Courtyard
        const altar2 = this.createAltar(new THREE.Vector3(12, 0, 12));
        this.craftingStations.push(altar2);
    }
    
    createAnvil(position) {
        const group = new THREE.Group();
        
        // Anvil base
        const baseGeometry = new THREE.BoxGeometry(1, 0.5, 1);
        const metalMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a5a5a,
            metalness: 0.8,
            roughness: 0.6
        });
        const base = new THREE.Mesh(baseGeometry, metalMaterial);
        base.position.y = 0.25;
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);
        
        // Anvil top
        const topGeometry = new THREE.CylinderGeometry(0.4, 0.6, 0.4, 8);
        const top = new THREE.Mesh(topGeometry, metalMaterial);
        top.position.y = 0.7;
        top.rotation.y = Math.PI / 8;
        top.castShadow = true;
        top.receiveShadow = true;
        group.add(top);
        
        group.position.copy(position);
        group.userData.isCraftingStation = true;
        
        this.game.scene.add(group);
        return group;
    }
    
    createAltar(position) {
        const group = new THREE.Group();
        
        // Altar platform
        const platformGeometry = new THREE.CylinderGeometry(1.5, 1.8, 0.5, 8);
        const stoneMaterial = new THREE.MeshStandardMaterial({
            color: 0x6a6a5a,
            roughness: 0.9,
            metalness: 0.1
        });
        const platform = new THREE.Mesh(platformGeometry, stoneMaterial);
        platform.position.y = 0.25;
        platform.castShadow = true;
        platform.receiveShadow = true;
        group.add(platform);
        
        // Altar surface with glow
        const surfaceGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.2, 8);
        const glowMaterial = new THREE.MeshStandardMaterial({
            color: 0x8a7a6a,
            emissive: 0x6a5a4a,
            emissiveIntensity: 0.5,
            roughness: 0.7,
            metalness: 0.3
        });
        const surface = new THREE.Mesh(surfaceGeometry, glowMaterial);
        surface.position.y = 0.6;
        surface.castShadow = true;
        surface.receiveShadow = true;
        group.add(surface);
        
        group.position.copy(position);
        group.userData.isCraftingStation = true;
        
        this.game.scene.add(group);
        return group;
    }
    
    update(delta) {
        // Check if player is near any crafting station
        this.nearCraftingStation = false;
        
        for (const station of this.craftingStations) {
            const distance = this.game.player.mesh.position.distanceTo(station.position);
            if (distance < 3) {
                this.nearCraftingStation = true;
                
                // Show hint
                if (this.craftingPanel.classList.contains('hidden')) {
                    this.game.uiManager.showMessage('Press C to craft at station');
                }
                break;
            }
        }
    }
    
    setupEventListeners() {
        this.closeButton.addEventListener('click', () => {
            this.toggleCraftingPanel();
        });
        
        this.craftButton.addEventListener('click', () => {
            this.attemptCraft();
        });
        
        // Click slots to add/remove items
        this.craftSlots.forEach((slot, index) => {
            slot.addEventListener('click', () => {
                if (this.selectedItems[index]) {
                    // Remove item from slot and return to inventory
                    const item = this.selectedItems[index];
                    this.game.player.addToInventory(item);
                    this.selectedItems[index] = null;
                    slot.textContent = 'Empty';
                    slot.classList.remove('filled');
                } else {
                    // Try to add item from inventory
                    this.tryAddItemToSlot(index);
                }
            });
        });
    }
    
    tryAddItemToSlot(slotIndex) {
        const inventory = this.game.player.inventory;
        if (inventory.length > 0) {
            const item = inventory[0]; // Take first item
            if (this.game.player.removeFromInventory(item)) {
                this.selectedItems[slotIndex] = item;
                this.craftSlots[slotIndex].textContent = item;
                this.craftSlots[slotIndex].classList.add('filled');
            }
        }
    }
    
    toggleCraftingPanel() {
        // Only allow opening crafting panel near a station
        if (this.craftingPanel.classList.contains('hidden') && !this.nearCraftingStation) {
            this.game.uiManager.showMessage('Must be near an anvil or altar to craft!');
            return;
        }
        
        this.craftingPanel.classList.toggle('hidden');
        
        // Lock/unlock pointer
        if (!this.craftingPanel.classList.contains('hidden')) {
            document.exitPointerLock();
        }
    }
    
    attemptCraft() {
        // Filter out empty slots - only allow 2-3 items
        const items = this.selectedItems.filter(item => item !== null && item !== undefined);
        
        if (items.length < 2) {
            this.game.uiManager.showMessage('Need 2-3 items to craft!');
            return;
        }
        
        if (items.length > 3) {
            this.game.uiManager.showMessage('Can only combine 2-3 items!');
            return;
        }
        
        // Create recipe key by sorting items
        const recipeKey = items.sort().join(',');
        
        if (this.recipes[recipeKey]) {
            const result = this.recipes[recipeKey];
            
            // Short crafting animation
            this.game.uiManager.showMessage('Crafting...');
            this.craftButton.disabled = true;
            
            setTimeout(() => {
                // Clear crafting slots
                this.selectedItems = [];
                this.craftSlots.forEach(slot => {
                    slot.textContent = 'Empty';
                    slot.classList.remove('filled');
                });
                
                // Add result to inventory
                if (this.game.player.addToInventory(result)) {
                    this.game.uiManager.showMessage(`Crafted ${result}!`);
                    
                    // Visual effect at crafting station
                    const nearestStation = this.findNearestCraftingStation();
                    if (nearestStation) {
                        this.game.particleSystem.createMagicEffect(
                            nearestStation.position.clone().add(new THREE.Vector3(0, 1, 0)),
                            0x8a7a6a
                        );
                    }
                    
                    // Apply item effects
                    this.applyItemEffects(result);
                } else {
                    this.game.uiManager.showMessage('Inventory full!');
                }
                
                this.craftButton.disabled = false;
            }, 1500); // 1.5 second animation
        } else {
            this.game.uiManager.showMessage('Invalid recipe!');
            
            // Return items to inventory
            items.forEach(item => {
                this.game.player.addToInventory(item);
            });
            
            this.selectedItems = [];
            this.craftSlots.forEach(slot => {
                slot.textContent = 'Empty';
                slot.classList.remove('filled');
            });
        }
    }
    
    findNearestCraftingStation() {
        let nearestStation = null;
        let minDistance = Infinity;
        
        for (const station of this.craftingStations) {
            const distance = this.game.player.mesh.position.distanceTo(station.position);
            if (distance < minDistance) {
                minDistance = distance;
                nearestStation = station;
            }
        }
        
        return nearestStation;
    }
    
    applyItemEffects(item) {
        // Apply effects based on crafted item
        if (item.includes('sword') || item.includes('staff') || item.includes('bow')) {
            this.game.uiManager.showMessage('Attack power increased!');
        } else if (item.includes('armor')) {
            this.game.uiManager.showMessage('Defense increased!');
        } else if (item.includes('potion')) {
            this.game.player.heal(50);
            this.game.uiManager.showMessage('Health restored!');
        }
    }
}
