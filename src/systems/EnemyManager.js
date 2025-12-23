import { Enemy } from '../entities/Enemy.js';
import * as THREE from 'three';

export class EnemyManager {
    constructor(game) {
        this.game = game;
        this.enemies = [];
    }
    
    spawnEnemy(position, type = 'basic') {
        const enemy = new Enemy(this.game, position, type);
        this.enemies.push(enemy);
        return enemy;
    }
    
    spawnEnemiesInZone(zoneName, count = 3) {
        // Clear existing enemies
        this.clearEnemies();
        
        // Determine enemy types for the zone
        let enemyTypes = ['fast_melee', 'ranged_magic', 'slow_heavy'];
        
        // Spawn new enemies based on zone with variety
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const radius = 15 + Math.random() * 10;
            const position = new THREE.Vector3(
                Math.cos(angle) * radius,
                1,
                Math.sin(angle) * radius
            );
            
            // Select enemy type in rotation to ensure variety
            const type = enemyTypes[i % enemyTypes.length];
            this.spawnEnemy(position, type);
        }
    }
    
    update(delta) {
        // Update all enemies
        for (const enemy of this.enemies) {
            enemy.update(delta);
        }
        
        // Remove dead enemies
        this.enemies = this.enemies.filter(enemy => !enemy.isDead || 
            this.game.scene.children.includes(enemy.mesh));
    }
    
    clearEnemies() {
        for (const enemy of this.enemies) {
            if (enemy.mesh) {
                this.game.scene.remove(enemy.mesh);
            }
        }
        this.enemies = [];
    }
}
