import * as THREE from 'three';

// Procedural Canvas Texture Generator for sharp, zero-latency architectural materials
export function createWoodFloorTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Base warm oak color
  ctx.fillStyle = '#b89068';
  ctx.fillRect(0, 0, 1024, 1024);

  // Planks
  const plankHeight = 64;
  const numPlanks = 1024 / plankHeight;

  for (let i = 0; i < numPlanks; i++) {
    const y = i * plankHeight;
    // Plank color variation
    const tone = (Math.sin(i * 99) * 0.5 + 0.5) * 20 - 10;
    const r = Math.min(255, Math.max(0, 184 + tone));
    const g = Math.min(255, Math.max(0, 144 + tone * 0.9));
    const b = Math.min(255, Math.max(0, 104 + tone * 0.8));

    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, y, 1024, plankHeight);

    // Fine wood grain lines
    ctx.strokeStyle = 'rgba(100, 70, 45, 0.12)';
    ctx.lineWidth = 1;
    for (let gIdx = 0; gIdx < 12; gIdx++) {
      ctx.beginPath();
      const gy = y + (gIdx * plankHeight) / 12 + (Math.random() - 0.5) * 2;
      ctx.moveTo(0, gy);
      ctx.bezierCurveTo(340, gy + Math.sin(i + gIdx) * 6, 680, gy - Math.sin(i * 2 + gIdx) * 5, 1024, gy);
      ctx.stroke();
    }

    // Groove between planks
    ctx.fillStyle = 'rgba(50, 30, 15, 0.45)';
    ctx.fillRect(0, y + plankHeight - 2, 1024, 2);

    // Staggered vertical plank ends
    const stagger = (i % 2 === 0) ? 512 : 256;
    ctx.fillRect(stagger, y, 2, plankHeight);
    ctx.fillRect((stagger + 512) % 1024, y, 2, plankHeight);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

export function createMarbleTileTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Base off-white marble
  ctx.fillStyle = '#f0ede6';
  ctx.fillRect(0, 0, 1024, 1024);

  // Large tiles (256x256)
  const tileSize = 256;
  for (let x = 0; x < 1024; x += tileSize) {
    for (let y = 0; y < 1024; y += tileSize) {
      // Subtle tile shade shift
      const shade = (Math.random() - 0.5) * 8;
      ctx.fillStyle = `rgba(${240 + shade}, ${237 + shade}, ${230 + shade}, 0.5)`;
      ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);

      // Veins
      ctx.strokeStyle = 'rgba(160, 150, 140, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + Math.random() * tileSize, y);
      ctx.bezierCurveTo(
        x + Math.random() * tileSize, y + tileSize * 0.4,
        x + Math.random() * tileSize, y + tileSize * 0.7,
        x + Math.random() * tileSize, y + tileSize
      );
      ctx.stroke();

      // Grout lines
      ctx.strokeStyle = 'rgba(180, 175, 170, 0.7)';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, tileSize, tileSize);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

export function createPatioWoodTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#6e5a4b';
  ctx.fillRect(0, 0, 512, 512);

  const plankWidth = 40;
  for (let x = 0; x < 512; x += plankWidth) {
    const tone = (Math.random() - 0.5) * 20;
    ctx.fillStyle = `rgb(${110 + tone}, ${90 + tone * 0.8}, ${75 + tone * 0.7})`;
    ctx.fillRect(x, 0, plankWidth - 3, 512);

    ctx.fillStyle = 'rgba(30, 20, 10, 0.5)';
    ctx.fillRect(x + plankWidth - 3, 0, 3, 512);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

export function createLawnTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#3a5f2d';
  ctx.fillRect(0, 0, 512, 512);

  // Noise grass blades
  for (let i = 0; i < 20000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const g = 80 + Math.floor(Math.random() * 60);
    ctx.fillStyle = `rgba(50, ${g}, 30, 0.4)`;
    ctx.fillRect(x, y, 2, 3);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 12);
  return texture;
}

export function createFabricTexture(baseColor = '#3b434c') {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  for (let i = 0; i < 256; i += 4) {
    ctx.fillRect(i, 0, 2, 256);
    ctx.fillRect(0, i, 256, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

export function createRugTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Modern abstract geometric Scandinavian rug
  ctx.fillStyle = '#e8e4dc';
  ctx.fillRect(0, 0, 512, 512);

  // Border
  ctx.strokeStyle = '#2b2e34';
  ctx.lineWidth = 14;
  ctx.strokeRect(16, 16, 480, 480);

  // Geometric shapes
  ctx.fillStyle = '#d97d54'; // Terracotta
  ctx.beginPath();
  ctx.arc(180, 220, 110, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#52667a'; // Muted slate
  ctx.fillRect(240, 160, 180, 220);

  ctx.fillStyle = '#dfb15b'; // Ochre
  ctx.beginPath();
  ctx.moveTo(120, 360);
  ctx.lineTo(260, 440);
  ctx.lineTo(90, 460);
  ctx.closePath();
  ctx.fill();

  // Subtle cross lines
  ctx.strokeStyle = 'rgba(40, 40, 40, 0.2)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(40, 256);
  ctx.lineTo(472, 256);
  ctx.moveTo(256, 40);
  ctx.lineTo(256, 472);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createCarportTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base dark charcoal / grey concrete paver
  ctx.fillStyle = '#474c52';
  ctx.fillRect(0, 0, 512, 512);

  // Concrete grid pavers (64x64)
  const size = 64;
  for (let x = 0; x < 512; x += size) {
    for (let y = 0; y < 512; y += size) {
      const shade = (Math.random() - 0.5) * 12;
      ctx.fillStyle = `rgb(${71 + shade}, ${76 + shade}, ${82 + shade})`;
      ctx.fillRect(x + 1, y + 1, size - 2, size - 2);

      // Fine grit
      for (let k = 0; k < 30; k++) {
        const gx = x + Math.random() * size;
        const gy = y + Math.random() * size;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(gx, gy, 1, 1);
      }
    }
  }

  // Groove joints
  ctx.strokeStyle = '#2b2f35';
  ctx.lineWidth = 2;
  for (let x = 0; x <= 512; x += size) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, x);
    ctx.lineTo(512, x);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 6);
  return texture;
}

export function createGardenCorridorTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base warm light concrete / tile tone matching photo
  ctx.fillStyle = '#cfcac0';
  ctx.fillRect(0, 0, 512, 512);

  // Ceramic paving tiles (128x128)
  const tileSize = 128;
  for (let x = 0; x < 512; x += tileSize) {
    for (let y = 0; y < 512; y += tileSize) {
      const shade = (Math.random() - 0.5) * 12;
      ctx.fillStyle = `rgb(${210 + shade}, ${205 + shade}, ${195 + shade})`;
      ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

      // Fine grit / stucco texture
      for (let k = 0; k < 30; k++) {
        const gx = x + Math.random() * tileSize;
        const gy = y + Math.random() * tileSize;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(gx, gy, 2, 2);
      }
    }
  }

  // Grout joints
  ctx.strokeStyle = '#9a9488';
  ctx.lineWidth = 2.5;
  for (let x = 0; x <= 512; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, x);
    ctx.lineTo(512, x);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 8);
  return texture;
}

// High-Resolution Glazed Moroccan Zellige Square Ceramic Tiles for Backsplash (Matching Reference Photo)
// 2048x2048 high-resolution procedural canvas matching exact handmade tile tones in media_1790527867438.png
export function createGlazedBeigeTileTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');

  // Realistic warm sand cement grout background
  ctx.fillStyle = '#b5aba0';
  ctx.fillRect(0, 0, 2048, 2048);

  // 16x16 grid of square tiles (each ~128x128 px on 2048 canvas = ultra sharp at close up!)
  const gridSize = 16;
  const tileSize = 2048 / gridSize; // 128px per tile
  const groutWidth = 4;

  // Realistic artisanal color palette sampled directly from reference photo media_1790527867438.png:
  // Warm ivory, parchment, champagne, cream, light biscuit
  const tileHues = [
    { r: 236, g: 231, b: 221 }, // soft ivory
    { r: 230, g: 223, b: 211 }, // warm parchment
    { r: 240, g: 235, b: 226 }, // luminous pale bone
    { r: 224, g: 216, b: 202 }, // warm biscuit
    { r: 234, g: 226, b: 215 }, // champagne glaze
    { r: 228, g: 220, b: 208 }  // toasted almond
  ];

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const x = col * tileSize;
      const y = row * tileSize;

      // Pseudo-random deterministic seed for consistent artisanal tile selection
      const seed = Math.sin(row * 127.1 + col * 311.7) * 43758.5453;
      const fract = seed - Math.floor(seed);
      const colorIdx = Math.floor(fract * tileHues.length);
      const base = tileHues[colorIdx];

      // Subtle natural tone shift
      const shift = (fract - 0.5) * 10;
      const r = Math.min(255, Math.max(0, Math.round(base.r + shift)));
      const g = Math.min(255, Math.max(0, Math.round(base.g + shift * 0.9)));
      const b = Math.min(255, Math.max(0, Math.round(base.b + shift * 0.8)));

      const innerX = x + groutWidth / 2;
      const innerY = y + groutWidth / 2;
      const innerW = tileSize - groutWidth;
      const innerH = tileSize - groutWidth;

      // Tile body fill
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(innerX, innerY, innerW, innerH);

      // Handmade glaze pooling gradient (wavy handcrafted reflective surface)
      const grad = ctx.createLinearGradient(innerX, innerY, innerX + innerW, innerY + innerH);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
      grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.08)');
      grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.04)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.12)');
      ctx.fillStyle = grad;
      ctx.fillRect(innerX, innerY, innerW, innerH);

      // Soft pillowed bevel highlight along top/left edge
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(innerX + 1.5, innerY + innerH - 1.5);
      ctx.lineTo(innerX + 1.5, innerY + 1.5);
      ctx.lineTo(innerX + innerW - 1.5, innerY + 1.5);
      ctx.stroke();

      // Soft pillowed shadow along bottom/right edge
      ctx.strokeStyle = 'rgba(60, 50, 40, 0.30)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(innerX + innerW - 1.5, innerY + 1.5);
      ctx.lineTo(innerX + innerW - 1.5, innerY + innerH - 1.5);
      ctx.lineTo(innerX + 1.5, innerY + innerH - 1.5);
      ctx.stroke();

      // Subtle micro-speckling for handcrafted ceramic authenticity
      const speckleCount = Math.floor(fract * 12);
      ctx.fillStyle = 'rgba(120, 110, 100, 0.15)';
      for (let s = 0; s < speckleCount; s++) {
        const sx = innerX + ((s * 37 + fract * 97) % (innerW - 8)) + 4;
        const sy = innerY + ((s * 53 + fract * 71) % (innerH - 8)) + 4;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.anisotropy = 8;
  return texture;
}

// Tangent-space Normal Map for Zellige Tiles (Generates 3D Pillowed Cushions & Grout Depth)
export function createZelligeTileNormalMap() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Flat normal vector: R=128 (X=0), G=128 (Y=0), B=255 (Z=1.0)
  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, 1024, 1024);

  const gridSize = 16;
  const tileSize = 1024 / gridSize;
  const groutW = 3;

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const x = col * tileSize;
      const y = row * tileSize;
      const w = tileSize - groutW;
      const h = tileSize - groutW;

      // Bevel pillow gradients:
      // Left edge slope (tilts normal +X -> R > 128)
      const gradLeft = ctx.createLinearGradient(x, y, x + 6, y);
      gradLeft.addColorStop(0, 'rgb(195, 128, 220)');
      gradLeft.addColorStop(1, 'rgb(128, 128, 255)');
      ctx.fillStyle = gradLeft;
      ctx.fillRect(x, y, 6, h);

      // Right edge slope (tilts normal -X -> R < 128)
      const gradRight = ctx.createLinearGradient(x + w - 6, y, x + w, y);
      gradRight.addColorStop(0, 'rgb(128, 128, 255)');
      gradRight.addColorStop(1, 'rgb(60, 128, 220)');
      ctx.fillStyle = gradRight;
      ctx.fillRect(x + w - 6, y, 6, h);

      // Top edge slope (tilts normal +Y -> G > 128)
      const gradTop = ctx.createLinearGradient(x, y, x, y + 6);
      gradTop.addColorStop(0, 'rgb(128, 195, 220)');
      gradTop.addColorStop(1, 'rgb(128, 128, 255)');
      ctx.fillStyle = gradTop;
      ctx.fillRect(x, y, w, 6);

      // Bottom edge slope (tilts normal -Y -> G < 128)
      const gradBottom = ctx.createLinearGradient(x, y + h - 6, x, y + h);
      gradBottom.addColorStop(0, 'rgb(128, 128, 255)');
      gradBottom.addColorStop(1, 'rgb(128, 60, 220)');
      ctx.fillStyle = gradBottom;
      ctx.fillRect(x, y + h - 6, w, 6);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.anisotropy = 8;
  return texture;
}

// 2048x2048 High-Resolution Polished White Carrara Marble Countertop Texture
// Matches the luminous white marble slab with delicate grey veins seen in media_1790527867438.png
export function createWhiteMarbleCounterTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');

  // Luminous crisp Carrara white ground
  ctx.fillStyle = '#faf9f6';
  ctx.fillRect(0, 0, 2048, 2048);

  // Soft cloudy micro-depth layers (crystalline translucency)
  for (let i = 0; i < 35; i++) {
    const rx = ((i * 197) % 2048);
    const ry = ((i * 311) % 2048);
    const rad = 150 + (i % 5) * 60;
    const grad = ctx.createRadialGradient(rx, ry, 20, rx, ry, rad);
    grad.addColorStop(0, 'rgba(238, 237, 233, 0.45)');
    grad.addColorStop(0.6, 'rgba(246, 245, 241, 0.20)');
    grad.addColorStop(1, 'rgba(250, 249, 246, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(rx, ry, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // Primary flowing smoke veins (multi-octave organic curves)
  const mainVeins = [
    { startX: 120, startY: 0, cp1x: 580, cp1y: 650, cp2x: 820, cp2y: 1250, endX: 1450, endY: 2048, width: 3.8, alpha: 0.32 },
    { startX: 1250, startY: 0, cp1x: 1050, cp1y: 750, cp2x: 1550, cp2y: 1350, endX: 1850, endY: 2048, width: 3.2, alpha: 0.26 },
    { startX: 0, startY: 820, cp1x: 620, cp1y: 950, cp2x: 1150, cp2y: 720, endX: 2048, endY: 1150, width: 2.8, alpha: 0.22 },
    { startX: 420, startY: 0, cp1x: 720, cp1y: 420, cp2x: 560, cp2y: 880, endX: 920, endY: 1200, width: 2.2, alpha: 0.20 },
    { startX: 850, startY: 1200, cp1x: 1250, cp1y: 1550, cp2x: 1450, cp2y: 1800, endX: 1950, endY: 2048, width: 2.5, alpha: 0.24 }
  ];

  mainVeins.forEach(v => {
    // Soft outer feather
    ctx.strokeStyle = `rgba(165, 172, 178, ${v.alpha * 0.4})`;
    ctx.lineWidth = v.width * 2.8;
    ctx.beginPath();
    ctx.moveTo(v.startX, v.startY);
    ctx.bezierCurveTo(v.cp1x, v.cp1y, v.cp2x, v.cp2y, v.endX, v.endY);
    ctx.stroke();

    // Defined core vein
    ctx.strokeStyle = `rgba(125, 132, 138, ${v.alpha})`;
    ctx.lineWidth = v.width;
    ctx.beginPath();
    ctx.moveTo(v.startX, v.startY);
    ctx.bezierCurveTo(v.cp1x, v.cp1y, v.cp2x, v.cp2y, v.endX, v.endY);
    ctx.stroke();

    // Hairline branch capillaries
    for (let b = 0; b < 4; b++) {
      const t = 0.2 + b * 0.22;
      const bx = (1 - t) * (1 - t) * v.startX + 2 * (1 - t) * t * v.cp1x + t * t * v.cp2x;
      const by = (1 - t) * (1 - t) * v.startY + 2 * (1 - t) * t * v.cp1y + t * t * v.cp2y;
      ctx.strokeStyle = `rgba(145, 150, 155, ${v.alpha * 0.5})`;
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.quadraticCurveTo(bx + 40 * (b % 2 === 0 ? 1 : -1), by + 30, bx + 90 * (b % 2 === 0 ? 1 : -1), by + 75);
      ctx.stroke();
    }
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.5, 1.5);
  texture.anisotropy = 8;
  return texture;
}

// Natural warm honey oak wood for display tower, open shelves, and cutting board (1024x1024 high-res)
export function createWarmOakTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Base warm golden honey oak tone
  ctx.fillStyle = '#b68750';
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle tonal wood plank variations
  const grad = ctx.createLinearGradient(0, 0, 0, 1024);
  grad.addColorStop(0.0, 'rgba(195, 148, 92, 0.4)');
  grad.addColorStop(0.3, 'rgba(170, 122, 70, 0.3)');
  grad.addColorStop(0.7, 'rgba(188, 140, 85, 0.35)');
  grad.addColorStop(1.0, 'rgba(162, 114, 64, 0.45)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Fine longitudinal wood grain fibers
  for (let y = 0; y < 1024; y += 2) {
    const wave = Math.sin(y * 0.08) * 1.5 + Math.sin(y * 0.02) * 3;
    const alpha = 0.06 + (Math.sin(y * 0.12) * 0.5 + 0.5) * 0.14 + (Math.random() - 0.5) * 0.05;
    ctx.fillStyle = `rgba(78, 48, 22, ${Math.max(0.02, alpha)})`;
    ctx.fillRect(0, y + wave, 1024, 1.2);
  }

  // Medullary rays (characteristic oak transverse flecks)
  for (let i = 0; i < 400; i++) {
    const rx = Math.random() * 1024;
    const ry = Math.random() * 1024;
    const rw = 12 + Math.random() * 35;
    ctx.fillStyle = 'rgba(215, 175, 120, 0.22)';
    ctx.fillRect(rx, ry, rw, 1.8);
  }

  // Cathedral grain arches and growth rings
  ctx.strokeStyle = 'rgba(72, 42, 18, 0.18)';
  ctx.lineWidth = 1.8;
  for (let c = 0; c < 5; c++) {
    const cy = 200 + c * 180;
    ctx.beginPath();
    ctx.ellipse(512 + (c % 2 === 0 ? 60 : -60), cy, 320, 110, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 2);
  texture.anisotropy = 8;
  return texture;
}

// High-Clarity Brushed Stainless Steel / Titanium Texture for 1-Door Refrigerator (1024x1024)
export function createBrushedFridgeTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Base metallic titanium steel tone (distinctly brighter & more reflective than matte black cabinetry)
  ctx.fillStyle = '#8e969f';
  ctx.fillRect(0, 0, 1024, 1024);

  // Vertical cylindrical specular light sweep across the door panel
  const grad = ctx.createLinearGradient(0, 0, 1024, 0);
  grad.addColorStop(0.0, 'rgba(100, 108, 118, 0.9)');
  grad.addColorStop(0.18, 'rgba(150, 158, 168, 0.7)');
  grad.addColorStop(0.38, 'rgba(215, 224, 235, 0.85)'); // bright specular highlight
  grad.addColorStop(0.55, 'rgba(175, 185, 195, 0.6)');
  grad.addColorStop(0.80, 'rgba(125, 133, 142, 0.75)');
  grad.addColorStop(1.0, 'rgba(95, 102, 110, 0.9)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Microscopic horizontal brushed metal hairline streaks
  for (let y = 0; y < 1024; y += 1) {
    const brightness = (Math.random() - 0.5) * 45;
    const alpha = 0.12 + Math.random() * 0.18;
    ctx.fillStyle = brightness > 0
      ? `rgba(255, 255, 255, ${alpha})`
      : `rgba(20, 25, 30, ${alpha * 0.8})`;
    ctx.fillRect(0, y, 1024, 1);
  }

  // Outer beveled perimeter shadow & highlight
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, 1012, 1012);

  ctx.strokeStyle = 'rgba(20, 25, 30, 0.5)';
  ctx.lineWidth = 4;
  ctx.strokeRect(12, 12, 1000, 1000);

  // Black Glass Integrated Digital Temperature Display at eye level (Y: 240 to 380)
  ctx.fillStyle = '#111316';
  ctx.fillRect(362, 260, 300, 110);
  ctx.strokeStyle = 'rgba(160, 175, 195, 0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(362, 260, 300, 110);

  // Glowing Ice-Blue Digital Readout
  ctx.fillStyle = '#00f0ff';
  ctx.font = 'bold 44px "Courier New", monospace';
  ctx.fillText('3 °C', 450, 320);

  ctx.font = '14px sans-serif';
  ctx.fillStyle = 'rgba(0, 240, 255, 0.75)';
  ctx.fillText('OPTIMAL FRESH • ECO MODE', 400, 350);

  // Brand Name Badge
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SIGNATURE', 512, 210);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 8;
  return texture;
}

// Architectural Tempered Canopy Glass Texture (Realistic micro-frit ceramic border & subtle tint)
export function createArchitecturalGlassTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Clear ultra-pure float glass base with faint sky-cyan sheen
  ctx.fillStyle = 'rgba(235, 246, 252, 0.45)';
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle diagonal reflection tint gradient
  const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
  grad.addColorStop(0, 'rgba(245, 252, 255, 0.25)');
  grad.addColorStop(0.45, 'rgba(220, 242, 250, 0.12)');
  grad.addColorStop(0.7, 'rgba(230, 246, 255, 0.28)');
  grad.addColorStop(1, 'rgba(215, 238, 248, 0.18)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Outer polished edge bevel border line
  ctx.strokeStyle = 'rgba(120, 195, 225, 0.65)';
  ctx.lineWidth = 14;
  ctx.strokeRect(10, 10, 1004, 1004);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, 984, 984);

  // Architectural Ceramic Safety Frit Pattern along perimeter (gradient dot matrix)
  // Modern solar canopy glass uses ceramic frit dots along edges to reduce glare and provide architectural definition
  const dotBands = 8;
  const margin = 28;
  const step = 9;

  for (let b = 0; b < dotBands; b++) {
    const inset = margin + b * step;
    const dotRadius = Math.max(0.8, 3.2 - b * 0.35);
    const alpha = Math.max(0.12, 0.75 - b * 0.08);
    ctx.fillStyle = `rgba(240, 250, 255, ${alpha})`;

    // Top & bottom rows
    for (let x = inset; x <= 1024 - inset; x += 18) {
      ctx.beginPath();
      ctx.arc(x, inset, dotRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, 1024 - inset, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Left & right rows
    for (let y = inset; y <= 1024 - inset; y += 18) {
      ctx.beginPath();
      ctx.arc(inset, y, dotRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(1024 - inset, y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Microscopic CAD tempered safety glass certification corner stamp
  ctx.fillStyle = 'rgba(160, 215, 238, 0.55)';
  ctx.font = 'bold 15px "Courier New", monospace';
  ctx.fillText('TEMPERED SAFETY GLASS • 10mm EN-12150', 44, 985);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Procedural Float-Glass Normal Map (Microscopic surface planarity & bevel edge refraction)
export function createGlassNormalMap() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Neutral normal map base: RGB(128, 128, 255) -> normal pointing straight +Z
  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle float-glass surface undulations (gentle cooling waves)
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;

  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 512; x++) {
      const idx = (y * 512 + x) * 4;

      // Gentle low-frequency float wave
      const waveX = Math.sin(x * 0.025 + Math.cos(y * 0.015)) * 6.0;
      const waveY = Math.cos(y * 0.025 + Math.sin(x * 0.015)) * 6.0;

      // Bevel edge normal distortion near borders
      let edgeDx = 0;
      let edgeDy = 0;
      const border = 16;
      if (x < border) edgeDx = -(border - x) * 1.8;
      if (x > 512 - border) edgeDx = (x - (512 - border)) * 1.8;
      if (y < border) edgeDy = -(border - y) * 1.8;
      if (y > 512 - border) edgeDy = (y - (512 - border)) * 1.8;

      data[idx] = Math.min(255, Math.max(0, 128 + waveX + edgeDx));     // Normal X
      data[idx + 1] = Math.min(255, Math.max(0, 128 + waveY + edgeDy)); // Normal Y
      data[idx + 2] = 255;                                               // Normal Z
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Procedural Glass Roughness Map (Micro-sheen & nano-polish distribution)
export function createGlassRoughnessMap() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Ultra-smooth specular float glass base (low roughness ~0.04 -> grayscale 10)
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, 256, 256);

  // Subtle nano-polish streaks
  for (let y = 0; y < 256; y += 4) {
    const val = 12 + Math.floor(Math.sin(y * 0.2) * 5);
    ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
    ctx.fillRect(0, y, 256, 2);
  }

  // Border silicone gasket contact zone (roughness ~0.35)
  ctx.strokeStyle = '#505050';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, 246, 246);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Textured Gray Cement Stucco Plaster for Boundary Walls (matching media_1790525894123.png)
export function createStuccoTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base raw concrete plaster tone
  ctx.fillStyle = '#7a7f85';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle trowel sweep texture
  for (let y = 0; y < 512; y += 8) {
    const shift = (Math.sin(y * 0.08) * 0.5 + 0.5) * 14 - 7;
    const r = Math.round(122 + shift);
    const g = Math.round(127 + shift);
    const b = Math.round(133 + shift);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.6)`;
    ctx.fillRect(0, y, 512, 8);
  }

  // Plaster grit & porosity
  for (let i = 0; i < 6000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const dark = Math.random() > 0.5;
    ctx.fillStyle = dark ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

// Handcrafted Undulating Beige Ceramic Tile Texture (1024x1024)
// Perfectly matching media_1790529799947.png:
// - 10x10 cm square tile grid in stack bond
// - Warm champagne / ivory / honey-beige natural variation
// - Handcrafted glaze pooling with organic edge irregularities
// - Fine tone-on-tone grout lines
export function createRoughBeigeCeramicTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Warm earthy clay-beige grout base
  ctx.fillStyle = '#9e8d77';
  ctx.fillRect(0, 0, 1024, 1024);

  // 8x8 square tile grid (each tile 128x128 px, matching 10x10cm handcrafted ceramic format)
  const gridSize = 8;
  const tileSize = 1024 / gridSize;
  const groutW = 2.5;

  // Authentic light limestone / travertine warm beige palette directly matching user reference photo media_1790531162667.png
  const palettes = [
    { r: 213, g: 200, b: 184 }, // Base Natural Beige (#d5c8b8)
    { r: 218, g: 207, b: 194 }, // Soft Creamy Limestone (#dacfc2)
    { r: 208, g: 194, b: 178 }, // Warm Sand Beige (#d0c2b2)
    { r: 223, g: 212, b: 199 }, // Warm Ivory Beige (#dfd4c7)
    { r: 204, g: 192, b: 175 }, // Natural Earth Stone (#ccc0af)
    { r: 215, g: 205, b: 191 }  // Warm Travertine (#d7cdbf)
  ];

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const x = c * tileSize + groutW;
      const y = r * tileSize + groutW;
      const w = tileSize - groutW * 2;
      const h = tileSize - groutW * 2;

      // Deterministic palette pick per tile
      const seed = Math.abs(Math.sin(r * 41 + c * 59));
      const pIdx = Math.floor(seed * palettes.length) % palettes.length;
      const baseCol = palettes[pIdx];

      // Subtle natural tone shift
      const shift = Math.sin(r * 17 + c * 29) * 4;
      const red = Math.min(255, Math.max(0, Math.round(baseCol.r + shift)));
      const green = Math.min(255, Math.max(0, Math.round(baseCol.g + shift * 0.95)));
      const blue = Math.min(255, Math.max(0, Math.round(baseCol.b + shift * 0.90)));

      ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
      ctx.fillRect(x, y, w, h);

      // Natural travertine stone mottling / cloudy variations
      for (let m = 0; m < 12; m++) {
        const mx = x + ((m * 37 + Math.floor(seed * 91)) % (w - 16));
        const my = y + ((m * 43 + Math.floor(seed * 67)) % (h - 16));
        const mr = 10 + (m % 5) * 4;
        const mAlpha = 0.04 + (m % 3) * 0.02;
        const isLighter = (m % 2 === 0);
        ctx.fillStyle = isLighter ? `rgba(245, 238, 226, ${mAlpha})` : `rgba(175, 158, 138, ${mAlpha})`;
        ctx.beginPath();
        ctx.arc(mx, my, mr, 0, Math.PI * 2);
        ctx.fill();
      }

      // Fine stone grain stippling
      ctx.fillStyle = 'rgba(140, 122, 102, 0.08)';
      for (let s = 0; s < 40; s++) {
        const sx = x + ((s * 29 + Math.floor(seed * 71)) % w);
        const sy = y + ((s * 31 + Math.floor(seed * 47)) % h);
        ctx.fillRect(sx, sy, 1.2, 1.2);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  texture.anisotropy = 8;
  return texture;
}

// Tangent-Space Normal Map for Handcrafted Undulating Zellige / Ceramic Tiles
// Creates the liquid-like wavy surface ripples and per-tile tilt seen reflecting under LED wash in media_1790529799947.png
export function createRoughBeigeCeramicNormalMap() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Flat normal vector: R=128 (X=0), G=128 (Y=0), B=255 (Z=1.0)
  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, 1024, 1024);

  const gridSize = 8;
  const tileSize = 1024 / gridSize;
  const groutW = 2.5;

  const imgData = ctx.getImageData(0, 0, 1024, 1024);
  const data = imgData.data;

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const startX = Math.round(c * tileSize + groutW);
      const startY = Math.round(r * tileSize + groutW);
      const endX = Math.round((c + 1) * tileSize - groutW);
      const endY = Math.round((r + 1) * tileSize - groutW);
      const w = endX - startX;
      const h = endY - startY;

      // Unique random tilt and wavy frequencies for each handcrafted tile
      const seed = Math.sin(r * 53 + c * 79);
      const tiltX = seed * 16; // Slight X-slope
      const tiltY = Math.cos(r * 37 + c * 61) * 16; // Slight Y-slope
      const waveFreqX = 0.08 + Math.abs(seed) * 0.06;
      const waveFreqY = 0.07 + Math.abs(Math.cos(r + c)) * 0.05;
      const wavePhaseX = seed * 10;
      const wavePhaseY = Math.cos(seed) * 10;

      for (let py = startY; py < endY; py++) {
        const ny = (py - startY) / h; // Normalized 0..1
        for (let px = startX; px < endX; px++) {
          const nx = (px - startX) / w; // Normalized 0..1

          // 1. Organic handcrafted rippled surface (sine waves simulating hand-rolled clay)
          const waveX = Math.sin(px * waveFreqX + wavePhaseX) * 18;
          const waveY = Math.cos(py * waveFreqY + wavePhaseY) * 18;

          // 2. Soft pillowed dome curvature (slight convex bulge in tile center)
          const domeX = (nx - 0.5) * -22;
          const domeY = (ny - 0.5) * -22;

          // 3. Bevel slope near tile edges dropping into grout
          let edgeBevelX = 0;
          let edgeBevelY = 0;
          const edgeDist = 6;
          if (px - startX < edgeDist) edgeBevelX = (edgeDist - (px - startX)) * 12;
          else if (endX - px < edgeDist) edgeBevelX = -((edgeDist - (endX - px)) * 12);
          if (py - startY < edgeDist) edgeBevelY = (edgeDist - (py - startY)) * 12;
          else if (endY - py < edgeDist) edgeBevelY = -((edgeDist - (endY - py)) * 12);

          // Combined normal vector perturbation
          const normX = Math.round(Math.min(255, Math.max(0, 128 + tiltX + waveX + domeX + edgeBevelX)));
          const normY = Math.round(Math.min(255, Math.max(0, 128 + tiltY + waveY + domeY + edgeBevelY)));
          // Z component keeps unit length
          const dx = (normX - 128) / 128;
          const dy = (normY - 128) / 128;
          const dz = Math.sqrt(Math.max(0, 1 - dx * dx - dy * dy));
          const normZ = Math.round(dz * 255);

          const idx = (py * 1024 + px) * 4;
          data[idx] = normX;
          data[idx + 1] = normY;
          data[idx + 2] = normZ;
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  texture.anisotropy = 8;
  return texture;
}

// Backward-compatibility export alias
export const createRoughBeigeCeramicBumpMap = createRoughBeigeCeramicNormalMap;




