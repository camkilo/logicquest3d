export class InputManager {
    constructor() {
        this.keys = {};
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    getInput() {
        return {
            forward: this.keys['w'] || false,
            backward: this.keys['s'] || false,
            left: this.keys['a'] || false,
            right: this.keys['d'] || false,
            jump: this.keys[' '] || false,
            sprint: this.keys['shift'] || false,
            interact: this.keys['e'] || false,
            craft: this.keys['c'] || false
        };
    }
    
    isKeyPressed(key) {
        return this.keys[key.toLowerCase()] || false;
    }
}
