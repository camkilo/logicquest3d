import * as THREE from 'three';

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particleGroups = [];
    }
    
    update(delta) {
        // Update all particle groups
        for (let i = this.particleGroups.length - 1; i >= 0; i--) {
            const group = this.particleGroups[i];
            group.lifetime -= delta;
            
            if (group.lifetime <= 0) {
                this.scene.remove(group.particles);
                this.particleGroups.splice(i, 1);
            } else {
                group.update(delta);
            }
        }
    }
    
    createAttackEffect(position) {
        const particles = this.createParticles({
            count: 20,
            color: 0xffff00,
            size: 0.2,
            spread: 1,
            velocity: 3,
            lifetime: 0.5
        });
        
        particles.position.copy(position);
        this.scene.add(particles);
        
        this.particleGroups.push({
            particles: particles,
            lifetime: 0.5,
            update: (delta) => {
                particles.position.y += delta * 2;
                particles.material.opacity = this.particleGroups.find(g => g.particles === particles)?.lifetime || 0;
            }
        });
    }
    
    createHitEffect(position) {
        const particles = this.createParticles({
            count: 15,
            color: 0xff0000,
            size: 0.15,
            spread: 0.5,
            velocity: 2,
            lifetime: 0.3
        });
        
        particles.position.copy(position);
        this.scene.add(particles);
        
        const velocities = [];
        for (let i = 0; i < 15; i++) {
            velocities.push(new THREE.Vector3(
                (Math.random() - 0.5) * 4,
                Math.random() * 3,
                (Math.random() - 0.5) * 4
            ));
        }
        
        this.particleGroups.push({
            particles: particles,
            lifetime: 0.3,
            velocities: velocities,
            update: (delta) => {
                const positions = particles.geometry.attributes.position.array;
                for (let i = 0; i < velocities.length; i++) {
                    positions[i * 3] += velocities[i].x * delta;
                    positions[i * 3 + 1] += velocities[i].y * delta;
                    positions[i * 3 + 2] += velocities[i].z * delta;
                    velocities[i].y -= 9.8 * delta; // gravity
                }
                particles.geometry.attributes.position.needsUpdate = true;
                particles.material.opacity = this.particleGroups.find(g => g.particles === particles)?.lifetime || 0;
            }
        });
    }
    
    createExplosionEffect(position) {
        const particles = this.createParticles({
            count: 50,
            color: 0xff6600,
            size: 0.3,
            spread: 2,
            velocity: 5,
            lifetime: 1.0
        });
        
        particles.position.copy(position);
        this.scene.add(particles);
        
        const velocities = [];
        for (let i = 0; i < 50; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const speed = 3 + Math.random() * 5;
            
            velocities.push(new THREE.Vector3(
                Math.sin(phi) * Math.cos(theta) * speed,
                Math.sin(phi) * Math.sin(theta) * speed,
                Math.cos(phi) * speed
            ));
        }
        
        this.particleGroups.push({
            particles: particles,
            lifetime: 1.0,
            velocities: velocities,
            update: (delta) => {
                const positions = particles.geometry.attributes.position.array;
                for (let i = 0; i < velocities.length; i++) {
                    positions[i * 3] += velocities[i].x * delta;
                    positions[i * 3 + 1] += velocities[i].y * delta;
                    positions[i * 3 + 2] += velocities[i].z * delta;
                }
                particles.geometry.attributes.position.needsUpdate = true;
                const lifetimeRatio = this.particleGroups.find(g => g.particles === particles)?.lifetime || 0;
                particles.material.opacity = lifetimeRatio;
                particles.material.size = 0.3 * (1 + (1 - lifetimeRatio));
            }
        });
    }
    
    createCollectEffect(position) {
        const particles = this.createParticles({
            count: 30,
            color: 0x00ff00,
            size: 0.2,
            spread: 1,
            velocity: 2,
            lifetime: 1.0
        });
        
        particles.position.copy(position);
        this.scene.add(particles);
        
        this.particleGroups.push({
            particles: particles,
            lifetime: 1.0,
            startY: position.y,
            update: (delta) => {
                particles.position.y += delta * 3;
                particles.rotation.y += delta * 2;
                const lifetimeRatio = this.particleGroups.find(g => g.particles === particles)?.lifetime || 0;
                particles.material.opacity = lifetimeRatio;
            }
        });
    }
    
    createMagicEffect(position, color = 0x00ffff) {
        const particles = this.createParticles({
            count: 40,
            color: color,
            size: 0.15,
            spread: 2,
            velocity: 1,
            lifetime: 2.0
        });
        
        particles.position.copy(position);
        this.scene.add(particles);
        
        const time = { value: 0 };
        this.particleGroups.push({
            particles: particles,
            lifetime: 2.0,
            time: time,
            basePosition: position.clone(),
            update: (delta) => {
                time.value += delta;
                const positions = particles.geometry.attributes.position.array;
                
                for (let i = 0; i < 40; i++) {
                    const angle = (i / 40) * Math.PI * 2 + time.value * 2;
                    const radius = 1 + Math.sin(time.value * 3 + i) * 0.5;
                    const height = Math.sin(time.value * 2 + i * 0.1) * 2;
                    
                    positions[i * 3] = Math.cos(angle) * radius;
                    positions[i * 3 + 1] = height;
                    positions[i * 3 + 2] = Math.sin(angle) * radius;
                }
                
                particles.geometry.attributes.position.needsUpdate = true;
                const lifetimeRatio = this.particleGroups.find(g => g.particles === particles)?.lifetime / 2.0 || 0;
                particles.material.opacity = Math.min(1, lifetimeRatio * 2);
            }
        });
    }
    
    createParticles(config) {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        
        for (let i = 0; i < config.count; i++) {
            positions.push(
                (Math.random() - 0.5) * config.spread,
                (Math.random() - 0.5) * config.spread,
                (Math.random() - 0.5) * config.spread
            );
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: config.color,
            size: config.size,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        return new THREE.Points(geometry, material);
    }
    
    createAmbientParticles(zone) {
        // Create floating ambient particles for atmosphere
        const particleCount = 100;
        const color = zone === 'forest' ? 0x88ff88 : zone === 'cave' ? 0x8888ff : 0xffaa00;
        
        const particles = this.createParticles({
            count: particleCount,
            color: color,
            size: 0.1,
            spread: 50,
            velocity: 0,
            lifetime: Infinity
        });
        
        const velocities = [];
        for (let i = 0; i < particleCount; i++) {
            velocities.push(new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                Math.random() * 0.3,
                (Math.random() - 0.5) * 0.5
            ));
        }
        
        this.scene.add(particles);
        
        this.particleGroups.push({
            particles: particles,
            lifetime: Infinity,
            velocities: velocities,
            update: (delta) => {
                const positions = particles.geometry.attributes.position.array;
                for (let i = 0; i < velocities.length; i++) {
                    positions[i * 3] += velocities[i].x * delta;
                    positions[i * 3 + 1] += velocities[i].y * delta;
                    positions[i * 3 + 2] += velocities[i].z * delta;
                    
                    // Wrap around
                    if (positions[i * 3 + 1] > 20) positions[i * 3 + 1] = 0;
                    if (Math.abs(positions[i * 3]) > 50) positions[i * 3] *= -1;
                    if (Math.abs(positions[i * 3 + 2]) > 50) positions[i * 3 + 2] *= -1;
                }
                particles.geometry.attributes.position.needsUpdate = true;
            }
        });
        
        return particles;
    }
}
