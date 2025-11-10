// Global Clock for Delta Time
const clock = new THREE.Clock(); 

// --- 2. Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta(); 
    
    controls.update(); 
    updatePlayerMovement(delta); // მოძრაობის ლოგიკა logic.js-დან

    renderer.render(scene, camera);
}

// --- 3. Start the application ---
initScene(); // სცენის ინიციალიზაცია setup.js-დან
animate();