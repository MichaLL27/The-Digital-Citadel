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

// 🎮 Portfolio Interactive Zones - თამაშის ზონები
const interactiveZones = [
    {
        name: "💡 უნარების კოშკი",
        position: new THREE.Vector3(-15, 0, 5), 
        size: new THREE.Vector3(6, 6, 6), 
        color: 0xFFD700, // ოქროსფერი
        link: null, 
        message: "🌟 დააჭირე [Enter]-ს ჩემი ტექნიკური უნარების სანახავად!",
        content: `
            <h2>💻 ტექნიკური უნარები</h2>
            <ul style="text-align: left; display: inline-block;">
                <li>🎨 Frontend: React, Vue.js, Three.js</li>
                <li>⚙️ Backend: Node.js, Python, Django</li>
                <li>📊 Database: MongoDB, PostgreSQL</li>
                <li>🎮 3D გრაფიკა: Three.js, WebGL, Blender</li>
                <li>🚀 DevOps: Docker, AWS, CI/CD</li>
                <li>🎯 Game Dev: Unity, Unreal Engine</li>
            </ul>
            <p style="margin-top: 20px; color: #4ECDC4;">✨ 5+ წლიანი გამოცდილება</p>
        `,
        visited: false
    },
    {
        name: "🎨 პროექტების გალერეა",
        position: new THREE.Vector3(15, 0, 5), 
        size: new THREE.Vector3(6, 6, 6), 
        color: 0xFF6B9D, // ვარდისფერი
        link: "https://github.com/MichaLL27", 
        message: "🎯 დააჭირე [Enter]-ს ჩემი პროექტების სანახავად!",
        content: `
            <h2>🚀 რჩეული პროექტები</h2>
            <ul style="text-align: left; display: inline-block;">
                <li>🏰 The Digital Citadel - ინტერაქტიული 3D პორტფოლიო</li>
                <li>🛒 E-Commerce პლატფორმა AI-ით</li>
                <li>🎮 WebGL თამაშის ძრავა</li>
                <li>📱 React Native მობილური აპლიკაცია</li>
                <li>🌐 Real-time Chat Application</li>
                <li>🤖 AI-powered Chatbot</li>
            </ul>
            <p style="margin-top: 20px;">
                <a href="https://github.com/MichaLL27" target="_blank" style="color: #FFD700;">
                    👉 იხილე GitHub-ზე
                </a>
            </p>
        `,
        visited: false
    },
    {
        name: "📧 საკონტაქტო პორტალი",
        position: new THREE.Vector3(-15, 0, -10), 
        size: new THREE.Vector3(5, 5, 5), 
        color: 0x4ECDC4, // ფირუზი
        link: null, 
        message: "✉️ დააჭირე [Enter]-ს საკონტაქტო ინფორმაციის სანახავად!",
        content: `
            <h2>📬 დაუკავშირდი ჩემს</h2>
            <p>📧 Email: your.email@example.com</p>
            <p>💼 LinkedIn: linkedin.com/in/yourname</p>
            <p>🐙 GitHub: github.com/MichaLL27</p>
            <p>🐦 Twitter: @yourhandle</p>
            <p>💬 Discord: YourUsername#1234</p>
            <div style="margin-top: 20px; padding: 15px; background: rgba(78, 205, 196, 0.1); border-radius: 10px;">
                <p style="color: #FFD700;">💡 ღია ვარ ახალი პროექტებისთვის!</p>
                <p>დამიკავშირდი თუ გაინტერესებს თანამშრომლობა 🤝</p>
            </div>
        `,
        visited: false
    },
    {
        name: "🏆 ჩემ შესახებ",
        position: new THREE.Vector3(0, 0, -5), 
        size: new THREE.Vector3(8, 8, 8), 
        color: 0x9B59B6, // იისფერი
        link: null, 
        message: "👋 დააჭირე [Enter]-ს ჩემი შესახებ გასაგებად!",
        content: `
            <h2>👨‍💻 ჩემ შესახებ</h2>
            <p style="font-size: 1.1em; color: #4ECDC4;">Full-Stack დეველოპერი & 3D Web ენთუზიასტი</p>
            <p>გატაცებული ვარ იმერსიული ვებ გამოცდილებების შექმნით!</p>
            <p>🎓 კომპიუტერული მეცნიერების კურსდამთავრებული</p>
            <p>🌍 მდებარეობა: საქართველო 🇬🇪</p>
            <p>🎮 მიყვარს თამაშების და ვებ დეველოპმენტის გაერთიანება</p>
            <p>☕ Coffee-Driven Developer</p>
            <div style="margin-top: 20px; padding: 15px; background: rgba(155, 89, 182, 0.1); border-radius: 10px;">
                <h3 style="color: #FFD700;">🎯 ჩემი მისია</h3>
                <p>შევქმნა ინოვაციური და სახალისო ვებ აპლიკაციები, რომლებიც ადამიანებს აოცებს!</p>
            </div>
        `,
        visited: false
    },
    {
        name: "🎯 მიღწევების ცენტრი",
        position: new THREE.Vector3(15, 0, -10), 
        size: new THREE.Vector3(5, 5, 5), 
        color: 0xE74C3C, // წითელი
        link: null, 
        message: "🏅 დააჭირე [Enter]-ს მიღწევების სანახავად!",
        content: `
            <h2>🏆 მიღწევები & სერტიფიკატები</h2>
            <ul style="text-align: left; display: inline-block;">
                <li>🥇 AWS Certified Developer - Associate</li>
                <li>🥈 Google Cloud Professional</li>
                <li>🥉 Hackerrank 5⭐ Problem Solver</li>
                <li>🎨 Udemy: Advanced Three.js Course</li>
                <li>🏅 GitHub Arctic Code Vault Contributor</li>
                <li>⚡ Hackathon Winner 2024</li>
            </ul>
            <div style="margin-top: 20px; padding: 15px; background: rgba(231, 76, 60, 0.1); border-radius: 10px;">
                <h3 style="color: #FFD700;">📊 სტატისტიკა</h3>
                <p>✅ 50+ დასრულებული პროექტი</p>
                <p>⭐ 1000+ GitHub Stars</p>
                <p>👥 20+ კმაყოფილი კლიენტი</p>
            </div>
        `,
        visited: false
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

    // 1.8. Create Interactive Zones with Visual Markers
    interactiveZones.forEach(zone => {
        // შევქმნათ თვალსაჩინო მარკერები (ანიმირებული კრისტალები)
        const geometry = new THREE.OctahedronGeometry(2, 0); // კრისტალის ფორმა
        const material = new THREE.MeshStandardMaterial({ 
            color: zone.color,
            emissive: zone.color,
            emissiveIntensity: 0.5,
            transparent: true, 
            opacity: 0.7,
            metalness: 0.8,
            roughness: 0.2
        });
        const zoneMesh = new THREE.Mesh(geometry, material);
        zoneMesh.position.copy(zone.position);
        zoneMesh.position.y = 3; // ჰაერში ტრიალებს
        zoneMesh.userData = zone; 
        zoneMesh.name = "interactiveZone"; // ანიმაციისთვის
        scene.add(zoneMesh);
        
        // დავამატოთ PointLight თითოეულ ზონას
        const zoneLight = new THREE.PointLight(zone.color, 2, 15);
        zoneLight.position.copy(zone.position);
        zoneLight.position.y = 3;
        scene.add(zoneLight);
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
            
            interactionText.textContent = "🏰 სასახლე ჩატვირთულია! შეისწავლე ციტადელი!";
            
            // განახლება loading progress
            if (typeof updateLoadingProgress !== 'undefined') {
                updateLoadingProgress();
            }
        },
        undefined,
        function (error) {
            console.error( 'Error loading Citadel model:', error );
            interactionText.textContent = "შეცდომა სასახლის ჩატვირთვისას. შეამოწმე კონსოლი.";
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
            
            interactionText.textContent = "✅ პერსონაჟი ჩატვირთულია! გამოიყენე W, A, S, D გადასაადგილებლად!";
            
            // განახლება loading progress
            if (typeof updateLoadingProgress !== 'undefined') {
                updateLoadingProgress();
            }
        },
        undefined,
        function (error) {
            console.error( 'Error loading player avatar:', error );
            interactionText.textContent = "შეცდომა პერსონაჟის ჩატვირთვისას.";
        }
    )
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}