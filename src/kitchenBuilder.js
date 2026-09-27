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

  // Materials
  const matteBlackMat = new THREE.MeshStandardMaterial({
    color: 0x181818,
    roughness: 0.55,
    metalness: 0.12
  });

  const recessedGrooveMat = new THREE.MeshStandardMaterial({
    color: 0x080808,
    roughness: 0.8
  });

  const plinthMat = new THREE.MeshStandardMaterial({
    color: 0x121212,
    roughness: 0.7
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
    color: 0x1b1b1b,
    roughness: 0.22,
    metalness: 0.85
  });

  const sinkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x222428,
    roughness: 0.32,
    metalness: 0.75
  });

  const stainlessMat = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    roughness: 0.28,
    metalness: 0.85
  });

  const glassHobMat = new THREE.MeshStandardMaterial({
    color: 0x080808,
    roughness: 0.08,
    metalness: 0.92
  });

  const castIronMat = new THREE.MeshStandardMaterial({
    color: 0x282828,
    roughness: 0.82,
    metalness: 0.25
  });

  const brassBurnerMat = new THREE.MeshStandardMaterial({
    color: 0xc8963e,
    roughness: 0.35,
    metalness: 0.8
  });

  const fridgeMat = new THREE.MeshStandardMaterial({
    color: 0x26282b,
    roughness: 0.38,
    metalness: 0.68
  });

  const smokedGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x181818,
    roughness: 0.1,
    transmission: 0.55,
    transparent: true,
    opacity: 0.82
  });

  const ledEmissiveMat = new THREE.MeshBasicMaterial({
    color: 0xffdfa0
  });

  // Mirror coordinate transformer:
  function mx(x) {
    return isCarportLeft ? x : -x;
  }

  // Helper to add box mesh with shadow and optional interactive metadata
  function addBox(w, h, d, mat, x, y, z, rotY = 0, itemData = null) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(mx(x), y, z);
    mesh.rotation.y = isCarportLeft ? rotY : -rotY;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    if (itemData) {
      mesh.userData.kitchenItem = itemData;
      kitchenGroup.userData.interactables.push(mesh);
    }

    kitchenGroup.add(mesh);
    return mesh;
  }

  function registerItem(mesh, itemData) {
    if (mesh && itemData) {
      mesh.userData.kitchenItem = itemData;
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

  // Recessed Handleless J-Pull Finger Groove along the top edge of base cabinets
  addBox(2.20, 0.035, 0.025, recessedGrooveMat, 1.40, counterBaseY - 0.02, facingWallZ + counterDepth);

  // Vertical Door Shadow Lines
  const shortDivX = [0.50, 0.90, 1.30, 1.90];
  shortDivX.forEach(gx => {
    addBox(0.004, cabHeight - 0.04, 0.005, recessedGrooveMat, gx, cabMidY - 0.015, facingWallZ + counterDepth + 0.002);
  });
  // Horizontal drawer groove in drying zone
  addBox(0.59, 0.004, 0.005, recessedGrooveMat, 1.60, cabMidY, facingWallZ + counterDepth + 0.002);

  // --- 1A. Left Wall Buffer (20cm: X in [0.30, 0.50]) ---
  const bufferData = {
    title: "Left Wall Clearance Buffer",
    zone: "Wet & Cleaning Zone",
    dimension: "20 cm (W) × 60 cm (D) × 90 cm (H)",
    materials: "Polished White Marble Counter + Matte Black Base",
    description: "20 cm ergonomic clearance between the undermount sink and adjacent wall."
  };
  addBox(0.20, slabThick, counterDepth, marbleMat, 0.40, counterTopY - slabThick / 2, cabZ, 0, bufferData);

  // --- 1B. Undermount Sink (80cm: X in [0.50, 1.30]) ---
  const sinkCenterX = 0.90;
  const sinkCenterZ = facingWallZ + 0.35; // Z = -0.80
  const sinkDepthM = 0.254; // 25.4 cm depth
  const basinFloorY = counterTopY - sinkDepthM; // ~0.646

  const sinkData = {
    title: "Undermount Sink Basin & Faucet",
    zone: "Wet & Cleaning Zone",
    dimension: "800 mm (W) × 500 mm (D) × 254 mm (Deep)",
    materials: "Gunmetal Stainless Basin + Matte Black Gooseneck Faucet",
    description: "Deep undermount single basin with basket strainer drain and arching 360° mixer faucet."
  };

  // Back border of sink cutout
  addBox(0.80, slabThick, 0.07, marbleMat, 0.90, counterTopY - slabThick / 2, facingWallZ + 0.035);
  // Front border of sink cutout
  addBox(0.80, slabThick, 0.07, marbleMat, 0.90, counterTopY - slabThick / 2, facingWallZ + counterDepth - 0.035);

  // Basin bottom floor & walls
  const basinBottom = addBox(0.76, 0.015, 0.44, sinkMetalMat, sinkCenterX, basinFloorY, sinkCenterZ, 0, sinkData);
  addBox(0.76, sinkDepthM, 0.015, sinkMetalMat, sinkCenterX, basinFloorY + sinkDepthM / 2, sinkCenterZ - 0.22);
  addBox(0.76, sinkDepthM, 0.015, sinkMetalMat, sinkCenterX, basinFloorY + sinkDepthM / 2, sinkCenterZ + 0.22);
  addBox(0.015, sinkDepthM, 0.44, sinkMetalMat, sinkCenterX - 0.38, basinFloorY + sinkDepthM / 2, sinkCenterZ);
  addBox(0.015, sinkDepthM, 0.44, sinkMetalMat, sinkCenterX + 0.38, basinFloorY + sinkDepthM / 2, sinkCenterZ);

  // Drain strainer in sink
  const drainGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.005, 24);
  const drainMesh = new THREE.Mesh(drainGeo, stainlessMat);
  drainMesh.position.set(mx(sinkCenterX), basinFloorY + 0.01, sinkCenterZ);
  drainMesh.receiveShadow = true;
  kitchenGroup.add(drainMesh);

  // Arching matte black gooseneck faucet
  const faucetData = {
    title: "Matte Black Gooseneck Faucet",
    zone: "Wet & Cleaning Zone",
    dimension: "20 cm (Reach) × 38 cm (Height above counter)",
    materials: "Solid Brass Alloy with Electroplated Matte Black Finish",
    description: "High-arc swivel gooseneck spout with aerator nozzle and single-lever ceramic mixer control."
  };
  const faucetBase = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.030, 0.05, 20), faucetMat);
  faucetBase.position.set(mx(sinkCenterX), counterTopY + 0.025, facingWallZ + 0.08);
  registerItem(faucetBase, faucetData);
  kitchenGroup.add(faucetBase);

  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.22, 16), faucetMat);
  stem.position.set(mx(sinkCenterX), counterTopY + 0.05 + 0.11, facingWallZ + 0.08);
  registerItem(stem, faucetData);
  kitchenGroup.add(stem);

  const archGeo = new THREE.TorusGeometry(0.09, 0.014, 12, 24, Math.PI);
  const arch = new THREE.Mesh(archGeo, faucetMat);
  arch.rotation.z = Math.PI / 2;
  arch.rotation.y = isCarportLeft ? Math.PI / 2 : -Math.PI / 2;
  arch.position.set(mx(sinkCenterX), counterTopY + 0.27, facingWallZ + 0.08 + (isCarportLeft ? 0.09 : -0.09));
  registerItem(arch, faucetData);
  kitchenGroup.add(arch);

  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.013, 0.06, 16), faucetMat);
  nozzle.position.set(mx(sinkCenterX), counterTopY + 0.24, facingWallZ + 0.26);
  registerItem(nozzle, faucetData);
  kitchenGroup.add(nozzle);

  const leverHub = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.03, 16), faucetMat);
  leverHub.rotation.z = Math.PI / 2;
  leverHub.position.set(mx(sinkCenterX + 0.04), counterTopY + 0.09, facingWallZ + 0.08);
  kitchenGroup.add(leverHub);

  const leverStick = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.08, 12), faucetMat);
  leverStick.position.set(mx(sinkCenterX + 0.055), counterTopY + 0.13, facingWallZ + 0.08);
  kitchenGroup.add(leverStick);

  // --- 1C. Dish Drying Space (60cm: X in [1.30, 1.90]) ---
  const rackX = 1.60;
  const rackZ = facingWallZ + 0.32;
  const dryingData = {
    title: "Dish Drying Station & Hanging Rail",
    zone: "Wet & Cleaning Zone",
    dimension: "60 cm (W) × 60 cm (D) × 24 cm (Rack Height)",
    materials: "Matte Black Wireframe + Drainage Tray + Porcelain Dishes",
    description: "Dedicated wet dishware management space without dishwasher, tiered rack and wall rail with S-hooks."
  };
  addBox(0.60, slabThick, counterDepth, marbleMat, 1.60, counterTopY - slabThick / 2, cabZ, 0, dryingData);

  // Drain tray with lip
  addBox(0.48, 0.012, 0.36, matteBlackMat, rackX, counterTopY + 0.006, rackZ, 0, dryingData);
  // Wireframe rack
  const wireMat = new THREE.MeshStandardMaterial({ color: 0x1f1f1f, roughness: 0.4, metalness: 0.8 });
  addBox(0.48, 0.01, 0.01, wireMat, rackX, counterTopY + 0.18, rackZ - 0.17);
  addBox(0.48, 0.01, 0.01, wireMat, rackX, counterTopY + 0.18, rackZ + 0.17);
  addBox(0.01, 0.01, 0.34, wireMat, rackX - 0.235, counterTopY + 0.18, rackZ);
  addBox(0.01, 0.01, 0.34, wireMat, rackX + 0.235, counterTopY + 0.18, rackZ);
  [[-0.235, -0.17], [0.235, -0.17], [-0.235, 0.17], [0.235, 0.17]].forEach(([dx, dz]) => {
    addBox(0.012, 0.18, 0.012, wireMat, rackX + dx, counterTopY + 0.09, rackZ + dz);
  });
  // Slotted white ceramic plates standing upright in rack
  const plateMat = new THREE.MeshStandardMaterial({ color: 0xf4f4f4, roughness: 0.15 });
  for (let pi = 0; pi < 6; pi++) {
    const ppx = rackX - 0.15 + pi * 0.05;
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.008, 24), plateMat);
    plate.rotation.z = Math.PI / 2;
    plate.position.set(mx(ppx), counterTopY + 0.13, rackZ - 0.04);
    plate.castShadow = true;
    registerItem(plate, dryingData);
    kitchenGroup.add(plate);
  }
  // Cutlery holder cup
  addBox(0.08, 0.12, 0.10, matteBlackMat, rackX + 0.18, counterTopY + 0.07, rackZ + 0.10, 0, dryingData);

  // Wall-mounted matte black hanging rail rod with S-hooks
  const rodY = counterTopY + 0.42; // Y = 1.32m
  addBox(0.65, 0.014, 0.014, faucetMat, 1.60, rodY, facingWallZ + 0.035, 0, dryingData);
  addBox(0.02, 0.03, 0.035, faucetMat, 1.32, rodY, facingWallZ + 0.02);
  addBox(0.02, 0.03, 0.035, faucetMat, 1.88, rodY, facingWallZ + 0.02);
  for (let hi = 0; hi < 3; hi++) {
    const hx = 1.45 + hi * 0.12;
    addBox(0.006, 0.04, 0.006, stainlessMat, hx, rodY - 0.025, facingWallZ + 0.035);
    addBox(0.02, 0.18, 0.008, stainlessMat, hx, rodY - 0.12, facingWallZ + 0.038);
  }

  // --- 1D. Backsplash on Short Facing Wall ---
  const backsplashData = {
    title: "Glazed Beige Square Ceramic Backsplash",
    zone: "Wall Finishes",
    dimension: "2.20 m (Facing Wall) + 2.50 m (Long Wall) × 65 cm (Height)",
    materials: "Warm Glazed 10cm × 10cm Square Ceramic Tiles",
    description: "Water-resistant, heat-reflective glazed ceramic backsplash illuminated by warm LED lighting."
  };
  const backsplashHeight = 0.65;
  const backsplashMidY = counterTopY + backsplashHeight / 2; // 1.225
  addBox(2.20, backsplashHeight, 0.015, backsplashMat, 1.40, backsplashMidY, facingWallZ + 0.008, 0, backsplashData);

  // --- 1E. Upper Cabinets on Short Facing Wall ---
  const upperDepth = 0.35;
  const upperHeight = 0.80;
  const upperBottomY = 1.55;
  const upperMidY = upperBottomY + upperHeight / 2; // 1.95
  const upperZ_short = facingWallZ + upperDepth / 2;

  const upperCabData = {
    title: "Handleless Matte Black Upper Cabinets",
    zone: "Upper Storage",
    dimension: "150 cm (W) × 35 cm (D) × 80 cm (H)",
    materials: "Matte Black Satin Finish with Bottom Finger Groove",
    description: "Sleek modern overhead storage with recessed finger grip and concealed soft-close hinges."
  };
  addBox(1.50, upperHeight, upperDepth, matteBlackMat, 1.15, upperMidY, upperZ_short, 0, upperCabData);
  [0.90, 1.40].forEach(gx => {
    addBox(0.004, upperHeight - 0.04, 0.005, recessedGrooveMat, gx, upperMidY, upperZ_short + upperDepth / 2 + 0.002);
  });
  addBox(1.50, 0.02, 0.02, recessedGrooveMat, 1.15, upperBottomY + 0.01, upperZ_short + upperDepth / 2 - 0.02);

  // Warm LED Under-Cabinet Strip Light along Short Run
  const ledData = {
    title: "Warm LED Under-Cabinet Strip Light",
    zone: "Architectural Lighting",
    dimension: "Full Length of Upper Cabinets at Y = 1.53 m",
    materials: "2700K Warm Golden LED Linear Strip (Low Energy)",
    description: "Concealed under-cabinet task lighting casting warm glow across the beige tiles and marble counter."
  };
  addBox(1.48, 0.01, 0.02, ledEmissiveMat, 1.15, upperBottomY - 0.005, upperZ_short + upperDepth / 2 - 0.03, 0, ledData);
  const ledLightShort = new THREE.PointLight(0xffdfa0, 0.85, 2.5, 1.5);
  ledLightShort.position.set(mx(1.15), upperBottomY - 0.05, facingWallZ + 0.20);
  kitchenGroup.add(ledLightShort);


  // =========================================================================
  // 2. LONG RIGHT WALL (3.20m: X = 2.50, Z in [-1.15, 2.05]) – EXACT TO HOUSE SCALE
  // Breakdown along Z:
  // - Corner: 60 cm (Z: -1.15 to -0.55)
  // - Prep Buffer: 50 cm (Z: -0.55 to -0.05)
  // - Cooking Station (Modena Hob): 73 cm (Z: -0.05 to 0.68)
  // - Microwave & Oak Tower: 40 cm (Z: 0.68 to 1.08)
  // - Transition Buffer: 27 cm (Z: 1.08 to 1.35)
  // - Refrigerator Enclosure: 70 cm (Z: 1.35 to 2.05) -> Flush with Bedroom 1 wall!
  // Sum = 60 + 50 + 73 + 40 + 27 + 70 = 320 cm = 3.20m EXACT!
  // =========================================================================
  const longWallX = 2.50;
  const baseMidX = longWallX - counterDepth / 2; // 2.20
  const plinthMidX = longWallX - (counterDepth - 0.05) / 2 - 0.01;

  // --- 2A. L-Junction Corner Base Intersection (60cm x 60cm: Z in [-1.15, -0.55]) ---
  const cornerData = {
    title: "L-Junction Base Corner Intersection",
    zone: "Corner Connection",
    dimension: "60 cm × 60 cm (Square Corner Base Unit)",
    materials: "Polished White Marble Top + Matte Black Base",
    description: "Seamless 90-degree corner intersection connecting the wet sink wall to the cooking run."
  };
  addBox(counterDepth, slabThick, counterDepth, marbleMat, baseMidX, counterTopY - slabThick / 2, facingWallZ + counterDepth / 2, 0, cornerData);

  // --- 2B. Prep Buffer (50cm: Z in [-0.55, -0.05]) ---
  const prepZ = -0.30;
  const prepLen = 0.50;
  const prepData = {
    title: "Food Preparation Counter Buffer",
    zone: "Cooking, Prep & Storage Zone",
    dimension: "50 cm (W) × 60 cm (D) × 90 cm (H)",
    materials: "Polished White Marble + Solid Oak End-Grain Chopping Board",
    description: "Uninterrupted food preparation zone with wooden prep board and ceramic utensil crock."
  };
  addBox(counterDepth - 0.02, cabHeight, prepLen, matteBlackMat, baseMidX, cabMidY, prepZ);
  addBox(counterDepth - 0.06, plinthHeight, prepLen, plinthMat, plinthMidX, plinthHeight / 2, prepZ);
  addBox(0.025, 0.035, prepLen, recessedGrooveMat, longWallX - counterDepth, counterBaseY - 0.02, prepZ);
  addBox(counterDepth, slabThick, prepLen, marbleMat, baseMidX, counterTopY - slabThick / 2, prepZ, 0, prepData);

  // Prep accessories
  addBox(0.32, 0.03, 0.38, oakMat, longWallX - 0.32, counterTopY + 0.015, prepZ, 0, prepData);

  const crockMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.05, 0.14, 20),
    new THREE.MeshStandardMaterial({ color: 0xded8cc, roughness: 0.3 })
  );
  crockMesh.position.set(mx(longWallX - 0.16), counterTopY + 0.07, -0.45);
  registerItem(crockMesh, prepData);
  kitchenGroup.add(crockMesh);
  for (let si = 0; si < 3; si++) {
    const spoon = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.22, 10), oakMat);
    spoon.rotation.x = 0.15 * (si - 1);
    spoon.rotation.z = (isCarportLeft ? 1 : -1) * 0.18;
    spoon.position.set(mx(longWallX - 0.16 + (si - 1) * 0.015), counterTopY + 0.15, -0.45 + (si - 1) * 0.015);
    kitchenGroup.add(spoon);
  }

  // --- 2C. Cooking Station (73cm: Z in [-0.05, 0.68]) ---
  const cookLen = 0.73;
  const cookZ = (-0.05 + 0.68) / 2; // 0.315
  const cookingData = {
    title: "Cooking Station: Modena 2-Burner Gas Hob & Deep Drawers",
    zone: "Cooking, Prep & Storage Zone",
    dimension: "730 mm (W) × 600 mm (D) × 900 mm (H)",
    materials: "Modena Tempered Glass Hob + 3 Deep Pull-out Drawers",
    description: "Modena 730×420mm 2-burner gas hob (660×360mm cut-out) over 3 deep cookware storage drawers."
  };
  addBox(counterDepth - 0.02, cabHeight, cookLen, matteBlackMat, baseMidX, cabMidY, cookZ);
  addBox(counterDepth - 0.06, plinthHeight, cookLen, plinthMat, plinthMidX, plinthHeight / 2, cookZ);
  addBox(0.025, 0.035, cookLen, recessedGrooveMat, longWallX - counterDepth, counterBaseY - 0.02, cookZ);
  // 3 Deep drawers with horizontal shadow lines
  const drawerY = [plinthHeight + cabHeight * 0.33, plinthHeight + cabHeight * 0.66];
  drawerY.forEach(dy => {
    addBox(0.005, 0.004, cookLen - 0.01, recessedGrooveMat, longWallX - counterDepth - 0.002, dy, cookZ);
  });
  addBox(counterDepth, slabThick, cookLen, marbleMat, baseMidX, counterTopY - slabThick / 2, cookZ, 0, cookingData);

  // Modena 2-Burner Gas Hob (730mm x 420mm)
  const hobDepthZ = 0.73;
  const hobWidthX = 0.42;
  const hobX = longWallX - 0.32;
  const hobZ = cookZ;
  addBox(hobWidthX, 0.012, hobDepthZ, glassHobMat, hobX, counterTopY + 0.006, hobZ, 0, cookingData);

  // 2 Dual-Ring Gas Burners with Cast Iron Trivets
  [-0.19, 0.19].forEach(bz => {
    const curBZ = hobZ + bz;
    const burnerRing = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.062, 0.014, 24), brassBurnerMat);
    burnerRing.position.set(mx(hobX), counterTopY + 0.019, curBZ);
    registerItem(burnerRing, cookingData);
    kitchenGroup.add(burnerRing);

    const centerCap = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.018, 20), castIronMat);
    centerCap.position.set(mx(hobX), counterTopY + 0.021, curBZ);
    registerItem(centerCap, cookingData);
    kitchenGroup.add(centerCap);

    addBox(0.24, 0.018, 0.022, castIronMat, hobX, counterTopY + 0.025, curBZ, 0, cookingData);
    addBox(0.022, 0.018, 0.24, castIronMat, hobX, counterTopY + 0.025, curBZ, 0, cookingData);
  });

  // Front Control Knobs
  [-0.07, 0.07].forEach(kz => {
    const knobBase = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.004, 16), stainlessMat);
    knobBase.position.set(mx(hobX - 0.15), counterTopY + 0.014, hobZ + kz);
    kitchenGroup.add(knobBase);

    const knobDial = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.016, 16), matteBlackMat);
    knobDial.position.set(mx(hobX - 0.15), counterTopY + 0.022, hobZ + kz);
    registerItem(knobDial, cookingData);
    kitchenGroup.add(knobDial);
  });

  // Slimline Range Hood Flush Under Upper Cabinets (Y = 1.55m)
  const hoodData = {
    title: "Integrated Slimline Range Hood",
    zone: "Cooking, Prep & Storage Zone",
    dimension: "730 mm (W) × 430 mm (D) × 60 mm (H)",
    materials: "Stainless Steel Body with Aluminum Grease Baffle Filters",
    description: "Flush integrated extraction hood directly above the Modena 2-burner hob with LED task lighting."
  };
  const hoodY = 1.55;
  const hoodDepthX = upperDepth + 0.08; // 0.43m
  const hoodMidX = longWallX - hoodDepthX / 2;
  addBox(hoodDepthX, 0.06, cookLen, stainlessMat, hoodMidX, hoodY + 0.03, cookZ, 0, hoodData);
  addBox(hoodDepthX - 0.04, 0.008, cookLen - 0.04, new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.4, metalness: 0.9 }), hoodMidX, hoodY - 0.002, cookZ, 0, hoodData);

  // --- 2D. Microwave & Open Display Tower (40cm: Z in [0.68, 1.08]) ---
  const towerZ = (0.68 + 1.08) / 2; // 0.88m
  const towerLen = 0.40;
  const towerData = {
    title: "Natural Oak Microwave & Display Tower",
    zone: "Cooking, Prep & Storage Zone",
    dimension: "40 cm (W) × 38 cm (D) × 145 cm (Height above counter, up to 2.35m)",
    materials: "Solid Natural Honey Oak Wood + Built-in Microwave",
    description: "Eye-level alcove housing digital microwave oven, topped with display shelves for ceramic jars and plant."
  };
  addBox(counterDepth - 0.02, cabHeight, towerLen, matteBlackMat, baseMidX, cabMidY, towerZ);
  addBox(counterDepth - 0.06, plinthHeight, towerLen, plinthMat, plinthMidX, plinthHeight / 2, towerZ);
  addBox(0.025, 0.035, towerLen, recessedGrooveMat, longWallX - counterDepth, counterBaseY - 0.02, towerZ);
  addBox(counterDepth, slabThick, towerLen, marbleMat, baseMidX, counterTopY - slabThick / 2, towerZ, 0, towerData);

  // Oak Vertical Panels & Shelves
  const oakDepthX = 0.38;
  const oakMidX = longWallX - oakDepthX / 2;
  const towerTotalH = 2.35 - counterTopY; // 1.45m
  addBox(oakDepthX, towerTotalH, 0.025, oakMat, oakMidX, counterTopY + towerTotalH / 2, 0.68 + 0.0125, 0, towerData);
  addBox(oakDepthX, towerTotalH, 0.025, oakMat, oakMidX, counterTopY + towerTotalH / 2, 1.08 - 0.0125, 0, towerData);
  addBox(0.018, towerTotalH, 0.38, oakMat, longWallX - 0.01, counterTopY + towerTotalH / 2, towerZ, 0, towerData);

  // Shelves
  addBox(oakDepthX, 0.025, 0.375, oakMat, oakMidX, 1.05, towerZ, 0, towerData);
  addBox(oakDepthX, 0.025, 0.375, oakMat, oakMidX, 1.48, towerZ, 0, towerData);
  addBox(oakDepthX, 0.025, 0.375, oakMat, oakMidX, 1.90, towerZ, 0, towerData);
  addBox(oakDepthX, 0.025, 0.375, oakMat, oakMidX, 2.35, towerZ, 0, towerData);

  // Microwave Oven
  const microData = {
    title: "Built-In Modern Microwave Oven",
    zone: "Appliances",
    dimension: "34 cm (W) × 34 cm (D) × 32 cm (H)",
    materials: "Matte Black Steel + Smoked Glass Door + Digital Display",
    description: "Dedicated eye-level microwave with digital LED timer and quick-touch keypad."
  };
  const microW = 0.34;
  const microH = 0.32;
  const microD = 0.34;
  const microY = 1.05 + 0.0125 + microH / 2;
  const microX = longWallX - 0.04 - microW / 2;
  addBox(microW, microH, microD, matteBlackMat, microX, microY, towerZ, 0, microData);
  addBox(0.01, microH - 0.04, microD * 0.68, smokedGlassMat, microX - microW / 2 - 0.005, microY, towerZ - 0.04, 0, microData);
  addBox(0.012, microH * 0.70, 0.012, stainlessMat, microX - microW / 2 - 0.015, microY, towerZ + 0.07);
  addBox(0.008, 0.04, 0.08, new THREE.MeshBasicMaterial({ color: 0x00ffaa }), microX - microW / 2 - 0.005, microY + 0.09, towerZ + 0.11);

  // Decorative Jars & Trailing Plant
  for (let ji = 0; ji < 2; ji++) {
    const jarMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.12, 16), new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: 0.3 }));
    jarMesh.position.set(mx(oakMidX), 1.48 + 0.0125 + 0.06, towerZ - 0.08 + ji * 0.16);
    registerItem(jarMesh, towerData);
    kitchenGroup.add(jarMesh);
    const lidMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.043, 0.043, 0.018, 16), oakMat);
    lidMesh.position.set(mx(oakMidX), 1.48 + 0.0125 + 0.125, towerZ - 0.08 + ji * 0.16);
    kitchenGroup.add(lidMesh);
  }

  const potMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.045, 0.10, 16), new THREE.MeshStandardMaterial({ color: 0xd4cdc5, roughness: 0.5 }));
  potMesh.position.set(mx(oakMidX), 1.90 + 0.0125 + 0.05, towerZ);
  registerItem(potMesh, towerData);
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

  // --- 2E. Transition Buffer (27cm: Z in [1.08, 1.35]) ---
  const transZ = (1.08 + 1.35) / 2; // 1.215m
  const transLen = 0.27; // 27cm calibrated to fit 3.2m wall
  const transData = {
    title: "Transition Counter Landing Buffer",
    zone: "Cooking, Prep & Storage Zone",
    dimension: "27 cm (W) × 60 cm (D) × 90 cm (H)",
    materials: "Polished White Marble Top + Matte Black Base",
    description: "Landing counter buffer for plating food and resting items between cooking/microwave and cold storage."
  };
  addBox(counterDepth - 0.02, cabHeight, transLen, matteBlackMat, baseMidX, cabMidY, transZ);
  addBox(counterDepth - 0.06, plinthHeight, transLen, plinthMat, plinthMidX, plinthHeight / 2, transZ);
  addBox(0.025, 0.035, transLen, recessedGrooveMat, longWallX - counterDepth, counterBaseY - 0.02, transZ);
  addBox(counterDepth, slabThick, transLen, marbleMat, baseMidX, counterTopY - slabThick / 2, transZ, 0, transData);

  // --- 2F. Refrigerator Enclosure (70cm: Z in [1.35, 2.05], Height: 2.25m) ---
  // Perfectly flush with the Bedroom 1 dividing wall at Z = 2.05!
  const fridgeWidthZ = 0.70;
  const fridgeZ = (1.35 + 2.05) / 2; // 1.70m
  const fridgeDepthX = 0.65;
  const fridgeMidX = longWallX - fridgeDepthX / 2;
  const fridgeTallH = 2.25;

  const fridgeData = {
    title: "Two-Door Refrigerator & Housing Enclosure",
    zone: "Cold Storage Zone",
    dimension: "70 cm (W) × 65 cm (D) × 225 cm (H)",
    materials: "Dark Titanium Stainless Steel + Matte Black Full-Height Surround",
    description: "Sleek 2-door refrigerator with full 90-degree door swing clearance and overhead bridge storage cabinet."
  };

  // Top overhead bridge cabinet
  addBox(fridgeDepthX, 0.35, fridgeWidthZ + 0.02, matteBlackMat, fridgeMidX, fridgeTallH - 0.175, fridgeZ, 0, fridgeData);
  // Side enclosure panel facing into room
  addBox(fridgeDepthX, fridgeTallH, 0.025, matteBlackMat, fridgeMidX, fridgeTallH / 2, 1.35 - 0.0125, 0, fridgeData);

  // Sleek 2-Door Refrigerator body
  const fBodyH = 1.84;
  const fBodyY = fBodyH / 2;
  const fBodyD = fridgeWidthZ - 0.04; // 0.66m wide
  const fBodyW = 0.60;
  const fBodyX = longWallX - 0.02 - fBodyW / 2;
  addBox(fBodyW, fBodyH, fBodyD, fridgeMat, fBodyX, fBodyY, fridgeZ, 0, fridgeData);

  // Door split gap & handles
  const splitY = 0.78;
  addBox(0.01, 0.01, fBodyD, recessedGrooveMat, fBodyX - fBodyW / 2 - 0.005, splitY, fridgeZ);
  addBox(0.02, 0.38, 0.02, matteBlackMat, fBodyX - fBodyW / 2 - 0.025, splitY + 0.30, fridgeZ - (isCarportLeft ? 0.24 : -0.24), 0, fridgeData);
  addBox(0.02, 0.45, 0.02, matteBlackMat, fBodyX - fBodyW / 2 - 0.025, splitY - 0.32, fridgeZ - (isCarportLeft ? 0.24 : -0.24), 0, fridgeData);
  addBox(0.008, 0.22, 0.12, new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.8 }), fBodyX - fBodyW / 2 - 0.005, 1.35, fridgeZ, 0, fridgeData);

  // --- Backsplash on Long Right Wall ---
  // Covers from corner (Z: -1.15) to fridge panel (Z: 1.35) -> length 2.50m
  const longBacksplashLen = 1.35 - (-1.15); // 2.50m
  const longBacksplashMidZ = (-1.15 + 1.35) / 2; // 0.10m
  addBox(0.015, backsplashHeight, longBacksplashLen, backsplashMat, longWallX - 0.008, backsplashMidY, longBacksplashMidZ, 0, backsplashData);

  // --- Upper Cabinets on Long Right Wall ---
  const upperMidX_long = longWallX - upperDepth / 2;
  // Corner to Hob (Z: -0.80 to -0.05, length 0.75m)
  addBox(upperDepth, upperHeight, 0.75, matteBlackMat, upperMidX_long, upperMidY, -0.425, 0, upperCabData);
  addBox(0.005, upperHeight - 0.04, 0.004, recessedGrooveMat, upperMidX_long - upperDepth / 2 - 0.002, upperMidY, -0.425);
  // Above Hob (Z: -0.05 to 0.68, length 0.73m)
  addBox(upperDepth, upperHeight - 0.10, cookLen, matteBlackMat, upperMidX_long, upperMidY + 0.05, cookZ, 0, upperCabData);
  // Above Transition buffer (Z: 1.08 to 1.35, length 0.27m)
  addBox(upperDepth, upperHeight, transLen, matteBlackMat, upperMidX_long, upperMidY, transZ, 0, upperCabData);

  // Recessed finger-grip channel under long upper cabinets
  addBox(0.02, 0.02, 0.75, recessedGrooveMat, upperMidX_long - upperDepth / 2 + 0.02, upperBottomY + 0.01, -0.425);
  addBox(0.02, 0.02, transLen, recessedGrooveMat, upperMidX_long - upperDepth / 2 + 0.02, upperBottomY + 0.01, transZ);

  // LED strip on Long Wall
  addBox(0.02, 0.01, 0.74, ledEmissiveMat, upperMidX_long - upperDepth / 2 + 0.03, upperBottomY - 0.005, -0.425, 0, ledData);
  addBox(0.02, 0.01, transLen - 0.01, ledEmissiveMat, upperMidX_long - upperDepth / 2 + 0.03, upperBottomY - 0.005, transZ, 0, ledData);

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
    longBox.max.set(lMaxX, 2.3, 2.05); // Exact flush wall end
    colliders.push(longBox);
  }

  scene.add(kitchenGroup);
  return kitchenGroup;
}
