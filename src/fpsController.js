import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

export class FPSController {
  constructor(camera, domElement, colliders, rooms) {
    this.camera = camera;
    this.domElement = domElement;
    this.colliders = colliders || [];
    this.rooms = rooms || [];

    this.controls = new PointerLockControls(camera, domElement);
    this.enabled = true;

    // Movement state
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.turnLeft = false;
    this.turnRight = false;
    this.isSprinting = false;

    // Physics & speeds
    this.walkSpeed = 4.0; // m/s
    this.sprintSpeed = 6.5; // m/s
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.playerRadius = 0.24; // slim clearance radius for easy door passage
    this.eyeHeight = 1.65; // realistic standing eye level

    // Head bobbing
    this.bobTimer = 0;
    this.bobAmount = 0.035;
    this.bobSpeed = 10.0;

    // Footstep audio callback
    this.onStep = null;
    this.lastStepDist = 0;

    // Drag-to-look when pointer is not locked
    this.isMouseDown = false;
    this.prevMouseX = 0;
    this.prevMouseY = 0;
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');

    this.setupListeners();
  }

  setupListeners() {
    this.onKeyDown = (event) => {
      if (!this.enabled) return;
      const code = event.code;
      const key = event.key ? event.key.toLowerCase() : '';

      if (code === 'KeyW' || key === 'w' || code === 'ArrowUp' || key === 'arrowup') {
        this.moveForward = true;
      }
      if (code === 'KeyS' || key === 's' || code === 'ArrowDown' || key === 'arrowdown') {
        this.moveBackward = true;
      }
      if (code === 'KeyA' || key === 'a' || code === 'ArrowLeft' || key === 'arrowleft') {
        this.moveLeft = true;
      }
      if (code === 'KeyD' || key === 'd' || code === 'ArrowRight' || key === 'arrowright') {
        this.moveRight = true;
      }
      if (code === 'KeyQ' || key === 'q') {
        this.turnLeft = true;
      }
      if (code === 'KeyE' || key === 'e') {
        this.turnRight = true;
      }
      if (code === 'ShiftLeft' || code === 'ShiftRight' || key === 'shift') {
        this.isSprinting = true;
      }
    };

    this.onKeyUp = (event) => {
      const code = event.code;
      const key = event.key ? event.key.toLowerCase() : '';

      if (code === 'KeyW' || key === 'w' || code === 'ArrowUp' || key === 'arrowup') {
        this.moveForward = false;
      }
      if (code === 'KeyS' || key === 's' || code === 'ArrowDown' || key === 'arrowdown') {
        this.moveBackward = false;
      }
      if (code === 'KeyA' || key === 'a' || code === 'ArrowLeft' || key === 'arrowleft') {
        this.moveLeft = false;
      }
      if (code === 'KeyD' || key === 'd' || code === 'ArrowRight' || key === 'arrowright') {
        this.moveRight = false;
      }
      if (code === 'KeyQ' || key === 'q') {
        this.turnLeft = false;
      }
      if (code === 'KeyE' || key === 'e') {
        this.turnRight = false;
      }
      if (code === 'ShiftLeft' || code === 'ShiftRight' || key === 'shift') {
        this.isSprinting = false;
      }
    };

    // Canvas click to lock
    this.onCanvasClick = (e) => {
      // Don't lock if clicking on UI buttons or overlays
      if (e.target.closest('#hud-toolbar') || e.target.closest('#minimap-wrapper') || e.target.closest('#room-teleport-bar') || e.target.closest('.plan-dialog') || e.target.closest('#touch-dpad')) {
        return;
      }
      if (this.enabled && !this.controls.isLocked) {
        this.lock();
      }
    };

    // Drag-to-look fallback
    this.onMouseDown = (e) => {
      if (e.target.closest('#hud-toolbar') || e.target.closest('#minimap-wrapper') || e.target.closest('#room-teleport-bar') || e.target.closest('.plan-dialog') || e.target.closest('#touch-dpad')) {
        return;
      }
      this.isMouseDown = true;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
    };

    this.onMouseMove = (e) => {
      if (!this.enabled) return;
      if (!this.controls.isLocked && this.isMouseDown) {
        const deltaX = e.clientX - this.prevMouseX;
        const deltaY = e.clientY - this.prevMouseY;
        this.prevMouseX = e.clientX;
        this.prevMouseY = e.clientY;

        this.euler.setFromQuaternion(this.camera.quaternion);
        this.euler.y -= deltaX * 0.003;
        this.euler.x -= deltaY * 0.003;
        this.euler.x = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, this.euler.x));
        this.camera.quaternion.setFromEuler(this.euler);
      }
    };

    this.onMouseUp = () => {
      this.isMouseDown = false;
    };

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    this.domElement.addEventListener('click', this.onCanvasClick);
    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
  }

  lock() {
    this.controls.lock();
  }

  unlock() {
    this.controls.unlock();
  }

  isLocked() {
    return this.controls.isLocked;
  }

  teleportTo(x, z, rotY = null) {
    this.camera.position.set(x, this.eyeHeight, z);
    this.velocity.set(0, 0, 0);
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;

    if (rotY !== null) {
      this.camera.rotation.set(0, rotY, 0);
    }
  }

  checkCollision(testPos) {
    const r = this.playerRadius;
    // Bounding cylinder check: only check vertical collision between 0.45m and eye level
    // This allows stepping over small floor thresholds and stepping stones without snagging
    const pMin = new THREE.Vector3(testPos.x - r, 0.45, testPos.z - r);
    const pMax = new THREE.Vector3(testPos.x + r, this.eyeHeight + 0.1, testPos.z + r);
    const playerBox = new THREE.Box3(pMin, pMax);

    for (let i = 0; i < this.colliders.length; i++) {
      const box = this.colliders[i];
      // Ignore colliders lower than knee height (e.g. floor borders, rugs, stones)
      if (box.max.y <= 0.45) continue;

      if (playerBox.intersectsBox(box)) {
        return true;
      }
    }
    return false;
  }

  getCurrentRoom() {
    const x = this.camera.position.x;
    const z = this.camera.position.z;

    for (let r of this.rooms) {
      const b = r.bounds;
      if (x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ) {
        return r;
      }
    }
    return { name: "House Grounds", id: "outside", area: "" };
  }

  getPosition() {
    return this.camera.position;
  }

  getYaw() {
    return this.camera.rotation.y;
  }

  update(delta) {
    if (!this.enabled) {
      return;
    }

    // Smooth keyboard turning (Q and E keys)
    if (this.turnLeft || this.turnRight) {
      const turnSpeed = 2.2; // rad/s
      const turnVal = Number(this.turnRight) - Number(this.turnLeft);
      this.euler.setFromQuaternion(this.camera.quaternion);
      this.euler.y -= turnVal * turnSpeed * delta;
      this.camera.quaternion.setFromEuler(this.euler);
    }

    const currentSpeed = this.isSprinting ? this.sprintSpeed : this.walkSpeed;
    const damping = 10.0;

    // Deceleration
    this.velocity.x -= this.velocity.x * damping * delta;
    this.velocity.z -= this.velocity.z * damping * delta;

    // Direction calculation
    const fwdVal = Number(this.moveForward) - Number(this.moveBackward);
    const sideVal = Number(this.moveRight) - Number(this.moveLeft);

    // Forward direction on horizontal XZ plane
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    // Right direction on horizontal XZ plane
    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    const moveVector = new THREE.Vector3();
    if (fwdVal !== 0) {
      moveVector.addScaledVector(forward, fwdVal);
    }
    if (sideVal !== 0) {
      moveVector.addScaledVector(right, sideVal);
    }

    if (moveVector.lengthSq() > 0.001) {
      moveVector.normalize();
      this.velocity.x += moveVector.x * currentSpeed * 12.0 * delta;
      this.velocity.z += moveVector.z * currentSpeed * 12.0 * delta;
    }

    // Attempt movement with wall-sliding collision & stuck recovery
    const curPos = this.camera.position;
    const isCurrentlyStuck = this.checkCollision(curPos);

    const targetX = curPos.x + this.velocity.x * delta;
    const targetZ = curPos.z + this.velocity.z * delta;

    // 1. Test X movement
    const testPosX = new THREE.Vector3(targetX, curPos.y, curPos.z);
    if (!this.checkCollision(testPosX) || isCurrentlyStuck) {
      curPos.x = targetX;
    } else {
      this.velocity.x = 0;
    }

    // 2. Test Z movement
    const testPosZ = new THREE.Vector3(curPos.x, curPos.y, targetZ);
    if (!this.checkCollision(testPosZ) || isCurrentlyStuck) {
      curPos.z = targetZ;
    } else {
      this.velocity.z = 0;
    }

    // Head bobbing & footsteps
    const speedMagnitude = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z);
    if (speedMagnitude > 0.4) {
      this.bobTimer += delta * (this.isSprinting ? this.bobSpeed * 1.4 : this.bobSpeed);
      const bobY = Math.sin(this.bobTimer) * this.bobAmount;
      this.camera.position.y = this.eyeHeight + bobY;

      this.lastStepDist += speedMagnitude * delta;
      if (this.lastStepDist > (this.isSprinting ? 1.8 : 1.3)) {
        this.lastStepDist = 0;
        if (this.onStep) this.onStep();
      }
    } else {
      this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, this.eyeHeight, delta * 8.0);
      this.bobTimer = 0;
    }
  }

  dispose() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.domElement.removeEventListener('click', this.onCanvasClick);
    window.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    this.controls.dispose();
  }
}
