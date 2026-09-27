import * as THREE from 'three';

export class FPSController {
  constructor(camera, domElement, colliders, rooms) {
    this.camera = camera;
    this.domElement = domElement;
    this.colliders = colliders || [];
    this.rooms = rooms || [];
    this.enabled = true;

    // Movement state
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.turnLeft = false;
    this.turnRight = false;
    this.isSprinting = false;

    // Persistent orientation scalars (in radians) - eliminates gimbal lock
    this.yaw = 0;
    this.pitch = 0;
    this.mouseSensitivity = 0.0028;

    // Physics & speeds
    this.walkSpeed = 4.2; // m/s
    this.sprintSpeed = 6.8; // m/s
    this.velocity = new THREE.Vector3();
    this.playerRadius = 0.16; // slim clearance radius for smooth door passage without snagging
    this.eyeHeight = 1.65; // realistic standing eye level

    // Head bobbing
    this.bobTimer = 0;
    this.bobAmount = 0.035;
    this.bobSpeed = 10.0;

    // Footstep audio callback
    this.onStep = null;
    this.lastStepDist = 0;

    // Mouse drag-to-look / pointer lock state
    this.isMouseDown = false;
    this.prevMouseX = 0;
    this.prevMouseY = 0;
    this.isLocked = false;

    // Mobile Touch & Swipe control state (decoupled multi-touch)
    this.touchLookId = null;
    this.touchLookPrevX = 0;
    this.touchLookPrevY = 0;

    this.touchMoveId = null;
    this.touchMoveOriginX = 0;
    this.touchMoveOriginY = 0;
    this.inputForward = 0;
    this.inputStrafe = 0;
    this.joystickKnob = null;

    this.setupListeners();
    this.syncFromCamera();
  }

  applyOrientation() {
    this.camera.quaternion.setFromEuler(new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ'));
  }

  syncFromCamera() {
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    if (dir.lengthSq() > 0.0001) {
      dir.normalize();
      this.pitch = Math.asin(Math.max(-0.999, Math.min(0.999, dir.y)));
      this.yaw = Math.atan2(-dir.x, -dir.z);
      this.applyOrientation();
    }
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
      if (code === 'KeyA' || key === 'a') {
        this.moveLeft = true;
      }
      if (code === 'KeyD' || key === 'd') {
        this.moveRight = true;
      }
      if (code === 'ArrowLeft' || key === 'arrowleft' || code === 'KeyQ' || key === 'q') {
        this.turnLeft = true;
      }
      if (code === 'ArrowRight' || key === 'arrowright' || code === 'KeyE' || key === 'e') {
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
      if (code === 'KeyA' || key === 'a') {
        this.moveLeft = false;
      }
      if (code === 'KeyD' || key === 'd') {
        this.moveRight = false;
      }
      if (code === 'ArrowLeft' || key === 'arrowleft' || code === 'KeyQ' || key === 'q') {
        this.turnLeft = false;
      }
      if (code === 'ArrowRight' || key === 'arrowright' || code === 'KeyE' || key === 'e') {
        this.turnRight = false;
      }
      if (code === 'ShiftLeft' || code === 'ShiftRight' || key === 'shift') {
        this.isSprinting = false;
      }
    };

    this.resetInputs = () => {
      this.moveForward = false;
      this.moveBackward = false;
      this.moveLeft = false;
      this.moveRight = false;
      this.turnLeft = false;
      this.turnRight = false;
      this.isSprinting = false;
      this.isMouseDown = false;
      this.touchLookId = null;
      this.touchMoveId = null;
      this.inputForward = 0;
      this.inputStrafe = 0;
      this.updateJoystickUI(0, 0);
    };

    this.onBlur = () => {
      // Don't wipe inputs if we just engaged pointer lock on our canvas
      if (document.pointerLockElement === this.domElement) return;
      this.resetInputs();
    };

    this.onCanvasClick = (e) => {
      if (e.target.closest('#hud-toolbar') || e.target.closest('#minimap-wrapper') || e.target.closest('#room-teleport-bar') || e.target.closest('.plan-dialog') || e.target.closest('.touch-ctrl')) {
        return;
      }
      const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      if (this.enabled && !isTouch && !this.isLocked) {
        this.lock();
      }
    };

    this.onPointerLockChange = () => {
      this.isLocked = (document.pointerLockElement === this.domElement);
    };

    // Mouse drag-to-look (left-click, middle-click, or right-click)
    this.onMouseDown = (e) => {
      if (!this.enabled) return;
      if (e.target.closest('#hud-toolbar') || e.target.closest('#minimap-wrapper') || e.target.closest('#room-teleport-bar') || e.target.closest('.plan-dialog') || e.target.closest('.touch-ctrl')) {
        return;
      }
      this.isMouseDown = true;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
    };

    this.onMouseMove = (e) => {
      if (!this.enabled) return;

      const isDragging = this.isMouseDown || ((e.buttons & 1) || (e.buttons & 2) || (e.buttons & 4));
      if (this.isLocked || isDragging) {
        let deltaX = 0;
        let deltaY = 0;

        if (this.isLocked) {
          deltaX = e.movementX || 0;
          deltaY = e.movementY || 0;
        } else {
          deltaX = e.clientX - this.prevMouseX;
          deltaY = e.clientY - this.prevMouseY;
          this.prevMouseX = e.clientX;
          this.prevMouseY = e.clientY;
        }

        this.yaw -= deltaX * this.mouseSensitivity;
        this.pitch -= deltaY * this.mouseSensitivity;
        this.pitch = Math.max(-1.46, Math.min(1.46, this.pitch));
        this.applyOrientation();
      }
    };

    this.onMouseUp = () => {
      this.isMouseDown = false;
    };

    this.onContextMenu = (e) => {
      if (this.enabled) {
        e.preventDefault();
      }
    };

    // ----------------------------------------------------
    // Mobile Touch & Swipe Event Handlers (Dual-touch decoupled)
    // ----------------------------------------------------
    this.onTouchStart = (e) => {
      if (!this.enabled) return;

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const target = touch.target;

        if (target.closest('#hud-toolbar') || target.closest('#minimap-wrapper') || target.closest('#room-teleport-bar') || target.closest('.plan-dialog') || target.closest('.turn-chip') || target.closest('.btn-primary') || target.closest('.btn-secondary')) {
          continue;
        }

        const isJoystick = !!target.closest('#virtual-joystick');

        if (isJoystick && this.touchMoveId === null) {
          this.touchMoveId = touch.identifier;
          this.touchMoveOriginX = touch.clientX;
          this.touchMoveOriginY = touch.clientY;
          this.updateJoystickUI(0, 0);
        } else if (!isJoystick && this.touchLookId === null) {
          this.touchLookId = touch.identifier;
          this.touchLookPrevX = touch.clientX;
          this.touchLookPrevY = touch.clientY;
        }
      }
    };

    this.onTouchMove = (e) => {
      if (!this.enabled) return;

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];

        if (touch.identifier === this.touchLookId) {
          const deltaX = touch.clientX - this.touchLookPrevX;
          const deltaY = touch.clientY - this.touchLookPrevY;
          this.touchLookPrevX = touch.clientX;
          this.touchLookPrevY = touch.clientY;

          this.yaw -= deltaX * 0.0050;
          this.pitch -= deltaY * 0.0040;
          this.pitch = Math.max(-1.46, Math.min(1.46, this.pitch));
          this.applyOrientation();
        } else if (touch.identifier === this.touchMoveId) {
          const dx = touch.clientX - this.touchMoveOriginX;
          const dy = touch.clientY - this.touchMoveOriginY;
          const maxRadius = 45;
          const dist = Math.hypot(dx, dy);
          const clampedDist = Math.min(dist, maxRadius);
          const angle = Math.atan2(dy, dx);

          const knobX = Math.cos(angle) * clampedDist;
          const knobY = Math.sin(angle) * clampedDist;
          this.updateJoystickUI(knobX, knobY);

          this.inputStrafe = knobX / maxRadius;
          this.inputForward = -knobY / maxRadius;
        }
      }
    };

    this.onTouchEnd = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];

        if (touch.identifier === this.touchLookId) {
          this.touchLookId = null;
        } else if (touch.identifier === this.touchMoveId) {
          this.touchMoveId = null;
          this.inputForward = 0;
          this.inputStrafe = 0;
          this.updateJoystickUI(0, 0);
        }
      }
    };

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
    this.domElement.addEventListener('click', this.onCanvasClick);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    this.domElement.addEventListener('contextmenu', this.onContextMenu);
    window.addEventListener('contextmenu', this.onContextMenu);

    window.addEventListener('touchstart', this.onTouchStart, { passive: true });
    window.addEventListener('touchmove', this.onTouchMove, { passive: true });
    window.addEventListener('touchend', this.onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', this.onTouchEnd, { passive: true });
  }

  updateJoystickUI(knobX, knobY) {
    if (!this.joystickKnob) {
      this.joystickKnob = document.getElementById('joystick-knob');
    }
    if (this.joystickKnob) {
      this.joystickKnob.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;
    }
  }

  quickTurn(angleRadians) {
    this.yaw += angleRadians;
    this.applyOrientation();
  }

  lock() {
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (!isTouch) {
      try {
        this.domElement.requestPointerLock();
      } catch (err) {
        console.warn('PointerLock not available:', err);
      }
    }
  }

  unlock() {
    try {
      if (document.exitPointerLock && document.pointerLockElement === this.domElement) {
        document.exitPointerLock();
      }
    } catch {
      // safe fallback
    }
    this.isLocked = false;
  }

  teleportTo(x, z, rotY = null) {
    this.camera.position.set(x, this.eyeHeight, z);
    this.velocity.set(0, 0, 0);
    this.resetInputs();

    if (rotY !== null) {
      this.yaw = rotY;
      this.pitch = 0;
      this.applyOrientation();
    }
  }

  checkCollision(testPos) {
    const r = this.playerRadius;
    const pMin = new THREE.Vector3(testPos.x - r, 0.45, testPos.z - r);
    const pMax = new THREE.Vector3(testPos.x + r, this.eyeHeight + 0.1, testPos.z + r);
    const playerBox = new THREE.Box3(pMin, pMax);

    for (let i = 0; i < this.colliders.length; i++) {
      const box = this.colliders[i];
      if (box.max.y <= 0.45) continue;

      if (playerBox.intersectsBox(box)) {
        return true;
      }
    }
    return false;
  }

  getRoomAt(x, z) {
    if (!this.rooms) return { name: "House Grounds", id: "outside", area: "" };
    for (let r of this.rooms) {
      const b = r.bounds;
      if (b && x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ) {
        return r;
      }
    }
    return { name: "House Grounds", id: "outside", area: "" };
  }

  getCurrentRoom() {
    return this.getRoomAt(this.camera.position.x, this.camera.position.z);
  }

  getPosition() {
    return this.camera.position;
  }

  getYaw() {
    return this.yaw;
  }

  getPitch() {
    return this.pitch;
  }

  update(delta) {
    if (!this.enabled) {
      return;
    }

    // Smooth keyboard turning (Q and E keys, ArrowLeft / ArrowRight)
    if (this.turnLeft || this.turnRight) {
      const turnSpeed = 2.4; // rad/s
      const turnVal = Number(this.turnRight) - Number(this.turnLeft);
      this.yaw -= turnVal * turnSpeed * delta;
      this.applyOrientation();
    }

    const currentSpeed = this.isSprinting ? this.sprintSpeed : this.walkSpeed;

    // Direction calculation
    let fwdVal = Number(this.moveForward) - Number(this.moveBackward);
    let sideVal = Number(this.moveRight) - Number(this.moveLeft);

    // Blend touch joystick analog inputs
    if (Math.abs(this.inputForward) > 0.05) {
      fwdVal = this.inputForward;
    }
    if (Math.abs(this.inputStrafe) > 0.05) {
      sideVal = this.inputStrafe;
    }

    // Forward and Right vectors on horizontal XZ plane derived directly from scalar yaw
    // (Never NaN, completely invariant to looking up/down!)
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

    let moveVector = new THREE.Vector3();
    if (Math.abs(fwdVal) > 0.01) {
      moveVector.addScaledVector(forward, fwdVal);
    }
    if (Math.abs(sideVal) > 0.01) {
      moveVector.addScaledVector(right, sideVal);
    }

    if (moveVector.lengthSq() > 0.001) {
      if (moveVector.length() > 1.0) {
        moveVector.normalize();
      }
    }

    // Snappy responsive velocity: instantly steers with the camera direction without sluggish momentum lag
    const targetVelX = moveVector.x * currentSpeed;
    const targetVelZ = moveVector.z * currentSpeed;
    const responsiveness = 18.0;

    this.velocity.x += (targetVelX - this.velocity.x) * Math.min(1.0, responsiveness * delta);
    this.velocity.z += (targetVelZ - this.velocity.z) * Math.min(1.0, responsiveness * delta);

    // Wall-sliding collision check
    const curPos = this.camera.position;
    const isCurrentlyStuck = this.checkCollision(curPos);

    const targetX = curPos.x + this.velocity.x * delta;
    const targetZ = curPos.z + this.velocity.z * delta;

    // 1. Test X movement independently
    const testPosX = new THREE.Vector3(targetX, curPos.y, curPos.z);
    if (!this.checkCollision(testPosX) || isCurrentlyStuck) {
      curPos.x = targetX;
    } else {
      this.velocity.x = 0;
    }

    // 2. Test Z movement independently
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
    window.removeEventListener('blur', this.onBlur);
    this.domElement.removeEventListener('click', this.onCanvasClick);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    window.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    this.domElement.removeEventListener('contextmenu', this.onContextMenu);
    window.removeEventListener('contextmenu', this.onContextMenu);

    window.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onTouchEnd);
    window.removeEventListener('touchcancel', this.onTouchEnd);
  }
}
