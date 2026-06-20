// ==========================================
// ECOSPHERE AI - JAVASCRIPT CORNERSTONE
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  lucide.createIcons();
  
  // 1. Particle Background System
  initParticles();
  
  // 2. Three.js Holographic Earth Globe
  initGlobe();
  
  // 3. UI Chart & Projections Setup
  initCharts();
  
  // 4. Inject Default Creature SVGs into EcoDex
  injectCreatureSVGs();
  
  // 5. Initial state check
  updateTrainerUI();

  // 6. Init ScrollSpy & Map Tooltips
  initScrollSpy();
  initMapTooltips();
  
  // 7. Init Background Glow Drifting & Mouse Spotlight Follow
  initBackgroundGlows();

  // 8. Init EcoDex Modal Click Handlers and Evolve status checks
  initEcoDexClickHandlers();
  checkReadyToEvolve();
  
  // ============================
  // IMPROVEMENT INITIALIZATIONS
  // ============================
  // 9. Scroll Reveal Animations
  initScrollReveal();
  
  // 10. Nav shrink on scroll
  initNavScroll();
  
  // 11. Animate stat number counters on scroll
  initCounterAnimations();
  
  // 12. Animate radial ring on scroll-in
  initRadialRingAnimation();
  
  // 13. Animate XP banner fill
  initXPBanner();
  
  // 14. Animate team bars on scroll
  initTeamBars();
  
  // 15. Slider fill track
  initSliderFillTracks();
});


// ==========================================
// TRAINER SYSTEM STATE
// ==========================================
let trainerState = {
  level: 1,
  xp: 450,
  maxXp: 1000,
  streak: 3,
  totalXp: 3890,
  unlockedBadges: ['seed-sower', 'volt-spark']
};

function updateTrainerUI() {
  document.getElementById('trainer-level').innerText = trainerState.level;
  document.getElementById('trainer-streak').innerText = trainerState.streak;
  document.getElementById('trainer-total-xp').innerText = trainerState.totalXp + ' XP';
  
  // Update main dashboard radial progress ring (Score: 750/1000)
  const scoreVal = parseInt(document.getElementById('current-impact-score').innerText);
  const ring = document.getElementById('radial-progress-circle');
  if (ring) {
    // Circumference of r=90 circle is ~565
    // Dashoffset: 565 - (565 * Score / 1000)
    const offset = 565 - (565 * scoreVal) / 1000;
    ring.style.strokeDashoffset = offset;
  }
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
function triggerToast(title, desc, type = 'green') {
  const container = document.getElementById('toast-wrapper');
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'green' ? '' : type}`;
  
  let icon = 'zap';
  if (type === 'blue') icon = 'info';
  if (type === 'yellow') icon = 'award';
  if (type === 'red') icon = 'alert-triangle';
  
  toast.innerHTML = `
    <i data-lucide="${icon}"></i>
    <div>
      <h4 style="font-size: 0.85rem; font-weight: 700; margin: 0;">${title}</h4>
      <p style="font-size: 0.75rem; color: var(--text-secondary); margin: 0;">${desc}</p>
    </div>
  `;
  
  container.appendChild(toast);
  lucide.createIcons();
  
  // Animate Entrance
  setTimeout(() => toast.classList.add('show'), 100);
  
  // Exits and destroys
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// ==========================================
// 1. PARTICLE SYSTEM BACKGROUND
// ==========================================
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  
  let particlesArray = [];
  const numberOfParticles = 50;
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height + canvas.height;
      this.size = Math.random() * 4 + 1;
      this.speedY = Math.random() * -1 - 0.2;
      this.speedX = Math.random() * 0.4 - 0.2;
      this.color = Math.random() > 0.5 ? 'rgba(0, 210, 106, 0.08)' : 'rgba(0, 191, 255, 0.08)';
    }
    
    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      
      // Reset if off screen
      if (this.y < 0) {
        this.y = canvas.height + 20;
        this.x = Math.random() * canvas.width;
      }
    }
    
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.fill();
    }
  }
  
  for (let i = 0; i < numberOfParticles; i++) {
    particlesArray.push(new Particle());
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
      particlesArray[i].draw();
    }
    requestAnimationFrame(animate);
  }
  
  animate();
}

// ==========================================
// 2. THREE.JS 3D EARTH GLOBE
// ==========================================
function initGlobe() {
  const container = document.getElementById('hero');
  const canvas = document.getElementById('globe-canvas');
  if (!canvas) return;

  const parent = canvas.parentElement;
  const width = parent.clientWidth || 500;
  const height = parent.clientHeight || 500;
  
  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  
  // Dynamic camera positioning to make sure the globe fits on all viewport aspect ratios
  const updateCameraZ = () => {
    const w = parent.clientWidth || 500;
    const h = parent.clientHeight || 500;
    const aspect = w / h;
    
    // Bounding radius is ~2.6 (ring). With safe padding of 1.15, max dimension is 3.0.
    // At fov=45, base distance is 3.0 / tan(22.5 deg) = 7.25.
    const baseDistance = 7.5;
    if (aspect < 1) {
      camera.position.z = baseDistance / aspect;
    } else {
      camera.position.z = baseDistance;
    }
  };
  
  updateCameraZ();
  
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
  // Load Earth Texture
  const textureLoader = new THREE.TextureLoader();
  const earthTexture = textureLoader.load(
    './earth-blue-marble.jpg',
    (tex) => {
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    },
    undefined,
    (err) => {
      console.error('Error loading earth texture, using color fallback', err);
    }
  );
  
  // Create Realistic Earth Globe
  const coreGeometry = new THREE.SphereGeometry(2.2, 64, 64);
  const coreMaterial = new THREE.MeshPhongMaterial({
    map: earthTexture,
    shininess: 40,
    specular: 0x00BFFF,
    emissive: 0x091428,
    transparent: false
  });
  const coreGlobe = new THREE.Mesh(coreGeometry, coreMaterial);
  scene.add(coreGlobe);
  
  // Subtle Atmosphere Glow Mesh
  const glowGeo = new THREE.SphereGeometry(2.24, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x00BFFF,
    transparent: true,
    opacity: 0.15,
    side: THREE.BackSide
  });
  const glowMesh = new THREE.Mesh(glowGeo, glowMat);
  scene.add(glowMesh);
  
  // Wireframe digital outer sphere
  const wireGeometry = new THREE.SphereGeometry(2.3, 24, 24);
  const wireMaterial = new THREE.MeshBasicMaterial({
    color: 0x00BFFF,
    wireframe: true,
    transparent: true,
    opacity: 0.1
  });
  const wireGlobe = new THREE.Mesh(wireGeometry, wireMaterial);
  scene.add(wireGlobe);
  
  // Glowing Orbiting Ring
  const ringGeo = new THREE.RingGeometry(2.6, 2.62, 64);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x00D26A, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2.5;
  scene.add(ring);
  
  // Glowing Hotspots (Interactive Ecosystem Markers)
  const markerGroup = new THREE.Group();
  const pins = [
    { lat: 40.7128, lon: -74.0060, name: 'North America', status: 'Balanced', color: 0x00D26A },
    { lat: 51.5074, lon: -0.1278, name: 'Europe', status: 'Stable', color: 0x00BFFF },
    { lat: -33.8688, lon: 151.2093, name: 'Australia', status: 'Degrading', color: 0xFF4D4D },
    { lat: 19.0760, lon: 72.8777, name: 'India', status: 'Improving', color: 0xFFD700 },
    { lat: -23.5505, lon: -46.6333, name: 'South America', status: 'Balanced', color: 0x00D26A }
  ];
  
  pins.forEach(pin => {
    const rad = 2.22;
    const phi = (90 - pin.lat) * (Math.PI / 180);
    const theta = (pin.lon + 180) * (Math.PI / 180);
    
    const x = -(rad * Math.sin(phi) * Math.sin(theta));
    const y = rad * Math.cos(phi);
    const z = rad * Math.sin(phi) * Math.cos(theta);
    
    const pinGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const pinMat = new THREE.MeshBasicMaterial({ color: pin.color });
    const pinMesh = new THREE.Mesh(pinGeo, pinMat);
    pinMesh.position.set(x, y, z);
    pinMesh.userData = pin;
    markerGroup.add(pinMesh);
  });
  
  scene.add(markerGroup);
  
  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);
  
  const pointLight1 = new THREE.PointLight(0x00D26A, 1.2, 50);
  pointLight1.position.set(10, 10, 10);
  scene.add(pointLight1);
  
  const pointLight2 = new THREE.PointLight(0x00BFFF, 0.8, 50);
  pointLight2.position.set(-10, -10, -10);
  scene.add(pointLight2);
  
  // Interaction Logic (Click to shift weather, rotate)
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  
  canvas.addEventListener('mousedown', e => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });
  
  window.addEventListener('mouseup', () => {
    isDragging = false;
  });
  
  canvas.addEventListener('mousemove', e => {
    if (!isDragging) {
      // Parallax mouse follow on hovering
      const xPercent = (e.clientX / window.innerWidth) - 0.5;
      const yPercent = (e.clientY / window.innerHeight) - 0.5;
      scene.rotation.y = xPercent * 0.5;
      scene.rotation.x = yPercent * 0.5;
      return;
    }
    
    const deltaMove = {
      x: e.clientX - previousMousePosition.x,
      y: e.clientY - previousMousePosition.y
    };
    
    coreGlobe.rotation.y += deltaMove.x * 0.005;
    coreGlobe.rotation.x += deltaMove.y * 0.005;
    wireGlobe.rotation.y += deltaMove.x * 0.005;
    wireGlobe.rotation.x += deltaMove.y * 0.005;
    markerGroup.rotation.y += deltaMove.x * 0.005;
    markerGroup.rotation.x += deltaMove.y * 0.005;
    
    previousMousePosition = {
      x: e.clientX,
      y: e.clientY
    };
  });
  
  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    
    if (!isDragging) {
      // Auto rotations
      coreGlobe.rotation.y += 0.002;
      wireGlobe.rotation.y -= 0.001;
      markerGroup.rotation.y += 0.002;
      ring.rotation.z += 0.001;
    }
    
    renderer.render(scene, camera);
  }
  
  animate();
  
  // Resize Handler
  window.addEventListener('resize', () => {
    const w = parent.clientWidth || 500;
    const h = parent.clientHeight || 500;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    updateCameraZ();
  });
}

// ==========================================
// 3. CHART.JS PROJECTION SYSTEMS
// ==========================================
let futureChart;

function initCharts() {
  const ctx = document.getElementById('future-projection-chart');
  if (!ctx) return;
  
  futureChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['2026', '2030', '2035', '2040', '2045', '2050'],
      datasets: [
        {
          label: 'Baseline Projections',
          data: [9.8, 9.2, 8.5, 7.6, 6.5, 5.0],
          borderColor: 'rgba(255, 77, 77, 0.4)',
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          tension: 0.3
        },
        {
          label: 'Your Simulated Impact',
          data: [9.8, 7.8, 5.4, 3.2, 1.0, 0.0],
          borderColor: '#00D26A',
          borderWidth: 3,
          backgroundColor: 'rgba(0, 210, 106, 0.05)',
          fill: true,
          tension: 0.3,
          pointBackgroundColor: '#00BFFF',
          pointBorderColor: '#fff',
          pointHoverRadius: 7
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#94A3B8',
            font: { family: 'Inter', size: 11 }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.03)' },
          ticks: { color: '#94A3B8', font: { family: 'Space Grotesk' } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.03)' },
          ticks: { color: '#94A3B8' },
          title: {
            display: true,
            text: 'Annual t CO₂e Emissions',
            color: '#64748B',
            font: { size: 10 }
          }
        }
      }
    }
  });
}

function updateSimulation() {
  const cleanEnergy = parseInt(document.getElementById('sim-clean').value);
  const plantBased = parseInt(document.getElementById('sim-plant').value);
  const cleanTransit = parseInt(document.getElementById('sim-transport').value);
  
  // Update slider numeric readouts
  document.getElementById('sim-val-clean').innerText = cleanEnergy;
  document.getElementById('sim-val-plant').innerText = plantBased;
  document.getElementById('sim-val-transport').innerText = cleanTransit;
  
  // Calculate simulated emission profile based on sliders
  // 100% cleans drops it down to zero faster.
  const baseImpact = 9.8;
  const transitMod = (cleanTransit / 100) * 2.8;
  const energyMod = (cleanEnergy / 100) * 3.5;
  const dietMod = (plantBased / 100) * 2.5;
  
  const totalMod = transitMod + energyMod + dietMod;
  
  // Generate projection values for 2026-2050
  const points = [
    baseImpact,
    Math.max(0, baseImpact - (totalMod * 0.25) - 0.5),
    Math.max(0, baseImpact - (totalMod * 0.5) - 1.2),
    Math.max(0, baseImpact - (totalMod * 0.75) - 2.0),
    Math.max(0, baseImpact - (totalMod * 0.95) - 3.2),
    Math.max(0, baseImpact - totalMod - 4.5)
  ];
  
  // Find projected Net Zero Target Year
  let netZeroYear = 2050;
  for (let i = 0; i < points.length; i++) {
    if (points[i] === 0) {
      if (i === 1) netZeroYear = 2030;
      else if (i === 2) netZeroYear = 2035;
      else if (i === 3) netZeroYear = 2040;
      else if (i === 4) netZeroYear = 2045;
      break;
    }
  }
  
  if (points[5] > 0) {
    netZeroYear = 'Post-2050';
  }
  
  document.getElementById('projected-target-year').innerText = netZeroYear;
  
  // Push changes to Chart.js
  if (futureChart) {
    futureChart.data.datasets[1].data = points;
    futureChart.update();
  }
}

// ==========================================
// 4. OFFICIAL POKÉMON DATABASE AND SVGS
// ==========================================
const creaturesData = {
  bulbasaur: {
    stage: 1,
    name: 'Bulbasaur',
    xp: 80,
    maxXp: 100,
    element: 'grass',
    stages: [
      { name: 'Bulbasaur', info: 'Stage 1: Seed Pokémon' },
      { name: 'Ivysaur', info: 'Stage 2: Seed Pokémon' },
      { name: 'Venusaur', info: 'Stage 3: Seed Pokémon' }
    ]
  },
  squirtle: {
    stage: 1,
    name: 'Squirtle',
    xp: 30,
    maxXp: 100,
    element: 'water',
    stages: [
      { name: 'Squirtle', info: 'Stage 1: Tiny Turtle Pokémon' },
      { name: 'Wartortle', info: 'Stage 2: Turtle Pokémon' },
      { name: 'Blastoise', info: 'Stage 3: Shellfish Pokémon' }
    ]
  },
  pichu: {
    stage: 1,
    name: 'Pichu',
    xp: 100,
    maxXp: 100,
    element: 'electric',
    stages: [
      { name: 'Pichu', info: 'Stage 1: Tiny Mouse Pokémon' },
      { name: 'Pikachu', info: 'Stage 2: Mouse Pokémon' },
      { name: 'Raichu', info: 'Stage 3: Mouse Pokémon' }
    ]
  },
  magnemite: {
    stage: 1,
    name: 'Magnemite',
    xp: 45,
    maxXp: 100,
    element: 'steel',
    stages: [
      { name: 'Magnemite', info: 'Stage 1: Magnet Pokémon' },
      { name: 'Magneton', info: 'Stage 2: Magnet Pokémon' },
      { name: 'Magnezone', info: 'Stage 3: Magnet Area Pokémon' }
    ]
  },
  pidgey: {
    stage: 1,
    name: 'Pidgey',
    xp: 0,
    maxXp: 100,
    element: 'wind',
    stages: [
      { name: 'Pidgey', info: 'Stage 1: Tiny Bird Pokémon' },
      { name: 'Pidgeotto', info: 'Stage 2: Bird Pokémon' },
      { name: 'Pidgeot', info: 'Stage 3: Bird Pokémon' }
    ]
  }
};

// Official Anime Artwork Image Libraries
const creatureSVGs = {
  bulbasaur: [
    `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png" class="creature-svg" alt="Bulbasaur">`,
    `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/2.png" class="creature-svg" alt="Ivysaur">`,
    `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png" class="creature-svg" alt="Venusaur">`
  ],
  squirtle: [
    `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png" class="creature-svg" alt="Squirtle">`,
    `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/8.png" class="creature-svg" alt="Wartortle">`,
    `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png" class="creature-svg" alt="Blastoise">`
  ],
  pichu: [
    `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/172.png" class="creature-svg" alt="Pichu">`,
    `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" class="creature-svg" alt="Pikachu">`,
    `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/26.png" class="creature-svg" alt="Raichu">`
  ],
  magnemite: [
    `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/81.png" class="creature-svg" alt="Magnemite">`,
    `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/82.png" class="creature-svg" alt="Magneton">`,
    `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/462.png" class="creature-svg" alt="Magnezone">`
  ],
  pidgey: [
    `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/16.png" class="creature-svg" alt="Pidgey">`,
    `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/17.png" class="creature-svg" alt="Pidgeotto">`,
    `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/18.png" class="creature-svg" alt="Pidgeot">`
  ]
};

function injectCreatureSVGs() {
  Object.keys(creaturesData).forEach(id => {
    const container = document.getElementById(`svg-${id}`);
    if (container) {
      container.innerHTML = creatureSVGs[id][0]; // Inject Stage 1 default
    }
  });
}

// ==========================================
// 5. EVOLUTION ACTION HANDLERS
// ==========================================
let evolvingCreatureKey = '';

function triggerEvolution(key) {
  const creature = creaturesData[key];
  if (creature.stage >= 3) {
    triggerToast('Max Stage Reached', `${creature.name} is already in its ultimate form!`, 'yellow');
    return;
  }
  
  evolvingCreatureKey = key;
  const overlay = document.getElementById('evo-screen');
  const spriteBox = document.getElementById('evo-sprite-container');
  const statusText = document.getElementById('evo-status-text');
  const subtitle = document.getElementById('evo-creature-names');
  const closeBtn = document.getElementById('btn-close-evo');
  
  // Prepare overlay details
  statusText.innerText = 'Your Companion is Evolving!';
  subtitle.innerText = `${creature.name} is evolving into ${creature.stages[creature.stage].name}...`;
  closeBtn.style.display = 'none';
  spriteBox.innerHTML = creatureSVGs[key][creature.stage - 1]; // Current stage visual
  
  // Show evolution panel
  overlay.style.display = 'flex';
  setTimeout(() => overlay.style.opacity = '1', 50);
  
  // Trigger evolving class (shake/flash)
  const sprite = spriteBox.querySelector('.creature-svg');
  sprite.classList.add('evolving');
  
  // Trigger mock particle canvas inside overlay
  const pCanvas = document.getElementById('evo-particles');
  pCanvas.innerHTML = '';
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.style.position = 'absolute';
    p.style.width = Math.random() * 8 + 4 + 'px';
    p.style.height = p.style.width;
    p.style.borderRadius = '50%';
    const colors = {
      grass: 'var(--primary-emerald)',
      water: 'var(--secondary-ocean)',
      electric: 'var(--accent-yellow)',
      steel: '#B0C4DE',
      wind: 'var(--secondary-sky)'
    };
    p.style.backgroundColor = colors[creature.element] || 'var(--primary-emerald)';
    p.style.left = Math.random() * 100 + '%';
    p.style.top = Math.random() * 100 + '%';
    p.style.filter = 'blur(1px)';
    p.style.opacity = '0';
    p.style.transform = 'translateY(100px)';
    p.style.transition = `all ${Math.random() * 1.5 + 1.0}s ease`;
    pCanvas.appendChild(p);
    
    // Animate particle upwards
    setTimeout(() => {
      p.style.opacity = '0.8';
      p.style.transform = 'translateY(-200px) scale(1.5)';
    }, 100);
  }
  
  // Evolve completion timer (1.5 seconds)
  setTimeout(() => {
    sprite.classList.remove('evolving');
    creature.stage += 1;
    spriteBox.innerHTML = creatureSVGs[key][creature.stage - 1]; // Inject new stage SVG
    
    statusText.innerText = 'Evolution Complete!';
    subtitle.innerText = `Congratulations! ${creature.stages[creature.stage - 2].name} evolved into ${creature.stages[creature.stage - 1].name}!`;
    closeBtn.style.display = 'inline-flex';
    
    // Update State XP values
    trainerState.totalXp += 200;
    trainerState.level += 1;
    updateTrainerUI();
    
    // Confetti effect
    triggerToast('Ecosystem Milestone!', `${creature.stages[creature.stage - 1].name} registered in EcoDex.`, 'yellow');
  }, 2200);
}

function closeEvolutionScreen() {
  const overlay = document.getElementById('evo-screen');
  overlay.style.opacity = '0';
  setTimeout(() => overlay.style.display = 'none', 500);
  
  // Update creature dashboard details
  const key = evolvingCreatureKey;
  const creature = creaturesData[key];
  
  // Card elements
  const cardName = document.getElementById(`name-${key}`);
  const cardStage = document.getElementById(`stage-${key}`);
  const cardXpText = document.getElementById(`xp-text-${key}`);
  const cardXpFill = document.getElementById(`xp-fill-${key}`);
  const cardBtn = document.getElementById(`btn-evolve-${key}`);
  const cardSvg = document.getElementById(`svg-${key}`);
  
  cardName.innerText = creature.stages[creature.stage - 1].name;
  cardStage.innerText = creature.stages[creature.stage - 1].info;
  
  // Reset XP on evolution
  creature.xp = 0;
  cardXpText.innerText = `0 / ${creature.maxXp} XP`;
  cardXpFill.style.width = '0%';
  cardBtn.disabled = true;
  
  // Remove ready-to-evolve card styling
  const cardEl = document.getElementById(`card-${key}`);
  if (cardEl) cardEl.classList.remove('ready-to-evolve');
  
  // Swap base card SVG to new evolution SVG
  cardSvg.innerHTML = creatureSVGs[key][creature.stage - 1];
  
  // Refresh Lucide / general indicators
  updateTrainerUI();
}

// ==========================================
// 6. SMART FOOTPRINT SCANNER FORM
// ==========================================
let scannerCurrentStep = 1;

function updateScannerValue(id) {
  const val = document.getElementById(`input-${id}`).value;
  document.getElementById(`val-${id}`).innerText = val;
}

function scannerNextStep() {
  if (scannerCurrentStep < 3) {
    document.getElementById(`q-group-${scannerCurrentStep}`).classList.remove('active');
    document.getElementById(`step-${scannerCurrentStep}`).classList.add('completed');
    document.getElementById(`step-${scannerCurrentStep}`).classList.remove('active');
    
    scannerCurrentStep += 1;
    document.getElementById(`q-group-${scannerCurrentStep}`).classList.add('active');
    document.getElementById(`step-${scannerCurrentStep}`).classList.add('active');
    
    document.getElementById('scanner-prev').style.display = 'inline-flex';
    
    if (scannerCurrentStep === 3) {
      document.getElementById('scanner-next').style.display = 'none';
      document.getElementById('scanner-submit').style.display = 'inline-flex';
    }
  }
}

function scannerPrevStep() {
  if (scannerCurrentStep > 1) {
    document.getElementById(`q-group-${scannerCurrentStep}`).classList.remove('active');
    document.getElementById(`step-${scannerCurrentStep}`).classList.remove('active');
    
    scannerCurrentStep -= 1;
    document.getElementById(`q-group-${scannerCurrentStep}`).classList.add('active');
    document.getElementById(`step-${scannerCurrentStep}`).classList.add('active');
    document.getElementById(`step-${scannerCurrentStep}`).classList.remove('completed');
    
    document.getElementById('scanner-next').style.display = 'inline-flex';
    document.getElementById('scanner-submit').style.display = 'none';
    
    if (scannerCurrentStep === 1) {
      document.getElementById('scanner-prev').style.display = 'none';
    }
  }
}

function submitFootprintScan() {
  // Trigger radar scan line animation
  const scannerLine = document.getElementById('scanner-line');
  scannerLine.style.display = 'block';
  
  // Pull parameters
  const mileage = parseInt(document.getElementById('input-car').value);
  const transit = parseInt(document.getElementById('input-transit').value);
  const electricity = parseInt(document.getElementById('input-elec').value);
  const renewable = parseInt(document.getElementById('input-renew').value);
  const meat = parseInt(document.getElementById('input-meat').value);
  const waste = parseInt(document.getElementById('input-waste').value);
  
  triggerToast('Initiating EcoScan', 'AI Core is evaluating your lifestyle matrices...', 'blue');
  
  setTimeout(() => {
    // Math to compute new carbon score (simple visual balance math)
    const transportCarbon = (mileage * 0.4) - (transit * 0.1);
    const utilityCarbon = (electricity * 0.005) * (1 - (renewable / 100));
    const foodWasteCarbon = (meat * 0.3) - (waste * 0.02);
    
    const computedCarbon = Math.max(0.5, (transportCarbon + utilityCarbon + foodWasteCarbon)).toFixed(1);
    const impactScore = Math.max(100, Math.min(1000, 1000 - Math.round(computedCarbon * 85)));
    
    // Update dashboard values
    document.getElementById('current-impact-score').innerText = impactScore;
    document.getElementById('stat-val-carbon').innerText = computedCarbon;
    document.getElementById('stat-val-energy').innerText = electricity;
    document.getElementById('stat-val-waste').innerText = waste;
    
    // Dynamically give grade feedback
    let grade = 'Eco-Guardian Grade B';
    if (impactScore > 850) grade = 'Eco-Master Grade A';
    else if (impactScore < 600) grade = 'Carbon-Heavy Grade C';
    document.getElementById('score-rating').innerText = grade;
    
    // Add XP to Squirtle (Water) & Magnemite (Recycle) to stimulate growth
    addXpToCreature('squirtle', 20);
    addXpToCreature('magnemite', 25);
    
    // Hide scanner line, reset step
    scannerLine.style.display = 'none';
    triggerToast('EcoScan Concluded', `Score: ${impactScore} XP Earned. Companions boosted!`, 'green');
    
    // Auto add item to timeline
    addTimelineItem('Concluded Diagnostic Scan', `Registered Carbon load of ${computedCarbon} t CO₂e. Impact Score adjusted to ${impactScore}.`);
    
    // Smooth scroll to dashboard to witness new status
    document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth' });
    
    // Reset scanner
    resetScanner();
  }, 2500);
}

function resetScanner() {
  document.getElementById(`q-group-${scannerCurrentStep}`).classList.remove('active');
  document.getElementById(`step-${scannerCurrentStep}`).classList.remove('active');
  document.getElementById(`step-${scannerCurrentStep}`).classList.remove('completed');
  
  scannerCurrentStep = 1;
  document.getElementById('q-group-1').classList.add('active');
  document.getElementById('step-1').classList.add('active');
  document.getElementById('step-2').classList.remove('completed');
  document.getElementById('step-3').classList.remove('completed');
  
  document.getElementById('scanner-prev').style.display = 'none';
  document.getElementById('scanner-next').style.display = 'inline-flex';
  document.getElementById('scanner-submit').style.display = 'none';
}

function addXpToCreature(key, amount) {
  const creature = creaturesData[key];
  if (creature.stage >= 3) return; // Cap form
  
  creature.xp = Math.min(creature.maxXp, creature.xp + amount);
  
  // Update card elements
  const textEl = document.getElementById(`xp-text-${key}`);
  const fillEl = document.getElementById(`xp-fill-${key}`);
  const btnEl = document.getElementById(`btn-evolve-${key}`);
  const cardEl = document.getElementById(`card-${key}`);
  
  textEl.innerText = `${creature.xp} / ${creature.maxXp} XP`;
  fillEl.style.width = `${(creature.xp / creature.maxXp) * 100}%`;
  
  if (creature.xp >= creature.maxXp) {
    btnEl.disabled = false;
    if (cardEl) cardEl.classList.add('ready-to-evolve');
    triggerToast('Companion Ready!', `${creature.stages[creature.stage - 1].name} is ready to evolve!`, 'yellow');
  }
}

// ==========================================
// 7. FUTURISTIC AI COACH CHAT INTERACTION
// ==========================================
const aiCoachResponses = {
  'give me a daily quest': 'I have refreshed your Quest Board! Unplugging idle appliances will boost Pichu (+30 XP) while recycling targets Magnemite. Go check them out!',
  'how do i evolve bulbasaur?': 'Bulbasaur grows from planting seedlings. To evolve it into Ivysaur (Stage 2) and Venusaur (Stage 3), complete reforestation quests and maintain positive organic waste diversion ratios. Try completing the trash segregation quest now!',
  'analyze my carbon footprint': 'Based on your carbon footprint diagnostic (4.8 t CO₂e), Transportation accounts for 58% of your overall footprint. Upgrading to active cycling or a shared clean transit system will instantly raise your Trainer Impact Score above 800.',
  'hello': 'Hello, Eco Trainer! Ready to embark on your planetary restoration adventure today?',
  'default': 'Fascinating query! Restoring our global ecosystem requires consistent micro-actions. Complete daily quests to gain companion XP and evolve Bulbasaur, Pichu, or Squirtle!'
};

function handleChatKey(event) {
  if (event.key === 'Enter') {
    sendUserMessage();
  }
}

function sendSuggestedChat(text) {
  document.getElementById('chat-input').value = text;
  sendUserMessage();
}

function getDynamicCoachResponse(text) {
  const key = text.toLowerCase().trim();
  
  // Extract current footprint score and carbon values
  const footprintText = document.getElementById('stat-val-carbon').innerText;
  const scoreText = document.getElementById('current-impact-score').innerText;
  const activeStreak = trainerState.streak;
  const activeLevel = trainerState.level;
  
  if (key.includes('quest') || key.includes('daily')) {
    return `I have refreshed your Quest Board! Unplugging idle appliances will boost Pichu (+20 XP), recycling targets Magnemite (+45 XP), while your new water quest boosts Squirtle (+40 XP). Keep it up!`;
  }
  
  if (key.includes('bulbasaur') || key.includes('evolve bulbasaur')) {
    return `Bulbasaur grows from reforestation and planting seeds. Since you currently have ${creaturesData.bulbasaur.xp}/100 XP, try toggling Quest 4 (Plant/Water plants) to push its progress. Evolving it to Ivysaur boosts your Grass element stats!`;
  }
  
  if (key.includes('analyze') || key.includes('footprint') || key.includes('carbon')) {
    return `Analyzing your latest diagnostic scan... Your carbon footprint is currently ${footprintText} t CO₂e, placing you at a Trainer Impact Score of ${scoreText}/1000. Try active transportation or planting trees to raise this score above 850 for Grade A status!`;
  }
  
  if (key.includes('hello') || key.includes('hi ') || key.includes('greetings')) {
    return `Hello, Eco Trainer! You are currently Lvl ${activeLevel} with a ${activeStreak}-day streak. Ready to embark on your planetary restoration adventure today?`;
  }
  
  // Free-text keyword matchers for organic action logs
  if (key.includes('plant') || key.includes('tree') || key.includes('garden') || key.includes('vegetable')) {
    addXpToCreature('bulbasaur', 20);
    trainerState.totalXp += 20;
    updateTrainerUI();
    addTimelineItem('Organic Action via Coach Chat', 'Reported tree-planting or botany habit. Earned +20 Grass XP.');
    return `Magnificent habit! I've credited +20 XP to your Bulbasaur. Planting vegetation draws carbon directly back into the biosphere. Keep expanding the canopy!`;
  }
  
  if (key.includes('recycle') || key.includes('compost') || key.includes('trash') || key.includes('sort')) {
    addXpToCreature('magnemite', 20);
    trainerState.totalXp += 20;
    updateTrainerUI();
    addTimelineItem('Waste Sorting via Coach Chat', 'Reported metal or plastics segregation. Earned +20 Steel XP.');
    return `Sensational! Diverting waste streams stops methane release from landfill dumps. I've credited +20 XP to Magnemite.`;
  }
  
  if (key.includes('water') || key.includes('shower') || key.includes('leak') || key.includes('rain')) {
    addXpToCreature('squirtle', 20);
    trainerState.totalXp += 20;
    updateTrainerUI();
    addTimelineItem('Water Saving via Coach Chat', 'Reported water conservation habit. Earned +20 Water XP.');
    return `Fantastic hydro-conservation! Limiting water waste protects critical aquatic habitats. Squirtle has been awarded +20 XP.`;
  }
  
  if (key.includes('cycle') || key.includes('walk') || key.includes('bus') || key.includes('train') || key.includes('transit')) {
    addXpToCreature('pidgey', 20);
    trainerState.totalXp += 20;
    updateTrainerUI();
    addTimelineItem('Active Transport via Coach Chat', 'Reported clean transit option. Earned +20 Wind XP.');
    return `Great clean transit choice! Choosing active travel structures keeps air sheds free of particulates. Pidgey has received +20 XP.`;
  }
  
  if (key.includes('power') || key.includes('electric') || key.includes('led') || key.includes('solar') || key.includes('unplug')) {
    addXpToCreature('pichu', 20);
    trainerState.totalXp += 20;
    updateTrainerUI();
    addTimelineItem('Energy Conservation via Coach Chat', 'Reported power conservation habit. Earned +20 Electric XP.');
    return `Smart power management! Lowering grid load reduces backup fossil fuel plant burn. Pichu has received +20 XP!`;
  }
  
  return `Fascinating point! Consistently practicing micro-actions is key. You can complete quests, simulate Clean Energy Grid values, or click on companions in your EcoDex to view element details. What else can I guide you on?`;
}

function sendUserMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (text === '') return;
  
  // Inject User bubble
  injectMessage(text, 'user');
  input.value = '';
  
  // Typing simulation
  setTimeout(() => {
    let response = getDynamicCoachResponse(text);
    injectMessage(response, 'bot');
  }, 1000);
}

function injectMessage(text, sender) {
  const messagesBox = document.getElementById('chat-messages');
  const msg = document.createElement('div');
  msg.className = `message ${sender}`;
  msg.innerText = text;
  messagesBox.appendChild(msg);
  messagesBox.scrollTop = messagesBox.scrollHeight;
}

// ==========================================
// 8. GAMIFICATION QUESTS, BADGES, AND STREAMING
// ==========================================
function toggleQuest(id, xpValue) {
  const quest = document.getElementById(id);
  if (quest.classList.contains('completed')) {
    // Reverse quest
    quest.classList.remove('completed');
    trainerState.totalXp -= xpValue;
    updateTrainerUI();
  } else {
    quest.classList.add('completed');
    trainerState.totalXp += xpValue;
    updateTrainerUI();
    

    
    // Add XP to random creature corresponding to the quest
    if (id === 'quest-1') {
      addXpToCreature('pidgey', 50); // Flying/Transit
      addTimelineItem('Commenced Active Commuting', 'Substituted personal motor transit with active cycling. Earned +50 Flying XP.');
    } else if (id === 'quest-2') {
      addXpToCreature('pichu', 20); // Electric/Energy
      addTimelineItem('Minimized Electric Grid Load', 'Power-cycled desktop computers and TV standby terminals. Earned +20 Electric XP.');
    } else if (id === 'quest-3') {
      addXpToCreature('magnemite', 45); // Magnemite/Waste
      addTimelineItem('Executed Complete Garbage Sort', 'Sorted aluminum and paper waste from generic bin. Earned +45 Steel XP.');
    } else if (id === 'quest-4') {
      addXpToCreature('bulbasaur', 60); // Grass/Plants
      addTimelineItem('Planted Native Vegetation', 'Planted organic flora seedlings in domestic workspace. Earned +60 Grass XP.');
    } else if (id === 'quest-5') {
      addXpToCreature('squirtle', 40); // Water/Shower
      addTimelineItem('Reduced Domestic Hydro-Draw', 'Concluded shower session under 5 minute cap limit. Earned +40 Water XP.');
    }
    
    triggerToast('Quest Concluded!', `Completed daily target. Gained +${xpValue} XP.`, 'green');
  }
}

// ==========================================
// 9. TIMELINE AND WORLD MAP FEEDS
// ==========================================
function addTimelineItem(title, desc) {
  const timeline = document.querySelector('.timeline-container');
  const item = document.createElement('div');
  item.className = 'timeline-item';
  item.innerHTML = `
    <div class="timeline-dot"></div>
    <div class="timeline-content">
      <div class="timeline-time">Just Now</div>
      <div class="timeline-title">${title}</div>
      <div class="timeline-desc">${desc}</div>
    </div>
  `;
  timeline.insertBefore(item, timeline.firstChild);
}

function triggerMapFeed(city, action, element) {
  const feed = document.getElementById('live-action-feed');
  const feedItem = document.createElement('div');
  feedItem.className = 'feed-item';
  feedItem.style.borderLeftColor = element === 'grass' ? 'var(--primary-emerald)' : 'var(--secondary-ocean)';
  feedItem.innerText = `Trainer at ${city} completed target: ${action}! (+70 Alliance XP)`;
  
  feed.insertBefore(feedItem, feed.firstChild);
  if (feed.children.length > 3) {
    feed.lastElementChild.remove();
  }
  
  triggerToast('Global Action Logged', `Alliance event tracked in ${city}.`, 'blue');
}

// ==========================================
// 10. ECODEX FILTER
// ==========================================
function filterEcoDex() {
  const query = document.getElementById('dex-search').value.toLowerCase();
  const filter = document.getElementById('dex-filter').value;
  const cards = document.querySelectorAll('.creature-card');
  
  cards.forEach(card => {
    const name = card.querySelector('.creature-name').innerText.toLowerCase();
    const element = card.getAttribute('data-element');
    
    const matchesSearch = name.includes(query);
    const matchesFilter = filter === 'all' || element === filter;
    
    if (matchesSearch && matchesFilter) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

// ==========================================
// 11. SCROLLSPY NAVIGATION
// ==========================================
function initScrollSpy() {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-links a');
  
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (window.scrollY >= (sectionTop - 150)) {
        current = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(a => {
      a.classList.remove('active');
      if (a.getAttribute('href') === `#${current}`) {
        a.classList.add('active');
      }
    });
  });

  // Close mobile nav drawer when clicking any menu link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const hamburger = document.getElementById('nav-hamburger');
      const links = document.getElementById('nav-links');
      if (hamburger && links) {
        hamburger.classList.remove('open');
        links.classList.remove('mobile-open');
      }
    });
  });
}

// ==========================================
// 12. INTERACTIVE MAP PINS TOOLTIPS
// ==========================================
function initMapTooltips() {
  const mapContainer = document.querySelector('.map-svg-container');
  const tooltip = document.getElementById('map-tooltip');
  
  if (mapContainer && tooltip) {
    document.querySelectorAll('.map-pin').forEach(pin => {
      pin.addEventListener('mouseenter', () => {
        const city = pin.getAttribute('data-city');
        const action = pin.getAttribute('data-action');
        const element = pin.getAttribute('data-element');
        const trainers = pin.getAttribute('data-trainers');
        const xp = pin.getAttribute('data-xp');
        
        let tagColor = 'var(--primary-emerald)';
        if (element === 'water') tagColor = 'var(--secondary-ocean)';
        if (element === 'electric') tagColor = 'var(--accent-yellow)';
        if (element === 'steel') tagColor = '#B0C4DE';
        if (element === 'wind') tagColor = 'var(--secondary-sky)';
        
        tooltip.innerHTML = `
          <h4 style="margin: 0; font-size: 0.85rem; font-weight: 700; color: #fff;">${city}</h4>
          <p style="margin: 0.15rem 0; font-size: 0.75rem; color: var(--text-secondary);">${action}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.35rem; gap: 1rem;">
            <span style="font-size: 0.7rem; color: var(--text-muted);">${trainers} Trainers</span>
            <span style="font-size: 0.7rem; font-weight: 700; color: ${tagColor};">${xp}</span>
          </div>
        `;
        
        const rect = pin.getBoundingClientRect();
        const containerRect = mapContainer.getBoundingClientRect();
        
        const left = rect.left - containerRect.left + (rect.width / 2);
        const top = rect.top - containerRect.top;
        
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        tooltip.style.display = 'block';
        setTimeout(() => {
          tooltip.style.opacity = '1';
          tooltip.style.transform = 'translate(-50%, -125%) scale(1)';
        }, 10);
      });
      
      pin.addEventListener('mouseleave', () => {
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translate(-50%, -125%) scale(0.95)';
        setTimeout(() => {
          if (tooltip.style.opacity === '0') {
            tooltip.style.display = 'none';
          }
        }, 200);
      });
    });
  }
}

// ==========================================
// 13. DYNAMIC BACKGROUND GLOWS ANIMATIONS & MOUSE TRACKING
// ==========================================
function initBackgroundGlows() {
  // Drifting animations for standard orbs using GSAP
  const orbs = document.querySelectorAll('.glow-orb:not(.orb-cursor)');
  orbs.forEach(orb => {
    // Generate organic floating drifts
    gsap.to(orb, {
      x: () => (Math.random() - 0.5) * 160,
      y: () => (Math.random() - 0.5) * 160,
      scale: () => Math.random() * 0.25 + 0.9,
      duration: () => Math.random() * 10 + 15,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  });

  // Cursor follow spotlight logic
  const cursorOrb = document.getElementById('orb-cursor');
  if (cursorOrb) {
    window.addEventListener('mousemove', (e) => {
      // Lazy display on first mouse movement
      if (cursorOrb.style.display !== 'block') {
        cursorOrb.style.display = 'block';
      }
      
      // Animate smoothly to cursor coords using GSAP
      gsap.to(cursorOrb, {
        left: e.clientX,
        top: e.clientY,
        duration: 0.8,
        ease: "power2.out"
      });
    });
  }
}

// ==========================================
// 14. ECODEX DETAIL MODAL & MAP ACTION LOGGING
// ==========================================
function initEcoDexClickHandlers() {
  document.querySelectorAll('.creature-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-evolve') || e.target.closest('.btn-evolve')) {
        return;
      }
      const key = card.id.replace('card-', '');
      openCreatureModal(key);
    });
  });
}

function checkReadyToEvolve() {
  Object.keys(creaturesData).forEach(key => {
    const creature = creaturesData[key];
    const cardEl = document.getElementById(`card-${key}`);
    const btnEl = document.getElementById(`btn-evolve-${key}`);
    if (cardEl && btnEl) {
      if (creature.xp >= creature.maxXp && creature.stage < 3) {
        cardEl.classList.add('ready-to-evolve');
        btnEl.disabled = false;
      } else {
        cardEl.classList.remove('ready-to-evolve');
        btnEl.disabled = true;
      }
    }
  });
}

function openCreatureModal(key) {
  const creature = creaturesData[key];
  if (!creature) return;
  
  const modal = document.getElementById('creature-modal');
  const nameEl = document.getElementById('modal-creature-name');
  const typeEl = document.getElementById('modal-creature-type');
  const stageEl = document.getElementById('modal-creature-stage');
  const descEl = document.getElementById('modal-creature-desc');
  const tipsEl = document.getElementById('modal-creature-tips');
  const glowEl = document.getElementById('modal-glow');
  const imgWrapper = document.getElementById('modal-image-wrapper');
  const powerEl = document.getElementById('modal-element-power');
  const auraEl = document.getElementById('modal-aura-boost');
  
  // Element Metadata configurations
  const elementDetails = {
    grass: {
      type: 'Grass',
      glowColor: 'var(--primary-emerald)',
      lore: 'Thrives on organic carbon cycles. Its growth is directly linked to photosynthesis efficiency and local reforestation actions. Evolving it helps stabilize soil nutrient integrity.',
      tips: ['Adopt organic composting in your household', 'Plant local native species in your community', 'Support sustainable, chemical-free agricultural farms'],
      power: 'Bio-Photosynthesis Sync',
      aura: '+0.5% Soil Cohesion'
    },
    water: {
      type: 'Water',
      glowColor: 'var(--secondary-ocean)',
      lore: 'Monitors clean freshwater volumes and ocean health. It draws kinetic energy from optimized hydrological habits, clean rivers, and reduced plastic runoff.',
      tips: ['Install low-flow shower and faucet adaptors', 'Divert greywater for landscaping usage', 'Eliminate single-use synthetic microplastics'],
      power: 'Hydrological Flow Rate Sync',
      aura: '+0.8% Marine Purity'
    },
    electric: {
      type: 'Electric',
      glowColor: 'var(--accent-yellow)',
      lore: 'Synthesizes clean electric currents from solar panels and wind turbines. Thrives on the reduction of standby energy draw and optimized domestic heating loops.',
      tips: ['De-energize standby electronic clusters', 'Transition home thermal systems to heat pumps', 'Subscribe to a clean energy community solar grid'],
      power: 'Standby Power Loop Mitigation',
      aura: '+1.2% Grid Load Offset'
    },
    steel: {
      type: 'Steel',
      glowColor: '#B0C4DE',
      lore: 'Represents heavy material recycling and circular supply chains. Grows through direct sorting of metals, minerals, and metals extraction loop closures.',
      tips: ['Separate aluminium, paper, and copper carefully', 'Drop off toxic batteries and tech at certified depots', 'Purchase goods manufactured with recycled post-consumer metals'],
      power: 'Circular Metallurgy Optimization',
      aura: '+0.6% Material Circularity'
    },
    wind: {
      type: 'Wind / Flying',
      glowColor: 'var(--secondary-sky)',
      lore: 'Sails upon high-velocity air corridors and monitors ozone layer health. Evolving it correlates with active commuting, public rail lines, and zero flight offsets.',
      tips: ['Leverage bicycle pathways and walking transit', 'Substitute short car commutes with commuter trains', 'Neutralize flight emissions via high-integrity carbon credits'],
      power: 'Active Velocity Drag Sync',
      aura: '+1.0% Air Shed Cleanliness'
    }
  };
  
  const details = elementDetails[creature.element];
  nameEl.innerText = creature.stages[creature.stage - 1].name;
  typeEl.innerText = details.type;
  
  // Set type pill color and glow
  typeEl.style.background = creature.element === 'grass' ? 'rgba(0, 210, 106, 0.15)' :
                            creature.element === 'water' ? 'rgba(0, 191, 255, 0.15)' :
                            creature.element === 'electric' ? 'rgba(255, 215, 0, 0.15)' :
                            creature.element === 'steel' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(135, 239, 255, 0.15)';
  typeEl.style.color = details.glowColor;
  
  stageEl.innerText = creature.stages[creature.stage - 1].info;
  descEl.innerText = details.lore;
  glowEl.style.backgroundColor = details.glowColor;
  
  // Populate image
  imgWrapper.innerHTML = creatureSVGs[key][creature.stage - 1];
  
  // Populate tips
  tipsEl.className = `modal-creature-tips flex-tips element-${creature.element}`;
  tipsEl.innerHTML = details.tips.map(tip => `<div class="modal-tip-item">${tip}</div>`).join('');
  
  powerEl.innerText = details.power;
  auraEl.innerText = details.aura;
  
  modal.style.display = 'flex';
  setTimeout(() => modal.classList.add('show'), 50);
}

function closeCreatureModal() {
  const modal = document.getElementById('creature-modal');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      if (!modal.classList.contains('show')) {
        modal.style.display = 'none';
      }
    }, 400);
  }
}

function openActionModal() {
  const modal = document.getElementById('action-modal');
  if (modal) {
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 50);
  }
}

function closeActionModal() {
  const modal = document.getElementById('action-modal');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      if (!modal.classList.contains('show')) {
        modal.style.display = 'none';
      }
    }, 400);
  }
}

function handleReportActionSubmit(event) {
  event.preventDefault();
  const city = document.getElementById('action-city').value.trim();
  const category = document.getElementById('action-category').value;
  const description = document.getElementById('action-description').value.trim();
  
  if (!city || !description) return;
  
  // 1. Calculate semi-random coordinates on the SVG map (viewBox 0 0 1000 500)
  const x = Math.floor(Math.random() * 600) + 200; // between 200 and 800
  const y = Math.floor(Math.random() * 300) + 100; // between 100 and 400
  
  // 2. Inject Pin into SVG
  const svgMap = document.getElementById('world-map');
  if (svgMap) {
    const pinGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    pinGroup.setAttribute('class', `map-pin ${category === 'water' ? 'blue' : category === 'electric' ? 'yellow' : category === 'steel' ? 'red' : category === 'wind' ? 'blue' : ''}`);
    pinGroup.setAttribute('transform', `translate(${x}, ${y})`);
    pinGroup.setAttribute('data-city', city);
    pinGroup.setAttribute('data-action', description);
    pinGroup.setAttribute('data-element', category);
    pinGroup.setAttribute('data-trainers', '1');
    pinGroup.setAttribute('data-xp', '+50 XP');
    pinGroup.setAttribute('onclick', `triggerMapFeed('${city}', '${description}', '${category}')`);
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '0');
    circle.setAttribute('cy', '0');
    circle.setAttribute('r', '6');
    
    pinGroup.appendChild(circle);
    svgMap.appendChild(pinGroup);
    
    // Re-bind tooltips
    initMapTooltips();
  }
  
  // 3. Award XP to corresponding Pokémon
  const pokemonMapping = {
    grass: 'bulbasaur',
    water: 'squirtle',
    electric: 'pichu',
    steel: 'magnemite',
    wind: 'pidgey'
  };
  const targetPokemon = pokemonMapping[category];
  if (targetPokemon) {
    addXpToCreature(targetPokemon, 50);
  }
  
  // 4. Update trainer total XP
  trainerState.totalXp += 50;
  updateTrainerUI();
  
  // 5. Add to live alliance feed
  const liveActionFeed = document.getElementById('live-action-feed');
  if (liveActionFeed) {
    const item = document.createElement('div');
    item.className = 'feed-item';
    item.style.borderLeftColor = category === 'grass' ? 'var(--primary-emerald)' : 'var(--secondary-ocean)';
    item.innerText = `You in ${city} completed: ${description}! (+50 Alliance XP)`;
    liveActionFeed.insertBefore(item, liveActionFeed.firstChild);
    if (liveActionFeed.children.length > 3) {
      liveActionFeed.lastElementChild.remove();
    }
  }
  
  // 6. Increment Global Health Index (cap at 99%)
  const healthValEl = document.getElementById('global-health-val');
  if (healthValEl) {
    let currentVal = parseInt(healthValEl.innerText);
    if (currentVal < 99) {
      currentVal += 1;
      healthValEl.innerText = `${currentVal}%`;
    }
  }
  
  // 7. Add to timeline
  addTimelineItem(`Logged Eco-Action in ${city}`, `${description}. Gained +50 XP for your ${creaturesData[targetPokemon].name}.`);
  
  // 8. Close modal and show toast success notification
  closeActionModal();
  triggerToast('Eco-Action Broadcasted', `Successfully mapped action. ${creaturesData[targetPokemon].name} gained +50 XP!`, 'green');
  
  // Clear form
  document.getElementById('eco-action-form').reset();
}


// ==========================================
// IMPROVEMENT FUNCTIONS
// ==========================================

// --- 9. Scroll Reveal System ---
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!revealEls.length) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  
  revealEls.forEach(el => observer.observe(el));
}

// --- 10. Nav shrink on scroll ---
function initNavScroll() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });
}

// --- 11. Animated number counter helper ---
function animateCounter(el, target, duration) {
  duration = duration || 1600;
  const startTime = performance.now();
  const isFloat = String(target).includes('.');
  const decimals = isFloat ? String(target).split('.')[1].length : 0;
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = target * eased;
    if (isFloat) {
      el.textContent = current.toFixed(decimals);
    } else {
      el.textContent = Math.round(current).toLocaleString();
    }
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = isFloat ? target.toFixed(decimals) : Number(target).toLocaleString();
    }
  }
  requestAnimationFrame(update);
}

function initCounterAnimations() {
  const counterMap = [
    { id: 'stat-val-carbon', target: 4.8 },
    { id: 'stat-val-energy', target: 280 },
    { id: 'stat-val-water', target: 1200 },
    { id: 'stat-val-waste', target: 85 },
    { id: 'current-impact-score', target: 750 },
  ];
  
  const counterEls = counterMap
    .map(c => ({ el: document.getElementById(c.id), target: c.target }))
    .filter(c => c.el);
  if (!counterEls.length) return;
  
  // Start all counters at 0
  counterEls.forEach(c => {
    c.el.textContent = c.target % 1 !== 0 ? '0.0' : '0';
  });
  
  const scorePanel = document.querySelector('.panel-score');
  if (!scorePanel) return;
  
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      counterEls.forEach(c => animateCounter(c.el, c.target));
      observer.unobserve(scorePanel);
    }
  }, { threshold: 0.3 });
  
  observer.observe(scorePanel);
}

// --- 12. Animate radial ring on scroll-in ---
function initRadialRingAnimation() {
  const ring = document.getElementById('radial-progress-circle');
  if (!ring) return;
  
  ring.style.strokeDashoffset = '565';
  
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      setTimeout(() => {
        ring.style.strokeDashoffset = String(565 - (565 * 750 / 1000));
      }, 300);
      observer.unobserve(ring);
    }
  }, { threshold: 0.5 });
  
  observer.observe(ring);
}

// --- 13. XP Banner Fill Animation ---
function initXPBanner() {
  const fill = document.getElementById('xp-banner-fill');
  const levelEl = document.getElementById('xp-banner-level');
  const ptsEl = document.getElementById('xp-banner-pts');
  
  if (!fill) return;
  
  const pct = Math.round(trainerState.xp / trainerState.maxXp * 100);
  if (levelEl) levelEl.textContent = trainerState.level;
  if (ptsEl) ptsEl.textContent = trainerState.xp.toLocaleString() + ' / ' + trainerState.maxXp.toLocaleString() + ' XP';
  
  const banner = document.getElementById('xp-banner');
  if (!banner) return;
  
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      setTimeout(() => { fill.style.width = pct + '%'; }, 400);
      observer.unobserve(banner);
    }
  }, { threshold: 0.5 });
  
  observer.observe(banner);
}

// --- 14. Animate Team Bars on Scroll ---
function initTeamBars() {
  const bars = document.querySelectorAll('.team-bar-inner');
  if (!bars.length) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        setTimeout(() => bar.classList.add('animated'), 200);
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.4 });
  
  bars.forEach(bar => observer.observe(bar));
}

// --- 15. Slider fill track via CSS background-size ---
function initSliderFillTracks() {
  const sliders = document.querySelectorAll('.slider-input');
  
  function updateFill(slider) {
    const min = parseFloat(slider.min) || 0;
    const max = parseFloat(slider.max) || 100;
    const val = parseFloat(slider.value) || 0;
    const pct = ((val - min) / (max - min)) * 100;
    slider.style.backgroundSize = pct + '% 100%';
  }
  
  sliders.forEach(slider => {
    updateFill(slider);
    slider.addEventListener('input', () => updateFill(slider));
  });
}


// ==========================================
// WAVE 2 IMPROVEMENT FUNCTIONS
// ==========================================

// --- 16. Scroll Progress Bar ---
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + '%';
  }, { passive: true });
}

// --- 17. Hero Cycling Text ---
function initHeroCycle() {
  const container = document.getElementById('hero-cycle');
  if (!container) return;
  const words = container.querySelectorAll('.hero-cycle-word');
  if (words.length < 2) return;
  
  let current = 0;
  setInterval(() => {
    words[current].classList.remove('active');
    current = (current + 1) % words.length;
    words[current].classList.add('active');
  }, 3000);
}

// --- 18. Quest Confetti Particle Burst ---
function spawnConfetti(x, y) {
  const colors = ['#00D26A', '#00BFFF', '#FFD700', '#87EFFF', '#FF4D4D', '#fff'];
  const container = document.createElement('div');
  container.className = 'quest-confetti';
  container.style.left = x + 'px';
  container.style.top = y + 'px';
  document.body.appendChild(container);
  
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-particle';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    const angle = (Math.PI * 2 * i) / 18 + (Math.random() - 0.5) * 0.5;
    const dist = 40 + Math.random() * 60;
    p.style.setProperty('--confetti-x', Math.cos(angle) * dist + 'px');
    p.style.setProperty('--confetti-y', Math.sin(angle) * dist - 30 + 'px');
    p.style.animationDelay = (Math.random() * 0.15) + 's';
    container.appendChild(p);
  }
  
  setTimeout(() => container.remove(), 1500);
}

// Patch toggleQuest to fire confetti
const origToggleQuest = typeof toggleQuest === 'function' ? toggleQuest : null;
function toggleQuestWithConfetti(id, xp) {
  const el = document.getElementById(id);
  if (el && !el.classList.contains('completed')) {
    const rect = el.getBoundingClientRect();
    spawnConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }
  if (origToggleQuest) origToggleQuest(id, xp);
}
// Replace global reference
if (origToggleQuest) {
  window.toggleQuest = toggleQuestWithConfetti;
}

// --- 19. Timeline Item Scroll Reveal ---
function initTimelineReveal() {
  const items = document.querySelectorAll('.timeline-item');
  if (!items.length) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  
  items.forEach(item => observer.observe(item));
}

// --- 20. Mobile Hamburger Toggle ---
function toggleMobileNav() {
  const hamburger = document.getElementById('nav-hamburger');
  const links = document.getElementById('nav-links');
  if (!hamburger || !links) return;
  
  hamburger.classList.toggle('open');
  links.classList.toggle('mobile-open');
}

// --- 21. Upgraded Map Tooltips ---
function initUpgradedMapTooltips() {
  const tooltip = document.getElementById('map-tooltip');
  const pins = document.querySelectorAll('.map-pin');
  const container = document.querySelector('.map-svg-container');
  if (!tooltip || !pins.length || !container) return;
  
  let tooltipTimeout;

  const showTooltip = (pin) => {
    const city = pin.getAttribute('data-city') || '';
    const action = pin.getAttribute('data-action') || '';
    const trainers = pin.getAttribute('data-trainers') || '';
    const xp = pin.getAttribute('data-xp') || '';
    
    tooltip.innerHTML = 
      '<div class="map-tooltip-city">' + city + '</div>' +
      '<div class="map-tooltip-action">' + action + '</div>' +
      '<div class="map-tooltip-stats">' +
        '<div class="map-tooltip-stat"><span class="map-tooltip-stat-label">Trainers</span><span class="map-tooltip-stat-val">' + trainers + '</span></div>' +
        '<div class="map-tooltip-stat"><span class="map-tooltip-stat-label">Alliance XP</span><span class="map-tooltip-stat-val">' + xp + '</span></div>' +
      '</div>';
    
    const rect = container.getBoundingClientRect();
    const pinRect = pin.getBoundingClientRect();
    tooltip.style.left = (pinRect.left - rect.left + pinRect.width / 2 - 90) + 'px';
    tooltip.style.top = (pinRect.top - rect.top - 10) + 'px';
    tooltip.classList.add('visible');
  };

  const hideTooltip = () => {
    tooltip.classList.remove('visible');
  };
  
  pins.forEach(pin => {
    // Desktop hover enter
    pin.addEventListener('mouseenter', () => {
      if (tooltipTimeout) clearTimeout(tooltipTimeout);
      showTooltip(pin);
    });
    
    // Desktop hover leave
    pin.addEventListener('mouseleave', () => {
      hideTooltip();
    });

    // Mobile tap support / Click toggle
    pin.addEventListener('click', (e) => {
      e.stopPropagation(); // Avoid event collision
      if (tooltipTimeout) clearTimeout(tooltipTimeout);
      showTooltip(pin);
      
      // Auto-hide tooltip after 3 seconds on mobile touch
      tooltipTimeout = setTimeout(() => {
        hideTooltip();
      }, 3000);
    });
  });

  // Tap anywhere else to dismiss tooltip
  document.addEventListener('click', () => {
    hideTooltip();
  });
}

// --- Initialize Wave 2 ---
// Must be called after DOMContentLoaded
(function initWave2() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runWave2);
  } else {
    runWave2();
  }
  
  function runWave2() {
    initScrollProgress();
    initHeroCycle();
    initTimelineReveal();
    initUpgradedMapTooltips();
  }
})();

// --- 22. Expose functions to window (Module wrapper compatibility) ---
window.toggleMobileNav = toggleMobileNav;
window.sendSuggestedChat = sendSuggestedChat;
window.sendUserMessage = sendUserMessage;
window.triggerEvolution = triggerEvolution;
window.toggleQuest = toggleQuest;
window.scannerPrevStep = scannerPrevStep;
window.scannerNextStep = scannerNextStep;
window.submitFootprintScan = submitFootprintScan;
window.openActionModal = openActionModal;
window.triggerMapFeed = triggerMapFeed;
window.closeEvolutionScreen = closeEvolutionScreen;
window.closeCreatureModal = closeCreatureModal;
window.closeActionModal = closeActionModal;
window.handleReportActionSubmit = handleReportActionSubmit;
window.updateSimulation = updateSimulation;
window.updateScannerValue = updateScannerValue;

