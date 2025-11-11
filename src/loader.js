// 🎬 Loading Screen Manager

let loadingProgress = 0;
let totalModels = 2; // citadel + player
let loadedModels = 0;

// განახლება დატვირთვის პროგრესის
function updateLoadingProgress() {
    loadedModels++;
    loadingProgress = (loadedModels / totalModels) * 100;
    
    const loadingBar = document.getElementById('loading-progress');
    const loadingText = document.getElementById('loading-text');
    
    if (loadingBar) {
        loadingBar.style.width = loadingProgress + '%';
    }
    
    if (loadingText) {
        if (loadingProgress < 50) {
            loadingText.textContent = 'Loading castle walls...';
        } else if (loadingProgress < 100) {
            loadingText.textContent = 'Summoning your avatar...';
        } else {
            loadingText.textContent = 'Ready to explore! 🎮';
        }
    }
    
    // თუ ყველაფერი დაიტვირთა
    if (loadingProgress >= 100) {
        setTimeout(() => {
            hideLoadingScreen();
        }, 500);
    }
}

// დამალე loading screen
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
}

// გამოაჩინე loading screen თავიდან
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
        loadingScreen.style.opacity = '1';
    }
});
