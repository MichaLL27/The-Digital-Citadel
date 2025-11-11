// Global Clock for Delta Time
const clock = new THREE.Clock(); 

// 🗺️ Mini Map Setup
let minimapCanvas, minimapCtx;

function initMinimap() {
    minimapCanvas = document.getElementById('minimap-canvas');
    if (minimapCanvas) {
        minimapCanvas.width = 150;
        minimapCanvas.height = 150;
        minimapCtx = minimapCanvas.getContext('2d');
    }
}

function drawMinimap() {
    if (!minimapCtx || !playerAvatar) return;
    
    const ctx = minimapCtx;
    const scale = 1.5; // მასშტაბი
    const centerX = 75;
    const centerY = 75;
    
    // გასუფთავება
    ctx.fillStyle = 'rgba(10, 10, 30, 0.9)';
    ctx.fillRect(0, 0, 150, 150);
    
    // სასახლის დახატვა (ცენტრში)
    ctx.fillStyle = '#9B59B6';
    ctx.fillRect(centerX - 5, centerY - 5, 10, 10);
    
    // ზონების დახატვა
    interactiveZones.forEach(zone => {
        const x = centerX + (zone.position.x - playerAvatar.position.x) * scale;
        const y = centerY + (zone.position.z - playerAvatar.position.z) * scale;
        
        if (zone.visited) {
            ctx.fillStyle = '#555'; // მონახულებული
        } else {
            ctx.fillStyle = '#' + zone.color.toString(16).padStart(6, '0');
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#' + zone.color.toString(16).padStart(6, '0');
        }
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    });
    
    // პლეიერის დახატვა (ყოველთვის ცენტრში)
    ctx.fillStyle = '#FFD700';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#FFD700';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // მიმართულების ინდიკატორი
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    const angle = Math.atan2(
        Math.sin(playerAvatar.rotation.y), 
        Math.cos(playerAvatar.rotation.y)
    );
    ctx.lineTo(
        centerX + Math.sin(angle) * 10,
        centerY + Math.cos(angle) * 10
    );
    ctx.stroke();
}

// --- 2. Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta(); 
    const elapsedTime = clock.getElapsedTime();
    
    // ✨ ანიმაცია ინტერაქტიულ ზონებს (კრისტალების ბრუნვა და ტრიალება)
    scene.children.forEach(child => {
        if (child.name === "interactiveZone") {
            child.rotation.y += delta * 0.5; // Y-ღერძზე ბრუნვა
            child.rotation.x = Math.sin(elapsedTime) * 0.2; // X-ზე რყევა
            child.position.y = 3 + Math.sin(elapsedTime * 2) * 0.5; // ტრიალება ზევით-ქვევით
            
            // ✨ პულსაცია (scale animation)
            const pulsate = 1 + Math.sin(elapsedTime * 3) * 0.1;
            child.scale.set(pulsate, pulsate, pulsate);
            
            // 🌟 emissive intensity ანიმაცია
            if (child.material && child.material.emissiveIntensity !== undefined) {
                child.material.emissiveIntensity = 0.5 + Math.sin(elapsedTime * 4) * 0.3;
            }
        }
        
        // 🎆 ფაიერვორქის პარტიკლების ანიმაცია
        if (child.name === 'firework') {
            child.position.add(child.velocity.clone().multiplyScalar(delta));
            child.velocity.y -= 9.8 * delta; // გრავიტაცია
            
            child.userData.lifetime -= delta;
            
            // გამჭვირვალობა და ზომა შემცირდება დროთა განმავლობაში
            const lifetimeRatio = child.userData.lifetime / child.userData.initialLifetime;
            child.material.opacity = lifetimeRatio;
            child.material.transparent = true;
            child.scale.setScalar(lifetimeRatio);
            
            // ბრწყინვა (emissive)
            if (child.material.emissive) {
                child.material.emissive = child.material.color;
                child.material.emissiveIntensity = lifetimeRatio * 2;
            }
            
            // წაშალე თუ lifetime ამოიწურა
            if (child.userData.lifetime <= 0) {
                scene.remove(child);
                child.geometry.dispose();
                child.material.dispose();
            }
        }
    });
    
    updatePlayerMovement(delta); 
    drawMinimap(); // 🗺️ მინი-მაპის განახლება

    renderer.render(scene, camera);
}

// --- 3. Start the application ---
initMinimap(); // 🗺️ ინიციალიზაცია
initScene(); 
animate();