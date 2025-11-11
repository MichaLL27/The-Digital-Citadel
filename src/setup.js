// Global variables for the 3D scene 
let scene, camera, renderer, playerLight; // playerLight დამატებულია
let playerAvatar = null; 
let citadelModel = null;
let playerBBox = null; 
let fenceModel = null; 
const interactionText = document.getElementById('interaction-text');


// --- კონფიგურაცია ---
const PLAYER_Y_OFFSET = 0.5;    
const CITADEL_SCALE = 6;        
const CITADEL_Y_OFFSET = 3.5;   

// 💡 საწყისი პოზიცია გადაწეულია უკან (15-დან 35-ზე)
const PLAYER_START_Z = 35;
// 💡 გზის სიგრძე გაზრდილია 40-დან 80-მდე
const PATH_LENGTH = 80;

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
    camera.position.set(0, 15, PLAYER_START_Z + 10); // კამერა პერსონაჟის უკან
    
    // 1.3. Renderer Setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    renderer.shadowMap.enabled = true; 

    // 1.4. Add Lighting
    const ambientLight = new THREE.AmbientLight(0x404080, 0.8); // ოდნავ გაძლიერებული
    scene.add(ambientLight);
    
    // მთვარის შუქი
    const moonlight = new THREE.DirectionalLight(0xccccff, 2.0); // გაძლიერებული
    moonlight.position.set(30, 50, 20);
    moonlight.castShadow = true;
    scene.add(moonlight);
    
    // PointLight პერსონაჟთან (უფრო ნათელი)
    playerLight = new THREE.PointLight(0xffffff, 8, 50); // გაძლიერებული 8-მდე
    playerLight.position.set(0, 5, PLAYER_START_Z);
    scene.add(playerLight);

    // 1.5. Add Ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    // 💡 მიწის ფერი უფრო მუქი მწვანე/ნაცრისფერი (ბალახი)
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x2A353A }); 
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2; 
    ground.receiveShadow = true; 
    scene.add(ground);
    
    // 1.6. Add Path and Instanced Fences
    createPath(); 
    createInstancedFences(); 

    // 💡 1.7. ახალი დეკორაციები
    createTrees();
    createTombstones();

    // 1.8. Create Interactive Zones
    interactiveZones.forEach(zone => {
        // ... (უცვლელია)
        const geometry = new THREE.BoxGeometry(zone.size.x, zone.size.y, zone.size.z);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0 });
        const zoneMesh = new THREE.Mesh(geometry, material);
        zoneMesh.position.copy(zone.position);
        zoneMesh.position.y = PLAYER_Y_OFFSET; 
        zoneMesh.userData = zone; 
        scene.add(zoneMesh);
    });

    // 1.9. Load Models
    loadModels();

    window.addEventListener('resize', onWindowResize, false);
}

// 💡 გზის შექმნის ფუნქცია (სიგრძის გაზრდა)
function createPath() {
    const pathGeometry = new THREE.BoxGeometry(10, 0.1, PATH_LENGTH); 
    const pathMaterial = new THREE.MeshLambertMaterial({ color: 0x555555 }); 
    const pathMesh = new THREE.Mesh(pathGeometry, pathMaterial);
    // გზა ცენტრიდან უკან გადავწიეთ, რომ Castle იყოს Z=0-ზე
    pathMesh.position.set(0, 0.05, -PATH_LENGTH / 2 + 20); 
    scene.add(pathMesh);
}

// 💡 ღობის InstancedMesh-ის შექმნა (სიგრძის გაზრდა)
function createInstancedFences() {
    const fencePostGeometry = new THREE.BoxGeometry(0.5, 3, 0.5); 
    const fencePostMaterial = new THREE.MeshLambertMaterial({ color: 0x6E5F5A }); 
    
    const numberOfPosts = 40; // 30-დან 40-მდე გაიზარდა
    
    const instancedFence = new THREE.InstancedMesh(
        fencePostGeometry,
        fencePostMaterial,
        numberOfPosts * 2 
    );
    
    const dummy = new THREE.Object3D();
    const spacing = 2; 
    let count = 0;
    const startZ = -PATH_LENGTH / 2 + 1; // ღობის დაწყება გზის დასაწყისიდან
    
    // მარჯვენა ღობე
    for (let i = 0; i < numberOfPosts; i++) {
        dummy.position.set(5.5, 1.5, startZ + i * spacing);
        dummy.updateMatrix();
        instancedFence.setMatrixAt(count++, dummy.matrix);
    }
    
    // მარცხენა ღობე
    for (let i = 0; i < numberOfPosts; i++) {
        dummy.position.set(-5.5, 1.5, startZ + i * spacing);
        dummy.updateMatrix();
        instancedFence.setMatrixAt(count++, dummy.matrix);
    }

    instancedFence.instanceMatrix.needsUpdate = true;
    scene.add(instancedFence);
}

// 💡 ხეების დეკორი Instancing-ით
function createTrees() {
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.5, 5, 8);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x543A2F });
    
    const crownGeometry = new THREE.ConeGeometry(3, 7, 8);
    const crownMaterial = new THREE.MeshLambertMaterial({ color: 0x1A472A }); // მუქი მწვანე
    
    const numTrees = 15;
    
    for (let i = 0; i < numTrees; i++) {
        // ღერო
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 2.5; 
        trunk.castShadow = true;
        
        // გვირგვინი
        const crown = new THREE.Mesh(crownGeometry, crownMaterial);
        crown.position.y = 5.5 + Math.random() * 1; // სიმაღლის ვარიაცია
        crown.castShadow = true;
        
        // შემთხვევითი პოზიცია გზიდან მოშორებით
        const zPos = -PATH_LENGTH / 2 + Math.random() * PATH_LENGTH;
        const xPos = (Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 20); // 10-დან 30-მდე მოშორებით

        trunk.position.set(xPos, 2.5, zPos);
        crown.position.set(xPos, crown.position.y, zPos);
        
        scene.add(trunk);
        scene.add(crown);
    }
}

// 💡 საფლავის ქვების დეკორი
function createTombstones() {
    const tombGeometry = new THREE.BoxGeometry(1.5, 2.5, 0.3);
    const tombMaterial = new THREE.MeshLambertMaterial({ color: 0x777777 }); // მუქი ნაცრისფერი ქვა
    
    const numTombstones = 10;
    
    for (let i = 0; i < numTombstones; i++) {
        const tomb = new THREE.Mesh(tombGeometry, tombMaterial);
        tomb.position.y = 1.25; 
        tomb.castShadow = true;

        const zPos = -PATH_LENGTH / 2 + Math.random() * PATH_LENGTH;
        const xPos = (Math.random() > 0.5 ? 1 : -1) * (6 + Math.random() * 5); // ღობესთან ახლოს
        
        tomb.position.set(xPos, 1.25, zPos);
        tomb.rotation.y = Math.random() * Math.PI * 2; // შემთხვევითი როტაცია
        
        scene.add(tomb);
    }
}

function loadModels() {
    const loader = new THREE.GLTFLoader();

    // --- Citadel Load ---
    loader.load(
        'assets/models/citadel_full.glb', 
        function (gltf) {
            citadelModel = gltf.scene; 
            citadelModel.scale.set(CITADEL_SCALE, CITADEL_SCALE, CITADEL_SCALE); 
            citadelModel.position.y = CITADEL_Y_OFFSET; 
            citadelModel.traverse(function(node) { if (node.isMesh) node.castShadow = true; });
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
            // 💡 პერსონაჟის საწყისი პოზიცია
            playerAvatar.position.set(0, PLAYER_Y_OFFSET, PLAYER_START_Z); 
            playerAvatar.traverse(function(node) { if (node.isMesh) node.castShadow = true; });
            scene.add(playerAvatar);
            
            playerBBox = new THREE.Box3().setFromObject(playerAvatar); 
            
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