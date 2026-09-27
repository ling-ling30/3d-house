import * as THREE from 'three';
import {
  createGlazedBeigeTileTexture,
  createWhiteMarbleCounterTexture,
  createWarmOakTexture
} from './textures.js';

export function buildKitchenSuite(scene, colliders, houseData) {
  const isCarportLeft = houseData.carportOnLeft !== false;
  const kitchenGroup = new THREE.Group();
  kitchenGroup.name = "kitchenSuite";
  kitchenGroup.userData.interactables = [];

  // Textures
  const beigeTileTex = createGlazedBeigeTileTexture();
  const marbleTex = createWhiteMarbleCounterTexture();
  const oakTex = createWarmOakTexture();

  // Materials: Architectural Matte Graphite Charcoal (realistic non-pure-black with soft specular sheen)
  const matteBlackMat = new THREE.MeshStandardMaterial({
    color: 0x2c2e33,
    roughness: 0.48,
    metalness: 0.10
  });

  const recessedGrooveMat = new THREE.MeshStandardMaterial({
    color: 0x1c1e21,
    roughness: 0.7
  });

  const plinthMat = new THREE.MeshStandardMaterial({
    color: 0x232529,
    roughness: 0.65
  });

  const marbleMat = new THREE.MeshStandardMaterial({
    map: marbleTex,
    roughness: 0.18,
    metalness: 0.05
  });

  const backsplashMat = new THREE.MeshStandardMaterial({
    map: beigeTileTex,
    roughness: 0.35,
    metalness: 0.08
  });

  const oakMat = new THREE.MeshStandardMaterial({
    map: oakTex,
    roughness: 0.45,
    metalness: 0.02
  });

  const faucetMat = new THREE.MeshStandardMaterial({
    color: 0x292b2f,
    roughness: 0.32,
    metalness: 0.78
  });

  const sinkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x2d3036,
    roughness: 0.38,
    metalness: 0.65
  });

  const stainlessMat = new THREE.MeshStandardMaterial({
    color: 0xd1d5db,
    roughness: 0.28,
    metalness: 0.85
  });

  const glassHobMat = new THREE.MeshStandardMaterial({
    color: 0x1d1f24,
    roughness: 0.08,
    metalness: 0.88
  });

  const castIronMat = new THREE.MeshStandardMaterial({
    color: 0x34373c,
    roughness: 0.78,
    metalness: 0.25
  });

  const brassBurnerMat = new THREE.MeshStandardMaterial({
    color: 0xc8963e,
    roughness: 0.35,
    metalness: 0.8
  });

  const fridgeMat = new THREE.MeshStandardMaterial({
    color: 0x33363b,
    roughness: 0.38,
    metalness: 0.65
  });

  const smokedGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x1e2024,
    roughness: 0.12,
    transmission: 0.6,
    transparent: true,
    opacity: 0.85
  });

  const ledEmissiveMat = new THREE.MeshBasicMaterial({
    color: 0xffdfa0
  });

  // Mirror coordinate transformer:
  function mx(x) {
    return isCarportLeft ? x : -x;
  }

  // Helper to add box mesh with shadow and optional dimension line metadata
  function addBox(w, h, d, mat, x, y, z, rotY = 0, dimInfo = null) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(mx(x), y, z);
    mesh.rotation.y = isCarportLeft ? rotY : -rotY;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    if (dimInfo) {
      mesh.userData.dimInfo = {
        ...dimInfo,
        p1: [mx(dimInfo.p1[0]), dimInfo.p1[1], dimInfo.p1[2]],
        p2: [mx(dimInfo.p2[0]), dimInfo.p2[1], dimInfo.p2[2]]
      };
      kitchenGroup.userData.interactables.push(mesh);
    }

    kitchenGroup.add(mesh);
    return mesh;
  }

  function registerItem(mesh, dimInfo) {
    if (mesh && dimInfo) {
      mesh.userData.dimInfo = {
        ...dimInfo,
        p1: [mx(dimInfo.p1[0]), dimInfo.p1[1], dimInfo.p1[2]],
        p2: [mx(dimInfo.p2[0]), dimInfo.p2[1], dimInfo.p2[2]]
      };
      kitchenGroup.userData.interactables.push(mesh);
    }
    return mesh;
  }

  // =========================================================================
  // 1. SHORT FACING WALL (2.20m: X in [0.30, 2.50], Z = -1.15) – WET & CLEANING ZONE
  // Total Width = 2.20m = 20cm (Buffer) + 80cm (Sink) + 60cm (Drying) + 60cm (Corner)
  // =========================================================================
  const facingWallZ = -1.15;
  const counterDepth = 0.60;
  const counterTopY = 0.90;
  const slabThick = 0.04;
  const counterBaseY = counterTopY - slabThick; // 0.86
  const plinthHeight = 0.10;
  const cabHeight = counterBaseY - plinthHeight; // 0.76

  // Plinth (Toe-kick) recessed 0.05m
  const plinthZ = facingWallZ + (counterDepth - 0.05) / 2 + 0.01;
  addBox(2.20, plinthHeight, counterDepth - 0.06, plinthMat, 1.40, plinthHeight / 2, plinthZ);

  // Base Cabinet Carcass & Doors (Matte Black)
  const cabZ = facingWallZ + counterDepth / 2;
  const cabMidY = plinthHeight + cabHeight / 2;
  addBox(2.20, cabHeight, counterDepth - 0.02, matteBlackMat, 1.40, cabMidY, cabZ);

  // Recessed Handleless J-Pull Finger Groove along top edge
  addBox(2.20, 0.035, 0.025, recessedGrooveMat, 1.40, counterBaseY - 0.02, facingWallZ + counterDepth);

  // Door division shadow lines
  [0.50, 0.90, 1.30, 1.90].forEach(gx => {
    addBox(0.004, cabHeight - 0.04, 0.005, recessedGrooveMat, gx, cabMidY - 0.015, facingWallZ + counterDepth + 0.002);
  });
  addBox(0.59, 0.004, 0.005, recessedGrooveMat, 1.60, cabMidY, facingWallZ + counterDepth + 0.002);

  // Front counter edge Z position for dimension lines
  const frontEdgeZ = facingWallZ + counterDepth + 0.02;

  // --- 1A. Left Wall Buffer (200mm: X in [0.30, 0.50]) ---
  const bufferDim = {
    label: "|-- 200 mm --|",
    p1: [0.30, 0.93, frontEdgeZ],
    p2: [0.50, 0.93, frontEdgeZ],
    axis: 'x'
  };
  addBox(0.20, slabThick, counterDepth, marbleMat, 0.40, counterTopY - slabThick / 2, cabZ, 0, bufferDim);

  // --- 1B. Undermount Sink (800mm: X in [0.50, 1.30]) ---
  const sinkCenterX = 0.90;
  const sinkCenterZ = facingWallZ + 0.35; // Z = -0.80
  const sinkDepthM = 0.254; // 25.4 cm depth
  const basinFloorY = counterTopY - sinkDepthM; // ~0.646

  const sinkDim = {
    label: "|-- 800 mm --|",
    p1: [0.50, 0.93, frontEdgeZ],
    p2: [1.30, 0.93, frontEdgeZ],
    axis: 'x'
  };

  addBox(0.80, slabThick, 0.07, marbleMat, 0.90, counterTopY - slabThick / 2, facingWallZ + 0.035, 0, sinkDim);
  addBox(0.80, slabThick, 0.07, marbleMat, 0.90, counterTopY - slabThick / 2, facingWallZ + counterDepth - 0.035, 0, sinkDim);

  addBox(0.76, 0.015, 0.44, sinkMetalMat, sinkCenterX, basinFloorY, sinkCenterZ, 0, sinkDim);
  addBox(0.76, sinkDepthM, 0.015, sinkMetalMat, sinkCenterX, basinFloorY + sinkDepthM / 2, sinkCenterZ - 0.22, 0, sinkDim);
  addBox(0.76, sinkDepthM, 0.015, sinkMetalMat, sinkCenterX, basinFloorY + sinkDepthM / 2, sinkCenterZ + 0.22, 0, sinkDim);
  addBox(0.015, sinkDepthM, 0.44, sinkMetalMat, sinkCenterX - 0.38, basinFloorY + sinkDepthM / 2, sinkCenterZ, 0, sinkDim);
  addBox(0.015, sinkDepthM, 0.44, sinkMetalMat, sinkCenterX + 0.38, basinFloorY + sinkDepthM / 2, sinkCenterZ, 0, sinkDim);

  // Drain strainer in sink
  const drainMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.005, 24), stainlessMat);
  drainMesh.position.set(mx(sinkCenterX), basinFloorY + 0.01, sinkCenterZ);
  drainMesh.receiveShadow = true;
  kitchenGroup.add(drainMesh);

  // Arching matte black gooseneck faucet (200mm reach / span)
  const faucetDim = {
    label: "|-- 200 mm --|",
    p1: [sinkCenterX - 0.10, counterTopY + 0.38, facingWallZ + 0.18],
    p2: [sinkCenterX + 0.10, counterTopY + 0.38, facingWallZ + 0.18],
    axis: 'x'
  };
  const faucetBase = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.030, 0.05, 20), faucetMat);
  faucetBase.position.set(mx(sinkCenterX), counterTopY + 0.025, facingWallZ + 0.08);
  registerItem(faucetBase, faucetDim);
  kitchenGroup.add(faucetBase);

  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.22, 16), faucetMat);
  stem.position.set(mx(sinkCenterX), counterTopY + 0.05 + 0.11, facingWallZ + 0.08);
  registerItem(stem, faucetDim);
  kitchenGroup.add(stem);

  const archGeo = new THREE.TorusGeometry(0.09, 0.014, 12, 24, Math.PI);
  const arch = new THREE.Mesh(archGeo, faucetMat);
  arch.rotation.z = Math.PI / 2;
  arch.rotation.y = isCarportLeft ? Math.PI / 2 : -Math.PI / 2;
  arch.position.set(mx(sinkCenterX), counterTopY + 0.27, facingWallZ + 0.08 + (isCarportLeft ? 0.09 : -0.09));
  registerItem(arch, faucetDim);
  kitchenGroup.add(arch);

  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.013, 0.06, 16), faucetMat);
  nozzle.position.set(mx(sinkCenterX), counterTopY + 0.24, facingWallZ + 0.26);
  registerItem(nozzle, faucetDim);
  kitchenGroup.add(nozzle);

  const leverHub = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.03, 16), faucetMat);
  leverHub.rotation.z = Math.PI / 2;
  leverHub.position.set(mx(sinkCenterX + 0.04), counterTopY + 0.09, facingWallZ + 0.08);
  kitchenGroup.add(leverHub);

  const leverStick = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.08, 12), faucetMat);
  leverStick.position.set(mx(sinkCenterX + 0.055), counterTopY + 0.13, facingWallZ + 0.08);
  kitchenGroup.add(leverStick);

  // --- 1C. Dish Drying Space (600mm: X in [1.30, 1.90]) ---
  const rackX = 1.60;
  const rackZ = facingWallZ + 0.32;
  const dryingDim = {
    label: "|-- 600 mm --|",
    p1: [1.30, 0.93, frontEdgeZ],
    p2: [1.90, 0.93, frontEdgeZ],
    axis: 'x'
  };
  addBox(0.60, slabThick, counterDepth, marbleMat, 1.60, counterTopY - slabThick / 2, cabZ, 0, dryingDim);
  addBox(0.48, 0.012, 0.36, matteBlackMat, rackX, counterTopY + 0.006, rackZ, 0, dryingDim);

  const wireMat = new THREE.MeshStandardMaterial({ color: 0x1f1f1f, roughness: 0.4, metalness: 0.8 });
  addBox(0.48, 0.01, 0.01, wireMat, rackX, counterTopY + 0.18, rackZ - 0.17, 0, dryingDim);
  addBox(0.48, 0.01, 0.01, wireMat, rackX, counterTopY + 0.18, rackZ + 0.17, 0, dryingDim);
  addBox(0.01, 0.01, 0.34, wireMat, rackX - 0.235, counterTopY + 0.18, rackZ, 0, dryingDim);
  addBox(0.01, 0.01, 0.34, wireMat, rackX + 0.235, counterTopY + 0.18, rackZ, 0, dryingDim);
  [[-0.235, -0.17], [0.235, -0.17], [-0.235, 0.17], [0.235, 0.17]].forEach(([dx, dz]) => {
    addBox(0.012, 0.18, 0.012, wireMat, rackX + dx, counterTopY + 0.09, rackZ + dz, 0, dryingDim);
  });

  const plateMat = new THREE.MeshStandardMaterial({ color: 0xf4f4f4, roughness: 0.15 });
  for (let pi = 0; pi < 6; pi++) {
    const ppx = rackX - 0.15 + pi * 0.05;
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.008, 24), plateMat);
    plate.rotation.z = Math.PI / 2;
    plate.position.set(mx(ppx), counterTopY + 0.13, rackZ - 0.04);
    plate.castShadow = true;
    registerItem(plate, dryingDim);
    kitchenGroup.add(plate);
  }
  addBox(0.08, 0.12, 0.10, matteBlackMat, rackX + 0.18, counterTopY + 0.07, rackZ + 0.10, 0, dryingDim);

  // Hanging rail rod
  const rodY = counterTopY + 0.42;
  addBox(0.65, 0.014, 0.014, faucetMat, 1.60, rodY, facingWallZ + 0.035, 0, dryingDim);
  addBox(0.02, 0.03, 0.035, faucetMat, 1.32, rodY, facingWallZ + 0.02);
  addBox(0.02, 0.03, 0.035, faucetMat, 1.88, rodY, facingWallZ + 0.02);
  for (let hi = 0; hi < 3; hi++) {
    const hx = 1.45 + hi * 0.12;
    addBox(0.006, 0.04, 0.006, stainlessMat, hx, rodY - 0.025, facingWallZ + 0.035);
    addBox(0.02, 0.18, 0.008, stainlessMat, hx, rodY - 0.12, facingWallZ + 0.038);
  }

  // --- 1D. Backsplash on Short Facing Wall ---
  const backsplashHeight = 0.65;
  const backsplashMidY = counterTopY + backsplashHeight / 2; // 1.225
  const backsplashDim = {
    label: "|-- 2200 mm --|",
    p1: [0.30, backsplashMidY + 0.28, facingWallZ + 0.03],
    p2: [2.50, backsplashMidY + 0.28, facingWallZ + 0.03],
    axis: 'x'
  };
  addBox(2.20, backsplashHeight, 0.015, backsplashMat, 1.40, backsplashMidY, facingWallZ + 0.008, 0, backsplashDim);

  // --- 1E. Upper Cabinets on Short Facing Wall (1500mm) ---
  const upperDepth = 0.35;
  const upperHeight = 0.80;
  const upperBottomY = 1.55;
  const upperMidY = upperBottomY + upperHeight / 2;
  const upperZ_short = facingWallZ + upperDepth / 2;

  const upperCabDim = {
    label: "|-- 1500 mm --|",
    p1: [0.40, upperBottomY - 0.03, facingWallZ + upperDepth + 0.02],
    p2: [1.90, upperBottomY - 0.03, facingWallZ + upperDepth + 0.02],
    axis: 'x'
  };
  addBox(1.50, upperHeight, upperDepth, matteBlackMat, 1.15, upperMidY, upperZ_short, 0, upperCabDim);
  [0.90, 1.40].forEach(gx => {
    addBox(0.004, upperHeight - 0.04, 0.005, recessedGrooveMat, gx, upperMidY, upperZ_short + upperDepth / 2 + 0.002);
  });
  addBox(1.50, 0.02, 0.02, recessedGrooveMat, 1.15, upperBottomY + 0.01, upperZ_short + upperDepth / 2 - 0.02);

  // Warm LED Under-Cabinet Strip Light
  const ledDim = {
    label: "|-- 1500 mm --|",
    p1: [0.40, upperBottomY - 0.01, upperZ_short + upperDepth / 2 - 0.03],
    p2: [1.90, upperBottomY - 0.01, upperZ_short + upperDepth / 2 - 0.03],
    axis: 'x'
  };
  addBox(1.48, 0.01, 0.02, ledEmissiveMat, 1.15, upperBottomY - 0.005, upperZ_short + upperDepth / 2 - 0.03, 0, ledDim);
  const ledLightShort = new THREE.PointLight(0xffdfa0, 0.85, 2.5, 1.5);
  ledLightShort.position.set(mx(1.15), upperBottomY - 0.05, facingWallZ + 0.20);
  kitchenGroup.add(ledLightShort);


  // =========================================================================
  // 2. LONG RIGHT WALL (3.20m: X = 2.50, Z in [-1.15, 2.05])
  // - Corner: 600 mm (Z: -1.15 to -0.55)
  // - Prep Buffer: 500 mm (Z: -0.55 to -0.05)
  // - Cooking Station (Modena Hob): 730 mm (Z: -0.05 to 0.68)
  // - Microwave & Oak Tower: 400 mm (Z: 0.68 to 1.08)
  // - Transition Buffer: 270 mm (Z: 1.08 to 1.35)
  // - Refrigerator Enclosure: 700 mm (Z: 1.35 to 2.05)
  // Total = 600 + 500 + 730 + 400 + 270 + 700 = 3200 mm = 3.20m EXACT!
  // =========================================================================
  const longWallX = 2.50;
  const baseMidX = longWallX - counterDepth / 2; // 2.20
  const plinthMidX = longWallX - (counterDepth - 0.05) / 2 - 0.01;
  const longEdgeX = longWallX - counterDepth - 0.02; // front edge facing the room

  // --- 2A. L-Junction Corner Base (600mm: Z in [-1.15, -0.55]) ---
  const cornerDim = {
    label: "|-- 600 mm --|",
    p1: [longEdgeX, 0.93, -1.15],
    p2: [longEdgeX, 0.93, -0.55],
    axis: 'z'
  };
  addBox(counterDepth, slabThick, counterDepth, marbleMat, baseMidX, counterTopY - slabThick / 2, facingWallZ + counterDepth / 2, 0, cornerDim);

  // --- 2B. Prep Buffer (450mm: Z in [-0.55, -0.10]) ---
  const prepZ = (-0.55 + -0.10) / 2; // -0.325
  const prepLen = 0.45;
  const prepDim = {
    label: "|-- 450 mm --|",
    p1: [longEdgeX, 0.93, -0.55],
    p2: [longEdgeX, 0.93, -0.10],
    axis: 'z'
  };
  addBox(counterDepth - 0.02, cabHeight, prepLen, matteBlackMat, baseMidX, cabMidY, prepZ);
  addBox(counterDepth - 0.06, plinthHeight, prepLen, plinthMat, plinthMidX, plinthHeight / 2, prepZ);
  addBox(0.025, 0.035, prepLen, recessedGrooveMat, longWallX - counterDepth, counterBaseY - 0.02, prepZ);
  addBox(counterDepth, slabThick, prepLen, marbleMat, baseMidX, counterTopY - slabThick / 2, prepZ, 0, prepDim);

  addBox(0.32, 0.03, 0.36, oakMat, longWallX - 0.32, counterTopY + 0.015, prepZ, 0, prepDim);
  const crockMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.05, 0.14, 20),
    new THREE.MeshStandardMaterial({ color: 0xded8cc, roughness: 0.3 })
  );
  crockMesh.position.set(mx(longWallX - 0.16), counterTopY + 0.07, -0.42);
  registerItem(crockMesh, prepDim);
  kitchenGroup.add(crockMesh);
  for (let si = 0; si < 3; si++) {
    const spoon = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.22, 10), oakMat);
    spoon.rotation.x = 0.15 * (si - 1);
    spoon.rotation.z = (isCarportLeft ? 1 : -1) * 0.18;
    spoon.position.set(mx(longWallX - 0.16 + (si - 1) * 0.015), counterTopY + 0.15, -0.42 + (si - 1) * 0.015);
    kitchenGroup.add(spoon);
  }

  // --- 2C. Cooking Station (730mm: Z in [-0.10, 0.63]) ---
  const cookLen = 0.73;
  const cookZ = (-0.10 + 0.63) / 2; // 0.265
  const cookingDim = {
    label: "|-- 730 mm --|",
    p1: [longEdgeX, 0.93, -0.10],
    p2: [longEdgeX, 0.93, 0.63],
    axis: 'z'
  };
  addBox(counterDepth - 0.02, cabHeight, cookLen, matteBlackMat, baseMidX, cabMidY, cookZ, 0, cookingDim);
  addBox(counterDepth - 0.06, plinthHeight, cookLen, plinthMat, plinthMidX, plinthHeight / 2, cookZ);
  addBox(0.025, 0.035, cookLen, recessedGrooveMat, longWallX - counterDepth, counterBaseY - 0.02, cookZ);
  const drawerY = [plinthHeight + cabHeight * 0.33, plinthHeight + cabHeight * 0.66];
  drawerY.forEach(dy => {
    addBox(0.005, 0.004, cookLen - 0.01, recessedGrooveMat, longWallX - counterDepth - 0.002, dy, cookZ);
  });
  addBox(counterDepth, slabThick, cookLen, marbleMat, baseMidX, counterTopY - slabThick / 2, cookZ, 0, cookingDim);

  // Modena Hob (730mm x 420mm)
  const hobDepthZ = 0.73;
  const hobWidthX = 0.42;
  const hobX = longWallX - 0.32;
  const hobZ = cookZ;
  addBox(hobWidthX, 0.012, hobDepthZ, glassHobMat, hobX, counterTopY + 0.006, hobZ, 0, cookingDim);

  [-0.19, 0.19].forEach(bz => {
    const curBZ = hobZ + bz;
    const burnerRing = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.062, 0.014, 24), brassBurnerMat);
    burnerRing.position.set(mx(hobX), counterTopY + 0.019, curBZ);
    registerItem(burnerRing, cookingDim);
    kitchenGroup.add(burnerRing);

    const centerCap = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.018, 20), castIronMat);
    centerCap.position.set(mx(hobX), counterTopY + 0.021, curBZ);
    registerItem(centerCap, cookingDim);
    kitchenGroup.add(centerCap);

    addBox(0.24, 0.018, 0.022, castIronMat, hobX, counterTopY + 0.025, curBZ, 0, cookingDim);
    addBox(0.022, 0.018, 0.24, castIronMat, hobX, counterTopY + 0.025, curBZ, 0, cookingDim);
  });

  [-0.07, 0.07].forEach(kz => {
    const knobBase = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.004, 16), stainlessMat);
    knobBase.position.set(mx(hobX - 0.15), counterTopY + 0.014, hobZ + kz);
    kitchenGroup.add(knobBase);

    const knobDial = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.016, 16), matteBlackMat);
    knobDial.position.set(mx(hobX - 0.15), counterTopY + 0.022, hobZ + kz);
    registerItem(knobDial, cookingDim);
    kitchenGroup.add(knobDial);
  });

  // Range Hood
  const hoodY = 1.55;
  const hoodDepthX = upperDepth + 0.08;
  const hoodMidX = longWallX - hoodDepthX / 2;
  const hoodDim = {
    label: "|-- 730 mm --|",
    p1: [longWallX - hoodDepthX - 0.01, hoodY + 0.04, -0.10],
    p2: [longWallX - hoodDepthX - 0.01, hoodY + 0.04, 0.63],
    axis: 'z'
  };
  addBox(hoodDepthX, 0.06, cookLen, stainlessMat, hoodMidX, hoodY + 0.03, cookZ, 0, hoodDim);
  addBox(hoodDepthX - 0.04, 0.008, cookLen - 0.04, new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.4, metalness: 0.9 }), hoodMidX, hoodY - 0.002, cookZ, 0, hoodDim);

  // --- 2D. Microwave & Oak Tower (500mm realistic tower: Z in [0.63, 1.13]) ---
  const towerZ = (0.63 + 1.13) / 2; // 0.88m
  const towerLen = 0.50; // Sized to 500mm to house realistic 480mm microwave
  const towerDim = {
    label: "|-- 500 mm (Oak Tower) --|",
    p1: [longEdgeX, 0.93, 0.63],
    p2: [longEdgeX, 0.93, 1.13],
    axis: 'z'
  };
  addBox(counterDepth - 0.02, cabHeight, towerLen, matteBlackMat, baseMidX, cabMidY, towerZ);
  addBox(counterDepth - 0.06, plinthHeight, towerLen, plinthMat, plinthMidX, plinthHeight / 2, towerZ);
  addBox(0.025, 0.035, towerLen, recessedGrooveMat, longWallX - counterDepth, counterBaseY - 0.02, towerZ);
  addBox(counterDepth, slabThick, towerLen, marbleMat, baseMidX, counterTopY - slabThick / 2, towerZ, 0, towerDim);

  // Oak Vertical Panels & Shelves (Width: 500mm)
  const oakDepthX = 0.38;
  const oakMidX = longWallX - oakDepthX / 2;
  const towerTotalH = 2.35 - counterTopY; // 1.45m
  addBox(oakDepthX, towerTotalH, 0.025, oakMat, oakMidX, counterTopY + towerTotalH / 2, 0.63 + 0.0125, 0, towerDim);
  addBox(oakDepthX, towerTotalH, 0.025, oakMat, oakMidX, counterTopY + towerTotalH / 2, 1.13 - 0.0125, 0, towerDim);
  addBox(0.018, towerTotalH, 0.48, oakMat, longWallX - 0.01, counterTopY + towerTotalH / 2, towerZ, 0, towerDim);

  addBox(oakDepthX, 0.025, 0.475, oakMat, oakMidX, 1.05, towerZ, 0, towerDim);
  addBox(oakDepthX, 0.025, 0.475, oakMat, oakMidX, 1.48, towerZ, 0, towerDim);
  addBox(oakDepthX, 0.025, 0.475, oakMat, oakMidX, 1.90, towerZ, 0, towerDim);
  addBox(oakDepthX, 0.025, 0.475, oakMat, oakMidX, 2.35, towerZ, 0, towerDim);

  // Realistic Standard Microwave Oven (480mm W x 360mm D x 300mm H)
  const microW = 0.36; // depth into room
  const microH = 0.30; // height
  const microD = 0.48; // width along wall: 480 mm standard microwave!
  const microY = 1.05 + 0.0125 + microH / 2;
  const microX = longWallX - 0.03 - microW / 2;
  const microDim = {
    label: "|-- 480 mm (Microwave) --|",
    p1: [microX - microW / 2 - 0.02, microY, towerZ - microD / 2],
    p2: [microX - microW / 2 - 0.02, microY, towerZ + microD / 2],
    axis: 'z'
  };
  addBox(microW, microH, microD, matteBlackMat, microX, microY, towerZ, 0, microDim);
  addBox(0.01, microH - 0.04, microD * 0.70, smokedGlassMat, microX - microW / 2 - 0.005, microY, towerZ - 0.05, 0, microDim);
  addBox(0.012, microH * 0.70, 0.012, stainlessMat, microX - microW / 2 - 0.015, microY, towerZ + 0.12);
  addBox(0.008, 0.04, 0.09, new THREE.MeshBasicMaterial({ color: 0x00ffaa }), microX - microW / 2 - 0.005, microY + 0.09, towerZ + 0.15);

  // Decor
  for (let ji = 0; ji < 2; ji++) {
    const jarMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.12, 16), new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: 0.3 }));
    jarMesh.position.set(mx(oakMidX), 1.48 + 0.0125 + 0.06, towerZ - 0.10 + ji * 0.20);
    registerItem(jarMesh, towerDim);
    kitchenGroup.add(jarMesh);
    const lidMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.018, 16), oakMat);
    lidMesh.position.set(mx(oakMidX), 1.48 + 0.0125 + 0.125, towerZ - 0.10 + ji * 0.20);
    kitchenGroup.add(lidMesh);
  }

  const potMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.045, 0.10, 16), new THREE.MeshStandardMaterial({ color: 0xd4cdc5, roughness: 0.5 }));
  potMesh.position.set(mx(oakMidX), 1.90 + 0.0125 + 0.05, towerZ);
  registerItem(potMesh, towerDim);
  kitchenGroup.add(potMesh);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x3b7a42, roughness: 0.6 });
  for (let li = 0; li < 8; li++) {
    const leafGeo = new THREE.SphereGeometry(0.035, 8, 8);
    leafGeo.scale(1.2, 0.4, 0.8);
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    const angle = li * 0.8;
    const drop = (li / 8) * 0.22;
    leaf.position.set(
      mx(oakMidX + Math.sin(angle) * 0.07 - (isCarportLeft ? drop * 0.3 : -drop * 0.3)),
      1.90 + 0.10 - drop,
      towerZ + Math.cos(angle) * 0.07
    );
    kitchenGroup.add(leaf);
  }

  // --- 2E. Transition Buffer (220mm: Z in [1.13, 1.35]) ---
  const transZ = (1.13 + 1.35) / 2; // 1.24m
  const transLen = 0.22; // 22cm
  const transDim = {
    label: "|-- 220 mm --|",
    p1: [longEdgeX, 0.93, 1.13],
    p2: [longEdgeX, 0.93, 1.35],
    axis: 'z'
  };
  addBox(counterDepth - 0.02, cabHeight, transLen, matteBlackMat, baseMidX, cabMidY, transZ);
  addBox(counterDepth - 0.06, plinthHeight, transLen, plinthMat, plinthMidX, plinthHeight / 2, transZ);
  addBox(0.025, 0.035, transLen, recessedGrooveMat, longWallX - counterDepth, counterBaseY - 0.02, transZ);
  addBox(counterDepth, slabThick, transLen, marbleMat, baseMidX, counterTopY - slabThick / 2, transZ, 0, transDim);

  // --- 2F. Refrigerator Enclosure (700mm: Z in [1.35, 2.05]) ---
  const fridgeWidthZ = 0.70;
  const fridgeZ = (1.35 + 2.05) / 2; // 1.70m
  const fridgeDepthX = 0.65;
  const fridgeMidX = longWallX - fridgeDepthX / 2;
  const fridgeTallH = 2.25;

  const fridgeDim = {
    label: "|-- 700 mm --|",
    p1: [longWallX - fridgeDepthX - 0.02, 0.93, 1.35],
    p2: [longWallX - fridgeDepthX - 0.02, 0.93, 2.05],
    axis: 'z'
  };

  addBox(fridgeDepthX, 0.35, fridgeWidthZ + 0.02, matteBlackMat, fridgeMidX, fridgeTallH - 0.175, fridgeZ, 0, fridgeDim);
  addBox(fridgeDepthX, fridgeTallH, 0.025, matteBlackMat, fridgeMidX, fridgeTallH / 2, 1.35 - 0.0125, 0, fridgeDim);

  const fBodyH = 1.84;
  const fBodyY = fBodyH / 2;
  const fBodyD = fridgeWidthZ - 0.04; // 0.66m
  const fBodyW = 0.60;
  const fBodyX = longWallX - 0.02 - fBodyW / 2;
  addBox(fBodyW, fBodyH, fBodyD, fridgeMat, fBodyX, fBodyY, fridgeZ, 0, fridgeDim);

  const splitY = 0.78;
  addBox(0.01, 0.01, fBodyD, recessedGrooveMat, fBodyX - fBodyW / 2 - 0.005, splitY, fridgeZ);
  addBox(0.02, 0.38, 0.02, matteBlackMat, fBodyX - fBodyW / 2 - 0.025, splitY + 0.30, fridgeZ - (isCarportLeft ? 0.24 : -0.24), 0, fridgeDim);
  addBox(0.02, 0.45, 0.02, matteBlackMat, fBodyX - fBodyW / 2 - 0.025, splitY - 0.32, fridgeZ - (isCarportLeft ? 0.24 : -0.24), 0, fridgeDim);
  addBox(0.008, 0.22, 0.12, new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.8 }), fBodyX - fBodyW / 2 - 0.005, 1.35, fridgeZ, 0, fridgeDim);

  // --- Backsplash on Long Right Wall ---
  const longBacksplashLen = 1.35 - (-1.15); // 2.50m
  const longBacksplashMidZ = (-1.15 + 1.35) / 2;
  addBox(0.015, backsplashHeight, longBacksplashLen, backsplashMat, longWallX - 0.008, backsplashMidY, longBacksplashMidZ);

  // --- Upper Cabinets on Long Right Wall ---
  const upperMidX_long = longWallX - upperDepth / 2;
  addBox(upperDepth, upperHeight, 0.75, matteBlackMat, upperMidX_long, upperMidY, -0.425);
  addBox(0.005, upperHeight - 0.04, 0.004, recessedGrooveMat, upperMidX_long - upperDepth / 2 - 0.002, upperMidY, -0.425);
  addBox(upperDepth, upperHeight - 0.10, cookLen, matteBlackMat, upperMidX_long, upperMidY + 0.05, cookZ);
  addBox(upperDepth, upperHeight, transLen, matteBlackMat, upperMidX_long, upperMidY, transZ);

  addBox(0.02, 0.02, 0.75, recessedGrooveMat, upperMidX_long - upperDepth / 2 + 0.02, upperBottomY + 0.01, -0.425);
  addBox(0.02, 0.02, transLen, recessedGrooveMat, upperMidX_long - upperDepth / 2 + 0.02, upperBottomY + 0.01, transZ);

  addBox(0.02, 0.01, 0.74, ledEmissiveMat, upperMidX_long - upperDepth / 2 + 0.03, upperBottomY - 0.005, -0.425);
  addBox(0.02, 0.01, transLen - 0.01, ledEmissiveMat, upperMidX_long - upperDepth / 2 + 0.03, upperBottomY - 0.005, transZ);

  const ledLightLong = new THREE.PointLight(0xffdfa0, 1.0, 3.0, 1.4);
  ledLightLong.position.set(mx(longWallX - 0.25), upperBottomY - 0.05, cookZ);
  kitchenGroup.add(ledLightLong);

  // =========================================================================
  // 3. COLLIDERS
  // =========================================================================
  if (colliders && Array.isArray(colliders)) {
    const shortBox = new THREE.Box3();
    const sMinX = Math.min(mx(0.30), mx(2.50));
    const sMaxX = Math.max(mx(0.30), mx(2.50));
    shortBox.min.set(sMinX, 0, facingWallZ);
    shortBox.max.set(sMaxX, 1.0, facingWallZ + counterDepth);
    colliders.push(shortBox);

    const longBox = new THREE.Box3();
    const lMinX = Math.min(mx(longWallX - counterDepth), mx(longWallX));
    const lMaxX = Math.max(mx(longWallX - counterDepth), mx(longWallX));
    longBox.min.set(lMinX, 0, facingWallZ + counterDepth);
    longBox.max.set(lMaxX, 2.3, 2.05);
    colliders.push(longBox);
  }

  scene.add(kitchenGroup);
  return kitchenGroup;
}
