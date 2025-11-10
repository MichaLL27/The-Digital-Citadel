// Global variables for Logic
const playerSpeed = 5; 
const keys = {}; 
let currentInteraction = null;

// --- Update Player Movement and Interaction ---
function updatePlayerMovement(delta) { 
    // შემოწმება, რომ ყველა ობიექტი ჩატვირთულია setup.js-დან
    if (!playerAvatar || !citadelModel) return;

    const prevPosition = playerAvatar.position.clone(); 
    const actualSpeed = playerSpeed * delta;
    
    const direction = new THREE.Vector3();
    let moved = false;
    
    // Z-Axis (წინ/უკან)
    if (keys['w'] || keys['arrowup']) {
        playerAvatar.position.z -= actualSpeed;
        direction.z = -1;
        moved = true;
    }
    if (keys['s'] || keys['arrowdown']) {
        playerAvatar.position.z += actualSpeed; 
        direction.z = 1;
        moved = true;
    }

    // X-Axis (მარცხნივ/მარჯვნივ)
    if (keys['a'] || keys['arrowleft']) {
        playerAvatar.position.x -= actualSpeed;
        direction.x = -1;
        moved = true;
    }
    if (keys['d'] || keys['arrowright']) {
        playerAvatar.position.x += actualSpeed; 
        direction.x = 1;
        moved = true;
    }

    // 💡 პერსონაჟის შემობრუნება (Rotation Logic)
    if (moved) {
        const angle = Math.atan2(direction.x, direction.z); 
        playerAvatar.rotation.y = angle;
    }
    
    // Y-position fix (დაბლა ჩავარდნის პრევენცია)
    playerAvatar.position.y = PLAYER_Y_OFFSET; 

    // --- ლოგიკა ინტერაქციული ზონებისთვის ---
    currentInteraction = null;
    let interactionFound = false;

    interactiveZones.forEach(zone => {
        const zoneBox = new THREE.Box3().setFromCenterAndSize(
            zone.position,
            zone.size
        );
        const playerBox = new THREE.Box3().setFromCenterAndSize(
            playerAvatar.position,
            new THREE.Vector3(1, 1, 1) 
        );

        if (playerBox.intersectsBox(zoneBox)) {
            currentInteraction = zone;
            interactionText.innerHTML = zone.message;
            interactionFound = true;
        }
    });

    if (!interactionFound) {
        interactionText.innerHTML = "Use W, A, S, D to explore the Citadel and find your projects!";
    }
    
    // Outer Bounds Collision
    if (playerAvatar.position.x > 45 || playerAvatar.position.x < -45 || 
        playerAvatar.position.z > 45 || playerAvatar.position.z < -45) {
        
        playerAvatar.position.copy(prevPosition);
    }
}

// --- Event Handlers for Movement and Interaction ---
window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    keys[key] = true;
    
    // Enter-ზე დაჭერის ლოგიკა
    if (key === 'enter' && currentInteraction && currentInteraction.link) {
        window.open(currentInteraction.link, '_blank');
        event.preventDefault();
    }
});

window.addEventListener('keyup', (event) => {
    keys[event.key.toLowerCase()] = false;
});