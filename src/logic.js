// Global variables for Logic
const playerSpeed = 5; 
const keys = {}; 
let currentInteraction = null;

// --- Update Camera Position ---
function updateCamera() {
    if (!playerAvatar) return;

    // კამერის ოფსეტი (ახლოდან ხედვა)
    const offset = new THREE.Vector3(0, 5, 10); 
    
    // ვბრუნავთ ოფსეტს პერსონაჟის როტაციის შესაბამისად
    offset.applyQuaternion(playerAvatar.quaternion);
    
    const idealPosition = playerAvatar.position.clone().add(offset);

    // პოზიციის გლუვი ცვლილება (Lerp)
    camera.position.lerp(idealPosition, 0.1); 

    // კამერა ყოველთვის უყურებს პერსონაჟის თავს
    const lookAtPosition = playerAvatar.position.clone().add(new THREE.Vector3(0, 2, 0));
    camera.lookAt(lookAtPosition);

    // სინათლე პერსონაჟს მიჰყვება
    if (playerLight) {
        playerLight.position.copy(playerAvatar.position).add(new THREE.Vector3(0, 5, 0));
    }
}

// --- Update Player Movement and Interaction ---
// src/logic.js - განახლებული updatePlayerMovement

function updatePlayerMovement(delta) { 
    if (!playerAvatar || !citadelModel) return;

    const prevPosition = playerAvatar.position.clone(); 
    const actualSpeed = playerSpeed * delta;
    
    let moved = false;
    
    // --- 1. კამერის მიმართულების ვექტორები (საჭიროა მხოლოდ როტაციისთვის) ---
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward); 
    forward.y = 0; 
    forward.normalize();
    
    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize(); 

    const moveDirection = new THREE.Vector3(0, 0, 0); // ვექტორი, რომელიც განსაზღვრავს მიმართულებას

    // --- 2. ლოკალური მოძრაობის ლოგიკა ---
    if (keys['w'] || keys['arrowup']) {
        // 💡 წინ მოძრაობა ლოკალური Z-ღერძით (ეს ითვალისწინებს ავატარის როტაციას)
        playerAvatar.translateZ(-actualSpeed); 
        moveDirection.add(forward);
        moved = true;
    }
    if (keys['s'] || keys['arrowdown']) {
        // 💡 უკან მოძრაობა ლოკალური Z-ღერძით
        playerAvatar.translateZ(actualSpeed);
        moveDirection.sub(forward);
        moved = true;
    }
    if (keys['a'] || keys['arrowleft']) {
        // 💡 მარცხნივ მოძრაობა ლოკალური X-ღერძით
        playerAvatar.translateX(-actualSpeed); 
        moveDirection.sub(right);
        moved = true;
    }
    if (keys['d'] || keys['arrowright']) {
        // 💡 მარჯვნივ მოძრაობა ლოკალური X-ღერძით
        playerAvatar.translateX(actualSpeed);
        moveDirection.add(right);
        moved = true;
    }

    if (playerAvatar.position.x > 50 || playerAvatar.position.x < -50 || 
        playerAvatar.position.z > 50 || playerAvatar.position.z < -50) {
        
        playerAvatar.position.copy(prevPosition);
    }

    // --- 3. როტაციის ლოგიკა (მხოლოდ იმ შემთხვევაში, თუ მოძრაობის ვექტორი შეიქმნა) ---
    if (moved && moveDirection.lengthSq() > 0.001) { // ამოწმებს, რომ მოძრაობა მოხდა
        
        // --- 3.1. იდეალური როტაციის კვარტეტის შექმნა ---
        const targetQuaternion = new THREE.Quaternion();
        const targetAngle = Math.atan2(moveDirection.x, moveDirection.z);
        targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetAngle);

        // --- 3.2. Slerp (გლუვი ბრუნვა) ---
        const currentQuaternion = playerAvatar.quaternion.clone();
        currentQuaternion.slerp(targetQuaternion, 0.1); 
        playerAvatar.quaternion.copy(currentQuaternion);
        
    }
    
    // 💡 Head Bobbing (უცვლელია)
    if (moved) {
        const elapsedTime = performance.now() / 1000;
        const bob = Math.sin(elapsedTime * 10) * 0.1; 
        playerAvatar.position.y = PLAYER_Y_OFFSET + bob;
    } else {
        playerAvatar.position.y = PLAYER_Y_OFFSET; 
    }

    // ... (ინტერაქციის ლოგიკა უცვლელია) ...
    currentInteraction = null;
    let interactionFound = false;

    interactiveZones.forEach(zone => {
        const zoneBox = new THREE.Box3().setFromCenterAndSize(zone.position, zone.size);
        const playerBox = new THREE.Box3().setFromCenterAndSize(playerAvatar.position, new THREE.Vector3(1, 1, 1));
        
        if (playerBox.intersectsBox(zoneBox)) {
            currentInteraction = zone;
            interactionText.innerHTML = zone.message;
            interactionFound = true;
        }
    });

    if (!interactionFound) {
        interactionText.innerHTML = "Use W, A, S, D to explore the Citadel and find your projects!";
    }
    
    // Outer Bounds Collision (უცვლელია)
    if (playerAvatar.position.x > 45 || playerAvatar.position.x < -45 || 
        playerAvatar.position.z > 45 || playerAvatar.position.z < -45) {
        
        playerAvatar.position.copy(prevPosition);
    }
    
    updateCamera(); 
}

// ... (დანარჩენი კოდი logic.js-ში უცვლელია) ...

// --- Event Handlers for Movement and Interaction ---
window.addEventListener('keydown', (event) => {
    // 💡 შევამოწმოთ, რომ 'w', 'a', 's', 'd' არ არის ჩაკეტილი
    const key = event.key.toLowerCase();
    keys[key] = true;
    console.log(`Key Down: ${key}`); // დაგვეხმარება დებაგინგში!
    
    if (key === 'enter' && currentInteraction && currentInteraction.link) {
        window.open(currentInteraction.link, '_blank');
        event.preventDefault();
    }
});

window.addEventListener('keyup', (event) => {
    keys[event.key.toLowerCase()] = false;
});