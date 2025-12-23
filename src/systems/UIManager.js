export class UIManager {
    constructor(game) {
        this.game = game;
        this.healthFill = document.getElementById('health-fill');
        this.staminaFill = document.getElementById('stamina-fill');
        this.inventorySlots = document.getElementById('inventory-slots');
        this.zoneIndicator = document.getElementById('current-zone');
        this.questText = document.getElementById('quest-text');
        this.messagePanel = document.getElementById('message-panel');
        this.uiOverlay = document.getElementById('ui-overlay');
        
        // Combat state for HUD fading
        this.inCombat = false;
        this.combatTimer = 0;
        
        this.initializeInventorySlots();
    }
    
    initializeInventorySlots() {
        // Create 9 inventory slots
        for (let i = 0; i < 9; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            slot.textContent = '';
            this.inventorySlots.appendChild(slot);
        }
    }
    
    updateHealth(current, max) {
        const percentage = (current / max) * 100;
        this.healthFill.style.width = percentage + '%';
    }
    
    updateStamina(current, max) {
        const percentage = (current / max) * 100;
        this.staminaFill.style.width = percentage + '%';
    }
    
    setInCombat(inCombat) {
        this.inCombat = inCombat;
        if (inCombat) {
            this.combatTimer = 5; // Fade after 5 seconds
            this.uiOverlay.classList.remove('faded');
        }
    }
    
    updateCombatState(delta) {
        if (this.inCombat && this.combatTimer > 0) {
            this.combatTimer -= delta;
            if (this.combatTimer <= 0) {
                this.uiOverlay.classList.add('faded');
            }
        }
    }
    
    updateInventory(items) {
        const slots = this.inventorySlots.children;
        
        // Clear all slots
        for (let i = 0; i < slots.length; i++) {
            slots[i].textContent = '';
            slots[i].classList.remove('has-item');
        }
        
        // Fill with items
        items.forEach((item, index) => {
            if (index < slots.length) {
                slots[index].textContent = item;
                slots[index].classList.add('has-item');
            }
        });
    }
    
    updateZoneIndicator(zoneName) {
        const zoneNames = {
            forest_ruins: 'Forest Ruins',
            underground_chamber: 'Underground Chamber',
            ritual_courtyard: 'Ritual Courtyard'
        };
        this.zoneIndicator.textContent = zoneNames[zoneName] || zoneName;
    }
    
    updateQuest(questText) {
        this.questText.textContent = questText;
    }
    
    showMessage(text, duration = 3000) {
        const message = document.createElement('div');
        message.className = 'game-message';
        message.textContent = text;
        this.messagePanel.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, duration);
    }
}
