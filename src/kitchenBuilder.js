import * as THREE from 'three';
import {
  createGlazedBeigeTileTexture,
  createZelligeTileNormalMap,
  createWhiteMarbleCounterTexture,
  createWarmOakTexture,
  createBrushedFridgeTexture,
  createRoughBeigeCeramicTexture,
  createRoughBeigeCeramicNormalMap
} from './textures.js';

/**
 * Architectural Kitchen Suite Builder
 * Swapped Configuration matching user's custom layout:
 *
 * 1. SHORT WALL (Z = -1.15m: X in [0.30, 2.50], Width = 2.20m) -> COOKING / STOVE ZONE:
 *    - Left base storage drawers (450mm)
 *    - Cooking Station (900mm) centered at X = 1.20m:
 *      * Modena 2-Burner Gas Hob (730 x 420 x 100 mm | Cut-Out 660 x 360 mm) on marble counter
 *      * Built-in Black Glass Electric Oven (600mm) centered directly under the gas hob
 *      * Slim Integrated Range Hood (780mm) with brushed stainless accent strip flush under upper cabinets
 *    - Right marble counter prep landing (250mm)
 *    - Inside corner junction (600mm) with Matte Black Electric Kettle
 *    - Full-width Glazed Beige Zellige Tile Backsplash with under-cabinet warm 3000K LED wash
 *
 * 2. LONG WALL (X = 2.50m: Z in [-1.15, 2.05], Length = 3.20m) -> SINK & FRIDGE ZONE:
 *    - Inside corner junction (600mm)
 *    - Food Prep & Storage Zone (800mm) with deep pot drawers and Chef's Angled Knife Block
 *    - Washing Station (1000mm) centered at Z = 0.75m:
 *      * Confirmed Workstation Sink (800 x 500 x 254 mm) in matte black composite
 *      * Workstation sliding natural oak cutting board (280 x 480 x 22 mm)
 *      * Stainless basket strainer drain with removable stopper pin
 *      * Wire dish colander basket with drying plates
 *      * Tall matte black gooseneck arch faucet with single-lever mixer
 *      * P-trap drainage pipe assembly inside base cabinet
 *      * Warranty card & installation guide booklet
 *      * Above Sink: Open Warm Honey Oak Shelving Unit (850mm) with microwave niche, jars, mugs, and plate rack
 *      * Under-shelf: Warm LED strip wash + horizontal hanging rail with S-hooks holding 4 coffee mugs
 *    - End-Cap Tall Refrigerator Enclosure (700mm, Z in [1.35, 2.05], Y up to 2.35m):
 *      * Single-Door Refrigerator (1 Door, no horizontal split!)
 *      * High-Clarity Brushed Stainless Steel / Titanium Texture (1024x1024) with visible directional grain & specular sheen
 *      * Full-length vertical stainless handle bar on opening edge
 *      * Eye-level black glass digital LED display panel (3 °C • ECO)
 *      * Brand badge & overhead top cabinet
 */
export function buildKitchenSuite(scene, colliders, houseData) {
  const isCarportLeft = houseData.carportOnLeft !== false;
  const kitchenGroup = new THREE.Group();
  kitchenGroup.name = "kitchenSuite";
  kitchenGroup.userData.interactables = [];

  // 1. High-Resolution Procedural Textures with Anisotropic Filtering
  const beigeTileTex = createGlazedBeigeTileTexture();
  const zelligeNormalTex = createZelligeTileNormalMap();
  const marbleTex = createWhiteMarbleCounterTexture();
  const oakTex = createWarmOakTexture();
  const fridgeTex = createBrushedFridgeTexture();

  // 2. Coherent Physically Based PBR Materials
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

  const marbleMat = new THREE.MeshStandardMaterial({
    map: marbleTex,
    roughness: 0.14,
    metalness: 0.03
  });

  // Helper to generate exact 10cm x 10cm natural beige ceramic tile material (directly matching user reference media_1790531162667.png)
  const texLoader = new THREE.TextureLoader();

  function create10cmBeigeCeramicMat(wMeters, hMeters) {
    // 8 tiles per 0.80m = exactly 10cm (0.10m) per square tile in world space
    const repX = wMeters / 0.80;
    const repY = hMeters / 0.80;

    const col = texLoader.load('/textures/beige_ceramic_tiles.png', (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(repX, repY);
      tex.anisotropy = 8;
      tex.needsUpdate = true;
    });
    col.colorSpace = THREE.SRGBColorSpace;
    col.wrapS = THREE.RepeatWrapping;
    col.wrapT = THREE.RepeatWrapping;
    col.repeat.set(repX, repY);

    const nrm = texLoader.load('/textures/beige_ceramic_tiles_normal.png', (tex) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(repX, repY);
      tex.anisotropy = 8;
      tex.needsUpdate = true;
    });
    nrm.wrapS = THREE.RepeatWrapping;
    nrm.wrapT = THREE.RepeatWrapping;
    nrm.repeat.set(repX, repY);

    return new THREE.MeshStandardMaterial({
      map: col,
      normalMap: nrm,
      normalScale: new THREE.Vector2(0.85, 0.85),
      roughness: 0.55,
      metalness: 0.02
    });
  }

  const oakMat = new THREE.MeshStandardMaterial({
    map: oakTex,
    roughness: 0.42,
    metalness: 0.02
  });

  const faucetMat = new THREE.MeshStandardMaterial({
    color: 0x222427,
    roughness: 0.28,
    metalness: 0.82
  });

  const sinkMatteMat = new THREE.MeshStandardMaterial({
    color: 0x1a1c1e,
    roughness: 0.50,
    metalness: 0.15
  });

  const stainlessMat = new THREE.MeshStandardMaterial({
    color: 0xd6d9dc,
    roughness: 0.24,
    metalness: 0.90
  });

  const gasHobGlassMat = new THREE.MeshStandardMaterial({
    color: 0x111215,
    roughness: 0.04,
    metalness: 0.12
  });

  const castIronMat = new THREE.MeshStandardMaterial({
    color: 0x222325,
    roughness: 0.65,
    metalness: 0.35
  });

  // High-Clarity Brushed Stainless Steel / Titanium Refrigerator Material (Distinct from matte black)
  const brushedFridgeMat = new THREE.MeshStandardMaterial({
    map: fridgeTex,
    roughness: 0.26,
    metalness: 0.88
  });

  const smokedGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x111215,
    roughness: 0.08,
    metalness: 0.15,
    transmission: 0.72,
    transparent: true,
    opacity: 0.88
  });

  const ceramicWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xf5f3ee,
    roughness: 0.26,
    metalness: 0.02
  });

  const clearGlassJarMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.06,
    metalness: 0.05,
    transmission: 0.90,
    transparent: true,
    opacity: 0.65
  });

  const corkMat = new THREE.MeshStandardMaterial({
    color: 0xc49d68,
    roughness: 0.75,
    metalness: 0.02
  });

  const ledEmissiveMat = new THREE.MeshBasicMaterial({
    color: 0xffdfa8
  });

  // Coordinate mirror transformer
  function mx(x) {
    return isCarportLeft ? x : -x;
  }

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

  // Global architectural measurements
  const facingWallZ = -1.15;
  const longWallX = 2.50;
  // Exact visible interior room faces of the architectural walls:
  // Rear short wall center Z = -1.15m (thickness 0.12m) -> inner room surface is at Z = -1.09m
  const rearWallInnerZ = facingWallZ + 0.06; // -1.09m
  // Long side wall center X = 2.50m (thickness 0.15m) -> inner room surface is at X = 2.425m
  const sideWallInnerX = longWallX - 0.075; // 2.425m
  const counterDepth = 0.60;
  const counterTopY = 0.90;
  const slabThick = 0.035;
  const counterBaseY = counterTopY - slabThick; // 0.865m
  const plinthHeight = 0.10;
  const cabHeight = counterBaseY - plinthHeight; // 0.765m
  const upperDepth = 0.36;
  const upperHeight = 0.80;
  const upperBottomY = 1.55;
  const upperMidY = upperBottomY + upperHeight / 2; // 1.95m
  const tallCabinetH = 2.35; // Top alignment for tall fridge housing & upper units
  const backsplashH = upperBottomY - counterTopY; // 0.65m
  const backsplashMidY = counterTopY + backsplashH / 2; // 1.225m

  // =========================================================================
  // 1. SHORT WALL (Z = -1.15m: X in [0.30, 2.50], Total Width = 2.20m)
  // NOW: COOKING & STOVE ZONE (Left Drawers -> Modena Hob & Oven -> Corner)
  // =========================================================================
  const sCenterZ = facingWallZ + counterDepth / 2;
  const sPlinthZ = facingWallZ + (counterDepth - 0.05) / 2 + 0.01;

  // --- 1A. LEFT STORAGE DRAWERS ON SHORT WALL (450mm: X in [0.30, 0.75]) ---
  const leftDrawW = 0.45;
  const leftDrawCenterX = 0.30 + leftDrawW / 2; // 0.525m
  addBox(leftDrawW, plinthHeight, counterDepth - 0.06, plinthMat, leftDrawCenterX, plinthHeight / 2, sPlinthZ);
  addBox(leftDrawW, cabHeight, counterDepth - 0.02, matteBlackMat, leftDrawCenterX, plinthHeight + cabHeight / 2, sCenterZ);
  addBox(leftDrawW, 0.035, 0.025, recessedGrooveMat, leftDrawCenterX, counterBaseY - 0.02, facingWallZ + counterDepth);
  addBox(leftDrawW, slabThick, counterDepth, marbleMat, leftDrawCenterX, counterTopY - slabThick / 2, sCenterZ);
  // Drawer divisions (3 utility / spice drawers)
  const sdY1 = plinthHeight + cabHeight * 0.33;
  const sdY2 = plinthHeight + cabHeight * 0.66;
  addBox(leftDrawW - 0.02, 0.006, 0.005, recessedGrooveMat, leftDrawCenterX, sdY1, facingWallZ + counterDepth + 0.002);
  addBox(leftDrawW - 0.02, 0.006, 0.005, recessedGrooveMat, leftDrawCenterX, sdY2, facingWallZ + counterDepth + 0.002);


  // --- 1B. COOKING STATION: MODENA 2-BURNER GAS HOB & BUILT-IN OVEN (900mm: X in [0.75, 1.65]) ---
  const stoveSecW = 0.90;
  const stoveCenterX = 1.20; // Centered at X = 1.20m on the short wall!
  const hobLen = 0.73; // 730 mm Modena hob length
  const hobWidth = 0.42; // 420 mm Modena hob width
  const hobCenterZ = facingWallZ + counterDepth / 2; // Centered in 600mm counter with 90mm margins

  const stoveDim = {
    label: "730 × 420 mm",
    p1: [stoveCenterX - hobLen / 2, 0.93, facingWallZ + counterDepth + 0.02],
    p2: [stoveCenterX + hobLen / 2, 0.93, facingWallZ + counterDepth + 0.02],
    axis: 'x'
  };

  // Base cabinet carcass under stove
  addBox(stoveSecW, plinthHeight, counterDepth - 0.06, plinthMat, stoveCenterX, plinthHeight / 2, sPlinthZ);
  addBox(stoveSecW, cabHeight, counterDepth - 0.02, matteBlackMat, stoveCenterX, plinthHeight + cabHeight / 2, sCenterZ);
  addBox(stoveSecW, 0.035, 0.025, recessedGrooveMat, stoveCenterX, counterBaseY - 0.02, facingWallZ + counterDepth);
  addBox(stoveSecW, slabThick, counterDepth, marbleMat, stoveCenterX, counterTopY - slabThick / 2, sCenterZ, 0, stoveDim);

  // 1. Built-in Black Glass Electric Oven centered under the hob (W = 600mm, H = 580mm)
  const ovenW = 0.60;
  const ovenH = 0.58;
  const ovenD = 0.54;
  const ovenY = plinthHeight + 0.08 + ovenH / 2;
  addBox(ovenW, ovenH, ovenD, matteBlackMat, stoveCenterX, ovenY, facingWallZ + 0.04 + ovenD / 2, 0, stoveDim);
  // Smoked glass door
  addBox(ovenW - 0.08, ovenH - 0.12, 0.015, smokedGlassMat, stoveCenterX, ovenY - 0.03, facingWallZ + counterDepth + 0.005, 0, stoveDim);
  // Interior oven cavity wire rack visible through glass
  addBox(ovenW - 0.16, 0.01, 0.01, stainlessMat, stoveCenterX, ovenY, facingWallZ + counterDepth - 0.12);
  addBox(ovenW - 0.16, 0.01, 0.01, stainlessMat, stoveCenterX, ovenY - 0.12, facingWallZ + counterDepth - 0.12);
  // Full-width brushed stainless oven handle bar
  addBox(ovenW - 0.12, 0.022, 0.02, stainlessMat, stoveCenterX, ovenY + 0.18, facingWallZ + counterDepth + 0.032, 0, stoveDim);
  addBox(0.02, 0.016, 0.028, stainlessMat, stoveCenterX - 0.20, ovenY + 0.18, facingWallZ + counterDepth + 0.015);
  addBox(0.02, 0.016, 0.028, stainlessMat, stoveCenterX + 0.20, ovenY + 0.18, facingWallZ + counterDepth + 0.015);
  // Top control panel with dual knobs & digital clock display
  addBox(ovenW - 0.04, 0.09, 0.015, matteBlackMat, stoveCenterX, ovenY + 0.24, facingWallZ + counterDepth + 0.005);
  addBox(0.06, 0.024, 0.006, new THREE.MeshBasicMaterial({ color: 0x00ffcc }), stoveCenterX, ovenY + 0.24, facingWallZ + counterDepth + 0.014);
  [-0.18, 0.18].forEach(ox => {
    const oKnob = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.014, 16), matteBlackMat);
    oKnob.position.set(mx(stoveCenterX + ox), ovenY + 0.24, facingWallZ + counterDepth + 0.015);
    kitchenGroup.add(oKnob);
  });

  // 2. Modena 2-Burner Gas Hob on Marble Counter (730mm L x 420mm W x 100mm H)
  // Tempered black glass base plate with beveled edge
  addBox(hobLen, 0.008, hobWidth, gasHobGlassMat, stoveCenterX, counterTopY + 0.004, hobCenterZ, 0, stoveDim);

  // Modena silver brand badge on front center rim of glass plate
  const modenaBadge = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.002, 0.012), stainlessMat);
  modenaBadge.position.set(mx(stoveCenterX), counterTopY + 0.009, hobCenterZ + hobWidth / 2 - 0.015);
  kitchenGroup.add(modenaBadge);

  // Dual Aluminum Burners with Semi Cast-Iron Grids & Gas Safety Technology
  [-0.19, 0.19].forEach(bx => {
    const burnerCenterX = stoveCenterX + bx;

    // Aluminum burner cup body
    const alumBody = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.062, 0.022, 24), stainlessMat);
    alumBody.position.set(mx(burnerCenterX), counterTopY + 0.015, hobCenterZ);
    kitchenGroup.add(alumBody);

    // Brass flame distributor ring crown
    const brassCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.008, 24), new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.25 }));
    brassCrown.position.set(mx(burnerCenterX), counterTopY + 0.026, hobCenterZ);
    kitchenGroup.add(brassCrown);

    // Black enamel burner cap
    const bCap = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.008, 24), matteBlackMat);
    bCap.position.set(mx(burnerCenterX), counterTopY + 0.032, hobCenterZ);
    kitchenGroup.add(bCap);

    // Gas safety thermocouple sensor pin
    const thermoPin = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.022, 10), new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9 }));
    thermoPin.position.set(mx(burnerCenterX - 0.02), counterTopY + 0.022, hobCenterZ + 0.048);
    kitchenGroup.add(thermoPin);

    // Electric spark ignition electrode pin
    const igniterPin = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.020, 10), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 }));
    igniterPin.position.set(mx(burnerCenterX + 0.02), counterTopY + 0.020, hobCenterZ + 0.048);
    kitchenGroup.add(igniterPin);

    // Semi Cast-Iron Heavy Pan Support Grid (210mm x 210mm x 35mm)
    const gridSpan = 0.21;
    const gridMat = castIronMat;
    addBox(gridSpan, 0.016, 0.016, gridMat, burnerCenterX, counterTopY + 0.040, hobCenterZ - gridSpan / 2 + 0.008);
    addBox(gridSpan, 0.016, 0.016, gridMat, burnerCenterX, counterTopY + 0.040, hobCenterZ + gridSpan / 2 - 0.008);
    addBox(0.016, 0.016, gridSpan, gridMat, burnerCenterX - gridSpan / 2 + 0.008, counterTopY + 0.040, hobCenterZ);
    addBox(0.016, 0.016, gridSpan, gridMat, burnerCenterX + gridSpan / 2 - 0.008, counterTopY + 0.040, hobCenterZ);
    // Inward support fingers
    addBox(gridSpan * 0.42, 0.020, 0.018, gridMat, burnerCenterX - 0.055, counterTopY + 0.048, hobCenterZ);
    addBox(gridSpan * 0.42, 0.020, 0.018, gridMat, burnerCenterX + 0.055, counterTopY + 0.048, hobCenterZ);
    addBox(0.018, 0.020, gridSpan * 0.42, gridMat, burnerCenterX, counterTopY + 0.048, hobCenterZ - 0.055);
    addBox(0.018, 0.020, gridSpan * 0.42, gridMat, burnerCenterX, counterTopY + 0.048, hobCenterZ + 0.055);
  });

  // Knurled Modena Metallic Knob Controls (located front center between burners)
  [-0.045, 0.045].forEach(kx => {
    const kRing = new THREE.Mesh(new THREE.RingGeometry(0.018, 0.022, 16), new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.7 }));
    kRing.rotation.x = -Math.PI / 2;
    kRing.position.set(mx(stoveCenterX + kx), counterTopY + 0.009, hobCenterZ + hobWidth / 2 - 0.045);
    kitchenGroup.add(kRing);

    const flameDot = new THREE.Mesh(new THREE.CircleGeometry(0.003, 12), new THREE.MeshBasicMaterial({ color: 0xff3322 }));
    flameDot.rotation.x = -Math.PI / 2;
    flameDot.position.set(mx(stoveCenterX + kx - 0.01), counterTopY + 0.010, hobCenterZ + hobWidth / 2 - 0.045 - 0.018);
    kitchenGroup.add(flameDot);

    const gKnob = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.016, 0.022, 20), stainlessMat);
    gKnob.position.set(mx(stoveCenterX + kx), counterTopY + 0.018, hobCenterZ + hobWidth / 2 - 0.045);
    kitchenGroup.add(gKnob);
  });

  // 3. Slim Built-in Telescopic Range Hood above Modena Hob (Y = 1.55m, Width = 780mm)
  const hoodH = 0.055;
  const hoodY = upperBottomY - hoodH / 2;
  addBox(hobLen + 0.05, hoodH, upperDepth, matteBlackMat, stoveCenterX, hoodY, facingWallZ + upperDepth / 2, 0, stoveDim);
  addBox(hobLen + 0.05, 0.018, 0.008, stainlessMat, stoveCenterX, hoodY, facingWallZ + upperDepth + 0.004);
  addBox(hobLen - 0.02, 0.006, upperDepth - 0.06, stainlessMat, stoveCenterX, upperBottomY - hoodH + 0.003, facingWallZ + upperDepth / 2);


  // --- 1C. RIGHT PREP COUNTER & CORNER BASE (X in [1.65, 2.50]) ---
  const sRightW = 2.50 - 1.65; // 0.85m
  const sRightCenterX = 1.65 + sRightW / 2;
  addBox(sRightW, plinthHeight, counterDepth - 0.06, plinthMat, sRightCenterX, plinthHeight / 2, sPlinthZ);
  addBox(sRightW, cabHeight, counterDepth - 0.02, matteBlackMat, sRightCenterX, plinthHeight + cabHeight / 2, sCenterZ);
  addBox(sRightW, 0.035, 0.025, recessedGrooveMat, sRightCenterX, counterBaseY - 0.02, facingWallZ + counterDepth);
  addBox(sRightW, slabThick, counterDepth, marbleMat, sRightCenterX, counterTopY - slabThick / 2, sCenterZ);

  // Matte Black Electric Kettle resting in inside corner on Short Wall
  const kettleX = 2.18;
  const kettleZ = facingWallZ + 0.28;
  const kettleBody = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.08, 0.22, 20), matteBlackMat);
  kettleBody.position.set(mx(kettleX), counterTopY + 0.11, kettleZ);
  kettleBody.castShadow = true;
  kitchenGroup.add(kettleBody);

  const kettleLid = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.025, 20), stainlessMat);
  kettleLid.position.set(mx(kettleX), counterTopY + 0.22 + 0.012, kettleZ);
  kitchenGroup.add(kettleLid);

  const kettleHandle = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.16, 0.035), matteBlackMat);
  kettleHandle.position.set(mx(kettleX + (isCarportLeft ? 0.085 : -0.085)), counterTopY + 0.12, kettleZ);
  kitchenGroup.add(kettleHandle);


  // --- 1D. BACKSPLASH & UPPER CABINETS ON SHORT WALL ---
  const sBacksplashW = 2.15;
  const sBacksplashCenterX = 0.30 + sBacksplashW / 2; // 1.375m
  const sBacksplashMat = create10cmBeigeCeramicMat(sBacksplashW, backsplashH);
  // Mount 10cm x 10cm handcrafted beige ceramic tiles directly on visible wall surface
  addBox(sBacksplashW, backsplashH, 0.020, sBacksplashMat, sBacksplashCenterX, backsplashMidY, rearWallInnerZ + 0.010);
  // Marble bottom curb strip (matching reference photo)
  addBox(sBacksplashW, 0.04, 0.024, marbleMat, sBacksplashCenterX, counterTopY + 0.02, rearWallInnerZ + 0.012);

  // Upper Cabinets across Short Wall (X in [0.30, 1.90], Length = 1.60m)
  const sUpperW = 1.60;
  const sUpperCenterX = 0.30 + sUpperW / 2; // 1.10m
  addBox(sUpperW, upperHeight, upperDepth, matteBlackMat, sUpperCenterX, upperMidY, facingWallZ + upperDepth / 2);
  addBox(sUpperW, 0.02, 0.02, recessedGrooveMat, sUpperCenterX, upperBottomY + 0.01, facingWallZ + upperDepth - 0.01);
  // Door seams
  [0.75, 1.20, 1.65].forEach(sx => {
    addBox(0.004, upperHeight - 0.04, 0.005, recessedGrooveMat, sx, upperMidY, facingWallZ + upperDepth + 0.002);
  });
  // LED strip under short wall upper cabinets
  addBox(sUpperW - 0.04, 0.008, 0.018, ledEmissiveMat, sUpperCenterX, upperBottomY - 0.004, facingWallZ + upperDepth / 2 + 0.08);
  const ledLightShort = new THREE.PointLight(0xffdfa8, 1.1, 3.0, 1.3);
  ledLightShort.position.set(mx(sUpperCenterX), upperBottomY - 0.06, facingWallZ + 0.22);
  kitchenGroup.add(ledLightShort);


  // =========================================================================
  // 2. LONG WALL (X = 2.50m: Z in [-1.15, 2.05], Total Length = 3.20m)
  // NOW: SINK & REFRIGERATOR ZONE (Prep -> Workstation Sink & Oak Shelves -> Fridge)
  // =========================================================================
  const baseMidX = longWallX - counterDepth / 2; // 2.20m
  const plinthMidX = longWallX - (counterDepth - 0.05) / 2 - 0.01;
  const longEdgeX = longWallX - counterDepth - 0.02;

  // --- 2A. L-JUNCTION CORNER BASE (600mm: Z in [-1.15, -0.55]) ---
  addBox(counterDepth, slabThick, counterDepth, marbleMat, baseMidX, counterTopY - slabThick / 2, facingWallZ + counterDepth / 2);
  addBox(counterDepth - 0.02, cabHeight, counterDepth, matteBlackMat, baseMidX, plinthHeight + cabHeight / 2, facingWallZ + counterDepth / 2);
  addBox(counterDepth - 0.06, plinthHeight, counterDepth, plinthMat, plinthMidX, plinthHeight / 2, facingWallZ + counterDepth / 2);


  // --- 2B. PREP ZONE & BASE DRAWERS (800mm: Z in [-0.55, 0.25]) ---
  const prepLen = 0.80;
  const prepCenterZ = (-0.55 + 0.25) / 2; // -0.15m
  addBox(counterDepth - 0.02, cabHeight, prepLen, matteBlackMat, baseMidX, plinthHeight + cabHeight / 2, prepCenterZ);
  addBox(counterDepth - 0.06, plinthHeight, prepLen, plinthMat, plinthMidX, plinthHeight / 2, prepCenterZ);
  addBox(0.025, 0.035, prepLen, recessedGrooveMat, longWallX - counterDepth, counterBaseY - 0.02, prepCenterZ);
  addBox(counterDepth, slabThick, prepLen, marbleMat, baseMidX, counterTopY - slabThick / 2, prepCenterZ);
  // Drawer split grooves
  const pMidY = plinthHeight + cabHeight / 2;
  addBox(0.005, 0.006, prepLen - 0.02, recessedGrooveMat, longWallX - counterDepth - 0.002, pMidY, prepCenterZ);

  // --- 2B1. DIGITAL INDUCTION RICE COOKER & RICE PADDLE UTENSIL (Z = -0.36m) ---
  const rcW = 0.24; // 240 mm wide (Z-axis)
  const rcD = 0.30; // 300 mm deep (X-axis)
  const rcH = 0.20; // 200 mm high
  const rcCenterZ = -0.36;
  const rcCenterX = longWallX - 0.30; // X = 2.20m (centered in 600mm counter)
  const rcBaseY = counterTopY;

  const rcDim = {
    label: "240 × 300 mm",
    p1: [rcCenterX - rcD / 2, counterTopY + rcH, rcCenterZ],
    p2: [rcCenterX + rcD / 2, counterTopY + rcH, rcCenterZ],
    axis: 'x'
  };

  const rcBodyMat = new THREE.MeshStandardMaterial({
    color: 0xf6f5f0,
    roughness: 0.25,
    metalness: 0.04
  });
  const rcTrimMat = new THREE.MeshStandardMaterial({
    color: 0xc8a27a, // Rose-gold / champagne metallic trim ring
    roughness: 0.30,
    metalness: 0.85
  });
  const rcDisplayMat = new THREE.MeshStandardMaterial({
    color: 0x111316,
    roughness: 0.12,
    metalness: 0.25
  });
  const rcLidMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.20,
    metalness: 0.02
  });
  const rcPlinthMat = new THREE.MeshStandardMaterial({
    color: 0x222427,
    roughness: 0.75
  });
  const paddleMat = new THREE.MeshStandardMaterial({
    color: 0xfbfaf6,
    roughness: 0.35,
    metalness: 0.02
  });

  // Rice Cooker Plinth / Anti-slip Base
  const rcBase = new THREE.Mesh(new THREE.CylinderGeometry(rcW * 0.44, rcW * 0.46, 0.018, 28), rcPlinthMat);
  rcBase.scale.set(rcD / rcW, 1, 1);
  rcBase.position.set(mx(rcCenterX), rcBaseY + 0.009, rcCenterZ);
  registerItem(rcBase, rcDim);
  kitchenGroup.add(rcBase);

  // Main Rounded Ceramic Capsule Body
  const rcBody = new THREE.Mesh(new THREE.CylinderGeometry(rcW * 0.48, rcW * 0.46, rcH * 0.65, 32), rcBodyMat);
  rcBody.scale.set(rcD / rcW, 1, 1);
  rcBody.position.set(mx(rcCenterX), rcBaseY + 0.018 + rcH * 0.325, rcCenterZ);
  rcBody.castShadow = true;
  registerItem(rcBody, rcDim);
  kitchenGroup.add(rcBody);

  // Champagne Rose-Gold Metallic Accent Ring
  const rcRing = new THREE.Mesh(new THREE.CylinderGeometry(rcW * 0.485, rcW * 0.485, 0.012, 32), rcTrimMat);
  rcRing.scale.set(rcD / rcW, 1, 1);
  rcRing.position.set(mx(rcCenterX), rcBaseY + 0.018 + rcH * 0.65, rcCenterZ);
  kitchenGroup.add(rcRing);

  // Domed Lid with Soft Contours
  const rcLid = new THREE.Mesh(new THREE.SphereGeometry(rcW * 0.47, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.36), rcLidMat);
  rcLid.scale.set(rcD / rcW, 0.55, 1);
  rcLid.position.set(mx(rcCenterX), rcBaseY + rcH * 0.68, rcCenterZ);
  rcLid.castShadow = true;
  kitchenGroup.add(rcLid);

  // Steam Vent Cap with vent slits on top
  const rcVent = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.036, 0.012, 20), rcTrimMat);
  rcVent.position.set(mx(rcCenterX + (isCarportLeft ? -0.035 : 0.035)), rcBaseY + rcH + 0.004, rcCenterZ);
  kitchenGroup.add(rcVent);
  const rcVentInner = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.014, 16), rcPlinthMat);
  rcVentInner.position.set(mx(rcCenterX + (isCarportLeft ? -0.035 : 0.035)), rcBaseY + rcH + 0.005, rcCenterZ);
  kitchenGroup.add(rcVentInner);

  // Chrome Push-Open Button on lid front
  const rcBtn = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.020, 0.042), stainlessMat);
  rcBtn.position.set(mx(rcCenterX - (isCarportLeft ? rcD * 0.46 : -rcD * 0.46)), rcBaseY + rcH * 0.70, rcCenterZ);
  kitchenGroup.add(rcBtn);

  // Angled Digital LED Display & Touch Control Panel on front
  const rcPanel = new THREE.Mesh(new THREE.BoxGeometry(0.010, 0.070, 0.13), rcDisplayMat);
  rcPanel.rotation.z = isCarportLeft ? 0.28 : -0.28;
  rcPanel.position.set(mx(rcCenterX - (isCarportLeft ? rcD * 0.44 : -rcD * 0.44)), rcBaseY + rcH * 0.42, rcCenterZ);
  kitchenGroup.add(rcPanel);

  // Glowing Amber Digital Timer ("0:18" cooking countdown)
  const rcTimerGlow = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.016, 0.042), new THREE.MeshBasicMaterial({ color: 0xffaa22 }));
  rcTimerGlow.rotation.z = isCarportLeft ? 0.28 : -0.28;
  rcTimerGlow.position.set(mx(rcCenterX - (isCarportLeft ? rcD * 0.447 : -rcD * 0.447)), rcBaseY + rcH * 0.45, rcCenterZ);
  kitchenGroup.add(rcTimerGlow);

  // Illuminated Status Indicators (COOK: Red LED, WARM: Green LED)
  const rcCookLed = new THREE.Mesh(new THREE.CircleGeometry(0.004, 12), new THREE.MeshBasicMaterial({ color: 0xff2222 }));
  rcCookLed.rotation.y = isCarportLeft ? -Math.PI / 2 : Math.PI / 2;
  rcCookLed.position.set(mx(rcCenterX - (isCarportLeft ? rcD * 0.451 : -rcD * 0.451)), rcBaseY + rcH * 0.38, rcCenterZ - 0.035);
  kitchenGroup.add(rcCookLed);

  const rcWarmLed = new THREE.Mesh(new THREE.CircleGeometry(0.004, 12), new THREE.MeshBasicMaterial({ color: 0x33ee66 }));
  rcWarmLed.rotation.y = isCarportLeft ? -Math.PI / 2 : Math.PI / 2;
  rcWarmLed.position.set(mx(rcCenterX - (isCarportLeft ? rcD * 0.451 : -rcD * 0.451)), rcBaseY + rcH * 0.38, rcCenterZ + 0.035);
  kitchenGroup.add(rcWarmLed);

  // Arched Folding Carry Handle
  const rcHandle = new THREE.Mesh(new THREE.TorusGeometry(rcW * 0.40, 0.008, 10, 24, Math.PI), rcBodyMat);
  rcHandle.position.set(mx(rcCenterX), rcBaseY + rcH * 0.75, rcCenterZ);
  rcHandle.rotation.x = Math.PI / 2;
  rcHandle.rotation.z = isCarportLeft ? Math.PI / 2 : -Math.PI / 2;
  kitchenGroup.add(rcHandle);

  // RICE COOKER UTENSIL 1: Rice Paddle (Shamoji) in Holster on cooker side
  const paddleHolster = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.075, 0.035), rcBodyMat);
  const holsterZ = rcCenterZ + (rcW * 0.46 + 0.016);
  paddleHolster.position.set(mx(rcCenterX), rcBaseY + 0.09, holsterZ);
  kitchenGroup.add(paddleHolster);

  // Handle standing in holster
  const pHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.005, 0.11, 16), paddleMat);
  pHandle.position.set(mx(rcCenterX), rcBaseY + 0.12, holsterZ);
  kitchenGroup.add(pHandle);

  // Textured Paddle Spatula Head
  const pHead = new THREE.Mesh(new THREE.BoxGeometry(0.010, 0.085, 0.058), paddleMat);
  pHead.position.set(mx(rcCenterX), rcBaseY + 0.20, holsterZ);
  pHead.castShadow = true;
  kitchenGroup.add(pHead);

  // Dimpled embossed non-stick textured dots on paddle
  for (let rdi = 0; rdi < 8; rdi++) {
    const pDot = new THREE.Mesh(new THREE.SphereGeometry(0.0022, 8, 8), paddleMat);
    const pdy = (rdi % 4) * 0.017 - 0.025;
    const pdz = Math.floor(rdi / 4) * 0.020 - 0.010;
    pDot.position.set(mx(rcCenterX + (isCarportLeft ? -0.006 : 0.006)), rcBaseY + 0.20 + pdy, holsterZ + pdz);
    kitchenGroup.add(pDot);
  }

  // RICE COOKER UTENSIL 2: Ceramic Spoon Rest with Flat Rice Spatula beside cooker
  const spoonRest = new THREE.Mesh(new THREE.CylinderGeometry(0.040, 0.035, 0.010, 20), ceramicWhiteMat);
  spoonRest.scale.set(1.3, 1, 0.85);
  spoonRest.position.set(mx(longWallX - 0.14), counterTopY + 0.005, rcCenterZ);
  kitchenGroup.add(spoonRest);
  const restPaddle = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.004, 0.11), paddleMat);
  restPaddle.rotation.y = 0.20;
  restPaddle.position.set(mx(longWallX - 0.14), counterTopY + 0.012, rcCenterZ);
  kitchenGroup.add(restPaddle);


  // --- 2B2. CHEF'S KNIFE BLOCK SET ON COUNTER (Z = -0.12m) ---
  const kbX = longWallX - 0.16;
  const kbZ = -0.12;
  const kbBlock = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.20, 0.09), matteBlackMat);
  kbBlock.rotation.x = 0.22;
  kbBlock.position.set(mx(kbX), counterTopY + 0.10, kbZ);
  kbBlock.castShadow = true;
  kitchenGroup.add(kbBlock);
  for (let ki = 0; ki < 6; ki++) {
    const kHandle = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.08, 0.020), matteBlackMat);
    kHandle.rotation.x = 0.22;
    kHandle.position.set(mx(kbX - 0.030 + (ki % 2) * 0.06), counterTopY + 0.21 + Math.floor(ki / 2) * 0.02, kbZ - 0.022 + Math.floor(ki / 2) * 0.022);
    kitchenGroup.add(kHandle);
  }


  // --- 2B3. COUNTERTOP DISH DRYING RACK (Z in [0.02, 0.23], directly beside sink) ---
  const drW = 0.21; // 210 mm wide (Z-axis)
  const drD = 0.38; // 380 mm deep (X-axis)
  const drH = 0.17; // 170 mm high
  const drCenterZ = 0.125; // Placed right beside workstation sink (which starts at Z = 0.25)
  const drCenterX = longWallX - 0.28; // X = 2.22m

  const drDim = {
    label: "380 × 220 mm",
    p1: [drCenterX - drD / 2, counterTopY + drH, drCenterZ],
    p2: [drCenterX + drD / 2, counterTopY + drH, drCenterZ],
    axis: 'x'
  };

  const drTrayMat = new THREE.MeshStandardMaterial({
    color: 0x1d1f22,
    roughness: 0.35,
    metalness: 0.10
  });
  const drWireMat = new THREE.MeshStandardMaterial({
    color: 0x2b2e32,
    roughness: 0.28,
    metalness: 0.80
  });
  const drChromeMat = new THREE.MeshStandardMaterial({
    color: 0xd8dbdf,
    roughness: 0.18,
    metalness: 0.92
  });

  // 1. Slanted Drainage Base Tray with lip directing water runoff toward sink
  const drTray = new THREE.Mesh(new THREE.BoxGeometry(drD, 0.016, drW), drTrayMat);
  drTray.position.set(mx(drCenterX), counterTopY + 0.008, drCenterZ);
  drTray.castShadow = true;
  drTray.receiveShadow = true;
  registerItem(drTray, drDim);
  kitchenGroup.add(drTray);

  // Drainage spout lip extending over sink margin
  const drSpout = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.012, 0.035), drTrayMat);
  drSpout.position.set(mx(drCenterX), counterTopY + 0.006, drCenterZ + drW / 2 + 0.015);
  kitchenGroup.add(drSpout);

  // 2. Stainless Steel Support Legs (4 Corner Feet with non-slip caps)
  [
    [-drD / 2 + 0.02, -drW / 2 + 0.02],
    [drD / 2 - 0.02, -drW / 2 + 0.02],
    [-drD / 2 + 0.02, drW / 2 - 0.02],
    [drD / 2 - 0.02, drW / 2 - 0.02]
  ].forEach(([fx, fz]) => {
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, drH, 12), drWireMat);
    foot.position.set(mx(drCenterX + (isCarportLeft ? fx : -fx)), counterTopY + drH / 2, drCenterZ + fz);
    kitchenGroup.add(foot);
  });

  // 3. Perimeter Wire Guard Rails (Upper & Lower)
  [0.05, drH].forEach(ry => {
    const rLong1 = new THREE.Mesh(new THREE.BoxGeometry(drD, 0.005, 0.005), drWireMat);
    rLong1.position.set(mx(drCenterX), counterTopY + ry, drCenterZ - drW / 2 + 0.015);
    kitchenGroup.add(rLong1);
    const rLong2 = new THREE.Mesh(new THREE.BoxGeometry(drD, 0.005, 0.005), drWireMat);
    rLong2.position.set(mx(drCenterX), counterTopY + ry, drCenterZ + drW / 2 - 0.015);
    kitchenGroup.add(rLong2);
    const rCross1 = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.005, drW - 0.03), drWireMat);
    rCross1.position.set(mx(drCenterX - (isCarportLeft ? drD / 2 - 0.015 : -drD / 2 + 0.015)), counterTopY + ry, drCenterZ);
    kitchenGroup.add(rCross1);
    const rCross2 = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.005, drW - 0.03), drWireMat);
    rCross2.position.set(mx(drCenterX + (isCarportLeft ? drD / 2 - 0.015 : -drD / 2 + 0.015)), counterTopY + ry, drCenterZ);
    kitchenGroup.add(rCross2);
  });

  // 4. Slotted Upright Wire Dividers with Standing Ceramic Plates
  const numDryingPlates = 5;
  const plateStep = (drD * 0.65) / numDryingPlates;
  for (let pi = 0; pi < numDryingPlates; pi++) {
    const px = -drD * 0.32 + pi * plateStep;
    // Upright wire loop
    const uWire = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.09, drW * 0.60), drWireMat);
    uWire.position.set(mx(drCenterX + (isCarportLeft ? px : -px)), counterTopY + 0.055, drCenterZ - 0.015);
    kitchenGroup.add(uWire);

    // Ceramic Plate drying in rack
    const plateRadius = pi % 2 === 0 ? 0.090 : 0.075;
    const plateMat = pi === 1
      ? new THREE.MeshStandardMaterial({ color: 0x90b5ad, roughness: 0.25 }) // Celadon ceramic
      : ceramicWhiteMat;
    const plateMesh = new THREE.Mesh(new THREE.CylinderGeometry(plateRadius, plateRadius, 0.006, 24), plateMat);
    plateMesh.rotation.z = Math.PI / 2;
    plateMesh.position.set(mx(drCenterX + (isCarportLeft ? px : -px)), counterTopY + plateRadius + 0.015, drCenterZ - 0.015);
    plateMesh.castShadow = true;
    kitchenGroup.add(plateMesh);
  }

  // 5. Side Cutlery Caddy / Utensil Basket holding spoons, forks, chopsticks
  const caddyD = 0.09;
  const caddyW = 0.065;
  const caddyH = 0.11;
  const caddyCenterX = drCenterX + (isCarportLeft ? drD / 2 - caddyD / 2 : -drD / 2 + caddyD / 2);
  const caddyCenterZ = drCenterZ + drW / 2 + caddyW / 2 - 0.005;
  const caddyBox = new THREE.Mesh(new THREE.BoxGeometry(caddyD, caddyH, caddyW), drTrayMat);
  caddyBox.position.set(mx(caddyCenterX), counterTopY + caddyH / 2 + 0.018, caddyCenterZ);
  caddyBox.castShadow = true;
  kitchenGroup.add(caddyBox);

  // Cutlery inside caddy (spoons, forks, and bamboo chopsticks)
  [-0.022, 0.022].forEach((cx, ci) => {
    // Spoon
    const spoonStem = new THREE.Mesh(new THREE.CylinderGeometry(0.0025, 0.0025, 0.13, 12), drChromeMat);
    spoonStem.rotation.x = 0.15;
    spoonStem.position.set(mx(caddyCenterX + (isCarportLeft ? cx : -cx)), counterTopY + 0.11, caddyCenterZ - 0.010);
    kitchenGroup.add(spoonStem);
    const spoonBowl = new THREE.Mesh(new THREE.SphereGeometry(0.011, 12, 10), drChromeMat);
    spoonBowl.scale.set(0.7, 1.2, 0.35);
    spoonBowl.position.set(mx(caddyCenterX + (isCarportLeft ? cx : -cx)), counterTopY + 0.17, caddyCenterZ - 0.014);
    kitchenGroup.add(spoonBowl);

    // Chopsticks (Bamboo)
    const chopstick = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0016, 0.18, 8), corkMat);
    chopstick.rotation.z = ci === 0 ? 0.10 : -0.08;
    chopstick.position.set(mx(caddyCenterX + (isCarportLeft ? cx + 0.012 : -cx - 0.012)), counterTopY + 0.13, caddyCenterZ + 0.012);
    kitchenGroup.add(chopstick);
  });

  // 6. Inverted Drying Glass Tumblers on rear wire rack section
  [-0.06, 0.06].forEach((gx) => {
    const glassTumbler = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.033, 0.085, 16), clearGlassJarMat);
    glassTumbler.position.set(mx(drCenterX + (isCarportLeft ? gx : -gx)), counterTopY + 0.060, drCenterZ + 0.045);
    kitchenGroup.add(glassTumbler);
  });


  // --- 2C. WASHING STATION: CONFIRMED WORKSTATION SINK (800 x 500 x 254 mm) (Z in [0.25, 1.25]) ---
  const sinkSecLen = 1.00;
  const sinkCenterZ = (0.25 + 1.25) / 2; // 0.75m
  const sinkW = 0.80; // 800 mm along long wall (Z-axis)
  const sinkD = 0.50; // 500 mm depth front-to-back (X-axis)
  const sinkH = 0.254; // 254 mm basin depth (10 inches)
  const sinkCenterX = longWallX - counterDepth / 2; // 2.20m (centered in 600mm counter)

  const sinkDim = {
    label: "800 × 500 mm",
    p1: [longEdgeX, 0.93, sinkCenterZ - sinkW / 2],
    p2: [longEdgeX, 0.93, sinkCenterZ + sinkW / 2],
    axis: 'z'
  };

  // Base cabinet plinth & carcass under sink
  addBox(counterDepth - 0.06, plinthHeight, sinkSecLen, plinthMat, plinthMidX, plinthHeight / 2, sinkCenterZ);
  addBox(counterDepth - 0.02, cabHeight, sinkSecLen, matteBlackMat, baseMidX, plinthHeight + cabHeight / 2, sinkCenterZ);
  addBox(0.025, 0.035, sinkSecLen, recessedGrooveMat, longWallX - counterDepth, counterBaseY - 0.02, sinkCenterZ);
  // Dual under-sink cabinet door seam
  addBox(0.005, cabHeight - 0.26, 0.004, recessedGrooveMat, longWallX - counterDepth - 0.002, plinthHeight + (cabHeight - 0.26) / 2, sinkCenterZ);

  // Matte Black Apron Front (Exposed on kitchen face at X = 1.90m)
  const apronThick = 0.035;
  const apronY = counterTopY - sinkH / 2;
  const apronX = longWallX - counterDepth - apronThick / 2 + 0.008;
  addBox(apronThick, sinkH, sinkW, sinkMatteMat, apronX, apronY, sinkCenterZ, 0, sinkDim);

  // Countertop Marble Surround around 800 x 500 mm sink
  const sideMarbleL = (sinkSecLen - sinkW) / 2; // ~0.10m on each side
  addBox(counterDepth, slabThick, sideMarbleL, marbleMat, baseMidX, counterTopY - slabThick / 2, 0.25 + sideMarbleL / 2, 0, sinkDim);
  addBox(counterDepth, slabThick, sideMarbleL, marbleMat, baseMidX, counterTopY - slabThick / 2, 1.25 - sideMarbleL / 2, 0, sinkDim);
  // Marble behind sink basin (50mm margin against backsplash for faucet deck)
  const rearMarbleD = counterDepth - sinkD; // ~0.10m
  addBox(rearMarbleD, slabThick, sinkW, marbleMat, longWallX - rearMarbleD / 2, counterTopY - slabThick / 2, sinkCenterZ, 0, sinkDim);

  // Workstation Basin Interior (800mm L x 500mm W x 254mm H)
  const sFloorY = counterTopY - sinkH + 0.015;
  // Basin floor
  addBox(sinkD - 0.04, 0.015, sinkW - 0.04, sinkMatteMat, sinkCenterX, sFloorY, sinkCenterZ, 0, sinkDim);
  // Basin walls
  addBox(sinkD - 0.04, sinkH, 0.02, sinkMatteMat, sinkCenterX, counterTopY - sinkH / 2, sinkCenterZ - sinkW / 2 + 0.01, 0, sinkDim);
  addBox(sinkD - 0.04, sinkH, 0.02, sinkMatteMat, sinkCenterX, counterTopY - sinkH / 2, sinkCenterZ + sinkW / 2 - 0.01, 0, sinkDim);
  addBox(0.02, sinkH, sinkW - 0.04, sinkMatteMat, longWallX - 0.06, counterTopY - sinkH / 2, sinkCenterZ, 0, sinkDim);

  // Integrated Workstation Stepped Ledge for sliding cutting board & basket
  const ledgeY = counterTopY - 0.018;
  addBox(sinkD - 0.04, 0.008, 0.015, stainlessMat, sinkCenterX, ledgeY, sinkCenterZ - sinkW / 2 + 0.025);
  addBox(sinkD - 0.04, 0.008, 0.015, stainlessMat, sinkCenterX, ledgeY, sinkCenterZ + sinkW / 2 - 0.025);

  // Stainless Basket Strainer Drain in Sink Floor with stopper pin
  const drainMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.01, 24), stainlessMat);
  drainMesh.position.set(mx(sinkCenterX), sFloorY + 0.01, sinkCenterZ);
  kitchenGroup.add(drainMesh);
  const drainPin = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.03, 12), stainlessMat);
  drainPin.position.set(mx(sinkCenterX), sFloorY + 0.025, sinkCenterZ);
  kitchenGroup.add(drainPin);

  // P-Trap Drainage Pipe Assembly modeled inside cabinet under sink
  const pipeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.35, metalness: 0.85 });
  const pTrapDrop = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.16, 16), pipeMat);
  pTrapDrop.position.set(mx(sinkCenterX), sFloorY - 0.08, sinkCenterZ);
  kitchenGroup.add(pTrapDrop);
  const pTrapCurve = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.022, 12, 20, Math.PI), pipeMat);
  pTrapCurve.position.set(mx(sinkCenterX), sFloorY - 0.16, sinkCenterZ);
  kitchenGroup.add(pTrapCurve);
  const pTrapOutlet = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.20, 16), pipeMat);
  pTrapOutlet.rotation.z = Math.PI / 2;
  pTrapOutlet.position.set(mx(sinkCenterX + (isCarportLeft ? 0.10 : -0.10)), sFloorY - 0.16, sinkCenterZ);
  kitchenGroup.add(pTrapOutlet);

  // Workstation Natural Oak Cutting Board (sliding over sink ledge)
  const cbW = 0.28; // 280 mm
  const cbD = sinkD - 0.02; // 480 mm
  const cbH = 0.022; // 22 mm solid oak
  const cbZ = sinkCenterZ + sinkW / 2 - cbW / 2 - 0.02;
  addBox(cbD, cbH, cbW, oakMat, sinkCenterX, counterTopY + cbH / 2 - 0.005, cbZ, 0, sinkDim);

  // Wire Dish Colander Basket (sliding over left side of sink)
  const wireBasketMat = new THREE.MeshStandardMaterial({ color: 0x333538, roughness: 0.35, metalness: 0.70 });
  const wbZ = sinkCenterZ - sinkW / 2 + 0.14;
  const wbW = 0.24;
  const wbD = sinkD - 0.04;
  addBox(wbD, 0.07, 0.01, wireBasketMat, sinkCenterX, counterTopY - 0.015, wbZ - wbW / 2 + 0.005);
  addBox(wbD, 0.07, 0.01, wireBasketMat, sinkCenterX, counterTopY - 0.015, wbZ + wbW / 2 - 0.005);
  addBox(0.01, 0.07, wbW, wireBasketMat, sinkCenterX - wbD / 2 + 0.005, counterTopY - 0.015, wbZ);
  addBox(0.01, 0.07, wbW, wireBasketMat, sinkCenterX + wbD / 2 - 0.005, counterTopY - 0.015, wbZ);
  for (let di = 0; di < 3; di++) {
    const dPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.006, 20), ceramicWhiteMat);
    dPlate.rotation.z = Math.PI / 2 + 0.15;
    dPlate.position.set(mx(sinkCenterX - 0.07 + di * 0.06), counterTopY + 0.04, wbZ);
    kitchenGroup.add(dPlate);
  }

  // Warranty Card & Installation Guide Booklet on Marble Deck
  const docMat = new THREE.MeshStandardMaterial({ color: 0xfcfcfc, roughness: 0.60 });
  const docMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.006, 0.16), docMat);
  docMesh.rotation.y = 0.25;
  docMesh.position.set(mx(longWallX - 0.15), counterTopY + 0.003, 0.30);
  kitchenGroup.add(docMesh);
  const sealMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.002, 16), new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.25 }));
  sealMesh.position.set(mx(longWallX - 0.15), counterTopY + 0.007, 0.30);
  kitchenGroup.add(sealMesh);

  // Tall Matte Black Gooseneck Arch Faucet (Mounted on rear marble deck behind sink)
  const faucetX = longWallX - 0.065;
  const faucetBase = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.028, 0.045, 20), faucetMat);
  faucetBase.position.set(mx(faucetX), counterTopY + 0.022, sinkCenterZ);
  registerItem(faucetBase, sinkDim);
  kitchenGroup.add(faucetBase);

  const faucetStem = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.20, 16), faucetMat);
  faucetStem.position.set(mx(faucetX), counterTopY + 0.045 + 0.10, sinkCenterZ);
  kitchenGroup.add(faucetStem);

  const faucetArchGeo = new THREE.TorusGeometry(0.08, 0.013, 12, 24, Math.PI);
  const faucetArch = new THREE.Mesh(faucetArchGeo, faucetMat);
  faucetArch.rotation.x = Math.PI / 2;
  faucetArch.rotation.z = isCarportLeft ? Math.PI / 2 : -Math.PI / 2;
  faucetArch.position.set(mx(faucetX - (isCarportLeft ? 0.08 : -0.08)), counterTopY + 0.245, sinkCenterZ);
  kitchenGroup.add(faucetArch);

  const faucetNozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.012, 0.055, 16), faucetMat);
  faucetNozzle.position.set(mx(faucetX - 0.16), counterTopY + 0.21, sinkCenterZ);
  kitchenGroup.add(faucetNozzle);

  // Single-lever side mixer handle
  const leverHub = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.026, 16), faucetMat);
  leverHub.rotation.x = Math.PI / 2;
  leverHub.position.set(mx(faucetX), counterTopY + 0.08, sinkCenterZ + 0.038);
  kitchenGroup.add(leverHub);
  const leverStick = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.075, 12), faucetMat);
  leverStick.position.set(mx(faucetX), counterTopY + 0.12, sinkCenterZ + 0.052);
  kitchenGroup.add(leverStick);


  // --- 2D. OPEN WARM OAK SHELVING & DISPLAY UNIT ABOVE SINK (850mm: Z in [0.32, 1.18]) ---
  const oakUnitLen = 0.86;
  const oakUnitCenterZ = sinkCenterZ; // 0.75m
  const oakUnitDepth = 0.35;
  const oakUnitCenterX = longWallX - oakUnitDepth / 2;
  const oakDim = {
    label: "850 mm",
    p1: [longWallX - oakUnitDepth - 0.02, 1.95, oakUnitCenterZ - oakUnitLen / 2],
    p2: [longWallX - oakUnitDepth - 0.02, 1.95, oakUnitCenterZ + oakUnitLen / 2],
    axis: 'z'
  };

  const oakThick = 0.02;
  // Oak Carcass (Left, Right, Top, Bottom, Back)
  addBox(oakUnitDepth, upperHeight, oakThick, oakMat, oakUnitCenterX, upperMidY, oakUnitCenterZ - oakUnitLen / 2 + oakThick / 2, 0, oakDim);
  addBox(oakUnitDepth, upperHeight, oakThick, oakMat, oakUnitCenterX, upperMidY, oakUnitCenterZ + oakUnitLen / 2 - oakThick / 2, 0, oakDim);
  addBox(oakUnitDepth, oakThick, oakUnitLen, oakMat, oakUnitCenterX, upperBottomY + upperHeight - oakThick / 2, oakUnitCenterZ, 0, oakDim);
  addBox(oakUnitDepth, oakThick, oakUnitLen, oakMat, oakUnitCenterX, upperBottomY + oakThick / 2, oakUnitCenterZ, 0, oakDim);
  addBox(0.015, upperHeight - 0.04, oakUnitLen - 0.04, oakMat, longWallX - 0.008, upperMidY, oakUnitCenterZ);

  // Vertical Center Oak Divider
  const oakDivZ = oakUnitCenterZ - 0.04;
  addBox(oakUnitDepth - 0.02, upperHeight - 0.04, oakThick, oakMat, oakUnitCenterX - 0.01, upperMidY, oakDivZ);

  // Left Column of Oak Unit (Z in [0.33, 0.70], Width ~0.37m) - Slotted Plate Drying Rack
  const oakL1ColZ = (0.33 + oakDivZ) / 2;
  const oakL1ColLen = oakDivZ - 0.33;
  addBox(oakUnitDepth - 0.02, oakThick, oakL1ColLen, oakMat, oakUnitCenterX - 0.01, upperBottomY + 0.36, oakL1ColZ);
  addBox(oakUnitDepth - 0.02, oakThick, oakL1ColLen, oakMat, oakUnitCenterX - 0.01, upperBottomY + 0.58, oakL1ColZ);
  // Standing ceramic plates in slotted plate rack
  for (let pi = 0; pi < 5; pi++) {
    const pX = longWallX - 0.26 + pi * 0.038;
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.008, 24), ceramicWhiteMat);
    plate.rotation.z = Math.PI / 2;
    plate.position.set(mx(pX), upperBottomY + oakThick + 0.12, oakL1ColZ);
    plate.castShadow = true;
    kitchenGroup.add(plate);
  }
  // Upper bowls
  const midDish1 = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.045, 0.05, 16), ceramicWhiteMat);
  midDish1.position.set(mx(longWallX - 0.18), upperBottomY + 0.36 + 0.03, oakL1ColZ);
  kitchenGroup.add(midDish1);

  // Right Column of Oak Unit (Z in [0.72, 1.17], Width ~0.45m) - Microwave Niche & Mugs
  const oakRColZ = (oakDivZ + 1.17) / 2;
  const oakRColLen = 1.17 - oakDivZ;
  addBox(oakUnitDepth - 0.02, oakThick, oakRColLen, oakMat, oakUnitCenterX - 0.01, upperBottomY + 0.36, oakRColZ);
  addBox(oakUnitDepth - 0.02, oakThick, oakRColLen, oakMat, oakUnitCenterX - 0.01, upperBottomY + 0.58, oakRColZ);

  // Microwave Oven in lower niche of right column
  const mBoxW = 0.42;
  const mBoxH = 0.28;
  const mBoxD = 0.30;
  const mBoxY = upperBottomY + oakThick + mBoxH / 2 + 0.01;
  addBox(mBoxD, mBoxH, mBoxW, matteBlackMat, longWallX - 0.04 - mBoxD / 2, mBoxY, oakRColZ, 0, oakDim);
  addBox(0.008, mBoxH - 0.04, mBoxW * 0.70, smokedGlassMat, longWallX - 0.04 - mBoxD - 0.004, mBoxY, oakRColZ - 0.05, 0, oakDim);
  addBox(0.014, mBoxH * 0.65, 0.014, matteBlackMat, longWallX - 0.04 - mBoxD - 0.015, mBoxY, oakRColZ + 0.07);
  addBox(0.006, mBoxH - 0.04, 0.08, matteBlackMat, longWallX - 0.04 - mBoxD - 0.004, mBoxY, oakRColZ + 0.15);
  addBox(0.004, 0.025, 0.05, new THREE.MeshBasicMaterial({ color: 0x00ffcc }), longWallX - 0.04 - mBoxD - 0.008, mBoxY + 0.07, oakRColZ + 0.15);

  // Middle Shelf: Glass storage jars with cork lids & coffee mugs
  [-0.08, 0.02].forEach(jz => {
    const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.11, 16), clearGlassJarMat);
    jar.position.set(mx(longWallX - 0.18), upperBottomY + 0.36 + 0.06, oakRColZ + jz);
    kitchenGroup.add(jar);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.040, 0.025, 16), corkMat);
    lid.position.set(mx(longWallX - 0.18), upperBottomY + 0.36 + 0.125, oakRColZ + jz);
    kitchenGroup.add(lid);
  });
  const mug1 = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.030, 0.085, 16), ceramicWhiteMat);
  mug1.position.set(mx(longWallX - 0.18), upperBottomY + 0.36 + 0.045, oakRColZ + 0.12);
  kitchenGroup.add(mug1);

  // Under-Shelf LED Strip Light & Utensil Hanging Rail
  addBox(0.018, 0.008, oakUnitLen - 0.04, ledEmissiveMat, longWallX - oakUnitDepth / 2 + 0.06, upperBottomY - 0.004, oakUnitCenterZ);
  const ledLightOak = new THREE.PointLight(0xffdfa8, 1.1, 2.8, 1.3);
  ledLightOak.position.set(mx(longWallX - 0.22), upperBottomY - 0.06, oakUnitCenterZ);
  kitchenGroup.add(ledLightOak);

  const railY = upperBottomY - 0.15;
  const railX = longWallX - 0.04;
  const railW = oakUnitLen - 0.10;
  const railBar = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, railW, 16), stainlessMat);
  railBar.position.set(mx(railX), railY, oakUnitCenterZ);
  kitchenGroup.add(railBar);

  [-0.24, -0.08, 0.08, 0.24].forEach(hz => {
    const sHook = new THREE.Mesh(new THREE.TorusGeometry(0.012, 0.0025, 8, 16, Math.PI * 1.5), stainlessMat);
    sHook.position.set(mx(railX), railY - 0.018, oakUnitCenterZ + hz);
    kitchenGroup.add(sHook);

    const hMug = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.028, 0.075, 16), ceramicWhiteMat);
    hMug.position.set(mx(railX - 0.015), railY - 0.075, oakUnitCenterZ + hz);
    kitchenGroup.add(hMug);
  });


  // --- 2E. TALL REFRIGERATOR ENCLOSURE (800mm) & 1-DOOR FRIDGE (700mm) (Z in [1.25, 2.05]) ---
  // Requested: "dont leave space between frige and the cabinet , need to make sure that the cabinet itself has its own mesurement surely the frige + the cabinet can be moretahn 700mm"
  // Total Cabinet Housing Width = 800 mm (Z in [1.25, 2.05], completely flush against counter at Z = 1.25 with ZERO gap!)
  // Refrigerator Appliance Width = 700 mm (Z in [1.29, 1.99])
  const tallCabW = 0.80; // 800 mm tall cabinet housing
  const tallCabCenterZ = (1.25 + 2.05) / 2; // 1.65m
  const fridgeDepth = 0.68;
  const fridgeCenterX = longWallX - fridgeDepth / 2; // 2.16m
  const fridgeBodyH = 1.82;
  const topFridgeBoxH = tallCabinetH - fridgeBodyH; // 0.53m

  // Distinct measurement for the Tall Cabinet Housing Unit (800 mm)
  const cabinetDim = {
    label: "800 mm",
    p1: [longWallX - fridgeDepth - 0.02, 2.10, 1.25],
    p2: [longWallX - fridgeDepth - 0.02, 2.10, 2.05],
    axis: 'z'
  };

  // Distinct measurement for the Refrigerator Appliance (700 mm)
  const fridgeDim = {
    label: "700 mm",
    p1: [longWallX - fridgeDepth - 0.035, 1.20, 1.29],
    p2: [longWallX - fridgeDepth - 0.035, 1.20, 1.99],
    axis: 'z'
  };

  // Outer cabinet side gables:
  // Side gable at Z = 1.25m sits DIRECTLY FLUSH against the base cabinet and marble countertop (ZERO gap!)
  const gableThick = 0.02;
  addBox(fridgeDepth, tallCabinetH, gableThick, brushedFridgeMat, fridgeCenterX, tallCabinetH / 2, 1.25 + gableThick / 2, 0, cabinetDim);
  addBox(fridgeDepth, tallCabinetH, gableThick, matteBlackMat, fridgeCenterX, tallCabinetH / 2, 2.05 - gableThick / 2, 0, cabinetDim);
  // Brushed stainless edge trim on exposed front edge of side gable
  addBox(0.015, tallCabinetH, 0.024, stainlessMat, longWallX - fridgeDepth - 0.005, tallCabinetH / 2, 1.25 + gableThick / 2);

  // Upper top bridge cabinet box above refrigerator (Y: 1.82m to 2.35m, spans full 800mm cabinet width)
  const topCabInnerW = tallCabW - gableThick * 2; // ~0.76m
  addBox(fridgeDepth, topFridgeBoxH, topCabInnerW, matteBlackMat, fridgeCenterX, fridgeBodyH + topFridgeBoxH / 2, tallCabCenterZ, 0, cabinetDim);
  addBox(fridgeDepth - 0.02, 0.015, topCabInnerW, matteBlackMat, fridgeCenterX, fridgeBodyH, tallCabCenterZ);
  addBox(0.005, topFridgeBoxH - 0.04, 0.004, recessedGrooveMat, longWallX - fridgeDepth - 0.002, fridgeBodyH + topFridgeBoxH / 2, tallCabCenterZ);

  // 700mm Refrigerator Appliance (Z in [1.29, 1.99], Width = 0.70m)
  const fridgeW = 0.70; // 700 mm appliance width
  const fridgeCenterZ = (1.29 + 1.99) / 2; // 1.64m
  const fInnerW = fridgeW - 0.04; // 0.66m
  const fInnerD = fridgeDepth - 0.04; // 0.64m

  // Refrigerator cabinet body shell
  addBox(fInnerD, fridgeBodyH, fInnerW, brushedFridgeMat, fridgeCenterX + 0.01, fridgeBodyH / 2, fridgeCenterZ, 0, fridgeDim);

  // SINGLE CONTINUOUS 1-DOOR FRONT (700mm wide, perfectly 1 door!)
  const fDoorThick = 0.04;
  addBox(fDoorThick, fridgeBodyH - 0.02, fInnerW, brushedFridgeMat, longWallX - fridgeDepth + fDoorThick / 2, fridgeBodyH / 2, fridgeCenterZ, 0, fridgeDim);

  // Full-Length Vertical Brushed Stainless Steel Handle Bar (H = 1.30m on opening edge)
  const handleBarH = 1.30;
  const handleBar = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, handleBarH, 16), stainlessMat);
  handleBar.position.set(mx(longWallX - fridgeDepth - 0.035), fridgeBodyH / 2, 1.29 + 0.08);
  kitchenGroup.add(handleBar);
  // Handle standoff mounts (top and bottom)
  [-handleBarH / 2 + 0.04, handleBarH / 2 - 0.04].forEach(hy => {
    const standoff = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.010, 0.035, 12), stainlessMat);
    standoff.rotation.z = Math.PI / 2;
    standoff.position.set(mx(longWallX - fridgeDepth - 0.018), fridgeBodyH / 2 + hy, 1.29 + 0.08);
    kitchenGroup.add(standoff);
  });

  // Digital LED Temperature Touch Display Panel at eye level (Y = 1.45m)
  addBox(0.005, 0.08, 0.18, new THREE.MeshPhysicalMaterial({ color: 0x111316, roughness: 0.05 }), longWallX - fridgeDepth - 0.004, 1.45, fridgeCenterZ);
  addBox(0.002, 0.03, 0.10, new THREE.MeshBasicMaterial({ color: 0x00f0ff }), longWallX - fridgeDepth - 0.008, 1.45, fridgeCenterZ);

  // Wall-side Filler Scribe Trim between fridge and rear wall (Z in [1.99, 2.05])
  const fillerW = 2.05 - 1.99; // 0.06m
  addBox(fridgeDepth - 0.02, fridgeBodyH, fillerW, matteBlackMat, fridgeCenterX, fridgeBodyH / 2, 1.99 + fillerW / 2);


  // --- 2F. BACKSPLASH & UPPER CABINETS ON LONG WALL ---
  const lBacksplashLen = 1.25 - rearWallInnerZ; // 1.25 - (-1.09) = 2.34m
  const lBacksplashMidZ = (rearWallInnerZ + 1.25) / 2; // 0.08m
  const lBacksplashMat = create10cmBeigeCeramicMat(lBacksplashLen, backsplashH);
  // Mount 10cm x 10cm handcrafted beige ceramic tiles directly on visible wall surface
  addBox(0.020, backsplashH, lBacksplashLen, lBacksplashMat, sideWallInnerX - 0.010, backsplashMidY, lBacksplashMidZ);
  // Marble bottom curb strip (matching reference photo)
  addBox(0.024, 0.04, lBacksplashLen, marbleMat, sideWallInnerX - 0.012, counterTopY + 0.02, lBacksplashMidZ);

  // Flanking Upper Cabinets on Long Wall (Corner to Oak unit, and Oak unit flush to Tall Fridge Cabinet)
  // Left upper section (Z in [-0.55, 0.32], Length = 0.87m)
  const lUpper1Len = 0.87;
  const lUpper1MidZ = (-0.55 + 0.32) / 2; // -0.115m
  const upperMidX_long = longWallX - upperDepth / 2;
  addBox(upperDepth, upperHeight, lUpper1Len, matteBlackMat, upperMidX_long, upperMidY, lUpper1MidZ);
  addBox(0.02, 0.02, lUpper1Len, recessedGrooveMat, upperMidX_long - upperDepth / 2 + 0.01, upperBottomY + 0.01, lUpper1MidZ);
  addBox(0.018, 0.008, lUpper1Len - 0.04, ledEmissiveMat, upperMidX_long - upperDepth / 2 + 0.08, upperBottomY - 0.004, lUpper1MidZ);

  // Right upper transition section (Z in [1.18, 1.25], Length = 0.07m flush against tall cabinet gable)
  const lUpper2Len = 1.25 - 1.18; // 0.07m
  const lUpper2MidZ = (1.18 + 1.25) / 2;
  addBox(upperDepth, upperHeight, lUpper2Len, matteBlackMat, upperMidX_long, upperMidY, lUpper2MidZ);

  // Task downlights on Long Wall
  const ledLightLong1 = new THREE.PointLight(0xffdfa8, 1.1, 3.0, 1.3);
  ledLightLong1.position.set(mx(longWallX - 0.22), upperBottomY - 0.06, -0.10);
  kitchenGroup.add(ledLightLong1);


  // =========================================================================
  // 3. COLLIDERS (Accurate walk-mode collision bounding boxes)
  // =========================================================================
  if (colliders && Array.isArray(colliders)) {
    // Short Wall Counter collider (X in [0.30, 2.50], Z in [-1.15, -0.55])
    const shortBox = new THREE.Box3();
    const sMinX = Math.min(mx(0.30), mx(2.50));
    const sMaxX = Math.max(mx(0.30), mx(2.50));
    shortBox.min.set(sMinX, 0, facingWallZ);
    shortBox.max.set(sMaxX, 2.35, facingWallZ + counterDepth + 0.04);
    colliders.push(shortBox);

    // Long Wall Counter collider (Z in [-0.55, 1.25])
    const longBox = new THREE.Box3();
    const lMinX = Math.min(mx(longWallX - counterDepth), mx(longWallX));
    const lMaxX = Math.max(mx(longWallX - counterDepth), mx(longWallX));
    longBox.min.set(lMinX, 0, facingWallZ + counterDepth);
    longBox.max.set(lMaxX, 2.35, 1.25);
    colliders.push(longBox);

    // Tall Cabinet & Fridge collider (Z in [1.25, 2.05])
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
