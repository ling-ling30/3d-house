import * as THREE from 'three';

/**
 * FreeCameraController
 * Natural Look-Direction 3D Flight Camera:
 * - Aim where you want to go with Mouse or Mobile Swipe (Yaw & Pitch)
 * - W / S: Fly in or out along the 3D look vector (looking up flies UP, looking down flies DOWN)
 * - A / D: Strafe horizontally left / right
 * - ArrowLeft / ArrowRight: Rotate yaw smoothly
 * - Shift: Turbo Flight Speed
 * - Desktop: Click to lock pointer (move mouse to aim, Esc to release) or Drag to aim
 * - Mobile: Virtual joystick to fly forward/strafe, swipe anywhere to look around
 * - Zero altitude keys or buttons required: pure natural flight navigation
 */
export class FreeCameraController {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.enabled = false;

    // Speeds (m/s)
    this.normalSpeed = 7.5;
    this.turboSpeed = 18.0;

    // Movement state
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.turnLeft = false;
    this.turnRight = false;
    this.isTurbo = false;

    // Persistent orientation scalars (in radians) - eliminates gimbal lock
    this.yaw = 0;
    this.pitch = 0;
    this.mouseSensitivity = 0.0028;

    // Velocity & deceleration
    this.velocity = new THREE.Vector3();

    // Mouse state
    this.isMouseDown = false;
    this.prevMouseX = 0;
    this.prevMouseY = 0;
    this.isLocked = false;

    // Mobile touch state (multi-touch decoupled)
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
    this.onKeyDown = (e) => {
      if (!this.enabled) return;
      const code = e.code;
      const key = e.key ? e.key.toLowerCase() : '';

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
      if (code === 'ArrowLeft' || key === 'arrowleft') {
        this.turnLeft = true;
      }
      if (code === 'ArrowRight' || key === 'arrowright') {
        this.turnRight = true;
      }
      if (code === 'ShiftLeft' || code === 'ShiftRight' || key === 'shift') {
        this.isTurbo = true;
      }
    };

    this.onKeyUp = (e) => {
      const code = e.code;
      const key = e.key ? e.key.toLowerCase() : '';

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
      if (code === 'ArrowLeft' || key === 'arrowleft') {
        this.turnLeft = false;
      }
      if (code === 'ArrowRight' || key === 'arrowright') {
        this.turnRight = false;
      }
      if (code === 'ShiftLeft' || code === 'ShiftRight' || key === 'shift') {
        this.isTurbo = false;
      }
    };

    this.resetInputs = () => {
      this.moveForward = false;
      this.moveBackward = false;
      this.moveLeft = false;
      this.moveRight = false;
      this.turnLeft = false;
      this.turnRight = false;
      this.isTurbo = false;
      this.isMouseDown = false;
      this.touchLookId = null;
      this.touchMoveId = null;
      this.inputForward = 0;
      this.inputStrafe = 0;
      this.updateJoystickUI(0, 0);
    };

    // Canvas click locks pointer for instant mouse look
    this.onCanvasClick = (e) => {
      if (!this.enabled) return;
      if (e.target.closest('#hud-toolbar') || e.target.closest('#minimap-wrapper') || e.target.closest('#room-teleport-bar') || e.target.closest('.plan-dialog') || e.target.closest('.touch-ctrl')) {
        return;
      }
      const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      if (!isTouch && !this.isLocked) {
        this.lock();
      }
    };

    this.onPointerLockChange = () => {
      this.isLocked = (document.pointerLockElement === this.domElement);
    };

    // Mouse drag-to-look (fallback or when pointer isn't locked)
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

      const isDragging = this.isMouseDown || ((e.buttons & 1) || (e.buttons & 2));
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
        // Clamp pitch to avoid flip (+/- 87.5 degrees)
        this.pitch = Math.max(-1.52, Math.min(1.52, this.pitch));
        this.applyOrientation();
      }
    };

    this.onMouseUp = () => {
      this.isMouseDown = false;
    };

    // Mouse wheel dolly (smooth zoom along camera look direction)
    this.onWheel = (e) => {
      if (!this.enabled) return;
      const fwd = new THREE.Vector3();
      this.camera.getWorldDirection(fwd);
      const zoomSpeed = this.isTurbo ? 2.5 : 1.2;
      const amount = (e.deltaY < 0 ? 1 : -1) * zoomSpeed;
      this.camera.position.addScaledVector(fwd, amount);
    };

    // Prevent context menu from popping up when right-clicking to look
    this.onContextMenu = (e) => {
      if (this.enabled) {
        e.preventDefault();
      }
    };

    // ----------------------------------------------------
    // Robust Mobile Multi-Touch Handlers (Dual-touch decoupled)
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

          this.yaw -= deltaX * 0.0048;
          this.pitch -= deltaY * 0.0038;
          this.pitch = Math.max(-1.52, Math.min(1.52, this.pitch));
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
          this.inputForward = -knobY / maxRadius; // Upward drag flies forward along 3D look
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
    window.addEventListener('blur', this.resetInputs);
    this.domElement.addEventListener('click', this.onCanvasClick);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    this.domElement.addEventListener('wheel', this.onWheel, { passive: true });
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

  enable() {
    this.enabled = true;
    this.resetInputs();
    this.syncFromCamera();
  }

  disable() {
    this.enabled = false;
    this.unlock();
    this.resetInputs();
  }

  setTarget(x, y, z) {
    const dir = new THREE.Vector3(x, y, z).sub(this.camera.position);
    if (dir.lengthSq() > 0.0001) {
      dir.normalize();
      this.pitch = Math.asin(Math.max(-0.999, Math.min(0.999, dir.y)));
      this.yaw = Math.atan2(-dir.x, -dir.z);
      this.applyOrientation();
    }
  }

  teleportTo(x, y, z, yaw = null, pitch = null) {
    this.camera.position.set(x, y, z);
    this.velocity.set(0, 0, 0);
    this.resetInputs();

    if (yaw !== null) this.yaw = yaw;
    if (pitch !== null) this.pitch = Math.max(-1.52, Math.min(1.52, pitch));
    this.applyOrientation();
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
    if (!this.enabled) return;

    // Smooth keyboard turning (ArrowLeft / ArrowRight)
    if (this.turnLeft || this.turnRight) {
      const turnSpeed = 2.4; // rad/s
      const turnVal = Number(this.turnRight) - Number(this.turnLeft);
      this.yaw -= turnVal * turnSpeed * delta;
      this.applyOrientation();
    }

    const currentSpeed = this.isTurbo ? this.turboSpeed : this.normalSpeed;
    const damping = 9.0;

    // Deceleration
    this.velocity.x -= this.velocity.x * damping * delta;
    this.velocity.y -= this.velocity.y * damping * delta;
    this.velocity.z -= this.velocity.z * damping * delta;

    // Translation directions
    let fwdVal = Number(this.moveForward) - Number(this.moveBackward);
    let sideVal = Number(this.moveRight) - Number(this.moveLeft);

    // Blend touch joystick analog inputs
    if (Math.abs(this.inputForward) > 0.05) fwdVal = this.inputForward;
    if (Math.abs(this.inputStrafe) > 0.05) sideVal = this.inputStrafe;

    // 3D forward vector directly from camera line of sight (pitch + yaw included!)
    // When looking UP, forward.y is POSITIVE -> camera flies UP into the sky!
    // When looking DOWN, forward.y is NEGATIVE -> camera flies DOWN towards target!
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.normalize();

    // Horizontal strafe vector (perpendicular to horizontal heading)
    const right = new THREE.Vector3(
      -Math.sin(this.yaw - Math.PI / 2),
      0,
      -Math.cos(this.yaw - Math.PI / 2)
    ).normalize();

    // Construct 3D movement vector
    const moveVector = new THREE.Vector3();
    if (Math.abs(fwdVal) > 0.01) {
      moveVector.addScaledVector(forward, fwdVal);
    }
    if (Math.abs(sideVal) > 0.01) {
      moveVector.addScaledVector(right, sideVal);
    }

    if (moveVector.lengthSq() > 0.0001) {
      if (moveVector.length() > 1.0) {
        moveVector.normalize();
      }
      this.velocity.addScaledVector(moveVector, currentSpeed * 14.0 * delta);
    }

    // Apply 3D position update
    this.camera.position.addScaledVector(this.velocity, delta);

    // Keep camera slightly above terrain floor (0.2m)
    if (this.camera.position.y < 0.2) {
      this.camera.position.y = 0.2;
      this.velocity.y = Math.max(0, this.velocity.y);
    }
  }

  dispose() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.resetInputs);
    this.domElement.removeEventListener('click', this.onCanvasClick);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    window.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    this.domElement.removeEventListener('wheel', this.onWheel);
    this.domElement.removeEventListener('contextmenu', this.onContextMenu);
    window.removeEventListener('contextmenu', this.onContextMenu);

    window.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onTouchEnd);
    window.removeEventListener('touchcancel', this.onTouchEnd);
  }
}
