// Global variables for the 3D scene (უნდა განისაზღვროს აქ, რომ სხვა ფაილებმა დაინახონ)
let scene, camera, renderer, controls;
const interactionText = document.getElementById('interaction-text');
let playerAvatar = null; 
let citadelModel = null;
let playerBBox = null; 

// --- ანიმაციის ცვლადები ---
let mixer; 
let runAction; 
let idleAction; 

// --- კონფიგურაცია ---
const PLAYER_Y_OFFSET = 0.5;    
const CITADEL_SCALE = 6;        
const CITADEL_Y_OFFSET = 2;   // დაარეგულირეთ ეს რიცხვი, თუ სასახლე მაინც ჩავარდნილია!

const interactiveZones = [
    {
        name: "E-Commerce Project",
        position: new THREE.Vector3(0, 0, 10), 
        size: new THREE.Vector3(5, 5, 5), 
        link: "https://yourportfolio.com/ecommerce", 
        message: "Press [Enter] to see the **E-Commerce Platform** project."
    },
    {
        name: "Design Case Study",
        position: new THREE.Vector3(15, 0, -5), 
        size: new THREE.Vector3(3, 3, 3), 
        link: "https://yourportfolio.com/uidesign", 
        message: "Press [Enter] to view **UI/UX Case Studies**."
    }
];

function initScene() {
    // 1.1. Scene Setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101030); 

    // 1.2. Camera Setup
    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    camera.position.set(0, 15, 30); 
    
    // 1.3. Renderer Setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // 1.4. Add Lighting (Moonlight/Night Atmosphere)
    const ambientLight = new THREE.AmbientLight(0x404080, 0.5); 
    scene.add(ambientLight);
    
    const moonlight = new THREE.DirectionalLight(0xccccff, 1.8);
    moonlight.position.set(30, 50, 20);
    scene.add(moonlight);
    
    // 1.5. Add Ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x333030 }); 
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2; 
    ground.receiveShadow = true; 
    scene.add(ground);
    
    // 1.6. Add Fences/Path to the Citadel 
    createFencesAndPath(); 

    // 1.7. OrbitControls Setup 
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; 
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 150;

    // 1.8. Create Interactive Zones
    interactiveZones.forEach(zone => {
        const geometry = new THREE.BoxGeometry(zone.size.x, zone.size.y, zone.size.z);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00, 
            transparent: true, 
            opacity: 0 
        });
        
        const zoneMesh = new THREE.Mesh(geometry, material);
        zoneMesh.position.copy(zone.position);
        zoneMesh.position.y = PLAYER_Y_OFFSET; 
        zoneMesh.userData = zone; 
        
        scene.add(zoneMesh);
    });

    // 1.9. Load Models
    loadModels(); // <<< ამ ფუნქციის შიგნით არის ახლა ლოადერი

    window.addEventListener('resize', onWindowResize, false);
}

// 💡 გზისა და ღობის შექმნის ფუნქცია
function createFencesAndPath() {
    // --- 1. გზა (Path) ---
    const pathGeometry = new THREE.BoxGeometry(10, 0.1, 40); 
    const pathMaterial = new THREE.MeshLambertMaterial({ color: 0x555555 }); 
    const pathMesh = new THREE.Mesh(pathGeometry, pathMaterial);
    pathMesh.position.set(0, 0.05, 0); 
    scene.add(pathMesh);
    
    // --- 2. მარტივი ღობე (Collision Mesh) ---
    const fenceGeometry = new THREE.BoxGeometry(10, 2, 0.5); 
    const fenceMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513, transparent: true, opacity: 0.5 }); 
    
    const fence1 = new THREE.Mesh(fenceGeometry, fenceMaterial);
    fence1.position.set(5.5, 1, 0); 
    scene.add(fence1);
    
    const fence2 = new THREE.Mesh(fenceGeometry, fenceMaterial);
    fence2.position.set(-5.5, 1, 0); 
    scene.add(fence2);
}

// 💡 LoadModels ფუნქცია (სრული)
function loadModels() {
    const loader = new THREE.GLTFLoader();

    // --- Citadel Load ---
    loader.load(
        'assets/models/citadel_full.glb', 
        function (gltf) {
            citadelModel = gltf.scene; 
            citadelModel.scale.set(CITADEL_SCALE, CITADEL_SCALE, CITADEL_SCALE); 
            citadelModel.position.y = CITADEL_Y_OFFSET; // სასახლის Y-პოზიცია
            scene.add(citadelModel);
            
            interactionText.textContent = "🏰 The Digital Citadel Loaded. Explore the fortress!";
        },
        undefined,
        function (error) {
            console.error( 'Error loading Citadel model:', error );
            interactionText.textContent = "Error loading Citadel model. Check console for details.";
        }
    );

    // --- Player Avatar Load ---
    loader.load(
        'assets/models/player_avatar.glb', 
        function (gltf) {
            playerAvatar = gltf.scene;
            playerAvatar.scale.set(1, 1, 1); 
            playerAvatar.position.set(0, PLAYER_Y_OFFSET, 15); // პერსონაჟის Y-პოზიცია
            scene.add(playerAvatar);

            playerBBox = new THREE.Box3().setFromObject(playerAvatar); 
            
            // 💡 ანიმაციის ინიციალიზაცია
            if (gltf.animations && gltf.animations.length > 0) {
                mixer = new THREE.AnimationMixer(playerAvatar);
                
                // ვარაუდობთ, რომ 0 არის IDLE, 1 არის RUN
                idleAction = mixer.clipAction(gltf.animations[0]); 
                runAction = mixer.clipAction(gltf.animations[1]);  

                idleAction.play(); // დავიწყოთ უძრაობით
            } else {
                console.warn("Player model contains no animations!");
            }
            
            interactionText.textContent = "Player Avatar Loaded. Use W, A, S, D to move!";
        },
        undefined,
        function (error) {
            console.error( 'Error loading player avatar:', error );
        }
    )
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}