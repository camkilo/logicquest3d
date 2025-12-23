export class UIManager {
    constructor(game) {
        this.game = game;
        this.healthFill = document.getElementById('health-fill');
        this.inventorySlots = document.getElementById('inventory-slots');
        this.zoneIndicator = document.getElementById('current-zone');
        this.questText = document.getElementById('quest-text');
        this.messagePanel = document.getElementById('message-panel');
        
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
            forest: 'Forest Zone',
            cave: 'Dark Cave',
            ruins: 'Ancient Ruins'
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
