import * as THREE from 'three';
import { DEFAULT_HOUSE_DATA, getHouseData } from './houseData.js';
import { buildHouse } from './houseBuilder.js';
import { FPSController } from './fpsController.js';
import { FreeCameraController } from './freeCameraController.js';
import { LightingSystem } from './lighting.js';
import { UIManager } from './ui.js';
import { audio } from './audio.js';

class App {
  constructor() {
    this.carportOnLeft = true;
    this.stripGardenSideWall = false;
    this.currentHouseData = getHouseData(this.carportOnLeft, this.stripGardenSideWall);
    this.mode = 'free'; // Default to Free Fly mode

    this.showDimensions = false; // Hidden by default
    this.roofVisible = true;
    this.muted = false;

    this.container = document.getElementById('canvas-container');
    this.initThree();
    this.lighting = new LightingSystem(this.scene);
    this.initHouse();
    this.initControllers();
    this.ui = new UIManager(this);

    // Initial free camera looking at the house from the front entrance
    this.camera.position.set(-1.5, 4.5, 12.0);
    this.freeCameraController.setTarget(0.0, 1.6, 0.0);
    this.freeCameraController.enable();
    this.ui.setModeUI('free');

    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2(-1000, -1000);
    this.screenPointer = { x: 0, y: 0 };
    this.hoveredItem = null;
    this.activeDimLabel = null;

    this.hoverDimensionGroup = new THREE.Group();
    this.hoverDimensionGroup.name = "hoverDimensionGroup";
    this.scene.add(this.hoverDimensionGroup);

    // Track mouse pointer for furniture hover inspection
    window.addEventListener('pointermove', (e) => {
      this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
      this.screenPointer = { x: e.clientX, y: e.clientY };
    });

    // Mobile touch support to inspect furniture on tap
    window.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) {
        const t = e.touches[0];
        this.pointer.x = (t.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = -(t.clientY / window.innerHeight) * 2 + 1;
        this.screenPointer = { x: t.clientX, y: t.clientY };
      }
    }, { passive: true });

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  initThree() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      400
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.container.appendChild(this.renderer.domElement);
  }

  initHouse() {
    if (this.houseResult && this.houseResult.houseGroup) {
      this.scene.remove(this.houseResult.houseGroup);
    }
    this.houseResult = buildHouse(this.scene, this.currentHouseData);
    this.houseResult.dimensionGroup.visible = this.showDimensions;
    if (this.houseResult.ceilingGroup) {
      this.houseResult.ceilingGroup.visible = this.roofVisible;
    }
  }

  initControllers() {
    this.fpsController = new FPSController(
      this.camera,
      this.renderer.domElement,
      this.houseResult.colliders,
      this.houseResult.rooms
    );

    this.fpsController.onStep = () => {
      if (!this.muted) {
        audio.playFootstep();
      }
    };

    this.freeCameraController = new FreeCameraController(
      this.camera,
      this.renderer.domElement
    );
  }

  setMode(newMode) {
    // Normalise mode
    if (newMode === 'dollhouse') newMode = 'free';
    if (this.mode === newMode) return;
    this.mode = newMode;

    if (newMode === 'walk') {
      this.freeCameraController.disable();
      if (this.houseResult.ceilingGroup) {
        this.houseResult.ceilingGroup.visible = this.roofVisible;
      }

      // Smooth transition: position player at current camera X, Z coordinates
      const camPos = this.camera.position;
      const curRoom = this.fpsController.getCurrentRoom();
      if (curRoom && curRoom.id !== 'outside') {
        this.fpsController.teleportTo(camPos.x, camPos.z);
      } else {
        const spawn = this.currentHouseData.playerSpawn;
        this.fpsController.teleportTo(spawn.x, spawn.z, spawn.rotY);
      }

      this.fpsController.enabled = true;
    } else if (newMode === 'free') {
      this.fpsController.enabled = false;
      this.fpsController.unlock();

      if (this.houseResult.ceilingGroup) {
        this.houseResult.ceilingGroup.visible = this.roofVisible;
      }
      this.freeCameraController.enable();
    }

    this.ui.setModeUI(newMode);
  }

  toggleMirror() {
    this.carportOnLeft = !this.carportOnLeft;
    this.currentHouseData = getHouseData(this.carportOnLeft, this.stripGardenSideWall);
    this.initHouse();
    this.initControllers();

    if (this.mode === 'free') {
      this.freeCameraController.enable();
    } else {
      const spawn = this.currentHouseData.playerSpawn;
      this.fpsController.teleportTo(spawn.x, spawn.z, spawn.rotY);
    }

    this.ui.updateAfterPlanReload();
    return this.carportOnLeft;
  }

  toggleGardenSideWall() {
    this.stripGardenSideWall = !this.stripGardenSideWall;
    this.currentHouseData = getHouseData(this.carportOnLeft, this.stripGardenSideWall);
    this.initHouse();
    this.initControllers();

    if (this.mode === 'free') {
      this.freeCameraController.enable();
    } else {
      const spawn = this.currentHouseData.playerSpawn;
      this.fpsController.teleportTo(spawn.x, spawn.z, spawn.rotY);
    }

    this.ui.updateAfterPlanReload();
    return this.stripGardenSideWall;
  }

  toggleRoof() {
    this.roofVisible = !this.roofVisible;
    if (this.houseResult && this.houseResult.ceilingGroup) {
      this.houseResult.ceilingGroup.visible = this.roofVisible;
    }
    return this.roofVisible;
  }

  setLighting(preset) {
    this.lighting.setPreset(preset);
    this.ui.setLightingUI(preset);
  }

  toggleDimensions() {
    this.showDimensions = !this.showDimensions;
    if (this.houseResult && this.houseResult.dimensionGroup) {
      this.houseResult.dimensionGroup.visible = this.showDimensions;
    }
    return this.showDimensions;
  }

  toggleSound() {
    this.muted = !this.muted;
    audio.muted = this.muted;
    return this.muted;
  }

  teleportToRoom(roomId) {
    const room = this.currentHouseData.rooms.find(r => r.id === roomId);
    if (!room) return;

    const b = room.bounds;
    const cx = (b.minX + b.maxX) / 2;
    const cz = (b.minZ + b.maxZ) / 2;

    if (this.mode === 'walk') {
      this.fpsController.teleportTo(cx, cz);
      audio.playDoorOpen();
      this.fpsController.lock();
    } else {
      // Free fly camera flies inside room at 1.8m height
      this.freeCameraController.teleportTo(cx, 1.85, cz + 0.8, 0, -0.15);
    }
  }

  teleportToCoords(x, z) {
    if (this.mode === 'walk') {
      this.fpsController.teleportTo(x, z);
      this.fpsController.lock();
    } else {
      this.freeCameraController.teleportTo(x, 3.2, z + 1.5, 0, -0.3);
    }
  }

  loadCustomHouse(data) {
    try {
      this.currentHouseData = data;
      this.initHouse();
      this.initControllers();
      this.ui.updateAfterPlanReload();
      return { success: true };
    } catch (err) {
      console.error("Failed to load house data", err);
      return { success: false, error: err.message };
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(this.animate);
    const delta = Math.min(this.clock.getDelta(), 0.1);

    if (this.mode === 'walk') {
      this.fpsController.update(delta);
    } else {
      this.freeCameraController.update(delta);
    }

    this.lighting.update(this.camera);
    this.updateHoverInspection();
    this.ui.update();

    this.renderer.render(this.scene, this.camera);
  }

  updateHoverInspection() {
    const interactables = (this.houseResult && (this.houseResult.interactables || (this.houseResult.kitchenGroup && this.houseResult.kitchenGroup.userData.interactables))) || [];
    if (!interactables || interactables.length === 0) {
      if (this.hoveredItem) {
        this.clear3DDimension();
        this.hoveredItem = null;
      }
      return;
    }

    const isPointerLocked = !!document.pointerLockElement;
    if (this.mode === 'walk' && isPointerLocked) {
      // Raycast from center crosshair in first-person pointer-locked view
      this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    } else {
      // Raycast from mouse pointer or touch position
      this.raycaster.setFromCamera(this.pointer, this.camera);
    }

    const intersects = this.raycaster.intersectObjects(interactables, false);
    if (intersects.length > 0 && intersects[0].distance < 14.0) {
      const hit = intersects[0].object;
      if (hit && hit.userData && hit.userData.dimInfo) {
        this.hoveredItem = hit;
        this.show3DDimension(hit.userData.dimInfo);
        return;
      }
    }

    if (this.hoveredItem) {
      this.clear3DDimension();
      this.hoveredItem = null;
    }
  }

  show3DDimension(dimInfo) {
    if (!dimInfo || !dimInfo.p1 || !dimInfo.p2) return;
    if (this.activeDimLabel === dimInfo.label) return; // Already displaying this line

    this.activeDimLabel = dimInfo.label;
    this.clear3DDimension();

    const p1 = new THREE.Vector3(...dimInfo.p1);
    const p2 = new THREE.Vector3(...dimInfo.p2);
    const axis = dimInfo.axis || 'x';

    // CAD dimension line: main line segment + perpendicular end ticks '|'
    const tickLen = 0.055;
    const points = [];

    // Main line connecting p1 and p2
    points.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);

    // End ticks '|'
    if (axis === 'x') {
      points.push(p1.x, p1.y, p1.z - tickLen, p1.x, p1.y, p1.z + tickLen);
      points.push(p2.x, p2.y, p2.z - tickLen, p2.x, p2.y, p2.z + tickLen);
    } else if (axis === 'z') {
      points.push(p1.x - tickLen, p1.y, p1.z, p1.x + tickLen, p1.y, p1.z);
      points.push(p2.x - tickLen, p2.y, p2.z, p2.x + tickLen, p2.y, p2.z);
    } else {
      points.push(p1.x - tickLen, p1.y, p1.z, p1.x + tickLen, p1.y, p1.z);
      points.push(p2.x - tickLen, p2.y, p2.z, p2.x + tickLen, p2.y, p2.z);
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      linewidth: 3,
      depthTest: false,
      transparent: true,
      opacity: 0.95
    });
    const lineMesh = new THREE.LineSegments(lineGeo, lineMat);
    lineMesh.renderOrder = 998;
    this.hoverDimensionGroup.add(lineMesh);

    // Crisp auto-sized dimension label sprite (never clips text)
    const measureCanvas = document.createElement('canvas');
    const mCtx = measureCanvas.getContext('2d');
    mCtx.font = 'bold 30px "JetBrains Mono", monospace';
    const textWidth = Math.ceil(mCtx.measureText(dimInfo.label).width);

    const canvas = document.createElement('canvas');
    const paddingX = 36;
    const canvasW = Math.max(180, textWidth + paddingX * 2);
    const canvasH = 84;
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext('2d');

    // Rounded dark pill container
    ctx.fillStyle = 'rgba(11, 15, 23, 0.94)';
    ctx.beginPath();
    ctx.roundRect(4, 4, canvasW - 8, canvasH - 8, 14);
    ctx.fill();

    // Vibrant cyan stroke
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Centered dimension label
    ctx.font = 'bold 30px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(dimInfo.label, canvasW / 2, canvasH / 2);

    const spriteTex = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({
      map: spriteTex,
      depthTest: false,
      transparent: true,
      opacity: 0.98
    });
    const sprite = new THREE.Sprite(spriteMat);
    const aspect = canvasW / canvasH;
    const spriteH = 0.15;
    sprite.scale.set(spriteH * aspect, spriteH, 1.0);
    sprite.renderOrder = 999;

    const mid = p1.clone().lerp(p2, 0.5);
    sprite.position.set(mid.x, mid.y + 0.05, mid.z);
    this.hoverDimensionGroup.add(sprite);
  }

  clear3DDimension() {
    this.activeDimLabel = null;
    while (this.hoverDimensionGroup.children.length > 0) {
      const child = this.hoverDimensionGroup.children[0];
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (child.material.map) child.material.map.dispose();
        child.material.dispose();
      }
      this.hoverDimensionGroup.remove(child);
    }
  }
}

// Bulletproof application startup
let appInstance = null;

function startApp() {
  if (!appInstance) {
    appInstance = new App();
    window.houseApp = appInstance;
    window.app = appInstance; // Also set window.app explicitly over the DOM element
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
