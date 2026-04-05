import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
camera.position.set(0, 0, 5);

// Renderer
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(300, 300);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const container = document.getElementById("avatar-container");
container.appendChild(renderer.domElement);

// ✅ State
let currentSection = "";
let tourActive = false;
let currentStep = 0;

const tourSteps = [
  { id: "about", text: "Let me introduce myself 👋 I'm Purva, a Data Analyst focused on solving real problems." },
  { id: "projects", text: "These are my projects 💻 — including real-time apps and finance platforms like Fintropolis." },
  { id: "experience", text: "Here's my work experience 📊 — at United Breweries I delivered ₹39L+ annual savings through data-driven optimization." },
  { id: "skills", text: "These are my tools ⚡ — from Python and SQL to Power BI and Machine Learning." },
  { id: "contact", text: "Let’s connect 🤝 — I’m open to opportunities and collaborations." }
];

function updateAI(text, id) {
  const box = document.getElementById("ai-text");
  box.innerText = text;
  box.style.whiteSpace = "normal";
  currentSection = id;
}

function updateTourProgress() {
  const progressEl = document.getElementById("tour-progress");
  if (progressEl) {
    progressEl.innerText = `Step ${currentStep + 1} / ${tourSteps.length}`;
  }
}

function highlightSection(id) {
  const allSections = document.querySelectorAll("section");

  allSections.forEach(sec => {
    sec.style.filter = "blur(3px)";
    sec.style.opacity = "0.3";
    sec.style.transform = "scale(1)";
    sec.style.outline = "none";
    sec.style.transition = "all 0.4s ease";
  });

  const active = document.getElementById(id);
  active.style.filter = "blur(0)";
  active.style.opacity = "1";
  active.style.transform = "scale(1.02)";
}

function clearHighlights() {
  document.querySelectorAll("section").forEach(sec => {
    sec.style.filter = "blur(0)";
    sec.style.opacity = "1";
    sec.style.transform = "scale(1)";
    sec.style.outline = "none";
  });
}

function runStep() {
  if (!tourActive) return;
  const step = tourSteps[currentStep];
  
  document.getElementById(step.id).scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
  
  updateAI(step.text, step.id);
  highlightSection(step.id);
}

function startTour() {
  tourActive = true;
  currentStep = 0;
  document.getElementById("start-tour").style.display = "none";
  document.getElementById("tour-controls").style.display = "block";
  document.getElementById("tour-progress").style.display = "block";
  runStep();
}

function stopTour() {
  tourActive = false;
  document.getElementById("start-tour").style.display = "block";
  document.getElementById("tour-controls").style.display = "none";
  document.getElementById("tour-progress").style.display = "none";
  clearHighlights();
  updateAI("Tour ended. Feel free to explore 👋", "end");
}

// Lighting
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0x3b82f6, 1.2);
dirLight.position.set(2, 2, 5);
scene.add(dirLight);

const fillLight = new THREE.DirectionalLight(0x8b5cf6, 0.6);
fillLight.position.set(-2, 0, 2);
scene.add(fillLight);

// Load Avatar
const loader = new GLTFLoader();
let avatar, mixer;
const clock = new THREE.Clock();

loader.load('avatar.glb', function(gltf) {
    avatar = gltf.scene;
    avatar.scale.set(2.5, 2.5, 2.5);
    avatar.position.set(0, -2, 0);
    scene.add(avatar);

    if (gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(avatar);
        const action = mixer.clipAction(gltf.animations[0]);
        action.play();
    }
}, undefined,
function(error) {
    const geo = new THREE.SphereGeometry(1, 32, 32);
    const mat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });
    avatar = new THREE.Mesh(geo, mat);
    scene.add(avatar);
});

// Mouse tracking
let mouseX = 0;
let mouseY = 0;
let isDragging = false;

renderer.domElement.style.cursor = 'grab';
renderer.domElement.addEventListener("mousedown", () => {
    isDragging = true;
    renderer.domElement.style.cursor = 'grabbing';
});

document.addEventListener("mouseup", () => {
    isDragging = false;
    renderer.domElement.style.cursor = 'grab';
});

// Handle both mouse and touch events
function updateMousePosition(event) {
    if (!isDragging) {
      const clientX = event.clientX || (event.touches && event.touches[0].clientX);
      const clientY = event.clientY || (event.touches && event.touches[0].clientY);
      if (clientX && clientY) {
        mouseX = (clientX / window.innerWidth - 0.5) * 2;
        mouseY = (clientY / window.innerHeight - 0.5) * 2;
      }
    }
}

document.addEventListener("mousemove", updateMousePosition);
document.addEventListener("touchmove", updateMousePosition, { passive: true });

// Touch drag support
renderer.domElement.addEventListener("touchstart", (e) => {
    isDragging = true;
    e.preventDefault();
});

document.addEventListener("touchend", () => {
    isDragging = false;
});

document.addEventListener("touchmove", (event) => {
    if (isDragging && event.touches.length > 0) {
      container.style.right = "auto";
      container.style.bottom = "auto";
      container.style.left = event.touches[0].clientX - 70 + "px";
      container.style.top = event.touches[0].clientY - 90 + "px";
    }
}, { passive: true });

// Animate
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    
    if (mixer) mixer.update(delta);

    if (avatar) {
        avatar.position.y = -2 + Math.sin(Date.now() * 0.002) * 0.05;
        avatar.scale.y = 2.5 + Math.sin(Date.now() * 0.003) * 0.02;
        avatar.rotation.y = THREE.MathUtils.lerp(avatar.rotation.y, mouseX * 0.3, 0.05);
        avatar.rotation.x = THREE.MathUtils.lerp(avatar.rotation.x, -mouseY * 0.2, 0.05);
    }

    renderer.render(scene, camera);
}

animate();

// ✅ Setup everything on load
window.addEventListener('load', () => {
  setTimeout(() => {
    updateAI("Hi, I'm Purva 👋 Welcome to my portfolio!", "intro");
  }, 1500);

  // Tour controls
  document.getElementById("start-tour").addEventListener("click", startTour);
  
  document.getElementById("next-step").addEventListener("click", () => {
    currentStep++;
    if (currentStep >= tourSteps.length) {
      updateAI("That’s my portfolio 🚀 Thanks for exploring!", "end");
      stopTour();
      return;
    }
    runStep();
  });
  
  document.getElementById("end-tour").addEventListener("click", stopTour);
});
