// Global variables for Logic
const playerSpeed = 5; 
const keys = {}; 
let currentInteraction = null;
let totalZones = 0; // სულ რამდენი ზონაა
let visitedZones = 0; // რამდენი მოინახულა

// --- Update Camera Position ---
function updateCamera() {
    if (!playerAvatar) return;

    // კამერის ოფსეტი (ახლოდან ხედვა) - FIXED: უკან გადმოწეულია
    const offset = new THREE.Vector3(0, 8, 15); // გაზრდილი დისტანცია
    
    // ვბრუნავთ ოფსეტს პერსონაჟის როტაციის შესაბამისად
    offset.applyQuaternion(playerAvatar.quaternion);
    
    const idealPosition = playerAvatar.position.clone().add(offset);

    // პოზიციის გლუვი ცვლილება (Lerp) - უფრო სწრაფი
    camera.position.lerp(idealPosition, 0.15); 

    // კამერა ყოველთვის უყურებს პერსონაჟის თავს
    const lookAtPosition = playerAvatar.position.clone().add(new THREE.Vector3(0, 3, 0));
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

    // ... (ინტერაქციის ლოგიკა) ...
    currentInteraction = null;
    let interactionFound = false;

    // გავითვალისწინოთ სასახლის მოდელის პოზიცია
    interactiveZones.forEach(zone => {
        const zoneBox = new THREE.Box3().setFromCenterAndSize(zone.position, zone.size);
        const playerBox = new THREE.Box3().setFromCenterAndSize(playerAvatar.position, new THREE.Vector3(2, 2, 2));
        
        if (playerBox.intersectsBox(zoneBox)) {
            currentInteraction = zone;
            interactionText.innerHTML = zone.message;
            interactionFound = true;
        }
    });

    if (!interactionFound) {
        updateProgressDisplay();
        interactionText.innerHTML = `🏰 სასახლეში მოგესალმებით! | შენახული: ${visitedZones}/${totalZones} ზონა ✨`;
    }
    
    // Outer Bounds Collision (უცვლელია)
    if (playerAvatar.position.x > 45 || playerAvatar.position.x < -45 || 
        playerAvatar.position.z > 45 || playerAvatar.position.z < -45) {
        
        playerAvatar.position.copy(prevPosition);
    }
    
    updateCamera(); 
}

// 🎯 პროგრესის განახლება
function updateProgressDisplay() {
    totalZones = interactiveZones.length;
    visitedZones = interactiveZones.filter(zone => zone.visited).length;
    
    const percentage = Math.round((visitedZones / totalZones) * 100);
    
    // პროგრესის ბარის განახლება
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    if (progressFill) {
        progressFill.style.width = percentage + '%';
    }
    
    if (progressText) {
        progressText.textContent = `პორტფოლიოს შესწავლა: ${percentage}% (${visitedZones}/${totalZones} ზონა)`;
        
        // 🎊 თუ ყველა ზონა მოინახულა
        if (visitedZones === totalZones && totalZones > 0) {
            progressText.innerHTML = '🎉 გილოცავთ! შენ გამოიკვლიე მთელი სასახლე! 🏆';
            progressText.style.color = '#FFD700';
        }
    }
}

// --- Event Handlers for Movement and Interaction ---
window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    keys[key] = true;
    
    if (key === 'enter' && currentInteraction) {
        // მონიშნოს, რომ ზონა მონახულებულია
        if (!currentInteraction.visited) {
            currentInteraction.visited = true;
            visitedZones++;
        }
        
        // თუ link აქვს, გახსენი ახალ ფანჯარაში
        if (currentInteraction.link) {
            window.open(currentInteraction.link, '_blank');
        } else if (currentInteraction.content) {
            // თუ content აქვს, ჩვენება პოპ-აპში
            showContentModal(currentInteraction);
        }
        event.preventDefault();
    }
    
    // ESC ღილაკით პოპ-აპის დახურვა
    if (key === 'escape') {
        closeContentModal();
    }
});

window.addEventListener('keyup', (event) => {
    keys[event.key.toLowerCase()] = false;
});

// 🎨 პოპ-აპის გამოჩენა
function showContentModal(zone) {
    // შევქმნათ modal თუ არ არსებობს
    let modal = document.getElementById('content-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'content-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-btn" onclick="closeContentModal()">&times;</span>
                <div id="modal-body"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // ჩავსვათ content
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <h1>${zone.name}</h1>
        ${zone.content}
        <p style="margin-top: 20px; color: #888; font-style: italic;">დააჭირე [ESC] დასახურად</p>
    `;
    
    modal.style.display = 'flex';
    
    // ვიზუალური "ხმის" ეფექტი - flash
    createFlashEffect(zone.color);
    
    // განვაახლოთ პროგრესი
    updateProgressDisplay();
    
    // 🎊 თუ ყველა ზონა მოინახულა, ვაჩვენოთ სიურპრიზი
    if (visitedZones === totalZones && totalZones > 0) {
        setTimeout(() => {
            createFireworks();
        }, 500);
    }
}

// ✨ Flash Effect როცა ზონას ხსნი
function createFlashEffect(color) {
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100vw';
    flash.style.height = '100vh';
    flash.style.backgroundColor = '#' + color.toString(16).padStart(6, '0');
    flash.style.opacity = '0.3';
    flash.style.zIndex = '999';
    flash.style.pointerEvents = 'none';
    flash.style.transition = 'opacity 0.3s ease';
    
    document.body.appendChild(flash);
    
    setTimeout(() => {
        flash.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(flash);
        }, 300);
    }, 50);
}

// 🎆 Fireworks Effect - გაუმჯობესებული!
function createFireworks() {
    // რამდენჯერმე ვქმნით ფაიერვორქის ფეთქებებს
    for (let burst = 0; burst < 5; burst++) {
        setTimeout(() => {
            const burstX = (Math.random() - 0.5) * 60;
            const burstZ = (Math.random() - 0.5) * 60;
            const burstY = 15 + Math.random() * 10;
            
            // თითოეული ფეთქება შედგება 100 პარტიკლისგან
            for (let i = 0; i < 100; i++) {
                const particle = new THREE.Mesh(
                    new THREE.SphereGeometry(0.3, 8, 8),
                    new THREE.MeshBasicMaterial({ 
                        color: new THREE.Color(
                            Math.random(),
                            Math.random(),
                            Math.random()
                        )
                    })
                );
                
                particle.position.set(burstX, burstY, burstZ);
                
                // შემთხვევითი მიმართულება
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.random() * Math.PI;
                const speed = 5 + Math.random() * 5;
                
                particle.velocity = new THREE.Vector3(
                    Math.sin(phi) * Math.cos(theta) * speed,
                    Math.sin(phi) * Math.sin(theta) * speed,
                    Math.cos(phi) * speed
                );
                
                particle.userData.lifetime = 1.5 + Math.random(); // 1.5-2.5 წამი
                particle.userData.initialLifetime = particle.userData.lifetime;
                particle.name = 'firework';
                
                scene.add(particle);
            }
            
            // ხმოვანი ეფექტი (ოფციონალური)
            console.log('💥 BOOM! Firework burst!');
            
        }, burst * 400); // 400ms ინტერვალით
    }
    
    // ბოლოს დამატებითი ტექსტი
    setTimeout(() => {
        interactionText.innerHTML = '🎊 შენ შეხვდი ყველა ზონას! გმადლობთ ჩემი პორტფოლიოს მონახულებისთვის! 🎉';
    }, 2500);
}

// 🚪 პოპ-აპის დახურვა
function closeContentModal() {
    const modal = document.getElementById('content-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// გლობალურად ხელმისაწვდომი ფუნქცია
window.closeContentModal = closeContentModal;