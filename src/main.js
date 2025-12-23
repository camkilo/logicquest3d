import * as THREE from 'three';
import { Game } from './core/Game.js';

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const game = new Game(canvas);
    
    // Start the game
    game.init();
    game.start();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        game.onWindowResize();
    });
    
    // Pointer lock for mouse control
    canvas.addEventListener('click', () => {
        canvas.requestPointerLock();
    });
    
    // Make game accessible for debugging
    window.game = game;
});
