import * as THREE from 'three';
import { createWarmOakTexture } from './textures.js';

export function buildGamingRoom(scene, colliders, houseData, interactablesList) {
  const isCarportLeft = houseData.carportOnLeft !== false;
  const roomGroup = new THREE.Group();
  roomGroup.name = "gamingRoomSuite";

  // Bedroom 1 coordinates:
  // With carport on left: bed1X is [0.30, 2.50], Z in [2.05, 5.25]
  // Door is at Z = 2.05 (from X = 0.45 to 1.30)
  // Window is at Z = 5.25 (front garden)
  function mx(x) {
    return isCarportLeft ? x : -x;
  }

  const oakTex = createWarmOakTexture();

  // Materials
  const walnutDeskMat = new THREE.MeshStandardMaterial({
    map: oakTex,
    color: 0x5a3d28,
    roughness: 0.4,
    metalness: 0.05
  });

  const graphiteSteelMat = new THREE.MeshStandardMaterial({
    color: 0x2b2d30,
    roughness: 0.45,
    metalness: 0.7
  });

  const matteBlackMat = new THREE.MeshStandardMaterial({
    color: 0x28292c,
    roughness: 0.5,
    metalness: 0.2
  });

  const screenBezelMat = new THREE.MeshStandardMaterial({
    color: 0x18191b,
    roughness: 0.2,
    metalness: 0.8
  });

  // Ultrawide gaming display panel with subtle wallpaper glow
  const screenDisplayMat = new THREE.MeshBasicMaterial({
    color: 0x22354a
  });

  const screenGlowMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8
  });

  const fabricCharcoalMat = new THREE.MeshStandardMaterial({
    color: 0x383a3f,
    roughness: 0.88,
    metalness: 0.02
  });

  const fabricCushionMat = new THREE.MeshStandardMaterial({
    color: 0xd2cbbd,
    roughness: 0.85,
    metalness: 0.02
  });

  const woodSlatMat = new THREE.MeshStandardMaterial({
    map: oakTex,
    color: 0xb58c5a,
    roughness: 0.5,
    metalness: 0.02
  });

  const acousticFeltMat = new THREE.MeshStandardMaterial({
    color: 0x1e2023,
    roughness: 0.95
  });

  function addBox(w, h, d, mat, x, y, z, rotY = 0, dimInfo = null) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(mx(x), y, z);
    mesh.rotation.y = isCarportLeft ? rotY : -rotY;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    if (dimInfo && interactablesList) {
      mesh.userData.dimInfo = {
        ...dimInfo,
        p1: [mx(dimInfo.p1[0]), dimInfo.p1[1], dimInfo.p1[2]],
        p2: [mx(dimInfo.p2[0]), dimInfo.p2[1], dimInfo.p2[2]]
      };
      interactablesList.push(mesh);
    }

    roomGroup.add(mesh);
    return mesh;
  }

  function registerItem(mesh, dimInfo) {
    if (mesh && dimInfo && interactablesList) {
      mesh.userData.dimInfo = {
        ...dimInfo,
        p1: [mx(dimInfo.p1[0]), dimInfo.p1[1], dimInfo.p1[2]],
        p2: [mx(dimInfo.p2[0]), dimInfo.p2[1], dimInfo.p2[2]]
      };
      interactablesList.push(mesh);
    }
    return mesh;
  }

  // =========================================================================
  // 1. ACOUSTIC WOOD SLAT WALL ACCENT (Along East Wall X = 2.50, Z: 3.10 to 4.70)
  // =========================================================================
  const eastWallX = 2.50;
  const slatCenterZ = 3.90;
  const slatWidthZ = 1.55;
  const slatHeightY = 2.40;

  const slatDim = {
    label: "|-- 1550 mm --|",
    p1: [eastWallX - 0.04, 1.40, slatCenterZ - slatWidthZ / 2],
    p2: [eastWallX - 0.04, 1.40, slatCenterZ + slatWidthZ / 2],
    axis: 'z'
  };

  // Dark acoustic felt backing
  addBox(0.015, slatHeightY, slatWidthZ, acousticFeltMat, eastWallX - 0.008, slatHeightY / 2, slatCenterZ, 0, slatDim);

  // Vertical warm oak acoustic slats
  const numSlats = 26;
  const slatSpacing = slatWidthZ / numSlats;
  for (let si = 0; si < numSlats; si++) {
    const sz = (slatCenterZ - slatWidthZ / 2) + si * slatSpacing + 0.02;
    addBox(0.018, slatHeightY - 0.04, 0.025, woodSlatMat, eastWallX - 0.022, slatHeightY / 2, sz);
  }

  // Soft ambient LED strip behind the slat wall
  const slatGlow = new THREE.PointLight(0xffbe76, 0.6, 2.8, 1.8);
  slatGlow.position.set(mx(eastWallX - 0.15), 1.6, slatCenterZ);
  roomGroup.add(slatGlow);


  // =========================================================================
  // 2. MODULAR EXECUTIVE GAMING & WFH DESK (1500mm x 700mm, H: 750mm)
  // =========================================================================
  const deskDepthX = 0.70;
  const deskLenZ = 1.50;
  const deskMidX = eastWallX - deskDepthX / 2 - 0.02; // 2.13
  const deskMidZ = slatCenterZ; // 3.90
  const deskHeight = 0.75;
  const deskTopThick = 0.038;

  const deskDim = {
    label: "|-- 1500 mm --|",
    p1: [eastWallX - deskDepthX - 0.04, deskHeight + 0.01, deskMidZ - deskLenZ / 2],
    p2: [eastWallX - deskDepthX - 0.04, deskHeight + 0.01, deskMidZ + deskLenZ / 2],
    axis: 'z'
  };

  // Solid Walnut / Oak Desktop slab
  addBox(deskDepthX, deskTopThick, deskLenZ, walnutDeskMat, deskMidX, deskHeight - deskTopThick / 2, deskMidZ, 0, deskDim);

  // Modern Steel Legs (C-frame / Loop legs in graphite steel)
  const legThick = 0.05;
  const legZ1 = deskMidZ - deskLenZ / 2 + 0.08;
  const legZ2 = deskMidZ + deskLenZ / 2 - 0.08;
  [legZ1, legZ2].forEach(lz => {
    // Top bracket
    addBox(deskDepthX - 0.08, 0.03, legThick, graphiteSteelMat, deskMidX, deskHeight - deskTopThick - 0.015, lz);
    // Vertical legs
    addBox(legThick, deskHeight - deskTopThick, legThick, graphiteSteelMat, deskMidX - deskDepthX / 2 + 0.08, (deskHeight - deskTopThick) / 2, lz);
    addBox(legThick, deskHeight - deskTopThick, legThick, graphiteSteelMat, deskMidX + deskDepthX / 2 - 0.08, (deskHeight - deskTopThick) / 2, lz);
    // Bottom floor foot
    addBox(deskDepthX - 0.08, 0.025, legThick, graphiteSteelMat, deskMidX, 0.0125, lz);
  });

  // Cable management tray under desk
  addBox(0.18, 0.08, 0.90, graphiteSteelMat, deskMidX + 0.15, deskHeight - 0.12, deskMidZ);


  // =========================================================================
  // 3. 34" ULTRAWIDE CURVED GAMING DISPLAY & PERIPHERALS
  // =========================================================================
  const monitorW = 0.82; // 820 mm wide (34-inch ultrawide)
  const monitorH = 0.36;
  const monitorD = 0.05;
  const monitorMidX = deskMidX + 0.10;
  const monitorY = deskHeight + 0.28;

  const monitorDim = {
    label: "|-- 820 mm (34\" Ultrawide) --|",
    p1: [monitorMidX - 0.05, monitorY, deskMidZ - monitorW / 2],
    p2: [monitorMidX - 0.05, monitorY, deskMidZ + monitorW / 2],
    axis: 'z'
  };

  // Monitor frame
  addBox(monitorD, monitorH, monitorW, screenBezelMat, monitorMidX, monitorY, deskMidZ, 0, monitorDim);
  // Screen surface
  addBox(0.005, monitorH - 0.02, monitorW - 0.02, screenDisplayMat, monitorMidX - monitorD / 2 - 0.002, monitorY, deskMidZ, 0, monitorDim);
  // Bias backlighting strip
  addBox(0.005, monitorH - 0.08, monitorW - 0.10, screenGlowMat, monitorMidX + monitorD / 2 + 0.002, monitorY, deskMidZ);

  // Monitor arm & desk clamp
  addBox(0.08, 0.04, 0.12, graphiteSteelMat, eastWallX - 0.06, deskHeight + 0.02, deskMidZ);
  addBox(0.035, 0.26, 0.035, graphiteSteelMat, eastWallX - 0.06, deskHeight + 0.15, deskMidZ);
  addBox(0.18, 0.035, 0.035, graphiteSteelMat, monitorMidX + 0.12, monitorY, deskMidZ);

  // Large desk mat (900mm x 400mm)
  addBox(0.40, 0.004, 0.90, new THREE.MeshStandardMaterial({ color: 0x1f2227, roughness: 0.9 }), deskMidX - 0.08, deskHeight + 0.002, deskMidZ);

  // Mechanical Keyboard with RGB underglow
  addBox(0.14, 0.016, 0.36, matteBlackMat, deskMidX - 0.08, deskHeight + 0.012, deskMidZ);
  // Keycaps
  addBox(0.12, 0.008, 0.34, new THREE.MeshStandardMaterial({ color: 0x3d4148, roughness: 0.4 }), deskMidX - 0.08, deskHeight + 0.024, deskMidZ);

  // Wireless Gaming Mouse & Charging Dock
  addBox(0.11, 0.024, 0.065, matteBlackMat, deskMidX - 0.08, deskHeight + 0.016, deskMidZ + 0.30);

  // Desktop Studio Monitor Speakers (Left & Right)
  [-0.52, 0.52].forEach(sz => {
    // Speaker box
    addBox(0.14, 0.22, 0.13, matteBlackMat, deskMidX + 0.08, deskHeight + 0.11, deskMidZ + sz);
    // Speaker cone
    const coneMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.01, 16),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3, metalness: 0.5 })
    );
    coneMesh.rotation.z = (isCarportLeft ? -1 : 1) * Math.PI / 2;
    coneMesh.position.set(mx(deskMidX + 0.08 - 0.075), deskHeight + 0.10, deskMidZ + sz);
    roomGroup.add(coneMesh);
  });

  // Desktop Gaming PC Tower (Tempered glass side panel)
  const pcW = 0.22;
  const pcH = 0.45;
  const pcD = 0.46;
  const pcX = eastWallX - 0.22;
  const pcZ = deskMidZ - 0.56;
  addBox(pcW, pcH, pcD, graphiteSteelMat, pcX, deskHeight + pcH / 2, pcZ);
  // Glass side panel
  addBox(0.006, pcH - 0.04, pcD - 0.04, new THREE.MeshPhysicalMaterial({ color: 0x111111, roughness: 0.1, transmission: 0.7, transparent: true, opacity: 0.8 }), pcX - pcW / 2 - 0.002, deskHeight + pcH / 2, pcZ);
  // Interior subtle RGB glow
  const pcLight = new THREE.PointLight(0x38bdf8, 0.5, 1.2, 2.0);
  pcLight.position.set(mx(pcX), deskHeight + pcH / 2, pcZ);
  roomGroup.add(pcLight);

  // High-End Ergonomic Executive Gaming Chair
  const chairX = deskMidX - 0.48;
  const chairZ = deskMidZ;
  // 5-Star Caster Base
  const baseMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.30, 0.04, 8), graphiteSteelMat);
  baseMesh.position.set(mx(chairX), 0.08, chairZ);
  roomGroup.add(baseMesh);
  // Gas lift cylinder
  const liftMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.36, 16), graphiteSteelMat);
  liftMesh.position.set(mx(chairX), 0.26, chairZ);
  roomGroup.add(liftMesh);
  // Seat cushion (Charcoal mesh fabric)
  addBox(0.48, 0.08, 0.48, fabricCharcoalMat, chairX, 0.48, chairZ);
  // Ergonomic curved backrest
  addBox(0.06, 0.56, 0.44, fabricCharcoalMat, chairX - 0.22, 0.78, chairZ);
  // Adjustable armrests
  [-0.25, 0.25].forEach(az => {
    addBox(0.04, 0.22, 0.04, graphiteSteelMat, chairX - 0.05, 0.58, chairZ + az);
    addBox(0.24, 0.03, 0.07, matteBlackMat, chairX - 0.05, 0.70, chairZ + az);
  });
  // Headrest
  addBox(0.05, 0.14, 0.24, fabricCharcoalMat, chairX - 0.22, 1.12, chairZ);


  // =========================================================================
  // 4. REPURPOSABLE CONVERTIBLE DAYBED / SOFA (1800mm x 800mm)
  // Along West Wall (X = 0.30, Z: 3.20 to 5.00)
  // Repurposes seamlessly between gaming lounge sofa and guest bed!
  // =========================================================================
  const westWallX = 0.30;
  const daybedDepthX = 0.80;
  const daybedLenZ = 1.80;
  const daybedMidX = westWallX + daybedDepthX / 2 + 0.04; // 0.74
  const daybedMidZ = 4.10;
  const daybedBaseH = 0.42;

  const daybedDim = {
    label: "|-- 1800 mm (Convertible Daybed / Sofa) --|",
    p1: [westWallX + daybedDepthX + 0.06, daybedBaseH + 0.04, daybedMidZ - daybedLenZ / 2],
    p2: [westWallX + daybedDepthX + 0.06, daybedBaseH + 0.04, daybedMidZ + daybedLenZ / 2],
    axis: 'z'
  };

  // Wood platform frame in warm oak
  addBox(daybedDepthX, 0.18, daybedLenZ, walnutDeskMat, daybedMidX, 0.09, daybedMidZ, 0, daybedDim);
  // Round tapered wooden legs
  [[-daybedDepthX / 2 + 0.08, -daybedLenZ / 2 + 0.10],
   [daybedDepthX / 2 - 0.08, -daybedLenZ / 2 + 0.10],
   [-daybedDepthX / 2 + 0.08, daybedLenZ / 2 - 0.10],
   [daybedDepthX / 2 - 0.08, daybedLenZ / 2 - 0.10]].forEach(([dx, dz]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.018, 0.12, 12), walnutDeskMat);
    leg.position.set(mx(daybedMidX + dx), 0.06, daybedMidZ + dz);
    roomGroup.add(leg);
  });

  // Thick mattress cushion (Lounge sofa / Guest bed mattress)
  addBox(daybedDepthX - 0.04, 0.22, daybedLenZ - 0.04, fabricCushionMat, daybedMidX, 0.29, daybedMidZ, 0, daybedDim);

  // Backrest bolsters along the wall
  addBox(0.18, 0.32, daybedLenZ - 0.06, fabricCharcoalMat, westWallX + 0.12, 0.46, daybedMidZ, 0, daybedDim);

  // Soft decorative throw pillows
  [-0.45, 0.0, 0.45].forEach(pz => {
    const pillow = addBox(0.14, 0.28, 0.32, new THREE.MeshStandardMaterial({ color: 0x8a929a, roughness: 0.85 }), westWallX + 0.22, 0.48, daybedMidZ + pz);
    pillow.rotation.z = (isCarportLeft ? 1 : -1) * 0.15;
  });

  // Warm textured throw blanket folded on corner
  addBox(daybedDepthX - 0.25, 0.04, 0.42, new THREE.MeshStandardMaterial({ color: 0xb58c5a, roughness: 0.9 }), daybedMidX + 0.08, 0.42, daybedMidZ - daybedLenZ / 2 + 0.26);


  // =========================================================================
  // 5. MODULAR FLOATING SHELVES (Above Daybed: X = 0.30, Y = 1.65m & 2.05m)
  // For headphones display, books, collectibles, indoor trailing plant
  // =========================================================================
  const shelfX = westWallX + 0.14;
  const shelfLenZ = 1.40;
  const shelfDepthX = 0.24;

  const shelfDim = {
    label: "|-- 1400 mm --|",
    p1: [shelfX + shelfDepthX / 2, 1.68, daybedMidZ - shelfLenZ / 2],
    p2: [shelfX + shelfDepthX / 2, 1.68, daybedMidZ + shelfLenZ / 2],
    axis: 'z'
  };

  // Lower Shelf at Y = 1.65m
  addBox(shelfDepthX, 0.025, shelfLenZ, walnutDeskMat, shelfX, 1.65, daybedMidZ, 0, shelfDim);
  // Upper Shelf at Y = 2.05m
  addBox(shelfDepthX, 0.025, shelfLenZ, walnutDeskMat, shelfX, 2.05, daybedMidZ, 0, shelfDim);

  // Headphone stand on lower shelf
  const hpBase = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.015, 16), walnutDeskMat);
  hpBase.position.set(mx(shelfX), 1.67, daybedMidZ - 0.40);
  roomGroup.add(hpBase);
  const hpStem = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.22, 12), graphiteSteelMat);
  hpStem.position.set(mx(shelfX), 1.78, daybedMidZ - 0.40);
  roomGroup.add(hpStem);
  // Gaming Headphones on stand
  const hpBand = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.014, 8, 16, Math.PI), matteBlackMat);
  hpBand.position.set(mx(shelfX), 1.88, daybedMidZ - 0.40);
  hpBand.rotation.y = Math.PI / 2;
  roomGroup.add(hpBand);

  // Books row on lower shelf
  for (let bi = 0; bi < 5; bi++) {
    const bColor = [0x3b82f6, 0xef4444, 0x10b981, 0xf59e0b, 0x8b5cf6][bi];
    addBox(0.16, 0.18, 0.035, new THREE.MeshStandardMaterial({ color: bColor, roughness: 0.6 }), shelfX, 1.75, daybedMidZ - 0.10 + bi * 0.04);
  }

  // Trailing pothos plant on upper shelf
  const potMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.09, 16), new THREE.MeshStandardMaterial({ color: 0xdedede, roughness: 0.4 }));
  potMesh.position.set(mx(shelfX), 2.11, daybedMidZ + 0.45);
  roomGroup.add(potMesh);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.65 });
  for (let li = 0; li < 6; li++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), leafMat);
    leaf.scale.set(1.2, 0.3, 0.8);
    leaf.position.set(mx(shelfX + 0.06), 2.10 - li * 0.04, daybedMidZ + 0.45 + (li % 2 === 0 ? 0.03 : -0.03));
    roomGroup.add(leaf);
  }


  // =========================================================================
  // 6. LOW WINDOW STORAGE CREDENZA / CONSOLE MEDIA UNIT (1200mm x 380mm)
  // Under Front Garden Window (Z = 5.25)
  // For console, controllers, board games, work documents
  // =========================================================================
  const credenzaW = 1.20;
  const credenzaD = 0.38;
  const credenzaH = 0.58;
  const credenzaMidX = 1.40; // centered in room
  const credenzaMidZ = 5.25 - credenzaD / 2 - 0.05; // 5.01

  const credenzaDim = {
    label: "|-- 1200 mm --|",
    p1: [credenzaMidX - credenzaW / 2, credenzaH + 0.02, credenzaMidZ - credenzaD / 2],
    p2: [credenzaMidX + credenzaW / 2, credenzaH + 0.02, credenzaMidZ - credenzaD / 2],
    axis: 'x'
  };

  // Credenza carcass in warm oak with matte black sliding doors
  addBox(credenzaW, credenzaH, credenzaD, walnutDeskMat, credenzaMidX, credenzaH / 2, credenzaMidZ, 0, credenzaDim);
  // Matte black door panels
  addBox(credenzaW * 0.48, credenzaH - 0.08, 0.015, matteBlackMat, credenzaMidX - credenzaW * 0.24, credenzaH / 2, credenzaMidZ - credenzaD / 2 - 0.005);
  addBox(credenzaW * 0.48, credenzaH - 0.08, 0.015, matteBlackMat, credenzaMidX + credenzaW * 0.24, credenzaH / 2, credenzaMidZ - credenzaD / 2 - 0.005);
  // Slim legs
  [[-credenzaW / 2 + 0.08, -credenzaD / 2 + 0.06],
   [credenzaW / 2 - 0.08, -credenzaD / 2 + 0.06],
   [-credenzaW / 2 + 0.08, credenzaD / 2 - 0.06],
   [credenzaW / 2 - 0.08, credenzaD / 2 - 0.06]].forEach(([dx, dz]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.014, 0.12, 12), graphiteSteelMat);
    leg.position.set(mx(credenzaMidX + dx), 0.06, credenzaMidZ + dz);
    roomGroup.add(leg);
  });

  // Game console on credenza (PS5 / Xbox style console in matte white/black)
  addBox(0.28, 0.06, 0.18, new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3 }), credenzaMidX - 0.25, credenzaH + 0.03, credenzaMidZ);
  // Dual game controllers
  [-0.04, 0.08].forEach(cz => {
    addBox(0.12, 0.04, 0.08, matteBlackMat, credenzaMidX + 0.15, credenzaH + 0.02, credenzaMidZ + cz);
  });


  // =========================================================================
  // 7. COLLIDERS (Prevent player clipping through furniture in Walk Mode)
  // =========================================================================
  if (colliders && Array.isArray(colliders)) {
    // Desk collider
    const deskBox = new THREE.Box3();
    const dMinX = Math.min(mx(eastWallX - deskDepthX), mx(eastWallX));
    const dMaxX = Math.max(mx(eastWallX - deskDepthX), mx(eastWallX));
    deskBox.min.set(dMinX, 0, deskMidZ - deskLenZ / 2);
    deskBox.max.set(dMaxX, 1.2, deskMidZ + deskLenZ / 2);
    colliders.push(deskBox);

    // Daybed collider
    const bedBox = new THREE.Box3();
    const bMinX = Math.min(mx(westWallX), mx(westWallX + daybedDepthX));
    const bMaxX = Math.max(mx(westWallX), mx(westWallX + daybedDepthX));
    bedBox.min.set(bMinX, 0, daybedMidZ - daybedLenZ / 2);
    bedBox.max.set(bMaxX, 0.9, daybedMidZ + daybedLenZ / 2);
    colliders.push(bedBox);

    // Credenza collider
    const credBox = new THREE.Box3();
    const cMinX = Math.min(mx(credenzaMidX - credenzaW / 2), mx(credenzaMidX + credenzaW / 2));
    const cMaxX = Math.max(mx(credenzaMidX - credenzaW / 2), mx(credenzaMidX + credenzaW / 2));
    credBox.min.set(cMinX, 0, credenzaMidZ - credenzaD / 2);
    credBox.max.set(cMaxX, 0.8, 5.25);
    colliders.push(credBox);
  }

  scene.add(roomGroup);
  return roomGroup;
}
