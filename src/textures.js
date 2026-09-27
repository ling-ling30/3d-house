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



