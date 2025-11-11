# 🏰 The Digital Citadel - Interactive 3D Portfolio

![Version](https://img.shields.io/badge/version-2.0-blue)
![Three.js](https://img.shields.io/badge/Three.js-r128-green)
![Status](https://img.shields.io/badge/status-active-success)

## 🎮 Overview

**The Digital Citadel** არის ინოვაციური 3D ინტერაქტიული პორტფოლიო, შექმნილი Three.js-ის გამოყენებით. პროექტი აერთიანებს თამაშის მექანიკას და პორტფოლიოს პრეზენტაციას, რაც მომხმარებელს საშუალებას აძლევს "შეისწავლოს" შენი უნარები და პროექტები სახალისო და ინტერაქტიული გზით.

## ✨ ძირითადი ფიჩები

### 🎯 Gameplay Features
- **3D Third-Person Exploration** - დაეხეტე სასახლის ტერიტორიაზე
- **5 Interactive Zones** - აღმოაჩინე სხვადასხვა პორტფოლიოს სექციები
- **Progress Tracking** - თვალი ადევნე, რამდენი ზონა მოინახულე
- **Animated Crystals** - თვალსაჩინო ინდიკატორები თითოეული ზონისთვის
- **Mini-Map** - ნავიგაცია უფრო მარტივია რუქის დახმარებით

### 🎨 Portfolio Zones
1. **💡 Skills Tower** - ტექნიკური უნარები
2. **🎨 Projects Gallery** - პროექტების showcase
3. **📧 Contact Portal** - საკონტაქტო ინფორმაცია
4. **🏆 About Me Chamber** - პირადი ინფორმაცია
5. **🎯 Achievement Center** - სერტიფიკატები და მიღწევები

### 🎆 Special Effects
- **Animated Zones** - კრისტალების ბრუნვა და ტრიალება
- **Head Bobbing** - რეალისტური მოძრაობის ანიმაცია
- **Fireworks** - როცა ყველა ზონას მოინახულებ 🎊
- **Dynamic Lighting** - ჰაერის ვიზუალური ეფექტები

## 🎮 Controls

| Key | Action |
|-----|--------|
| W / ↑ | წინ |
| S / ↓ | უკან |
| A / ← | მარცხნივ |
| D / → | მარჯვნივ |
| Enter | ინტერაქცია ზონასთან |
| ESC | პოპ-აპის დახურვა |

## 🚀 Setup & Installation

```bash
# Clone the repository
git clone https://github.com/MichaLL27/The-Digital-Citadel.git

# Navigate to project
cd The-Digital-Citadel

# Open with Live Server or any local server
# Or simply open index.html in browser
```

## 📁 Project Structure

```
The-Digital-Citadel/
│
├── index.html              # Main HTML file
├── readme.md              # Documentation
│
├── assets/
│   └── models/
│       ├── citadel_full.glb    # 3D Castle model
│       └── player_avatar.glb   # Player character
│
└── src/
    ├── setup.js           # Scene initialization & zones
    ├── logic.js           # Player movement & interactions
    ├── game_3d.js         # Animation loop & mini-map
    └── style.css          # UI styling
```

## 🛠️ Tech Stack

- **Three.js r128** - 3D Graphics Library
- **WebGL** - 3D Rendering
- **JavaScript** - Game Logic
- **HTML5 Canvas** - Mini-Map
- **CSS3** - UI/UX Design
- **GLTF Models** - 3D Assets

## 🎨 Customization

### შეცვალე პორტფოლიოს კონტენტი:

`src/setup.js`-ში ნახე `interactiveZones` მასივი:

```javascript
{
    name: "💡 Skills Tower",
    content: `
        <h2>💻 Technical Skills</h2>
        <ul>
            <li>შენი უნარები აქ დაამატე</li>
        </ul>
    `,
    // ...
}
```

### შეცვალე ფერები და სტილები:

`src/style.css` - შეცვალე ფერები და ანიმაციები  
`src/setup.js` - შეცვალე ზონების ფერები (`color: 0xFFD700`)

## 🌐 Deployment

### GitHub Pages:
```bash
git add .
git commit -m "Portfolio update"
git push origin main
```

Settings → Pages → Source: main → Save

### Live Demo:
🔗 [View Live Demo](https://michall27.github.io/The-Digital-Citadel/)

## 📊 Features Roadmap

- [ ] Sound Effects & Background Music
- [ ] More Interactive Zones
- [ ] Mobile Touch Controls
- [ ] Multiplayer Support
- [ ] Custom Avatar Selection
- [ ] Day/Night Cycle

## 👨‍💻 Developer

Created with ❤️ by [MichaLL27](https://github.com/MichaLL27)

## 📄 License

MIT License - Feel free to use for your own portfolio!

---

### 🎮 3D Models Credits
- Castle Model: [Tripo3D Studio](https://studio.tripo3d.ai/workspace/overview?project=772ea722-5160-4c72-97c4-aa6ae100ccd5)
- Character Model: Custom Created

---

**⭐ If you like this project, give it a star on GitHub!**