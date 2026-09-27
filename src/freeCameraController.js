import * as THREE from 'three';

/**
 * FreeCameraController
 * Full 6-DOF / 3D Free Flying Camera without wall or height restrictions.
 * - WASD: Fly forward/backward along 3D view vector & strafe left/right
 * - Space / E / PageUp: Fly Up (+Y)
 * - C / Q / PageDown: Fly Down (-Y)
 * - Shift: Turbo Fly Speed
 * - ArrowLeft / ArrowRight: Rotate camera yaw smoothly
 * - Mouse Drag / Pointer Lock: 3D Pitch and Yaw rotation
 * - Mouse Wheel: Smooth dolly zoom forward/backward
 * - Mobile Touch: Joystick on bottom-left, Altitude buttons (Up/Down), Swipe anywhere to look
 * - Independent Dual-Touch: Simultaneous flying and turning without conflict
 */
export class FreeCameraController {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.enabled = false;

    // Movement speeds (m/s)
    this.normalSpeed = 7.5;
    this.turboSpeed = 18.0;
    this.slowSpeed = 3.0;

    // Keyboard movement state
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.moveUp = false;
    this.moveDown = false;
    this.turnLeft = false;
    this.turnRight = false;
    this.isTurbo = false;

    // Velocity & orientation
    this.velocity = new THREE.Vector3();
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
    this.mouseSensitivity = 0.0032;

    // Mouse drag state
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
    this.inputFlyY = 0; // -1 to +1 from touch altitude buttons
    this.joystickKnob = null;

    this.setupListeners();
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
      // Arrow keys turn left/right for easy steering while walking/flying
      if (code === 'ArrowLeft' || key === 'arrowleft') {
        this.turnLeft = true;
      }
      if (code === 'ArrowRight' || key === 'arrowright') {
        this.turnRight = true;
      }
      // Vertical ascent: Space, E, PageUp
      if (code === 'Space' || key === ' ' || code === 'KeyE' || key === 'e' || code === 'PageUp') {
        this.moveUp = true;
      }
      // Vertical descent: C, Q, PageDown
      if (code === 'KeyC' || key === 'c' || code === 'KeyQ' || key === 'q' || code === 'PageDown') {
        this.moveDown = true;
      }
      // Turbo flight speed
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
      if (code === 'Space' || key === ' ' || code === 'KeyE' || key === 'e' || code === 'PageUp') {
        this.moveUp = false;
      }
      if (code === 'KeyC' || key === 'c' || code === 'KeyQ' || key === 'q' || code === 'PageDown') {
        this.moveDown = false;
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
      this.moveUp = false;
      this.moveDown = false;
      this.turnLeft = false;
      this.turnRight = false;
      this.isTurbo = false;
      this.isMouseDown = false;
      this.touchLookId = null;
      this.touchMoveId = null;
      this.inputForward = 0;
      this.inputStrafe = 0;
      this.inputFlyY = 0;
      this.updateJoystickUI(0, 0);
    };

    // Mouse drag to look around
    this.onMouseDown = (e) => {
      if (!this.enabled) return;
      if (e.target.closest('#hud-toolbar') || e.target.closest('#minimap-wrapper') || e.target.closest('#room-teleport-bar') || e.target.closest('.plan-dialog') || e.target.closest('.touch-ctrl')) {
        return;
      }
      this.isMouseDown = true;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
      this.euler.setFromQuaternion(this.camera.quaternion);
    };

    this.onMouseMove = (e) => {
      if (!this.enabled) return;

      // Handle pointer lock or mouse button dragging
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

        this.euler.setFromQuaternion(this.camera.quaternion);
        this.euler.y -= deltaX * this.mouseSensitivity;
        this.euler.x -= deltaY * this.mouseSensitivity;
        // Clamp pitch to avoid inversion (+/- 87 degrees)
        this.euler.x = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, this.euler.x));
        this.camera.quaternion.setFromEuler(this.euler);
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
      const zoomSpeed = this.isTurbo ? 3.0 : 1.2;
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
    // Robust Mobile Multi-Touch Handlers (Simultaneous fly + turn)
    // ----------------------------------------------------
    this.onTouchStart = (e) => {
      if (!this.enabled) return;

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const target = touch.target;

        // Skip toolbar/dialog UI
        if (target.closest('#hud-toolbar') || target.closest('#minimap-wrapper') || target.closest('#room-teleport-bar') || target.closest('.plan-dialog') || target.closest('.turn-chip') || target.closest('.altitude-btn') || target.closest('.btn-primary') || target.closest('.btn-secondary')) {
          continue;
        }

        const isJoystick = !!target.closest('#virtual-joystick');

        if (isJoystick && this.touchMoveId === null) {
          // Dedicated touch for virtual joystick movement
          this.touchMoveId = touch.identifier;
          this.touchMoveOriginX = touch.clientX;
          this.touchMoveOriginY = touch.clientY;
          this.updateJoystickUI(0, 0);
        } else if (!isJoystick && this.touchLookId === null) {
          // Dedicated touch for swiping & looking around
          this.touchLookId = touch.identifier;
          this.touchLookPrevX = touch.clientX;
          this.touchLookPrevY = touch.clientY;
          this.euler.setFromQuaternion(this.camera.quaternion);
        }
      }
    };

    this.onTouchMove = (e) => {
      if (!this.enabled) return;

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];

        if (touch.identifier === this.touchLookId) {
          // Swipe to turn view in 3D
          const deltaX = touch.clientX - this.touchLookPrevX;
          const deltaY = touch.clientY - this.touchLookPrevY;
          this.touchLookPrevX = touch.clientX;
          this.touchLookPrevY = touch.clientY;

          this.euler.setFromQuaternion(this.camera.quaternion);
          this.euler.y -= deltaX * 0.0050;
          this.euler.x -= deltaY * 0.0040;
          this.euler.x = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, this.euler.x));
          this.camera.quaternion.setFromEuler(this.euler);
        } else if (touch.identifier === this.touchMoveId) {
          // Virtual joystick move
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
          this.inputForward = -knobY / maxRadius; // Upward drag flies forward
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
    this.euler.setFromQuaternion(this.camera.quaternion);
    this.euler.y += angleRadians;
    this.camera.quaternion.setFromEuler(this.euler);
  }

  setAltitudeInput(val) {
    this.inputFlyY = val;
  }

  enable() {
    this.enabled = true;
    this.resetInputs();
    this.euler.setFromQuaternion(this.camera.quaternion);
  }

  disable() {
    this.enabled = false;
    this.resetInputs();
  }

  setTarget(x, y, z) {
    // Point camera smoothly towards (x, y, z)
    this.camera.lookAt(x, y, z);
    this.euler.setFromQuaternion(this.camera.quaternion);
  }

  teleportTo(x, y, z, rotY = null, pitch = null) {
    this.camera.position.set(x, y, z);
    this.velocity.set(0, 0, 0);
    this.resetInputs();

    if (rotY !== null) {
      this.euler.setFromQuaternion(this.camera.quaternion);
      this.euler.y = rotY;
      if (pitch !== null) {
        this.euler.x = pitch;
      }
      this.camera.quaternion.setFromEuler(this.euler);
    }
  }

  getPosition() {
    return this.camera.position;
  }

  getYaw() {
    return this.euler.y;
  }

  update(delta) {
    if (!this.enabled) return;

    // Smooth keyboard turning (ArrowLeft / ArrowRight)
    if (this.turnLeft || this.turnRight) {
      const turnSpeed = 2.4; // rad/s
      const turnVal = Number(this.turnRight) - Number(this.turnLeft);
      this.euler.setFromQuaternion(this.camera.quaternion);
      this.euler.y -= turnVal * turnSpeed * delta;
      this.camera.quaternion.setFromEuler(this.euler);
    }

    const currentSpeed = this.isTurbo ? this.turboSpeed : this.normalSpeed;
    const damping = 9.0;

    // Velocity deceleration for cinematic gliding flight
    this.velocity.x -= this.velocity.x * damping * delta;
    this.velocity.y -= this.velocity.y * damping * delta;
    this.velocity.z -= this.velocity.z * damping * delta;

    // Translation directions
    let fwdVal = Number(this.moveForward) - Number(this.moveBackward);
    let sideVal = Number(this.moveRight) - Number(this.moveLeft);
    let upVal = Number(this.moveUp) - Number(this.moveDown);

    // Blend touch controls
    if (Math.abs(this.inputForward) > 0.05) fwdVal = this.inputForward;
    if (Math.abs(this.inputStrafe) > 0.05) sideVal = this.inputStrafe;
    if (Math.abs(this.inputFlyY) > 0.05) upVal = this.inputFlyY;

    // 3D forward vector from camera direction
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.normalize();

    // Horizontal right vector perpendicular to forward and world up
    const worldUp = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3();
    right.crossVectors(forward, worldUp).normalize();

    // Construct 3D move vector
    const moveVector = new THREE.Vector3();
    if (Math.abs(fwdVal) > 0.01) {
      moveVector.addScaledVector(forward, fwdVal);
    }
    if (Math.abs(sideVal) > 0.01) {
      moveVector.addScaledVector(right, sideVal);
    }
    if (Math.abs(upVal) > 0.01) {
      moveVector.addScaledVector(worldUp, upVal);
    }

    if (moveVector.lengthSq() > 0.0001) {
      if (moveVector.length() > 1.0) {
        moveVector.normalize();
      }
      this.velocity.addScaledVector(moveVector, currentSpeed * 12.0 * delta);
    }

    // Apply 3D position update (free fly with zero collision restriction)
    this.camera.position.addScaledVector(this.velocity, delta);

    // Keep camera slightly above terrain minimum (-1.0m to prevent falling into the void)
    if (this.camera.position.y < 0.2) {
      this.camera.position.y = 0.2;
      this.velocity.y = Math.max(0, this.velocity.y);
    }
  }

  dispose() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.resetInputs);
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
