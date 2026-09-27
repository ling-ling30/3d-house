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

// Warm glazed beige square ceramic tiles for kitchen backsplash
export function createGlazedBeigeTileTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base grout color
  ctx.fillStyle = '#b8ad9c';
  ctx.fillRect(0, 0, 512, 512);

  // 4x4 square glazed ceramic tiles (128x128 per tile)
  const tileSize = 64; // 8x8 grid of square tiles
  for (let x = 0; x < 512; x += tileSize) {
    for (let y = 0; y < 512; y += tileSize) {
      // Natural handmade glaze variation
      const hueShift = (Math.sin(x * 0.1 + y * 0.2) * 0.5 + 0.5) * 8 - 4;
      const r = Math.round(232 + hueShift);
      const g = Math.round(222 + hueShift * 0.9);
      const b = Math.round(204 + hueShift * 0.7);

      // Tile face
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);

      // Soft glazed surface gradient highlight
      const grad = ctx.createLinearGradient(x, y, x + tileSize, y + tileSize);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.08)');
      ctx.fillStyle = grad;
      ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);

      // Delicate edge cushion bevel
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 2.5, y + 2.5, tileSize - 5, tileSize - 5);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 2);
  return texture;
}

// Polished white marble / granite countertop with fine grey veining
export function createWhiteMarbleCounterTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Base luminous crisp white
  ctx.fillStyle = '#faf9f6';
  ctx.fillRect(0, 0, 1024, 1024);

  // Soft subtle cloudy depth
  for (let i = 0; i < 20; i++) {
    const rx = Math.random() * 1024;
    const ry = Math.random() * 1024;
    const rad = 100 + Math.random() * 200;
    const grad = ctx.createRadialGradient(rx, ry, 10, rx, ry, rad);
    grad.addColorStop(0, 'rgba(235, 235, 232, 0.4)');
    grad.addColorStop(1, 'rgba(250, 249, 246, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(rx, ry, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // Elegant flowing grey smoke veins
  const veins = [
    { startX: 50, startY: 0, cp1x: 280, cp1y: 350, cp2x: 420, cp2y: 650, endX: 750, endY: 1024, width: 2.2, alpha: 0.28 },
    { startX: 620, startY: 0, cp1x: 520, cp1y: 400, cp2x: 780, cp2y: 720, endX: 920, endY: 1024, width: 1.8, alpha: 0.22 },
    { startX: 0, startY: 420, cp1x: 310, cp1y: 490, cp2x: 580, cp2y: 380, endX: 1024, endY: 580, width: 1.5, alpha: 0.18 },
    { startX: 200, startY: 0, cp1x: 350, cp1y: 200, cp2x: 280, cp2y: 450, endX: 450, endY: 600, width: 1.0, alpha: 0.15 }
  ];

  veins.forEach(v => {
    ctx.strokeStyle = `rgba(135, 142, 148, ${v.alpha})`;
    ctx.lineWidth = v.width;
    ctx.beginPath();
    ctx.moveTo(v.startX, v.startY);
    ctx.bezierCurveTo(v.cp1x, v.cp1y, v.cp2x, v.cp2y, v.endX, v.endY);
    ctx.stroke();

    // Secondary hairline feathering
    ctx.strokeStyle = `rgba(165, 170, 175, ${v.alpha * 0.6})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(v.startX + 8, v.startY + 4);
    ctx.bezierCurveTo(v.cp1x + 12, v.cp1y - 8, v.cp2x - 10, v.cp2y + 15, v.endX + 6, v.endY);
    ctx.stroke();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

// Natural warm honey oak wood for display tower and open shelves
export function createWarmOakTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Warm honey golden oak tone
  ctx.fillStyle = '#bf9159';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle grain lines
  for (let y = 0; y < 512; y += 3) {
    const darkness = Math.sin(y * 0.15) * 0.08 + (Math.random() - 0.5) * 0.04;
    ctx.fillStyle = `rgba(85, 52, 22, ${Math.max(0, 0.1 + darkness)})`;
    ctx.fillRect(0, y, 512, 1.5);
  }

  // Cathedral grain swirls
  ctx.strokeStyle = 'rgba(75, 45, 18, 0.18)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(256, 180, 160, 80, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(256, 360, 190, 90, 0, 0, Math.PI * 2);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 2);
  return texture;
}

