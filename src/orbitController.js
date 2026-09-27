import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class DollhouseController {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    this.controls = new OrbitControls(camera, domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below ground
    this.controls.minDistance = 6.0;
    this.controls.maxDistance = 45.0;
    this.controls.target.set(-1.0, 0.5, -1.0); // Center of house

    this.enabled = false;
    this.controls.enabled = false;
  }

  enable() {
    this.enabled = true;
    this.controls.enabled = true;
    this.controls.update();
  }

  disable() {
    this.enabled = false;
    this.controls.enabled = false;
  }

  setTarget(x, y, z) {
    this.controls.target.set(x, y, z);
    this.controls.update();
  }

  update() {
    if (this.enabled) {
      this.controls.update();
    }
  }

  dispose() {
    this.controls.dispose();
  }
}
