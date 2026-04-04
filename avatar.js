import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
camera.position.set(0, 1.5, 3);

// Renderer
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(300, 300);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById("avatar-container").appendChild(renderer.domElement);

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

console.log('⏳ Avatar script loaded, starting load...');

loader.load('avatar.glb', function(gltf) {
    console.log('✅ Avatar loaded successfully!');
    avatar = gltf.scene;

    avatar.scale.set(1.8, 1.8, 1.8);
    avatar.position.set(0, -1, 0);

    scene.add(avatar);

    // 🎬 PLAY BUILT-IN ANIMATION
    if (gltf.animations.length > 0) {
        console.log('✅ Found', gltf.animations.length, 'animations');
        mixer = new THREE.AnimationMixer(avatar);
        const action = mixer.clipAction(gltf.animations[0]);
        action.play();
    } else {
        console.log('⚠️ No animations found in model');
    }
},
function(progress) {
    console.log('📥 Loading:', Math.round(progress.loaded / progress.total * 100) + '%');
},
function(error) {
    console.error('❌ Load failed:', error);
    // Simple fallback sphere so you see something
    const geo = new THREE.SphereGeometry(1, 32, 32);
    const mat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });
    avatar = new THREE.Mesh(geo, mat);
    scene.add(avatar);
});

// Mouse tracking
let mouseX = 0;
let mouseY = 0;

document.addEventListener("mousemove", (event) => {
    mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
});

// Animate
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    
    if (mixer) mixer.update(delta);

    if (avatar) {
        // 🔥 Idle floating motion
        avatar.position.y = -1 + Math.sin(Date.now() * 0.002) * 0.08;

        // 🔥 Subtle rotation
        avatar.rotation.y += 0.002;

        // 🔥 Follow mouse (head-like movement)
        avatar.rotation.y += mouseX * 0.02;
        avatar.rotation.x = mouseY * 0.1;
    }

    renderer.render(scene, camera);
}

animate();

// Dragging functionality
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

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    const container = document.getElementById("avatar-container");
    container.style.right = "auto";
    container.style.bottom = "auto";
    container.style.left = e.clientX - 150 + "px";
    container.style.top = e.clientY - 150 + "px";
  }
});
