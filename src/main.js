import * as THREE from 'three';
import { DEFAULT_HOUSE_DATA, getHouseData } from './houseData.js';
import { buildHouse } from './houseBuilder.js';
import { FPSController } from './fpsController.js';
import { DollhouseController } from './orbitController.js';
import { LightingSystem } from './lighting.js';
import { UIManager } from './ui.js';
import { audio } from './audio.js';

class App {
  constructor() {
    this.carportOnLeft = true;
    this.stripGardenSideWall = false;
    this.currentHouseData = getHouseData(this.carportOnLeft, this.stripGardenSideWall);
    this.mode = 'dollhouse'; // Default to 3D Dollhouse overview

    this.showDimensions = false; // Hidden by default
    this.muted = false;

    this.container = document.getElementById('canvas-container');
    this.initThree();
    this.lighting = new LightingSystem(this.scene);
    this.initHouse();
    this.initControllers();
    this.ui = new UIManager(this);

    // Initial dollhouse camera looking down into the house from front street
    this.camera.position.set(-1.5, 16.5, 15.5);
    this.dollhouseController.setTarget(0.0, 0.5, 0.0);
    this.dollhouseController.enable();
    this.houseResult.ceilingGroup.visible = false;
    this.ui.setModeUI('dollhouse');

    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2(-1000, -1000);
    this.screenPointer = { x: 0, y: 0 };
    this.hoveredItem = null;

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
    if (this.mode === 'dollhouse') {
      this.houseResult.ceilingGroup.visible = false;
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

    this.dollhouseController = new DollhouseController(
      this.camera,
      this.renderer.domElement
    );
  }

  setMode(newMode) {
    if (this.mode === newMode) return;
    this.mode = newMode;

    if (newMode === 'walk') {
      this.dollhouseController.disable();
      this.houseResult.ceilingGroup.visible = true;

      // Teleport player to current target or spawn
      const curRoom = this.fpsController.getCurrentRoom();
      if (curRoom && curRoom.bounds) {
        const cx = (curRoom.bounds.minX + curRoom.bounds.maxX) / 2;
        const cz = (curRoom.bounds.minZ + curRoom.bounds.maxZ) / 2;
        this.fpsController.teleportTo(cx, cz);
      } else {
        const spawn = this.currentHouseData.playerSpawn;
        this.fpsController.teleportTo(spawn.x, spawn.z, spawn.rotY);
      }

      this.fpsController.enabled = true;
    } else if (newMode === 'dollhouse') {
      this.fpsController.enabled = false;
      this.fpsController.unlock();

      // Lift camera up and look down at center of house (isometric perspective)
      this.houseResult.ceilingGroup.visible = false;
      this.camera.position.set(1.5, 16.5, 15.5);
      this.dollhouseController.setTarget(0.0, 0.5, 0.0);
      this.dollhouseController.enable();
    }

    this.ui.setModeUI(newMode);
  }

  toggleMirror() {
    this.carportOnLeft = !this.carportOnLeft;
    this.currentHouseData = getHouseData(this.carportOnLeft, this.stripGardenSideWall);
    this.initHouse();
    this.initControllers();

    if (this.mode === 'dollhouse') {
      this.houseResult.ceilingGroup.visible = false;
      this.camera.position.set(this.carportOnLeft ? -1.5 : 1.5, 16.5, 15.5);
      this.dollhouseController.setTarget(0.0, 0.5, 0.0);
      this.dollhouseController.enable();
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

    if (this.mode === 'dollhouse') {
      this.houseResult.ceilingGroup.visible = false;
      this.dollhouseController.enable();
    } else {
      const spawn = this.currentHouseData.playerSpawn;
      this.fpsController.teleportTo(spawn.x, spawn.z, spawn.rotY);
    }

    this.ui.updateAfterPlanReload();
    return this.stripGardenSideWall;
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
      this.dollhouseController.setTarget(cx, 0.5, cz);
    }
  }

  teleportToCoords(x, z) {
    if (this.mode === 'walk') {
      this.fpsController.teleportTo(x, z);
      this.fpsController.lock();
    } else {
      this.dollhouseController.setTarget(x, 0.5, z);
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
    } else if (this.mode === 'dollhouse') {
      this.dollhouseController.update();
    }

    this.lighting.update(this.camera);
    this.updateHoverInspection();
    this.ui.update();

    this.renderer.render(this.scene, this.camera);
  }

  updateHoverInspection() {
    const interactables = (this.houseResult && this.houseResult.kitchenGroup && this.houseResult.kitchenGroup.userData.interactables) || [];
    if (!interactables || interactables.length === 0) {
      if (this.hoveredItem) {
        this.ui.hideFurnitureTooltip();
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
      if (hit && hit.userData && hit.userData.kitchenItem) {
        this.hoveredItem = hit;
        this.ui.showFurnitureTooltip(
          hit.userData.kitchenItem,
          this.screenPointer,
          this.mode === 'walk' && isPointerLocked
        );
        return;
      }
    }

    if (this.hoveredItem) {
      this.ui.hideFurnitureTooltip();
      this.hoveredItem = null;
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
