import * as THREE from 'three';

export class LightingSystem {
  constructor(scene) {
    this.scene = scene;

    // Ambient / Hemisphere light
    this.hemiLight = new THREE.HemisphereLight(0xddeeff, 0x334433, 0.7);
    this.hemiLight.position.set(0, 50, 0);
    this.scene.add(this.hemiLight);

    // Main Directional Sun
    this.sunLight = new THREE.DirectionalLight(0xfff7e6, 1.8);
    this.sunLight.position.set(16, 24, 18);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.left = -8;
    this.sunLight.shadow.camera.right = 8;
    this.sunLight.shadow.camera.top = 10;
    this.sunLight.shadow.camera.bottom = -10;
    this.sunLight.shadow.bias = -0.0003;
    this.sunLight.shadow.normalBias = 0.015;
    this.scene.add(this.sunLight);

    // Interior Ambient Fill (soft bounce light)
    this.fillLight = new THREE.DirectionalLight(0xbad2e8, 0.4);
    this.fillLight.position.set(-15, 15, -15);
    this.scene.add(this.fillLight);

    // Sky Dome
    this.createSky();
    this.currentPreset = 'day';
    this.setPreset('day');
  }

  createSky() {
    // Large hemispherical sky dome
    const skyGeo = new THREE.SphereGeometry(150, 32, 24);
    this.skyMat = new THREE.MeshBasicMaterial({
      color: 0x87ceeb,
      side: THREE.BackSide
    });
    this.skyMesh = new THREE.Mesh(skyGeo, this.skyMat);
    this.scene.add(this.skyMesh);
  }

  setPreset(preset) {
    this.currentPreset = preset;
    if (preset === 'day') {
      this.skyMat.color.set(0x8bc9ee);
      this.scene.fog = new THREE.FogExp2(0xd6e8f7, 0.008);

      this.sunLight.intensity = 1.9;
      this.sunLight.color.set(0xfff5e6);
      this.sunLight.position.set(16, 26, 18);

      this.hemiLight.intensity = 0.75;
      this.hemiLight.color.set(0xeaf4ff);
      this.hemiLight.groundColor.set(0x556644);

      this.fillLight.intensity = 0.4;
    } else if (preset === 'sunset') {
      this.skyMat.color.set(0xe88a55);
      this.scene.fog = new THREE.FogExp2(0xf0aa77, 0.012);

      this.sunLight.intensity = 2.2;
      this.sunLight.color.set(0xff8833);
      this.sunLight.position.set(-28, 8, 20);

      this.hemiLight.intensity = 0.55;
      this.hemiLight.color.set(0xffcca0);
      this.hemiLight.groundColor.set(0x442a1a);

      this.fillLight.intensity = 0.3;
    } else if (preset === 'night') {
      this.skyMat.color.set(0x060b14);
      this.scene.fog = new THREE.FogExp2(0x0a101d, 0.015);

      this.sunLight.intensity = 0.15;
      this.sunLight.color.set(0x6080b0);
      this.sunLight.position.set(10, 20, -10);

      this.hemiLight.intensity = 0.18;
      this.hemiLight.color.set(0x203050);
      this.hemiLight.groundColor.set(0x101520);

      this.fillLight.intensity = 0.1;
    }
  }

  update(camera) {
    if (this.skyMesh && camera) {
      this.skyMesh.position.copy(camera.position);
    }
  }
}
