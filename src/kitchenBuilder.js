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
  // If carport is on left (default), kitchen is on East side (X in [0.30, 2.50]).
  // If mirrored, flip X coordinate: x -> -x.
  function mx(x) {
    return isCarportLeft ? x : -x;
  }

  // Helper to add box mesh with shadow
  function addBox(w, h, d, mat, x, y, z, rotY = 0) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(mx(x), y, z);
    mesh.rotation.y = isCarportLeft ? rotY : -rotY;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    kitchenGroup.add(mesh);
    return mesh;
  }

  // =========================================================================
  // 1. SHORT FACING WALL (2.20m: X in [0.30, 2.50], Z = -1.15) – WET & CLEANING ZONE
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

  // Vertical Door Shadow Lines on Short Run:
  // Buffer door (0.30 - 0.50), Sink double door (0.50 - 1.30), Drying double drawer (1.30 - 1.90), Corner (1.90 - 2.50)
  const shortDivX = [0.50, 0.90, 1.30, 1.90];
  shortDivX.forEach(gx => {
    addBox(0.004, cabHeight - 0.04, 0.005, recessedGrooveMat, gx, cabMidY - 0.015, facingWallZ + counterDepth + 0.002);
  });
  // Horizontal drawer groove in drying zone (X: 1.30 to 1.90)
  addBox(0.59, 0.004, 0.005, recessedGrooveMat, 1.60, cabMidY, facingWallZ + counterDepth + 0.002);

  // Countertop on Short Wall (Granite Wall Buffer + Dish Drying + Corner)
  // Sink is cut out at X in [0.50, 1.30], Z in [-1.08, -0.62]
  // 1) Left Buffer Slab (X: 0.30 to 0.50)
  addBox(0.20, slabThick, counterDepth, marbleMat, 0.40, counterTopY - slabThick / 2, cabZ);
  // 2) Right Drying & Corner Slab (X: 1.30 to 1.90)
  addBox(0.60, slabThick, counterDepth, marbleMat, 1.60, counterTopY - slabThick / 2, cabZ);
  // 3) Back border of sink cutout (Z: -1.15 to -1.08, width 0.80)
  addBox(0.80, slabThick, 0.07, marbleMat, 0.90, counterTopY - slabThick / 2, facingWallZ + 0.035);
  // 4) Front border of sink cutout (Z: -0.62 to -0.55, width 0.80)
  addBox(0.80, slabThick, 0.07, marbleMat, 0.90, counterTopY - slabThick / 2, facingWallZ + counterDepth - 0.035);

  // --- Undermount Sink (800mm x 500mm x 254mm deep) ---
  const sinkCenterX = 0.90;
  const sinkCenterZ = facingWallZ + 0.35; // Z = -0.80
  const sinkDepthM = 0.254; // 25.4 cm depth
  const basinFloorY = counterTopY - sinkDepthM; // ~0.646

  // Basin bottom floor
  addBox(0.76, 0.015, 0.44, sinkMetalMat, sinkCenterX, basinFloorY, sinkCenterZ);
  // Basin walls (inside cutout)
  addBox(0.76, sinkDepthM, 0.015, sinkMetalMat, sinkCenterX, basinFloorY + sinkDepthM / 2, sinkCenterZ - 0.22); // back
  addBox(0.76, sinkDepthM, 0.015, sinkMetalMat, sinkCenterX, basinFloorY + sinkDepthM / 2, sinkCenterZ + 0.22); // front
  addBox(0.015, sinkDepthM, 0.44, sinkMetalMat, sinkCenterX - 0.38, basinFloorY + sinkDepthM / 2, sinkCenterZ); // left
  addBox(0.015, sinkDepthM, 0.44, sinkMetalMat, sinkCenterX + 0.38, basinFloorY + sinkDepthM / 2, sinkCenterZ); // right

  // Drain strainer in sink
  const drainGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.005, 24);
  const drainMesh = new THREE.Mesh(drainGeo, stainlessMat);
  drainMesh.position.set(mx(sinkCenterX), basinFloorY + 0.01, sinkCenterZ);
  drainMesh.receiveShadow = true;
  kitchenGroup.add(drainMesh);

  // Faucet: Arching matte black gooseneck faucet
  const faucetBaseGeo = new THREE.CylinderGeometry(0.026, 0.030, 0.05, 20);
  const faucetBase = new THREE.Mesh(faucetBaseGeo, faucetMat);
  faucetBase.position.set(mx(sinkCenterX), counterTopY + 0.025, facingWallZ + 0.08);
  kitchenGroup.add(faucetBase);

  // Faucet upright stem
  const stemGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.22, 16);
  const stem = new THREE.Mesh(stemGeo, faucetMat);
  stem.position.set(mx(sinkCenterX), counterTopY + 0.05 + 0.11, facingWallZ + 0.08);
  kitchenGroup.add(stem);

  // Gooseneck arch (Torus segment)
  const archGeo = new THREE.TorusGeometry(0.09, 0.014, 12, 24, Math.PI);
  const arch = new THREE.Mesh(archGeo, faucetMat);
  arch.rotation.z = Math.PI / 2;
  arch.rotation.y = isCarportLeft ? Math.PI / 2 : -Math.PI / 2;
  arch.position.set(mx(sinkCenterX), counterTopY + 0.27, facingWallZ + 0.08 + (isCarportLeft ? 0.09 : -0.09));
  kitchenGroup.add(arch);

  // Aerator nozzle head
  const nozzleGeo = new THREE.CylinderGeometry(0.016, 0.013, 0.06, 16);
  const nozzle = new THREE.Mesh(nozzleGeo, faucetMat);
  nozzle.position.set(mx(sinkCenterX), counterTopY + 0.24, facingWallZ + 0.26);
  kitchenGroup.add(nozzle);

  // Single-lever side mixer handle
  const leverHubGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.03, 16);
  const leverHub = new THREE.Mesh(leverHubGeo, faucetMat);
  leverHub.rotation.z = Math.PI / 2;
  leverHub.position.set(mx(sinkCenterX + 0.04), counterTopY + 0.09, facingWallZ + 0.08);
  kitchenGroup.add(leverHub);

  const leverStickGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.08, 12);
  const leverStick = new THREE.Mesh(leverStickGeo, faucetMat);
  leverStick.position.set(mx(sinkCenterX + 0.055), counterTopY + 0.13, facingWallZ + 0.08);
  kitchenGroup.add(leverStick);

  // --- Dish Drying Space (~60cm: X in [1.30, 1.90]) ---
  // Tiered matte black dish drying rack with drain tray and plates
  const rackX = 1.60;
  const rackZ = facingWallZ + 0.32;
  // Drain tray with lip
  addBox(0.48, 0.012, 0.36, matteBlackMat, rackX, counterTopY + 0.006, rackZ);
  // Wireframe rack legs & top frame
  const wireMat = new THREE.MeshStandardMaterial({ color: 0x1f1f1f, roughness: 0.4, metalness: 0.8 });
  addBox(0.48, 0.01, 0.01, wireMat, rackX, counterTopY + 0.18, rackZ - 0.17);
  addBox(0.48, 0.01, 0.01, wireMat, rackX, counterTopY + 0.18, rackZ + 0.17);
  addBox(0.01, 0.01, 0.34, wireMat, rackX - 0.235, counterTopY + 0.18, rackZ);
  addBox(0.01, 0.01, 0.34, wireMat, rackX + 0.235, counterTopY + 0.18, rackZ);
  // 4 corner rack vertical posts
  [[-0.235, -0.17], [0.235, -0.17], [-0.235, 0.17], [0.235, 0.17]].forEach(([dx, dz]) => {
    addBox(0.012, 0.18, 0.012, wireMat, rackX + dx, counterTopY + 0.09, rackZ + dz);
  });
  // Slotted white ceramic plates standing upright in rack
  const plateMat = new THREE.MeshStandardMaterial({ color: 0xf4f4f4, roughness: 0.15 });
  for (let pi = 0; pi < 6; pi++) {
    const ppx = rackX - 0.15 + pi * 0.05;
    const plateGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.008, 24);
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.rotation.z = Math.PI / 2;
    plate.position.set(mx(ppx), counterTopY + 0.13, rackZ - 0.04);
    plate.castShadow = true;
    kitchenGroup.add(plate);
  }
  // Side cutlery holder cup
  addBox(0.08, 0.12, 0.10, matteBlackMat, rackX + 0.18, counterTopY + 0.07, rackZ + 0.10);

  // Wall-mounted matte black hanging rail rod with S-hooks above drying zone
  const rodY = counterTopY + 0.42; // Y = 1.32m
  addBox(0.65, 0.014, 0.014, faucetMat, 1.60, rodY, facingWallZ + 0.035);
  // Mounting brackets
  addBox(0.02, 0.03, 0.035, faucetMat, 1.32, rodY, facingWallZ + 0.02);
  addBox(0.02, 0.03, 0.035, faucetMat, 1.88, rodY, facingWallZ + 0.02);
  // S-Hooks & hanging tools
  for (let hi = 0; hi < 3; hi++) {
    const hx = 1.45 + hi * 0.12;
    addBox(0.006, 0.04, 0.006, stainlessMat, hx, rodY - 0.025, facingWallZ + 0.035);
    // Utensil spatula / ladle
    addBox(0.02, 0.18, 0.008, stainlessMat, hx, rodY - 0.12, facingWallZ + 0.038);
  }

  // --- Backsplash on Short Facing Wall ---
  // Glazed beige square ceramic tiles from counterTopY (0.90) to upper cabinet underside (1.55)
  const backsplashHeight = 0.65;
  const backsplashMidY = counterTopY + backsplashHeight / 2; // 1.225
  addBox(2.20, backsplashHeight, 0.015, backsplashMat, 1.40, backsplashMidY, facingWallZ + 0.008);

  // --- Upper Cabinetry on Short Facing Wall ---
  // Modern handleless matte black upper cabinets (Depth: 0.35m, Height: 0.80m from Y=1.55 to Y=2.35)
  const upperDepth = 0.35;
  const upperHeight = 0.80;
  const upperBottomY = 1.55;
  const upperMidY = upperBottomY + upperHeight / 2; // 1.95
  const upperZ_short = facingWallZ + upperDepth / 2;

  // Upper cabinets from X: 0.40 to 1.90 (width 1.50m)
  addBox(1.50, upperHeight, upperDepth, matteBlackMat, 1.15, upperMidY, upperZ_short);
  // Vertical door gaps (3 doors, 50cm each: 0.40, 0.90, 1.40, 1.90)
  [0.90, 1.40].forEach(gx => {
    addBox(0.004, upperHeight - 0.04, 0.005, recessedGrooveMat, gx, upperMidY, upperZ_short + upperDepth / 2 + 0.002);
  });
  // Recessed finger-grip channel under upper cabinets
  addBox(1.50, 0.02, 0.02, recessedGrooveMat, 1.15, upperBottomY + 0.01, upperZ_short + upperDepth / 2 - 0.02);

  // Warm LED Under-Cabinet Strip Light along Short Run
  const ledStripShort = addBox(1.48, 0.01, 0.02, ledEmissiveMat, 1.15, upperBottomY - 0.005, upperZ_short + upperDepth / 2 - 0.03);
  const ledLightShort = new THREE.PointLight(0xffdfa0, 0.9, 2.5, 1.5);
  ledLightShort.position.set(mx(1.15), upperBottomY - 0.05, facingWallZ + 0.20);
  kitchenGroup.add(ledLightShort);


  // =========================================================================
  // 2. LONG RIGHT WALL (3.30m: X = 2.50, Z in [-1.15, 2.15]) – COOKING, PREP & STORAGE ZONE
  // =========================================================================
  const longWallX = 2.50;
  const baseMidX = longWallX - counterDepth / 2; // 2.20
  const plinthMidX = longWallX - (counterDepth - 0.05) / 2 - 0.01;

  // L-junction seamless corner countertop slab (X in [1.90, 2.50], Z in [-1.15, -0.55])
  addBox(counterDepth, slabThick, counterDepth, marbleMat, baseMidX, counterTopY - slabThick / 2, facingWallZ + counterDepth / 2);

  // --- Prep Buffer (50cm: Z in [-0.55, -0.05]) ---
  // Base cabinet carcass & door
  addBox(counterDepth - 0.02, cabHeight, 0.50, matteBlackMat, baseMidX, cabMidY, -0.30);
  addBox(counterDepth - 0.06, plinthHeight, 0.50, plinthMat, plinthMidX, plinthHeight / 2, -0.30);
  addBox(0.025, 0.035, 0.50, recessedGrooveMat, longWallX - counterDepth, counterBaseY - 0.02, -0.30);
  // Countertop slab (uninterrupted white marble)
  addBox(counterDepth, slabThick, 0.50, marbleMat, baseMidX, counterTopY - slabThick / 2, -0.30);

  // Prep accessories: Solid end-grain oak chopping board + ceramic utensil crock
  const boardX = longWallX - 0.32;
  const boardZ = -0.30;
  addBox(0.32, 0.03, 0.38, oakMat, boardX, counterTopY + 0.015, boardZ);

  const crockGeo = new THREE.CylinderGeometry(0.055, 0.05, 0.14, 20);
  const crockMesh = new THREE.Mesh(crockGeo, new THREE.MeshStandardMaterial({ color: 0xded8cc, roughness: 0.3 }));
  crockMesh.position.set(mx(longWallX - 0.16), counterTopY + 0.07, -0.45);
  kitchenGroup.add(crockMesh);
  // Wooden spoons in crock
  for (let si = 0; si < 3; si++) {
    const spoonGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.22, 10);
    const spoon = new THREE.Mesh(spoonGeo, oakMat);
    spoon.rotation.x = 0.15 * (si - 1);
    spoon.rotation.z = (isCarportLeft ? 1 : -1) * 0.18;
    spoon.position.set(mx(longWallX - 0.16 + (si - 1) * 0.015), counterTopY + 0.15, -0.45 + (si - 1) * 0.015);
    kitchenGroup.add(spoon);
  }

  // --- Cooking Station (75cm: Z in [-0.05, 0.70]) ---
  const cookZ = 0.325; // center of cooking zone
  addBox(counterDepth - 0.02, cabHeight, 0.75, matteBlackMat, baseMidX, cabMidY, cookZ);
  addBox(counterDepth - 0.06, plinthHeight, 0.75, plinthMat, plinthMidX, plinthHeight / 2, cookZ);
  addBox(0.025, 0.035, 0.75, recessedGrooveMat, longWallX - counterDepth, counterBaseY - 0.02, cookZ);
  // 3 Deep pull-out drawers for pots and pans with horizontal finger grooves
  const drawerY = [plinthHeight + cabHeight * 0.33, plinthHeight + cabHeight * 0.66];
  drawerY.forEach(dy => {
    addBox(0.005, 0.004, 0.74, recessedGrooveMat, longWallX - counterDepth - 0.002, dy, cookZ);
  });
  // Countertop slab under hob
  addBox(counterDepth, slabThick, 0.75, marbleMat, baseMidX, counterTopY - slabThick / 2, cookZ);

  // Modena 2-Burner Black Tempered Glass Gas Hob (730mm x 420mm)
  const hobDepthZ = 0.73; // along wall
  const hobWidthX = 0.42; // depth into room
  const hobX = longWallX - 0.32;
  const hobZ = cookZ;
  // Tempered glass plate with beveled rim
  addBox(hobWidthX, 0.012, hobDepthZ, glassHobMat, hobX, counterTopY + 0.006, hobZ);

  // 2 Dual-Ring Gas Burners with Cast Iron Trivets
  const burnerZOffsets = [-0.19, 0.19];
  burnerZOffsets.forEach(bz => {
    const curBZ = hobZ + bz;
    // Brass burner head
    const burnerRingGeo = new THREE.CylinderGeometry(0.058, 0.062, 0.014, 24);
    const burnerRing = new THREE.Mesh(burnerRingGeo, brassBurnerMat);
    burnerRing.position.set(mx(hobX), counterTopY + 0.019, curBZ);
    kitchenGroup.add(burnerRing);

    const centerCapGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.018, 20);
    const centerCap = new THREE.Mesh(centerCapGeo, castIronMat);
    centerCap.position.set(mx(hobX), counterTopY + 0.021, curBZ);
    kitchenGroup.add(centerCap);

    // Heavy Cast Iron Trivet (4 prongs pan support)
    const trivetFrameGeo = new THREE.BoxGeometry(0.24, 0.016, 0.24);
    const trivetEdgeMat = castIronMat;
    // Cross prongs
    addBox(0.24, 0.018, 0.022, trivetEdgeMat, hobX, counterTopY + 0.025, curBZ);
    addBox(0.022, 0.018, 0.24, trivetEdgeMat, hobX, counterTopY + 0.025, curBZ);
  });

  // Front Control Knobs (Rotary dials)
  const knobZOffsets = [-0.07, 0.07];
  knobZOffsets.forEach(kz => {
    const knobBaseGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.004, 16);
    const knobBase = new THREE.Mesh(knobBaseGeo, stainlessMat);
    knobBase.position.set(mx(hobX - 0.15), counterTopY + 0.014, hobZ + kz);
    kitchenGroup.add(knobBase);

    const knobDialGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.016, 16);
    const knobDial = new THREE.Mesh(knobDialGeo, matteBlackMat);
    knobDial.position.set(mx(hobX - 0.15), counterTopY + 0.022, hobZ + kz);
    kitchenGroup.add(knobDial);
  });

  // Slimline Range Hood Flush Under Upper Cabinets (Above Hob, Y = 1.55m)
  const hoodY = 1.55;
  const hoodDepthX = upperDepth + 0.08; // 0.43m
  const hoodMidX = longWallX - hoodDepthX / 2;
  // Hood body
  addBox(hoodDepthX, 0.06, 0.75, stainlessMat, hoodMidX, hoodY + 0.03, cookZ);
  // Metallic grease baffle filters underneath
  const filterMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.4, metalness: 0.9 });
  addBox(hoodDepthX - 0.04, 0.008, 0.70, filterMat, hoodMidX, hoodY - 0.002, cookZ);

  // --- Microwave & Open Display Tower (40cm: Z in [0.70, 1.10]) ---
  // Warm natural oak multi-tier shelving unit from counter to top (Y: 0.90 to 2.35m)
  const towerZ = 0.90; // center of 40cm unit
  const towerDepthX = counterDepth; // 0.60m base, 0.35m upper
  // Base section under microwave
  addBox(counterDepth - 0.02, cabHeight, 0.40, matteBlackMat, baseMidX, cabMidY, towerZ);
  addBox(counterDepth - 0.06, plinthHeight, 0.40, plinthMat, plinthMidX, plinthHeight / 2, towerZ);
  addBox(0.025, 0.035, 0.40, recessedGrooveMat, longWallX - counterDepth, counterBaseY - 0.02, towerZ);
  addBox(counterDepth, slabThick, 0.40, marbleMat, baseMidX, counterTopY - slabThick / 2, towerZ);

  // Natural Warm Oak Shelving Tower (Y: 0.90 to 2.35m, depth 0.38m)
  const oakDepthX = 0.38;
  const oakMidX = longWallX - oakDepthX / 2;
  const towerTotalH = 2.35 - counterTopY; // 1.45m
  // Side vertical oak panels
  addBox(oakDepthX, towerTotalH, 0.025, oakMat, oakMidX, counterTopY + towerTotalH / 2, 0.70 + 0.0125);
  addBox(oakDepthX, towerTotalH, 0.025, oakMat, oakMidX, counterTopY + towerTotalH / 2, 1.10 - 0.0125);
  // Back oak lining panel
  addBox(0.018, towerTotalH, 0.38, oakMat, longWallX - 0.01, counterTopY + towerTotalH / 2, towerZ);

  // Horizontal Oak Shelves:
  // 1) Microwave shelf floor at Y = 1.05m
  addBox(oakDepthX, 0.025, 0.375, oakMat, oakMidX, 1.05, towerZ);
  // 2) Microwave top shelf / intermediate display at Y = 1.48m
  addBox(oakDepthX, 0.025, 0.375, oakMat, oakMidX, 1.48, towerZ);
  // 3) Upper display shelf at Y = 1.90m
  addBox(oakDepthX, 0.025, 0.375, oakMat, oakMidX, 1.90, towerZ);
  // 4) Top crown shelf at Y = 2.35m
  addBox(oakDepthX, 0.025, 0.375, oakMat, oakMidX, 2.35, towerZ);

  // Built-in Microwave in the Dedicated Eye-Level Alcove (Y in [1.07, 1.46])
  const microW = 0.34; // into room
  const microH = 0.32;
  const microD = 0.34; // along Z
  const microY = 1.05 + 0.0125 + microH / 2;
  const microX = longWallX - 0.04 - microW / 2;
  // Microwave matte black chassis
  addBox(microW, microH, microD, matteBlackMat, microX, microY, towerZ);
  // Smoked glass door
  addBox(0.01, microH - 0.04, microD * 0.68, smokedGlassMat, microX - microW / 2 - 0.005, microY, towerZ - 0.04);
  // Stainless pull handle
  addBox(0.012, microH * 0.70, 0.012, stainlessMat, microX - microW / 2 - 0.015, microY, towerZ + 0.07);
  // Digital LED Display & Keypad panel
  const displayMat = new THREE.MeshBasicMaterial({ color: 0x00ffaa });
  addBox(0.008, 0.04, 0.08, displayMat, microX - microW / 2 - 0.005, microY + 0.09, towerZ + 0.11);
  addBox(0.008, 0.12, 0.08, matteBlackMat, microX - microW / 2 - 0.005, microY - 0.02, towerZ + 0.11);

  // Open Shelving Decor:
  // Ceramic jars on Y = 1.48 shelf
  for (let ji = 0; ji < 2; ji++) {
    const jarGeo = new THREE.CylinderGeometry(0.04, 0.045, 0.12, 16);
    const jarMesh = new THREE.Mesh(jarGeo, new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: 0.3 }));
    jarMesh.position.set(mx(oakMidX), 1.48 + 0.0125 + 0.06, towerZ - 0.08 + ji * 0.16);
    kitchenGroup.add(jarMesh);
    // Wooden lid
    const lidGeo = new THREE.CylinderGeometry(0.043, 0.043, 0.018, 16);
    const lidMesh = new THREE.Mesh(lidGeo, oakMat);
    lidMesh.position.set(mx(oakMidX), 1.48 + 0.0125 + 0.125, towerZ - 0.08 + ji * 0.16);
    kitchenGroup.add(lidMesh);
  }
  // Potted trailing pothos plant on upper shelf (Y = 1.90)
  const potGeo = new THREE.CylinderGeometry(0.06, 0.045, 0.10, 16);
  const potMesh = new THREE.Mesh(potGeo, new THREE.MeshStandardMaterial({ color: 0xd4cdc5, roughness: 0.5 }));
  potMesh.position.set(mx(oakMidX), 1.90 + 0.0125 + 0.05, towerZ);
  kitchenGroup.add(potMesh);
  // Trailing green leaves
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

  // --- Transition Buffer (37cm: Z in [1.10, 1.47]) ---
  const transZ = 1.285;
  const transLen = 0.37;
  addBox(counterDepth - 0.02, cabHeight, transLen, matteBlackMat, baseMidX, cabMidY, transZ);
  addBox(counterDepth - 0.06, plinthHeight, transLen, plinthMat, plinthMidX, plinthHeight / 2, transZ);
  addBox(0.025, 0.035, transLen, recessedGrooveMat, longWallX - counterDepth, counterBaseY - 0.02, transZ);
  // Uninterrupted marble landing countertop
  addBox(counterDepth, slabThick, transLen, marbleMat, baseMidX, counterTopY - slabThick / 2, transZ);

  // --- Refrigerator Enclosure (70cm: Z in [1.47, 2.15], Height: 2.20m) ---
  const fridgeZ = 1.81;
  const fridgeWidthZ = 0.68;
  const fridgeDepthX = 0.65;
  const fridgeMidX = longWallX - fridgeDepthX / 2;
  const fridgeTallH = 2.25;

  // Tall matte black outer cabinet enclosure
  // Top overhead bridge cabinet
  addBox(fridgeDepthX, 0.35, fridgeWidthZ + 0.04, matteBlackMat, fridgeMidX, fridgeTallH - 0.175, fridgeZ);
  // Side enclosure panel facing the room
  addBox(fridgeDepthX, fridgeTallH, 0.025, matteBlackMat, fridgeMidX, fridgeTallH / 2, 1.47 - 0.0125);

  // Sleek 2-Door Refrigerator (Dark Titanium Stainless Steel)
  const fBodyH = 1.84;
  const fBodyY = fBodyH / 2;
  const fBodyD = fridgeWidthZ - 0.03; // 0.65m wide
  const fBodyW = 0.60;
  const fBodyX = longWallX - 0.02 - fBodyW / 2;
  addBox(fBodyW, fBodyH, fBodyD, fridgeMat, fBodyX, fBodyY, fridgeZ);

  // Door division gap (Top freezer / Bottom fridge doors)
  const splitY = 0.78;
  addBox(0.01, 0.01, fBodyD, recessedGrooveMat, fBodyX - fBodyW / 2 - 0.005, splitY, fridgeZ);

  // Sleek vertical matte black bar handles
  const handleMat = matteBlackMat;
  // Freezer door handle (top)
  addBox(0.02, 0.38, 0.02, handleMat, fBodyX - fBodyW / 2 - 0.025, splitY + 0.30, fridgeZ - (isCarportLeft ? 0.24 : -0.24));
  // Main fridge door handle (bottom)
  addBox(0.02, 0.45, 0.02, handleMat, fBodyX - fBodyW / 2 - 0.025, splitY - 0.32, fridgeZ - (isCarportLeft ? 0.24 : -0.24));

  // Digital LED temperature & ice dispenser panel on top door
  const fDispenserMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.8 });
  addBox(0.008, 0.22, 0.12, fDispenserMat, fBodyX - fBodyW / 2 - 0.005, 1.35, fridgeZ);

  // --- Backsplash on Long Right Wall ---
  // Glazed beige square ceramic tiles from counterTopY (0.90) to upper cabinet underside (1.55)
  // Covers from corner (Z: -1.15) to fridge edge (Z: 1.47) -> length 2.62m
  const longBacksplashLen = 1.47 - (-1.15); // 2.62m
  const longBacksplashMidZ = (-1.15 + 1.47) / 2; // 0.16m
  addBox(0.015, backsplashHeight, longBacksplashLen, backsplashMat, longWallX - 0.008, backsplashMidY, longBacksplashMidZ);

  // --- Upper Cabinetry on Long Right Wall ---
  // Matte black handleless wall cabinets (Depth: 0.35m, Height: 0.80m, Y: 1.55 to 2.35m)
  const upperMidX_long = longWallX - upperDepth / 2;
  // Section A: Corner to Hob (Z: -0.80 to -0.05, length 0.75m)
  addBox(upperDepth, upperHeight, 0.75, matteBlackMat, upperMidX_long, upperMidY, -0.425);
  // Vertical door groove
  addBox(0.005, upperHeight - 0.04, 0.004, recessedGrooveMat, upperMidX_long - upperDepth / 2 - 0.002, upperMidY, -0.425);

  // Section B: Cooking zone upper cabinet (Z: -0.05 to 0.70, length 0.75m, houses the flush slimline hood)
  addBox(upperDepth, upperHeight - 0.10, 0.75, matteBlackMat, upperMidX_long, upperMidY + 0.05, cookZ);

  // Section C: Above Transition buffer (Z: 1.10 to 1.47, length 0.37m)
  addBox(upperDepth, upperHeight, 0.37, matteBlackMat, upperMidX_long, upperMidY, transZ);

  // Recessed finger-grip channel under upper cabinets along Long Wall
  addBox(0.02, 0.02, 0.75, recessedGrooveMat, upperMidX_long - upperDepth / 2 + 0.02, upperBottomY + 0.01, -0.425);
  addBox(0.02, 0.02, 0.37, recessedGrooveMat, upperMidX_long - upperDepth / 2 + 0.02, upperBottomY + 0.01, transZ);

  // Warm LED Under-Cabinet Strip Light along Long Run
  addBox(0.02, 0.01, 0.74, ledEmissiveMat, upperMidX_long - upperDepth / 2 + 0.03, upperBottomY - 0.005, -0.425);
  addBox(0.02, 0.01, 0.36, ledEmissiveMat, upperMidX_long - upperDepth / 2 + 0.03, upperBottomY - 0.005, transZ);

  const ledLightLong = new THREE.PointLight(0xffdfa0, 1.1, 3.0, 1.4);
  ledLightLong.position.set(mx(longWallX - 0.25), upperBottomY - 0.05, cookZ);
  kitchenGroup.add(ledLightLong);

  // =========================================================================
  // 3. COLLIDERS (Prevent player clipping into counters in Walk Mode)
  // =========================================================================
  if (colliders && Array.isArray(colliders)) {
    // Short wall base cabinet collider
    const shortBox = new THREE.Box3();
    const sMinX = Math.min(mx(0.30), mx(2.50));
    const sMaxX = Math.max(mx(0.30), mx(2.50));
    shortBox.min.set(sMinX, 0, facingWallZ);
    shortBox.max.set(sMaxX, 1.0, facingWallZ + counterDepth);
    colliders.push(shortBox);

    // Long wall base cabinet collider
    const longBox = new THREE.Box3();
    const lMinX = Math.min(mx(longWallX - counterDepth), mx(longWallX));
    const lMaxX = Math.max(mx(longWallX - counterDepth), mx(longWallX));
    longBox.min.set(lMinX, 0, facingWallZ + counterDepth);
    longBox.max.set(lMaxX, 2.3, 2.15);
    colliders.push(longBox);
  }

  scene.add(kitchenGroup);
  return kitchenGroup;
}
