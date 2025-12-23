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
        
        // Crafting recipes: [ingredient1, ingredient2, (optional)ingredient3] -> result
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
        this.craftingPanel.classList.toggle('hidden');
        
        // Lock/unlock pointer
        if (!this.craftingPanel.classList.contains('hidden')) {
            document.exitPointerLock();
        }
    }
    
    attemptCraft() {
        // Filter out empty slots
        const items = this.selectedItems.filter(item => item !== null && item !== undefined);
        
        if (items.length < 2) {
            this.game.uiManager.showMessage('Need at least 2 items to craft!');
            return;
        }
        
        // Create recipe key by sorting items
        const recipeKey = items.sort().join(',');
        
        if (this.recipes[recipeKey]) {
            const result = this.recipes[recipeKey];
            
            // Clear crafting slots
            this.selectedItems = [];
            this.craftSlots.forEach(slot => {
                slot.textContent = 'Empty';
                slot.classList.remove('filled');
            });
            
            // Add result to inventory
            if (this.game.player.addToInventory(result)) {
                this.game.uiManager.showMessage(`Crafted ${result}!`);
                this.game.particleSystem.createMagicEffect(
                    this.game.player.mesh.position.clone()
                );
                
                // Apply item effects
                this.applyItemEffects(result);
            } else {
                this.game.uiManager.showMessage('Inventory full!');
            }
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
