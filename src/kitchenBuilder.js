import * as THREE from 'three';
import {
  createGlazedBeigeTileTexture,
  createZelligeTileNormalMap,
  createWhiteMarbleCounterTexture,
  createWarmOakTexture,
  createBrushedFridgeTexture
} from './textures.js';
import { audio } from './audio.js';

/**
 * Architectural Interactive Kitchen Suite Builder
 * Fixed & Calibrated:
 * 1. Seamless L-junction corner base cabinet & continuous marble countertop (no holes, no broken seams).
 * 2. Refrigerator door hinged on the rear/wall side (Z = 2.01m), handle at front (Z = 1.33m),
 *    swinging open 95° towards the wall so the entire illuminated interior faces the kitchen workspace!
 * 3. High-poly Japanese digital induction rice cooker with curved squircle body, domed lid,
 *    champagne gold accent band, steam vent, and slanted digital LCD screen.
 * 4. Interactive appliances: Fridge, Stove Burner, Sink Faucet & Water, Under-Sink Cabinet,
 *    Cookware Drawer, and 20L Microwave.
 */
export function buildKitchenSuite(scene, colliders, houseData) {
  const isCarportLeft = houseData.carportOnLeft !== false;
  const kitchenGroup = new THREE.Group();
  kitchenGroup.name = "kitchenSuite";
  kitchenGroup.userData.interactables = [];
  kitchenGroup.userData.interactiveList = [];

  // Procedural Textures
  const beigeTileTex = createGlazedBeigeTileTexture();
  const zelligeNormalTex = createZelligeTileNormalMap();
  const marbleTex = createWhiteMarbleCounterTexture();
  const oakTex = createWarmOakTexture();
  const fridgeTex = createBrushedFridgeTexture();

  // PBR Materials
  const matteBlackMat = new THREE.MeshStandardMaterial({
    color: 0x1d1f22,
    roughness: 0.44,
    metalness: 0.06
  });

  const recessedGrooveMat = new THREE.MeshStandardMaterial({
    color: 0x111214,
    roughness: 0.75
  });

  const plinthMat = new THREE.MeshStandardMaterial({
    color: 0x17191b,
    roughness: 0.65
  });

  const sinkMatteMat = new THREE.MeshStandardMaterial({
    color: 0x1c1e21,
    roughness: 0.68,
    metalness: 0.12
  });

  const faucetMat = new THREE.MeshStandardMaterial({
    color: 0x181a1c,
    roughness: 0.28,
    metalness: 0.88
  });

  const castIronMat = new THREE.MeshStandardMaterial({
    color: 0x161719,
    roughness: 0.80,
    metalness: 0.25
  });

  const stainlessMat = new THREE.MeshStandardMaterial({
    color: 0xd8dce0,
    roughness: 0.22,
    metalness: 0.92
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.08,
    metalness: 0.98
  });

  const brassBurnerMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.30,
    metalness: 0.85
  });

  const flundraMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.35,
    metalness: 0.02
  });

  const smokedGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x181c20,
    transmission: 0.88,
    opacity: 0.92,
    transparent: true,
    roughness: 0.05,
    ior: 1.52,
    metalness: 0.1
  });

  const clearGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 0.95,
    opacity: 0.35,
    transparent: true,
    roughness: 0.04,
    ior: 1.52
  });

  const waterMat = new THREE.MeshPhysicalMaterial({
    color: 0x93c5fd,
    transmission: 0.92,
    opacity: 0.80,
    transparent: true,
    roughness: 0.02,
    ior: 1.333,
    depthWrite: false
  });

  const blueFlameMat = new THREE.MeshStandardMaterial({
    color: 0x0088ff,
    emissive: 0x00d4ff,
    emissiveIntensity: 3.5,
    transparent: true,
    opacity: 0.92,
    roughness: 0.1
  });

  const innerFlameMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.95
  });

  const fridgeInteriorMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.15,
    metalness: 0.02
  });

  const gasHobGlassMat = new THREE.MeshStandardMaterial({
    color: 0x0a0c0e,
    roughness: 0.08,
    metalness: 0.15
  });

  const marbleMat = new THREE.MeshStandardMaterial({
    map: marbleTex,
    roughness: 0.18,
    metalness: 0.04
  });

  const oakMat = new THREE.MeshStandardMaterial({
    map: oakTex,
    roughness: 0.42,
    metalness: 0.02
  });

  const brushedFridgeMat = new THREE.MeshStandardMaterial({
    map: fridgeTex,
    roughness: 0.32,
    metalness: 0.80
  });

  const ledEmissiveMat = new THREE.MeshBasicMaterial({
    color: 0xfffae0
  });

  const plantLeafMat = new THREE.MeshStandardMaterial({
    color: 0x2e6b38,
    roughness: 0.45,
    metalness: 0.05
  });

  function create10cmBeigeCeramicMat(wMeters, hMeters) {
    const repX = wMeters / 0.80;
    const repY = hMeters / 0.80;
    const bTex = beigeTileTex.clone();
    bTex.repeat.set(repX, repY);
    bTex.wrapS = THREE.RepeatWrapping;
    bTex.wrapT = THREE.RepeatWrapping;
    bTex.needsUpdate = true;

    const nTex = zelligeNormalTex.clone();
    nTex.repeat.set(repX, repY);
    nTex.wrapS = THREE.RepeatWrapping;
    nTex.wrapT = THREE.RepeatWrapping;
    nTex.needsUpdate = true;

    return new THREE.MeshStandardMaterial({
      map: bTex,
      normalMap: nTex,
      normalScale: new THREE.Vector2(0.55, 0.55),
      roughness: 0.35,
      metalness: 0.04
    });
  }

  // Dimension Constants
  const counterBaseY = 0.86;
  const slabThick = 0.04;
  const counterTopY = counterBaseY + slabThick; // 0.90m
  const plinthHeight = 0.10;
  const cabHeight = counterBaseY - plinthHeight; // 0.76m
  const counterDepth = 0.60;
  const facingWallZ = -1.15;
  const longWallX = 2.50;

  const upperBottomY = 1.50;
  const upperHeight = 0.85;
  const upperMidY = upperBottomY + upperHeight / 2; // 1.925m
  const upperDepth = 0.35;
  const tallCabinetH = 2.35;
  const backsplashH = upperBottomY - counterTopY; // 0.60m
  const backsplashMidY = counterTopY + backsplashH / 2; // 1.20m

  function mx(x) {
    return isCarportLeft ? x : -x;
  }

  function registerItem(mesh, dimInfo) {
    if (dimInfo) mesh.userData.dimInfo = dimInfo;
    kitchenGroup.userData.interactables.push(mesh);
  }

  function registerInteractable(mesh, controller) {
    mesh.userData.interactive = true;
    mesh.userData.interactiveController = controller;
    if (!kitchenGroup.userData.interactables.includes(mesh)) {
      kitchenGroup.userData.interactables.push(mesh);
    }
    if (!kitchenGroup.userData.interactiveList.includes(controller)) {
      kitchenGroup.userData.interactiveList.push(controller);
    }
  }

  function addBox(w, h, d, mat, x, y, z, rotY = 0, dimInfo = null) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(mx(x), y, z);
    if (rotY !== 0) mesh.rotation.y = rotY;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    kitchenGroup.add(mesh);
    if (dimInfo) registerItem(mesh, dimInfo);
    return mesh;
  }

  // =========================================================================
  // 1. SHORT WALL: WET & CLEANING ZONE (Z = -1.15m: X in [0.30, 1.90])
  // =========================================================================
  const sCenterZ = facingWallZ + counterDepth / 2; // -0.85m
  const sPlinthZ = facingWallZ + (counterDepth - 0.06) / 2; // -0.88m

  // 1A. Left Base Utility Drawer (300mm: X in [0.30, 0.60])
  const leftDrawW = 0.30;
  const leftDrawCenterX = 0.30 + leftDrawW / 2; // 0.45m
  addBox(leftDrawW, plinthHeight, counterDepth - 0.06, plinthMat, leftDrawCenterX, plinthHeight / 2, sPlinthZ);
  addBox(leftDrawW, cabHeight, counterDepth - 0.02, matteBlackMat, leftDrawCenterX, plinthHeight + cabHeight / 2, sCenterZ);
  addBox(leftDrawW, 0.035, 0.025, recessedGrooveMat, leftDrawCenterX, counterBaseY - 0.02, facingWallZ + counterDepth);
  addBox(leftDrawW, slabThick, counterDepth, marbleMat, leftDrawCenterX, counterTopY - slabThick / 2, sCenterZ);

  // 1B. Washing Station & Modena Multifunction Sink Granit 2 (800mm: X in [0.60, 1.40])
  const sinkSecW = 0.80;
  const sinkCenterX = 1.00;
  const sinkW = 0.80;
  const sinkD = 0.50;
  const sinkH = 0.254;

  const sinkDim = {
    label: "Modena Granit 2 Bowl (800 × 500 mm)",
    p1: [sinkCenterX - sinkW / 2, 0.93, facingWallZ + counterDepth + 0.02],
    p2: [sinkCenterX + sinkW / 2, 0.93, facingWallZ + counterDepth + 0.02],
    axis: 'x'
  };

  addBox(sinkSecW, plinthHeight, counterDepth - 0.06, plinthMat, sinkCenterX, plinthHeight / 2, sPlinthZ);
  // Cabinet interior cavity under sink
  addBox(sinkSecW - 0.04, cabHeight - 0.04, counterDepth - 0.08, matteBlackMat, sinkCenterX, plinthHeight + cabHeight / 2, sCenterZ - 0.02);

  // P-Trap drainage pipe assembly inside cabinet
  const pTrapDrop = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.24, 16), chromeMat);
  pTrapDrop.position.set(mx(sinkCenterX), 0.50, sCenterZ);
  kitchenGroup.add(pTrapDrop);
  const pTrapCurve = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.022, 12, 20, Math.PI), chromeMat);
  pTrapCurve.position.set(mx(sinkCenterX), 0.38, sCenterZ);
  kitchenGroup.add(pTrapCurve);

  // Waste Sorting Eco Bins inside under-sink cabinet
  const binMatGrey = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5 });
  const binMatGreen = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 });
  addBox(0.24, 0.34, 0.22, binMatGrey, sinkCenterX - 0.20, plinthHeight + 0.17, sCenterZ);
  addBox(0.24, 0.34, 0.22, binMatGreen, sinkCenterX + 0.20, plinthHeight + 0.17, sCenterZ);

  // --- INTERACTIVE UNDER-SINK CABINET CONTROLLER ---
  const sinkCabinetController = {
    id: "sink_cabinet",
    isOpen: false,
    progress: 0,
    toggle() {
      this.isOpen = !this.isOpen;
      audio.playCabinet(this.isOpen);
    },
    getPromptText() {
      return this.isOpen ? "Close Sink Cabinet" : "Open Under-Sink Cabinet";
    },
    update(delta) {
      this.progress = THREE.MathUtils.damp(this.progress, this.isOpen ? 1 : 0, 8.5, delta);
      leftDoorHinge.rotation.y = this.progress * (isCarportLeft ? -1.55 : 1.55);
      rightDoorHinge.rotation.y = this.progress * (isCarportLeft ? 1.55 : -1.55);
    }
  };

  // Left Door Hinge Group at X = 0.60
  const leftDoorHinge = new THREE.Group();
  leftDoorHinge.position.set(mx(0.60), plinthHeight + cabHeight / 2, facingWallZ + counterDepth);
  kitchenGroup.add(leftDoorHinge);
  const leftDoorMesh = new THREE.Mesh(new THREE.BoxGeometry(0.395, cabHeight - 0.01, 0.02), matteBlackMat);
  leftDoorMesh.position.set(isCarportLeft ? 0.395 / 2 : -0.395 / 2, 0, 0);
  leftDoorMesh.castShadow = true;
  leftDoorHinge.add(leftDoorMesh);
  registerInteractable(leftDoorMesh, sinkCabinetController);

  // Right Door Hinge Group at X = 1.40
  const rightDoorHinge = new THREE.Group();
  rightDoorHinge.position.set(mx(1.40), plinthHeight + cabHeight / 2, facingWallZ + counterDepth);
  kitchenGroup.add(rightDoorHinge);
  const rightDoorMesh = new THREE.Mesh(new THREE.BoxGeometry(0.395, cabHeight - 0.01, 0.02), matteBlackMat);
  rightDoorMesh.position.set(isCarportLeft ? -0.395 / 2 : 0.395 / 2, 0, 0);
  rightDoorMesh.castShadow = true;
  rightDoorHinge.add(rightDoorMesh);
  registerInteractable(rightDoorMesh, sinkCabinetController);

  // Countertop Marble surround behind sink
  const rearMarbleD = counterDepth - sinkD;
  addBox(sinkW, slabThick, rearMarbleD, marbleMat, sinkCenterX, counterTopY - slabThick / 2, facingWallZ + rearMarbleD / 2, 0, sinkDim);

  // Granite Apron Front (Exposed at Z = -0.55m)
  const apronThick = 0.035;
  const apronY = counterTopY - sinkH / 2;
  const apronZ = facingWallZ + counterDepth + apronThick / 2 - 0.008;
  const apronMesh = addBox(sinkW, sinkH, apronThick, sinkMatteMat, sinkCenterX, apronY, apronZ, 0, sinkDim);

  // Basin Floors for Bowl 1 and Bowl 2
  const b1Len = 0.363;
  const b2Len = 0.363;
  const bWid = 0.375;
  const bFloorY = counterTopY - sinkH + 0.015;
  const bCenterZ = facingWallZ + 0.10 + bWid / 2 + 0.02; // -0.84m
  const b1CenterX = sinkCenterX - sinkW / 2 + 0.024 + b1Len / 2; // ~0.825m
  const b2CenterX = sinkCenterX + sinkW / 2 - 0.024 - b2Len / 2; // ~1.175m

  addBox(b1Len, 0.015, bWid, sinkMatteMat, b1CenterX, bFloorY, bCenterZ, 0, sinkDim);
  addBox(b2Len, 0.015, bWid, sinkMatteMat, b2CenterX, bFloorY, bCenterZ, 0, sinkDim);

  // Basin Outer Walls & Central Ridge Divider
  addBox(0.024, sinkH, bWid, sinkMatteMat, sinkCenterX - sinkW / 2 + 0.012, counterTopY - sinkH / 2, bCenterZ, 0, sinkDim);
  addBox(0.024, sinkH, bWid, sinkMatteMat, sinkCenterX + sinkW / 2 - 0.012, counterTopY - sinkH / 2, bCenterZ, 0, sinkDim);
  addBox(sinkW - 0.04, sinkH, 0.024, sinkMatteMat, sinkCenterX, counterTopY - sinkH / 2, bCenterZ - bWid / 2 - 0.012, 0, sinkDim);
  addBox(sinkW - 0.04, sinkH, 0.024, sinkMatteMat, sinkCenterX, counterTopY - sinkH / 2, bCenterZ + bWid / 2 + 0.012, 0, sinkDim);
  addBox(0.026, sinkH - 0.02, bWid, sinkMatteMat, sinkCenterX, counterTopY - (sinkH - 0.02) / 2 - 0.01, bCenterZ, 0, sinkDim);

  // Stainless Basket Strainers
  [b1CenterX, b2CenterX].forEach(drainX => {
    const drainMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.01, 24), stainlessMat);
    drainMesh.position.set(mx(drainX), bFloorY + 0.01, bCenterZ);
    kitchenGroup.add(drainMesh);
  });

  // Workstation Natural Oak Cutting Board
  const cbW = 0.28;
  const cbD = 0.48;
  const cbH = 0.022;
  const boardDim = {
    label: "Oak Cutting Board (280 × 480 mm)",
    p1: [b1CenterX - cbW / 2, counterTopY + cbH, bCenterZ],
    p2: [b1CenterX + cbW / 2, counterTopY + cbH, bCenterZ],
    axis: 'x'
  };
  addBox(cbW, cbH, cbD, oakMat, b1CenterX, counterTopY + cbH / 2 - 0.006, bCenterZ, 0, boardDim);

  // --- INTERACTIVE TALL MATTE BLACK FAUCET & WATER CONTROLLER ---
  const faucetZ = facingWallZ + 0.07;
  const faucetDim = {
    label: "Gooseneck Mixer Faucet",
    p1: [sinkCenterX, counterTopY + 0.38, faucetZ - 0.06],
    p2: [sinkCenterX, counterTopY + 0.38, faucetZ + 0.10],
    axis: 'z'
  };

  const faucetBase = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.028, 0.045, 20), faucetMat);
  faucetBase.position.set(mx(sinkCenterX), counterTopY + 0.022, faucetZ);
  kitchenGroup.add(faucetBase);

  const faucetStem = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.20, 16), faucetMat);
  faucetStem.position.set(mx(sinkCenterX), counterTopY + 0.045 + 0.10, faucetZ);
  kitchenGroup.add(faucetStem);

  const faucetArchGeo = new THREE.TorusGeometry(0.08, 0.013, 12, 24, Math.PI);
  const faucetArch = new THREE.Mesh(faucetArchGeo, faucetMat);
  faucetArch.rotation.y = isCarportLeft ? Math.PI / 2 : -Math.PI / 2;
  faucetArch.position.set(mx(sinkCenterX), counterTopY + 0.245, faucetZ + (isCarportLeft ? 0.08 : -0.08));
  kitchenGroup.add(faucetArch);

  const nozzleZ = faucetZ + 0.16;
  const nozzleY = counterTopY + 0.21;
  const faucetNozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.012, 0.055, 16), faucetMat);
  faucetNozzle.position.set(mx(sinkCenterX), nozzleY, nozzleZ);
  kitchenGroup.add(faucetNozzle);

  // Faucet Lever Pivot Group
  const leverHinge = new THREE.Group();
  leverHinge.position.set(mx(sinkCenterX + 0.038), counterTopY + 0.08, faucetZ);
  kitchenGroup.add(leverHinge);
  const leverHub = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.026, 16), faucetMat);
  leverHub.rotation.z = Math.PI / 2;
  leverHinge.add(leverHub);
  const leverStick = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.075, 12), faucetMat);
  leverStick.position.set(isCarportLeft ? 0.014 : -0.014, 0.036, 0);
  leverHinge.add(leverStick);

  // Animated Flowing Water Stream
  const waterStreamGeo = new THREE.CylinderGeometry(0.010, 0.014, 0.45, 16);
  waterStreamGeo.translate(0, -0.225, 0);
  const waterStream = new THREE.Mesh(waterStreamGeo, waterMat);
  waterStream.position.set(mx(sinkCenterX), nozzleY - 0.03, nozzleZ);
  waterStream.visible = false;
  kitchenGroup.add(waterStream);

  // Water Splash Ripple Disc in Sink Basin
  const waterRippleGeo = new THREE.RingGeometry(0.015, 0.09, 24);
  waterRippleGeo.rotateX(-Math.PI / 2);
  const waterRipple = new THREE.Mesh(waterRippleGeo, waterMat);
  waterRipple.position.set(mx(sinkCenterX), bFloorY + 0.018, nozzleZ);
  waterRipple.visible = false;
  kitchenGroup.add(waterRipple);

  const sinkController = {
    id: "sink_faucet",
    isOpen: false,
    progress: 0,
    toggle() {
      this.isOpen = !this.isOpen;
      audio.playWaterStream(this.isOpen);
    },
    getPromptText() {
      return this.isOpen ? "Turn Off Water Faucet" : "Turn On Kitchen Faucet";
    },
    update(delta) {
      this.progress = THREE.MathUtils.damp(this.progress, this.isOpen ? 1 : 0, 10, delta);
      leverHinge.rotation.x = this.progress * 0.50;
      waterStream.visible = this.progress > 0.05;
      waterStream.scale.set(1, this.progress, 1);
      waterRipple.visible = this.progress > 0.1;
      const rippleWave = 0.88 + Math.sin(Date.now() * 0.015) * 0.16;
      waterRipple.scale.set(rippleWave, 1, rippleWave);
    }
  };

  registerInteractable(faucetBase, sinkController);
  registerInteractable(faucetStem, sinkController);
  registerInteractable(faucetArch, sinkController);
  registerInteractable(faucetNozzle, sinkController);
  registerInteractable(leverStick, sinkController);
  registerInteractable(apronMesh, sinkController);

  // 1C. Right Prep Counter & IKEA FLUNDRA Dish Rack (500mm: X in [1.40, 1.90])
  const flW = 0.36;
  const flD = 0.46;
  const flH = 0.12;
  const prepCenterX = 1.65;
  addBox(0.50, plinthHeight, counterDepth - 0.06, plinthMat, prepCenterX, plinthHeight / 2, sPlinthZ);
  addBox(0.50, cabHeight, counterDepth - 0.02, matteBlackMat, prepCenterX, plinthHeight + cabHeight / 2, sCenterZ);
  addBox(0.50, 0.035, 0.025, recessedGrooveMat, prepCenterX, counterBaseY - 0.02, facingWallZ + counterDepth);
  addBox(0.50, slabThick, counterDepth, marbleMat, prepCenterX, counterTopY - slabThick / 2, sCenterZ);

  // IKEA FLUNDRA Dish Rack Model
  const flY = counterTopY + flH / 2;
  const flundraDim = {
    label: "IKEA FLUNDRA Dish Rack (460 × 360 × 120 mm)",
    p1: [prepCenterX - flW / 2, counterTopY + flH, sCenterZ - flD / 2],
    p2: [prepCenterX + flW / 2, counterTopY + flH, sCenterZ + flD / 2],
    axis: 'x'
  };
  addBox(flW, 0.012, flD, flundraMat, prepCenterX, counterTopY + 0.006, sCenterZ, 0, flundraDim);
  addBox(0.015, flH, flD, flundraMat, prepCenterX - flW / 2 + 0.008, flY, sCenterZ, 0, flundraDim);
  addBox(0.015, flH, flD, flundraMat, prepCenterX + flW / 2 - 0.008, flY, sCenterZ, 0, flundraDim);
  addBox(flW, flH, 0.015, flundraMat, prepCenterX, flY, sCenterZ - flD / 2 + 0.008, 0, flundraDim);
  addBox(flW, flH, 0.015, flundraMat, prepCenterX, flY, sCenterZ + flD / 2 - 0.008, 0, flundraDim);

  // Large ceramic dinner plates drying inside rack
  const plateMat = new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.25 });
  for (let pi = 0; pi < 5; pi++) {
    const pMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.125, 0.008, 24), plateMat);
    pMesh.rotation.z = Math.PI / 2;
    pMesh.position.set(mx(prepCenterX - 0.08 + pi * 0.038), counterTopY + 0.13, sCenterZ);
    kitchenGroup.add(pMesh);
  }

  // =========================================================================
  // 2. SEAMLESS L-JUNCTION CORNER BASE & CONTINUOUS COUNTER (X in [1.90, 2.50], Z in [-1.15, -0.55])
  // =========================================================================
  // This seamlessly joins the Short Wall base & Long Wall base into a continuous L-shape!
  const cornBaseW = 0.60;
  const cornBaseD = 0.60;
  const cornBaseCenterX = 1.90 + cornBaseW / 2; // 2.20m
  const cornBaseCenterZ = -1.15 + cornBaseD / 2; // -0.85m

  // Corner plinth & carcass base
  addBox(cornBaseW, plinthHeight, cornBaseD - 0.06, plinthMat, cornBaseCenterX, plinthHeight / 2, cornBaseCenterZ - 0.03);
  addBox(cornBaseW, cabHeight, cornBaseD, matteBlackMat, cornBaseCenterX, plinthHeight + cabHeight / 2, cornBaseCenterZ);
  // Continuous Corner Marble Countertop slab
  addBox(cornBaseW, slabThick, cornBaseD, marbleMat, cornBaseCenterX, counterTopY - slabThick / 2, cornBaseCenterZ);

  // Backsplashes meeting perfectly at corner (X = 2.50m, Z = -1.15m)
  const sBacksplashMat = create10cmBeigeCeramicMat(2.20, backsplashH);
  addBox(2.20, backsplashH, 0.020, sBacksplashMat, 1.40, backsplashMidY, facingWallZ + 0.010);

  // =========================================================================
  // 3. UPPER CABINETRY & CORNER CASEWORK (Short Wall X in [0.30, 2.50])
  // =========================================================================

  // 3A. Left Upper Cabinet (300mm: X in [0.30, 0.60])
  const leftUpperDim = {
    label: "300 mm Upper Cabinet",
    p1: [0.30, upperMidY, facingWallZ + upperDepth + 0.01],
    p2: [0.60, upperMidY, facingWallZ + upperDepth + 0.01],
    axis: 'x'
  };
  addBox(0.30, 0.025, upperDepth, matteBlackMat, leftDrawCenterX, upperBottomY + 0.012, facingWallZ + upperDepth / 2);
  addBox(0.30, 0.025, upperDepth, matteBlackMat, leftDrawCenterX, upperBottomY + upperHeight - 0.012, facingWallZ + upperDepth / 2);
  addBox(0.025, upperHeight, upperDepth, matteBlackMat, 0.30 + 0.012, upperMidY, facingWallZ + upperDepth / 2);
  addBox(0.025, upperHeight, upperDepth, matteBlackMat, 0.60 - 0.012, upperMidY, facingWallZ + upperDepth / 2);
  addBox(0.30, upperHeight, 0.015, matteBlackMat, leftDrawCenterX, upperMidY, facingWallZ + 0.008);
  addBox(0.26, 0.020, upperDepth - 0.04, oakMat, leftDrawCenterX, upperBottomY + 0.42, facingWallZ + upperDepth / 2);

  // Left Upper Cabinet Interactive Door
  const leftCabHinge = new THREE.Group();
  leftCabHinge.position.set(mx(0.30 + 0.01), upperMidY, facingWallZ + upperDepth);
  kitchenGroup.add(leftCabHinge);
  const leftCabDoor = new THREE.Mesh(new THREE.BoxGeometry(0.29, upperHeight - 0.02, 0.02), matteBlackMat);
  leftCabDoor.position.set(isCarportLeft ? 0.145 : -0.145, 0, 0.01);
  leftCabDoor.castShadow = true;
  leftCabHinge.add(leftCabDoor);
  const leftCabHandle = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.15, 0.018), stainlessMat);
  leftCabHandle.position.set(isCarportLeft ? 0.26 : -0.26, -0.15, 0.022);
  leftCabHinge.add(leftCabHandle);

  const leftUpperCabController = {
    id: "left_upper_cabinet",
    isOpen: false,
    progress: 0,
    toggle() {
      this.isOpen = !this.isOpen;
      audio.playCabinet(this.isOpen);
    },
    getPromptText() {
      return this.isOpen ? "Close Left Cabinet" : "Open Left Upper Cabinet";
    },
    update(delta) {
      this.progress = THREE.MathUtils.damp(this.progress, this.isOpen ? 1 : 0, 8.0, delta);
      leftCabHinge.rotation.y = this.progress * (isCarportLeft ? -1.40 : 1.40);
    }
  };
  registerInteractable(leftCabDoor, leftUpperCabController);
  registerInteractable(leftCabHandle, leftUpperCabController);

  // 3B. Center Open Oak Dish Shelving Unit above Sink (800mm: X in [0.60, 1.40])
  const shelfBoxDim = {
    label: "Oak Dish Shelving (800 mm)",
    p1: [0.60, upperMidY, facingWallZ + upperDepth / 2],
    p2: [1.40, upperMidY, facingWallZ + upperDepth / 2],
    axis: 'x'
  };
  addBox(0.80, 0.025, upperDepth, oakMat, sinkCenterX, upperBottomY + 0.012, facingWallZ + upperDepth / 2, 0, shelfBoxDim);
  addBox(0.80, 0.025, upperDepth, oakMat, sinkCenterX, upperBottomY + upperHeight - 0.012, facingWallZ + upperDepth / 2, 0, shelfBoxDim);
  addBox(0.80, 0.022, upperDepth - 0.04, oakMat, sinkCenterX, upperBottomY + 0.42, facingWallZ + upperDepth / 2);
  addBox(0.025, upperHeight, upperDepth, oakMat, 0.60 + 0.012, upperMidY, facingWallZ + upperDepth / 2);
  addBox(0.025, upperHeight, upperDepth, oakMat, 1.40 - 0.012, upperMidY, facingWallZ + upperDepth / 2);
  addBox(0.80, upperHeight, 0.015, oakMat, sinkCenterX, upperMidY, facingWallZ + 0.008);

  // Shelved Ceramic Dishes & Tableware in Oak Unit
  const dishWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.25 });
  for (let pi = 0; pi < 6; pi++) {
    const dPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.008, 24), dishWhiteMat);
    dPlate.rotation.z = Math.PI / 2;
    dPlate.position.set(mx(sinkCenterX - 0.22 + pi * 0.038), upperBottomY + 0.13, facingWallZ + upperDepth / 2);
    kitchenGroup.add(dPlate);
  }
  for (let bi = 0; bi < 3; bi++) {
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.045, 0.045, 16), dishWhiteMat);
    bowl.position.set(mx(sinkCenterX + 0.14 + (bi - 1) * 0.11), upperBottomY + 0.42 + 0.035, facingWallZ + upperDepth / 2);
    kitchenGroup.add(bowl);
  }
  // Under-shelf LED warm task light above sink
  addBox(0.76, 0.008, 0.018, ledEmissiveMat, sinkCenterX, upperBottomY - 0.004, facingWallZ + upperDepth / 2 + 0.06);
  const ledLightSink = new THREE.PointLight(0xffdfa8, 1.1, 2.8, 1.3);
  ledLightSink.position.set(mx(sinkCenterX), upperBottomY - 0.06, facingWallZ + 0.22);
  kitchenGroup.add(ledLightSink);

  // 3C. Right Upper Cabinet above Prep Counter & Flundra Rack (500mm: X in [1.40, 1.90])
  // RESTORED: Completely closes the missing gap between Oak unit and corner!
  const rightUpperDim = {
    label: "500 mm Upper Cabinet",
    p1: [1.40, upperMidY, facingWallZ + upperDepth + 0.01],
    p2: [1.90, upperMidY, facingWallZ + upperDepth + 0.01],
    axis: 'x'
  };
  addBox(0.50, 0.025, upperDepth, matteBlackMat, 1.65, upperBottomY + 0.012, facingWallZ + upperDepth / 2, 0, rightUpperDim);
  addBox(0.50, 0.025, upperDepth, matteBlackMat, 1.65, upperBottomY + upperHeight - 0.012, facingWallZ + upperDepth / 2, 0, rightUpperDim);
  addBox(0.025, upperHeight, upperDepth, matteBlackMat, 1.40 + 0.012, upperMidY, facingWallZ + upperDepth / 2);
  addBox(0.025, upperHeight, upperDepth, matteBlackMat, 1.90 - 0.012, upperMidY, facingWallZ + upperDepth / 2);
  addBox(0.50, upperHeight, 0.015, matteBlackMat, 1.65, upperMidY, facingWallZ + 0.008);
  addBox(0.46, 0.020, upperDepth - 0.04, oakMat, 1.65, upperBottomY + 0.42, facingWallZ + upperDepth / 2);

  // Storage canisters inside right upper cabinet
  const jarColors = [0xe2e8f0, 0xcbd5e1, 0x94a3b8];
  jarColors.forEach((jc, ji) => {
    const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.12, 16), new THREE.MeshStandardMaterial({ color: jc, roughness: 0.3 }));
    jar.position.set(mx(1.53 + ji * 0.11), upperBottomY + 0.42 + 0.07, facingWallZ + upperDepth / 2);
    kitchenGroup.add(jar);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.02, 16), oakMat);
    lid.position.set(mx(1.53 + ji * 0.11), upperBottomY + 0.42 + 0.135, facingWallZ + upperDepth / 2);
    kitchenGroup.add(lid);
  });

  // Right Upper Cabinet Interactive Door (swings open towards the corner)
  const rightCabHinge = new THREE.Group();
  rightCabHinge.position.set(mx(1.90 - 0.01), upperMidY, facingWallZ + upperDepth);
  kitchenGroup.add(rightCabHinge);
  const rightCabDoor = new THREE.Mesh(new THREE.BoxGeometry(0.49, upperHeight - 0.02, 0.02), matteBlackMat);
  rightCabDoor.position.set(isCarportLeft ? -0.245 : 0.245, 0, 0.01);
  rightCabDoor.castShadow = true;
  rightCabHinge.add(rightCabDoor);
  const rightCabHandle = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.15, 0.018), stainlessMat);
  rightCabHandle.position.set(isCarportLeft ? -0.44 : 0.44, -0.15, 0.022);
  rightCabHinge.add(rightCabHandle);

  const rightUpperCabController = {
    id: "right_upper_cabinet",
    isOpen: false,
    progress: 0,
    toggle() {
      this.isOpen = !this.isOpen;
      audio.playCabinet(this.isOpen);
    },
    getPromptText() {
      return this.isOpen ? "Close Upper Cabinet" : "Open Upper Prep Cabinet";
    },
    update(delta) {
      this.progress = THREE.MathUtils.damp(this.progress, this.isOpen ? 1 : 0, 8.0, delta);
      rightCabHinge.rotation.y = this.progress * (isCarportLeft ? 1.40 : -1.40);
    }
  };
  registerInteractable(rightCabDoor, rightUpperCabController);
  registerInteractable(rightCabHandle, rightUpperCabController);

  // Under-cabinet LED task light illuminating Flundra dish rack
  addBox(0.46, 0.008, 0.018, ledEmissiveMat, 1.65, upperBottomY - 0.004, facingWallZ + upperDepth / 2 + 0.06);
  const ledLightPrep = new THREE.PointLight(0xffdfa8, 0.9, 2.5, 1.3);
  ledLightPrep.position.set(mx(1.65), upperBottomY - 0.06, facingWallZ + 0.22);
  kitchenGroup.add(ledLightPrep);

// 3D. Architectural L-Corner Casework & Open Shelving (X in [1.90, 2.50], Z in [-1.15, -0.55])
  // Features: Solid lower oak appliance shelf for microwave, mid plant shelf, upper shelf, and solid gables/backing.
  const cornUpperDim = {
    label: "Corner Appliance & Display Casework",
    p1: [1.90, upperMidY, -0.85],
    p2: [2.50, upperMidY, -0.85],
    axis: 'x'
  };
  const cornCenterX = 2.20;
  const cornCenterZ = -0.85;

  // 1. Lower Oak Appliance Shelf (RESTORED at Y = 1.18m specifically for Microwave)
  const mwShelfTopY = 1.18;
  const mwShelfThick = 0.028;
  const lowerShelfDim = {
    label: "Lower Microwave Shelf (600 × 600 mm)",
    p1: [1.90, mwShelfTopY, cornCenterZ],
    p2: [2.50, mwShelfTopY, cornCenterZ],
    axis: 'x'
  };
  addBox(0.58, mwShelfThick, 0.58, oakMat, cornCenterX, mwShelfTopY - mwShelfThick / 2, cornCenterZ, 0, lowerShelfDim);

  // 2. Mid Oak Display Shelf (Y = 1.55m) - Directly above microwave
  addBox(0.55, 0.025, 0.55, oakMat, cornCenterX + 0.02, 1.55, cornCenterZ - 0.02);

  // 3. Upper Oak Display Shelf (Y = 1.95m)
  addBox(0.55, 0.025, 0.55, oakMat, cornCenterX + 0.02, 1.95, cornCenterZ - 0.02);

  // 4. Top Ceiling Capping Slab (Y = 2.35m)
  addBox(0.60, 0.025, 0.60, matteBlackMat, cornCenterX, 2.35 - 0.012, cornCenterZ, 0, cornUpperDim);

  // Solid left side gable (connecting flush to right upper cabinet at X = 1.90, spanning from lower shelf to ceiling)
  const leftGableH = 2.35 - (mwShelfTopY - mwShelfThick);
  const leftGableMidY = (mwShelfTopY - mwShelfThick + 2.35) / 2;
  addBox(0.025, leftGableH, upperDepth, matteBlackMat, 1.90 + 0.012, leftGableMidY, facingWallZ + upperDepth / 2);

  // Solid front side gable (connecting flush to long wall upper cabinet at Z = -0.55)
  addBox(upperDepth, leftGableH, 0.025, matteBlackMat, longWallX - upperDepth / 2, leftGableMidY, -0.55 - 0.012);

  // Solid finished back wall panels against walls
  addBox(0.60, leftGableH, 0.018, oakMat, cornCenterX, leftGableMidY, facingWallZ + 0.009);
  addBox(0.018, leftGableH, 0.60, oakMat, longWallX - 0.009, leftGableMidY, cornCenterZ);

  // Trailing Ivy Plant in White Ceramic Pot on Mid Shelf (Y = 1.55m)
  const potMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.12, 20), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25 }));
  potMesh.position.set(mx(cornCenterX + 0.04), 1.55 + 0.065 + 0.012, cornCenterZ - 0.02);
  kitchenGroup.add(potMesh);
  for (let li = 0; li < 7; li++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), plantLeafMat);
    leaf.scale.set(0.6, 1.2, 0.3);
    leaf.position.set(mx(cornCenterX - 0.04 + li * 0.025), 1.55 + 0.03 - li * 0.04, cornCenterZ + 0.10 + (li % 2) * 0.035);
    kitchenGroup.add(leaf);
  }

  // Decorative ceramic jars on upper shelf (Y = 1.95m)
  for (let ui = 0; ui < 2; ui++) {
    const uVase = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.14, 16), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 }));
    uVase.position.set(mx(cornCenterX + 0.08 - ui * 0.12), 1.95 + 0.07 + 0.012, cornCenterZ - 0.04);
    kitchenGroup.add(uVase);
  }

  // Warm accent ceiling spotlight in corner casework
  const cornSpotLight = new THREE.PointLight(0xffdfa8, 0.9, 2.2, 1.4);
  cornSpotLight.position.set(mx(cornCenterX), 2.35 - 0.06, cornCenterZ);
  kitchenGroup.add(cornSpotLight);

  // 3E. 20L MICROWAVE OVEN ELEVATED ON LOWER OAK SHELF (Y = 1.18m)
  // Perfectly sized 20L microwave, elevated to clear counter space below, opening FORWARD into room!
  const mwW = 0.455;
  const mwH = 0.252;
  const mwD = 0.320;
  const mwPosX = 2.18;
  const mwPosZ = -0.82;
  const mwFeetH = 0.012;
  const mwBodyY = mwShelfTopY + mwFeetH + mwH / 2; // 1.18 + 0.012 + 0.126 = 1.318m

  const mwDim = {
    label: "20L Microwave (455 × 252 mm)",
    p1: [mwPosX - mwW / 2, mwShelfTopY + mwFeetH + mwH, mwPosZ],
    p2: [mwPosX + mwW / 2, mwShelfTopY + mwFeetH + mwH, mwPosZ],
    axis: 'x'
  };

  // 4 Non-slip rubber feet resting on the lower oak shelf
  const rubberMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
  [
    [-mwW / 2 + 0.03, -mwD / 2 + 0.03],
    [mwW / 2 - 0.03, -mwD / 2 + 0.03],
    [-mwW / 2 + 0.03, mwD / 2 - 0.03],
    [mwW / 2 - 0.03, mwD / 2 - 0.03]
  ].forEach(([fx, fz]) => {
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, mwFeetH, 12), rubberMat);
    foot.position.set(mx(mwPosX + fx), mwShelfTopY + mwFeetH / 2, mwPosZ + fz);
    kitchenGroup.add(foot);
  });

  // Outer Chassis & Interior Cavity
  const mwChassis = addBox(mwW, mwH, mwD, matteBlackMat, mwPosX, mwBodyY, mwPosZ, 0, mwDim);
  addBox(mwW - 0.06, mwH - 0.05, mwD - 0.06, new THREE.MeshStandardMaterial({ color: 0x22262a, roughness: 0.3 }), mwPosX - 0.02, mwBodyY, mwPosZ);

  // Glass Turntable & Ceramic Mug inside microwave
  const turnTable = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.008, 20), clearGlassMat);
  turnTable.position.set(mx(mwPosX - 0.02), mwShelfTopY + mwFeetH + 0.025, mwPosZ);
  kitchenGroup.add(turnTable);

  const mugMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.035, 0.08, 16), new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3 }));
  mugMesh.position.set(mx(mwPosX - 0.02), mwShelfTopY + mwFeetH + 0.07, mwPosZ);
  kitchenGroup.add(mugMesh);

  // Microwave Interior Light
  const mwLight = new THREE.PointLight(0xffe899, 0, 0.9);
  mwLight.position.set(mx(mwPosX - 0.02), mwBodyY + 0.05, mwPosZ);
  kitchenGroup.add(mwLight);

  // Microwave Door Hinge Group on Left Edge
  const mwDoorHinge = new THREE.Group();
  mwDoorHinge.position.set(mx(mwPosX - mwW / 2 + 0.01), mwBodyY, mwPosZ + mwD / 2);
  kitchenGroup.add(mwDoorHinge);

  const mwDoorMesh = new THREE.Mesh(new THREE.BoxGeometry(mwW - 0.10, mwH - 0.02, 0.015), smokedGlassMat);
  mwDoorMesh.position.set(isCarportLeft ? (mwW - 0.10) / 2 : -(mwW - 0.10) / 2, 0, 0);
  mwDoorHinge.add(mwDoorMesh);

  const mwHandleMesh = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.15, 0.022), stainlessMat);
  mwHandleMesh.position.set(isCarportLeft ? mwW - 0.12 : -(mwW - 0.12), 0, 0.012);
  mwDoorHinge.add(mwHandleMesh);

  const microwaveController = {
    id: "microwave",
    isOpen: false,
    progress: 0,
    toggle() {
      this.isOpen = !this.isOpen;
      audio.playMicrowave(this.isOpen);
    },
    getPromptText() {
      return this.isOpen ? "Close Microwave" : "Open Microwave Door";
    },
    update(delta) {
      this.progress = THREE.MathUtils.damp(this.progress, this.isOpen ? 1 : 0, 8.5, delta);
      // Fixed: Negative angle swings door forward into room towards +Z (facing user), opening the interior wide!
      const openAngle = isCarportLeft ? -1.45 : 1.45;
      mwDoorHinge.rotation.y = this.progress * openAngle;
      mwLight.intensity = this.progress * 1.2;
    }
  };

  registerInteractable(mwDoorMesh, microwaveController);
  registerInteractable(mwHandleMesh, microwaveController);
  registerInteractable(mwChassis, microwaveController);

  // =========================================================================
  // 4. LONG WALL: COOKING & REFRIGERATOR ZONE (X = 2.50m: Z in [-0.55, 2.05])
  // =========================================================================
  const baseMidX = longWallX - counterDepth / 2; // 2.20m
  const plinthMidX = longWallX - (counterDepth - 0.06) / 2; // 2.23m

  // 4A. Food Prep Zone (Z in [-0.55, -0.05])
  const prepLen = 0.50;
  const prepCenterZ_long = (-0.55 - 0.05) / 2; // -0.30m
  addBox(counterDepth - 0.02, cabHeight, prepLen, matteBlackMat, baseMidX, plinthHeight + cabHeight / 2, prepCenterZ_long);
  addBox(counterDepth - 0.06, plinthHeight, prepLen, plinthMat, plinthMidX, plinthHeight / 2, prepCenterZ_long);
  addBox(0.025, 0.035, prepLen, recessedGrooveMat, longWallX - counterDepth, counterBaseY - 0.02, prepCenterZ_long);
  addBox(counterDepth, slabThick, prepLen, marbleMat, baseMidX, counterTopY - slabThick / 2, prepCenterZ_long);

  // Chef's Knife Block with Angled Stainless Knives
  addBox(0.10, 0.22, 0.16, oakMat, longWallX - 0.16, counterTopY + 0.11, -0.44, 0.25);

  // --- HIGH-POLY JAPANESE DIGITAL INDUCTION RICE COOKER ---
  const rcGroup = new THREE.Group();
  const rcPosX = longWallX - 0.28;
  const rcPosZ = -0.22;
  rcGroup.position.set(mx(rcPosX), counterTopY, rcPosZ);
  kitchenGroup.add(rcGroup);

  // Rounded Squircle Outer Body (Pearl Charcoal Metallic)
  const rcBodyMat = new THREE.MeshStandardMaterial({
    color: 0x1c1e22,
    roughness: 0.25,
    metalness: 0.35
  });
  const rcBody = new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.115, 0.14, 32), rcBodyMat);
  rcBody.scale.set(1.0, 1.0, 1.15); // squircle proportions
  rcBody.position.set(0, 0.07, 0);
  rcBody.castShadow = true;
  rcGroup.add(rcBody);

  // Champagne Gold Accent Band around perimeter
  const goldAccentMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.22,
    metalness: 0.88
  });
  const rcGoldBand = new THREE.Mesh(new THREE.CylinderGeometry(0.128, 0.128, 0.014, 32), goldAccentMat);
  rcGoldBand.scale.set(1.0, 1.0, 1.15);
  rcGoldBand.position.set(0, 0.14, 0);
  rcGroup.add(rcGoldBand);

  // Domed Curved Top Lid
  const rcLid = new THREE.Mesh(new THREE.CylinderGeometry(0.124, 0.127, 0.035, 32), rcBodyMat);
  rcLid.scale.set(1.0, 1.0, 1.15);
  rcLid.position.set(0, 0.16, 0);
  rcGroup.add(rcLid);

  // Oval Steam Vent Cap on Top
  const ventCap = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.008, 16), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3 }));
  ventCap.position.set(0, 0.18, 0.03);
  rcGroup.add(ventCap);

  // Slanted Front Control Panel with Backlit LCD Screen
  const rcPanel = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.06, 0.11), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 }));
  rcPanel.position.set(isCarportLeft ? -0.122 : 0.122, 0.08, 0);
  rcPanel.rotation.z = isCarportLeft ? 0.22 : -0.22;
  rcGroup.add(rcPanel);

  // Glowing Amber/Cyan Display
  const rcDisplay = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.022, 0.055), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
  rcDisplay.position.set(isCarportLeft ? -0.128 : 0.128, 0.09, 0);
  rcDisplay.rotation.z = isCarportLeft ? 0.22 : -0.22;
  rcGroup.add(rcDisplay);

  // Curved Carrying Handle Arch
  const rcHandle = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.007, 10, 24, Math.PI), goldAccentMat);
  rcHandle.rotation.x = Math.PI / 2;
  rcHandle.position.set(0, 0.14, 0);
  rcGroup.add(rcHandle);

  // 4B. Cooking Station: Modena BH 2725 GBBK & Cookware Drawer (900mm: Z in [-0.05, 0.85])
  const cookLen = 0.90;
  const cookCenterZ = (-0.05 + 0.85) / 2; // 0.40m
  const hobLen = 0.73;
  const hobWidth = 0.42;
  const hobCenterX = longWallX - counterDepth / 2; // 2.20m

  const cookingDim = {
    label: "Modena BH 2725 GBBK (730 × 420 mm)",
    p1: [longWallX - counterDepth - 0.02, 0.93, cookCenterZ - hobLen / 2],
    p2: [longWallX - counterDepth - 0.02, 0.93, cookCenterZ + hobLen / 2],
    axis: 'z'
  };

  addBox(counterDepth - 0.06, plinthHeight, cookLen, plinthMat, plinthMidX, plinthHeight / 2, cookCenterZ);
  addBox(counterDepth, slabThick, cookLen, marbleMat, baseMidX, counterTopY - slabThick / 2, cookCenterZ);

  // Built-in Oven
  const ovenW = 0.60;
  const ovenH = 0.60;
  const ovenY = plinthHeight + ovenH / 2 + 0.02;
  addBox(counterDepth - 0.02, ovenH, ovenW, matteBlackMat, baseMidX, ovenY, cookCenterZ);
  addBox(0.015, ovenH - 0.12, ovenW - 0.08, smokedGlassMat, longWallX - counterDepth - 0.005, ovenY - 0.03, cookCenterZ, 0, cookingDim);
  addBox(0.02, 0.022, ovenW - 0.12, stainlessMat, longWallX - counterDepth - 0.032, ovenY + 0.18, cookCenterZ, 0, cookingDim);

  // --- INTERACTIVE COOKWARE DRAWER UNDER OVEN ---
  const drawerSlideGroup = new THREE.Group();
  drawerSlideGroup.position.set(0, 0, 0);
  kitchenGroup.add(drawerSlideGroup);

  const drawerFront = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.12, ovenW), matteBlackMat);
  drawerFront.position.set(mx(longWallX - counterDepth - 0.01), plinthHeight / 2 + 0.04, cookCenterZ);
  drawerFront.castShadow = true;
  drawerSlideGroup.add(drawerFront);

  // Stainless Steel Cookware inside drawer
  const panBody = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.10, 0.05, 20), stainlessMat);
  panBody.position.set(mx(longWallX - counterDepth + 0.18), plinthHeight / 2 + 0.04, cookCenterZ);
  drawerSlideGroup.add(panBody);
  const panHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.18, 12), matteBlackMat);
  panHandle.rotation.x = Math.PI / 2;
  panHandle.position.set(mx(longWallX - counterDepth + 0.18), plinthHeight / 2 + 0.05, cookCenterZ + 0.16);
  drawerSlideGroup.add(panHandle);

  const cookwareDrawerController = {
    id: "cook_drawer",
    isOpen: false,
    progress: 0,
    toggle() {
      this.isOpen = !this.isOpen;
      audio.playCabinet(this.isOpen);
    },
    getPromptText() {
      return this.isOpen ? "Close Cookware Drawer" : "Open Cookware Drawer";
    },
    update(delta) {
      this.progress = THREE.MathUtils.damp(this.progress, this.isOpen ? 1 : 0, 8.0, delta);
      drawerSlideGroup.position.x = mx(this.progress * (isCarportLeft ? -0.36 : 0.36));
    }
  };

  registerInteractable(drawerFront, cookwareDrawerController);

  // Modena BH 2725 GBBK Gas Hob Glass Plate
  const hobGlass = addBox(hobWidth, 0.008, hobLen, gasHobGlassMat, hobCenterX, counterTopY + 0.004, cookCenterZ, 0, cookingDim);

  // Modena silver brand badge
  const modenaBadge = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.002, 0.065), stainlessMat);
  modenaBadge.position.set(mx(hobCenterX - hobWidth / 2 + 0.015), counterTopY + 0.009, cookCenterZ);
  kitchenGroup.add(modenaBadge);

  // Dual Double-Ring Brass Gas Burners & Cast Iron Trivets
  const activeBurnerZ = cookCenterZ - 0.19; // Left burner is interactive
  const rightBurnerZ = cookCenterZ + 0.19;

  [activeBurnerZ, rightBurnerZ].forEach(curBZ => {
    const alumBody = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.062, 0.022, 24), stainlessMat);
    alumBody.position.set(mx(hobCenterX), counterTopY + 0.015, curBZ);
    kitchenGroup.add(alumBody);

    const brassCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.008, 24), brassBurnerMat);
    brassCrown.position.set(mx(hobCenterX), counterTopY + 0.026, curBZ);
    kitchenGroup.add(brassCrown);

    const bCap = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.008, 24), matteBlackMat);
    bCap.position.set(mx(hobCenterX), counterTopY + 0.032, curBZ);
    kitchenGroup.add(bCap);

    // Cast iron pan support grid
    const gridSpan = 0.21;
    addBox(gridSpan, 0.016, 0.016, castIronMat, hobCenterX, counterTopY + 0.040, curBZ - gridSpan / 2 + 0.008);
    addBox(gridSpan, 0.016, 0.016, castIronMat, hobCenterX, counterTopY + 0.040, curBZ + gridSpan / 2 - 0.008);
    addBox(0.016, 0.016, gridSpan, castIronMat, hobCenterX - gridSpan / 2 + 0.008, counterTopY + 0.040, curBZ);
    addBox(0.016, 0.016, gridSpan, castIronMat, hobCenterX + gridSpan / 2 - 0.008, counterTopY + 0.040, curBZ);
  });

  // --- INTERACTIVE GAS FLAME & BURNER CONTROLLER ---
  const flameGroup = new THREE.Group();
  flameGroup.position.set(mx(hobCenterX), counterTopY + 0.036, activeBurnerZ);
  flameGroup.visible = false;
  kitchenGroup.add(flameGroup);

  // Outer ring of 16 blue gas flame jets
  for (let fi = 0; fi < 16; fi++) {
    const ang = (fi / 16) * Math.PI * 2;
    const jet = new THREE.Mesh(new THREE.ConeGeometry(0.007, 0.024, 8), blueFlameMat);
    jet.rotation.x = Math.PI / 2;
    jet.position.set(Math.cos(ang) * 0.056, 0.008, Math.sin(ang) * 0.056);
    flameGroup.add(jet);
  }
  // Inner ring of blue flame
  const innerRingMesh = new THREE.Mesh(new THREE.TorusGeometry(0.030, 0.006, 8, 20), innerFlameMat);
  innerRingMesh.rotation.x = Math.PI / 2;
  flameGroup.add(innerRingMesh);

  // Dynamic Blue Flame Point Light
  const flameLight = new THREE.PointLight(0x00d4ff, 0, 1.6, 1.5);
  flameLight.position.set(mx(hobCenterX), counterTopY + 0.12, activeBurnerZ);
  kitchenGroup.add(flameLight);

  // Knurled Modena Metallic Control Knobs
  const knobHinge = new THREE.Group();
  knobHinge.position.set(mx(hobCenterX - 0.15), counterTopY + 0.022, cookCenterZ - 0.045);
  kitchenGroup.add(knobHinge);
  const knobDial = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.016, 16), matteBlackMat);
  knobHinge.add(knobDial);

  const knob2 = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.016, 16), matteBlackMat);
  knob2.position.set(mx(hobCenterX - 0.15), counterTopY + 0.022, cookCenterZ + 0.045);
  kitchenGroup.add(knob2);

  const burnerController = {
    id: "stove_burner",
    isOpen: false,
    progress: 0,
    toggle() {
      this.isOpen = !this.isOpen;
      audio.playBurner(this.isOpen);
    },
    getPromptText() {
      return this.isOpen ? "Turn Off Stove Flame" : "Turn On Modena Gas Burner";
    },
    update(delta) {
      this.progress = THREE.MathUtils.damp(this.progress, this.isOpen ? 1 : 0, 10, delta);
      knobHinge.rotation.y = this.progress * 1.57;
      flameGroup.visible = this.progress > 0.05;
      const flicker = 0.92 + Math.sin(Date.now() * 0.03) * 0.09;
      flameGroup.scale.set(this.progress, this.progress * flicker, this.progress);
      flameLight.intensity = this.progress * (1.3 + Math.sin(Date.now() * 0.02) * 0.25);
    }
  };

  registerInteractable(knobDial, burnerController);
  registerInteractable(hobGlass, burnerController);

  // Cooker Hood (Exact: 700 x 480 x 100 mm)
  const hoodL = 0.70;
  const hoodW = 0.48;
  const hoodH = 0.10;
  const hoodY = upperBottomY - hoodH / 2; // 1.50m
  const hoodCenterX = longWallX - hoodW / 2;
  const hoodDim = {
    label: "Cooker Hood (700 × 480 × 100 mm)",
    p1: [longWallX - hoodW, upperBottomY, cookCenterZ - hoodL / 2],
    p2: [longWallX - hoodW, upperBottomY, cookCenterZ + hoodL / 2],
    axis: 'z'
  };
  addBox(hoodW, hoodH, hoodL, matteBlackMat, hoodCenterX, hoodY, cookCenterZ, 0, hoodDim);
  addBox(0.008, 0.020, hoodL, stainlessMat, longWallX - hoodW - 0.004, hoodY, cookCenterZ);

  // 4C. Right Buffer Prep Counter (400mm: Z in [0.85, 1.25])
  const bufLen = 0.40;
  const bufCenterZ = (0.85 + 1.25) / 2; // 1.05m
  addBox(counterDepth - 0.02, cabHeight, bufLen, matteBlackMat, baseMidX, plinthHeight + cabHeight / 2, bufCenterZ);
  addBox(counterDepth - 0.06, plinthHeight, bufLen, plinthMat, plinthMidX, plinthHeight / 2, bufCenterZ);
  addBox(0.025, 0.035, bufLen, recessedGrooveMat, longWallX - counterDepth, counterBaseY - 0.02, bufCenterZ);
  addBox(counterDepth, slabThick, bufLen, marbleMat, baseMidX, counterTopY - slabThick / 2, bufCenterZ);

  // Backsplash & Upper Cabinets on Long Wall
  const lBacksplashLen = 2.40;
  const lBacksplashMidZ = (-1.15 + 1.25) / 2; // 0.05m
  const lBacksplashMat = create10cmBeigeCeramicMat(lBacksplashLen, backsplashH);
  addBox(0.020, backsplashH, lBacksplashLen, lBacksplashMat, longWallX - 0.010, backsplashMidY, lBacksplashMidZ);

  // Upper Cabinets flanking Hood
  const upperMidX_long = longWallX - upperDepth / 2;
  addBox(upperDepth, upperHeight, 0.60, matteBlackMat, upperMidX_long, upperMidY, -0.25);
  addBox(upperDepth, upperHeight, 0.50, matteBlackMat, upperMidX_long, upperMidY, 1.00);

  // Task downlight
  const ledLightLong1 = new THREE.PointLight(0xffdfa8, 1.1, 3.0, 1.3);
  ledLightLong1.position.set(mx(longWallX - 0.22), upperBottomY - 0.06, cookCenterZ);
  kitchenGroup.add(ledLightLong1);

  // =========================================================================
  // 5. TALL REFRIGERATOR ENCLOSURE & INTERACTIVE REFRIGERATOR (Z in [1.25, 2.05])
  // =========================================================================
  const tallCabW = 0.80;
  const tallCabCenterZ = (1.25 + 2.05) / 2; // 1.65m
  const fridgeDepth = 0.68;
  const fridgeCenterX = longWallX - fridgeDepth / 2; // 2.16m
  const fridgeBodyH = 1.82;
  const fridgeW = 0.70;
  const fridgeFrontX = longWallX - fridgeDepth + 0.02;

  const cabinetDim = {
    label: "800 mm Tall Cabinet",
    p1: [longWallX - fridgeDepth - 0.02, 2.10, 1.25],
    p2: [longWallX - fridgeDepth - 0.02, 2.10, 2.05],
    axis: 'z'
  };

  const fridgeDim = {
    label: "700 mm Refrigerator",
    p1: [longWallX - fridgeDepth - 0.035, 1.20, 1.29],
    p2: [longWallX - fridgeDepth - 0.035, 1.20, 1.99],
    axis: 'z'
  };

  const gableThick = 0.02;
  // Exterior Housing Enclosure (Cabinet framing)
  addBox(fridgeDepth, tallCabinetH, gableThick, brushedFridgeMat, fridgeCenterX, tallCabinetH / 2, 1.25 + gableThick / 2, 0, cabinetDim);
  addBox(fridgeDepth, tallCabinetH, gableThick, brushedFridgeMat, fridgeCenterX, tallCabinetH / 2, 2.05 - gableThick / 2, 0, cabinetDim);
  addBox(fridgeDepth, gableThick, tallCabW, brushedFridgeMat, fridgeCenterX, tallCabinetH - gableThick / 2, tallCabCenterZ, 0, cabinetDim);
  addBox(fridgeDepth, 0.50, tallCabW - gableThick * 2, brushedFridgeMat, fridgeCenterX, fridgeBodyH + 0.27, tallCabCenterZ, 0, cabinetDim);

  // --- REFRIGERATOR INTERIOR CAVITY & SHELVES ---
  const fCavW = fridgeW - 0.08; // ~0.62m
  const fCavD = fridgeDepth - 0.12;
  const fCavH = fridgeBodyH - 0.08;
  const fCavX = fridgeCenterX + 0.05;

  // White Glossy Insulated Interior Walls
  addBox(fCavD, fCavH, fCavW, fridgeInteriorMat, fCavX, fridgeBodyH / 2, tallCabCenterZ);

  // 3 Tempered Glass Shelves with Edge Light
  [0.55, 0.95, 1.35].forEach(sy => {
    addBox(fCavD - 0.04, 0.010, fCavW - 0.02, clearGlassMat, fCavX, sy, tallCabCenterZ);
  });

  // Food & Beverages inside fridge:
  // Top Shelf: Milk Carton & 1L Orange Juice Bottle
  addBox(0.08, 0.18, 0.08, new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3 }), fCavX + 0.05, 1.35 + 0.09, tallCabCenterZ - 0.14);
  const juiceMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.20, 16), new THREE.MeshPhysicalMaterial({ color: 0xf97316, transmission: 0.85, roughness: 0.1 }));
  juiceMesh.position.set(mx(fCavX + 0.05), 1.35 + 0.10, tallCabCenterZ + 0.14);
  kitchenGroup.add(juiceMesh);

  // Middle Shelf: 3 Soda Cans & Fresh Salad Bowl
  const canColors = [0xef4444, 0x3b82f6, 0x10b981];
  canColors.forEach((cc, ci) => {
    const can = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.11, 16), new THREE.MeshStandardMaterial({ color: cc, metalness: 0.85, roughness: 0.2 }));
    can.position.set(mx(fCavX + 0.06), 0.95 + 0.055, tallCabCenterZ - 0.16 + ci * 0.075);
    kitchenGroup.add(can);
  });

  // Bottom Crisper Drawer
  addBox(fCavD - 0.06, 0.28, fCavW - 0.04, new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.75, roughness: 0.3 }), fCavX, 0.14 + 0.14, tallCabCenterZ);

  // Glowing Cool White Interior LED Light
  const fridgeInteriorLight = new THREE.PointLight(0xe0f2fe, 0, 2.2, 1.2);
  fridgeInteriorLight.position.set(mx(fCavX - 0.10), fridgeBodyH - 0.25, tallCabCenterZ);
  kitchenGroup.add(fridgeInteriorLight);

  // --- REFRIGERATOR DOOR HINGE (HINGED AT REAR WALL SIDE, SWINGING WIDE TOWARDS WORKSPACE) ---
  // The hinge is placed at Z = 2.01m (against the end panel).
  // The door extends from Z = 2.01m towards Z = 1.33m.
  // The handle is placed at the front Z = 1.33m (closest to the cook!).
  const fDoorLen = fridgeW - 0.02; // 0.68m
  const fHingeZ = 2.05 - gableThick - 0.01; // 2.02m

  const fridgeDoorHinge = new THREE.Group();
  fridgeDoorHinge.position.set(mx(fridgeFrontX), fridgeBodyH / 2, fHingeZ);
  kitchenGroup.add(fridgeDoorHinge);

  // In local space of fridgeDoorHinge:
  // Hinge is at (0, 0, 0).
  // The door extends along -Z by 0.68m.
  // Its center is at local Z = -0.34m, X = 0.
  const fridgeDoorMesh = new THREE.Mesh(new THREE.BoxGeometry(0.045, fridgeBodyH, fDoorLen), brushedFridgeMat);
  fridgeDoorMesh.position.set(0, 0, -fDoorLen / 2);
  fridgeDoorMesh.castShadow = true;
  fridgeDoorHinge.add(fridgeDoorMesh);

  // Vertical Stainless Steel Handle near front edge (local Z = -0.62m, closest to the cook)
  const fridgeHandleMesh = new THREE.Mesh(new THREE.BoxGeometry(0.024, 1.10, 0.025), stainlessMat);
  fridgeHandleMesh.position.set(isCarportLeft ? -0.038 : 0.038, -0.04, -fDoorLen + 0.06);
  fridgeDoorHinge.add(fridgeHandleMesh);

  // Eye-level Digital LED Display
  const ledDisplayMesh = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.065, 0.16), matteBlackMat);
  ledDisplayMesh.position.set(isCarportLeft ? -0.025 : 0.025, 0.55, -fDoorLen / 2);
  fridgeDoorHinge.add(ledDisplayMesh);

  // Inner Door Racks with Beverage/Condiment Bottles (attached to door so they rotate with it!)
  const rackMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.7, roughness: 0.2 });
  [0.10, -0.30].forEach(ry => {
    const dRack = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.09, fDoorLen - 0.10), rackMat);
    dRack.position.set(isCarportLeft ? 0.05 : -0.05, ry, -fDoorLen / 2);
    fridgeDoorHinge.add(dRack);
  });

  const fridgeController = {
    id: "fridge_door",
    isOpen: false,
    progress: 0,
    toggle() {
      this.isOpen = !this.isOpen;
      audio.playFridge(this.isOpen);
    },
    getPromptText() {
      return this.isOpen ? "Close Refrigerator" : "Open Refrigerator";
    },
    update(delta) {
      this.progress = THREE.MathUtils.damp(this.progress, this.isOpen ? 1 : 0, 8.5, delta);
      // When opening: handle swings from local -Z towards -X into the room!
      // In Three.js: rotating by +Math.PI/2 moves (0, 0, -0.68) to (-0.68, 0, 0)
      const openAngle = isCarportLeft ? (Math.PI / 2 + 0.15) : (-Math.PI / 2 - 0.15);
      fridgeDoorHinge.rotation.y = this.progress * openAngle;
      fridgeInteriorLight.intensity = this.progress * 2.2;
    }
  };

  registerInteractable(fridgeDoorMesh, fridgeController);
  registerInteractable(fridgeHandleMesh, fridgeController);

  // =========================================================================
  // 6. COLLIDERS
  // =========================================================================
  if (colliders && Array.isArray(colliders)) {
    const shortBox = new THREE.Box3();
    const sMinX = Math.min(mx(0.30), mx(2.50));
    const sMaxX = Math.max(mx(0.30), mx(2.50));
    shortBox.min.set(sMinX, 0, facingWallZ);
    shortBox.max.set(sMaxX, 2.35, facingWallZ + counterDepth + 0.04);
    colliders.push(shortBox);

    const longBox = new THREE.Box3();
    const lMinX = Math.min(mx(longWallX - counterDepth), mx(longWallX));
    const lMaxX = Math.max(mx(longWallX - counterDepth), mx(longWallX));
    longBox.min.set(lMinX, 0, facingWallZ + counterDepth);
    longBox.max.set(lMaxX, 2.35, 1.25);
    colliders.push(longBox);

    const fridgeBox = new THREE.Box3();
    const fMinX = Math.min(mx(longWallX - fridgeDepth), mx(longWallX));
    const fMaxX = Math.max(mx(longWallX - fridgeDepth), mx(longWallX));
    fridgeBox.min.set(fMinX, 0, 1.25);
    fridgeBox.max.set(fMaxX, 2.35, 2.05);
    colliders.push(fridgeBox);
  }

  scene.add(kitchenGroup);
  return kitchenGroup;
}
