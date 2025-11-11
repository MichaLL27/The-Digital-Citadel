// Global Clock for Delta Time
const clock = new THREE.Clock(); 

// --- 2. Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta(); 
    
    // controls.update(); - აღარ გვჭირდება, რადგან OrbitControls გამორთულია
    updatePlayerMovement(delta); 

    renderer.render(scene, camera);
}

// --- 3. Start the application ---
initScene(); 
animate();