import * as THREE from 'three';
import {
  createWoodFloorTexture,
  createMarbleTileTexture,
  createPatioWoodTexture,
  createGardenCorridorTexture,
  createLawnTexture,
  createRugTexture,
  createCarportTexture,
  createArchitecturalGlassTexture,
  createGlassNormalMap,
  createGlassRoughnessMap,
  createStuccoTexture
} from './textures.js';
import { buildFurniture } from './furnitureBuilder.js';
import { buildKitchenSuite } from './kitchenBuilder.js';
import { buildGamingRoom } from './gamingRoomBuilder.js';


export function buildHouse(scene, houseData) {
  const houseGroup = new THREE.Group();
  houseGroup.name = "houseGroup";

  const colliders = []; // Array of THREE.Box3 objects for player collision
  const ceilingGroup = new THREE.Group();
  ceilingGroup.name = "ceilingGroup";
  const dimensionGroup = new THREE.Group();
  dimensionGroup.name = "dimensionGroup";
  const interactables = [];

  // Textures
  const woodFloorTex = createWoodFloorTexture();
  const marbleTileTex = createMarbleTileTexture();
  const patioWoodTex = createPatioWoodTexture();
  const gardenCorridorTex = createGardenCorridorTexture();
  const lawnTex = createLawnTexture();
  const rugTex = createRugTexture();
  const carportTex = createCarportTexture();
  const stuccoTex = createStuccoTexture();

  // Materials
  const lawnMat = new THREE.MeshStandardMaterial({ map: lawnTex, roughness: 0.95 });
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x8c8982, roughness: 0.8 });
  const carportMat = new THREE.MeshStandardMaterial({ map: carportTex, roughness: 0.7 });
  const woodFloorMat = new THREE.MeshStandardMaterial({ map: woodFloorTex, roughness: 0.45, metalness: 0.05 });
  const marbleTileMat = new THREE.MeshStandardMaterial({ map: marbleTileTex, roughness: 0.25, metalness: 0.1 });
  const patioWoodMat = new THREE.MeshStandardMaterial({ map: patioWoodTex, roughness: 0.65 });
  const gardenCorridorMat = new THREE.MeshStandardMaterial({ map: gardenCorridorTex, roughness: 0.65 });
  const ceilingMat = new THREE.MeshStandardMaterial({ color: 0xfcfcfc, roughness: 0.85 });

  const baseboardMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 });

  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xf5f3ee,
    roughness: 0.85,
    side: THREE.DoubleSide
  });

  // Authentic Gray Cement Stucco Plaster for Boundary Walls (media_1790525894123.png)
  const boundaryWallMat = new THREE.MeshStandardMaterial({
    map: stuccoTex,
    color: 0x7c8188,
    roughness: 0.92,
    side: THREE.DoubleSide
  });

  const windowFrameMat = new THREE.MeshStandardMaterial({
    color: 0x1f2328,
    metalness: 0.8,
    roughness: 0.2
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.25,
    roughness: 0.05,
    transmission: 0.9,
    ior: 1.52,
    reflectivity: 0.9
  });

  // 1. SURROUNDING TERRAIN & STREET
  const groundGeo = new THREE.PlaneGeometry(60, 60);
  const groundMesh = new THREE.Mesh(groundGeo, lawnMat);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.position.y = -0.06;
  groundMesh.receiveShadow = true;
  houseGroup.add(groundMesh);

  // Front Road / Street Asphalt (Z > 7.0)
  const roadGeo = new THREE.PlaneGeometry(40, 14);
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x2d3238, roughness: 0.9 });
  const roadMesh = new THREE.Mesh(roadGeo, roadMat);
  roadMesh.rotation.x = -Math.PI / 2;
  roadMesh.position.set(0, -0.04, 14.0);
  roadMesh.receiveShadow = true;
  houseGroup.add(roadMesh);

  // Foundation Slab under the 5m x 14.5m house lot
  const slabGeo = new THREE.BoxGeometry(5.2, 0.2, 14.7);
  const slabMesh = new THREE.Mesh(slabGeo, concreteMat);
  slabMesh.position.set(0.0, -0.1, 0.0);
  slabMesh.receiveShadow = true;
  houseGroup.add(slabMesh);

  // 2. ROOM FLOORS
  const floorGeos = {
    wood_floor: woodFloorMat,
    marble_tile: marbleTileMat,
    patio_wood: patioWoodMat,
    garden_corridor: gardenCorridorMat,
    concrete_carport: carportMat,
    lawn: lawnMat
  };

  houseData.rooms.forEach(room => {
    const b = room.bounds;
    const width = b.maxX - b.minX;
    const depth = b.maxZ - b.minZ;
    const cx = (b.minX + b.maxX) / 2;
    const cz = (b.minZ + b.maxZ) / 2;

    const mat = floorGeos[room.floorType] || woodFloorMat;
    const floorY = room.stepDown ? -0.05 : 0.005;

    const boundsList = (room.subBounds && room.subBounds.length > 0)
      ? room.subBounds
      : [room.bounds];

    boundsList.forEach(sb => {
      const sw = sb.maxX - sb.minX;
      const sd = sb.maxZ - sb.minZ;
      const scx = (sb.minX + sb.maxX) / 2;
      const scz = (sb.minZ + sb.maxZ) / 2;

      const floorGeo = new THREE.PlaneGeometry(sw, sd);
      const floorMesh = new THREE.Mesh(floorGeo, mat);
      floorMesh.rotation.x = -Math.PI / 2;
      floorMesh.position.set(scx, floorY, scz);
      floorMesh.receiveShadow = true;
      houseGroup.add(floorMesh);

      // Ceiling (if room has one)
      if (room.hasCeiling) {
        const ceilHeight = room.ceilingHeight || houseData.ceilingHeight || 3.0;
        const ceilGeo = new THREE.PlaneGeometry(sw, sd);
        const ceilMesh = new THREE.Mesh(ceilGeo, ceilingMat);
        ceilMesh.rotation.x = Math.PI / 2;
        ceilMesh.position.set(scx, ceilHeight, scz);
        ceilingGroup.add(ceilMesh);

        // Recessed spotlight pucks on ceiling
        const numSpotsX = Math.max(1, Math.round(sw / 3.0));
        const numSpotsZ = Math.max(1, Math.round(sd / 3.0));
        for (let sx = 0; sx < numSpotsX; sx++) {
          for (let sz = 0; sz < numSpotsZ; sz++) {
            const px = sb.minX + (sx + 0.5) * (sw / numSpotsX);
            const pz = sb.minZ + (sz + 0.5) * (sd / numSpotsZ);
            const puck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16), baseboardMat);
            puck.position.set(px, ceilHeight - 0.01, pz);
            ceilingGroup.add(puck);

            const bulb = new THREE.Mesh(new THREE.CircleGeometry(0.06, 16), new THREE.MeshBasicMaterial({ color: 0xfffaea }));
            bulb.rotation.x = Math.PI / 2;
            bulb.position.set(px, ceilHeight - 0.02, pz);
            ceilingGroup.add(bulb);
          }
        }
      }
    });

    // ---------------------------------------------------------------------------------
    // ARCHITECTURAL CANOPY & CORRIDOR ROOF (Rebuilt to match media_1790525894123.png)
    // - Black round tubular steel header beam along outer roof edge
    // - Inner wall ledger channel mounted flush along house wall
    // - 8 transverse black steel rafters casting realistic geometric shadows onto floor
    // - Continuous translucent architectural safety glass / polycarbonate panels
    // - Corner white PVC vertical rainwater downpipe with 90° elbow & horizontal ground run
    // - 100% unobstructed floor corridor with ZERO ground posts/columns
    // ---------------------------------------------------------------------------------
    if (room.id === 'covered_area') {
      const canopyGroup = new THREE.Group();
      canopyGroup.name = "canopyGroup";

      const gWidth = width; // 1.20m
      const gMidX = cx;
      const isCarportLeft = houseData.carportOnLeft;
      const roofEdgeX = isCarportLeft ? b.minX : b.maxX; // Outer edge facing garden (-1.5m if carport left)
      const wallEdgeX = isCarportLeft ? b.maxX : b.minX; // Inner edge facing house wall (-0.3m if carport left)

      const zNorthWall = -0.75;
      const zSouthWall = -7.25;
      const totalRoofDepth = Math.abs(zSouthWall - zNorthWall); // 6.50m
      const canopyY = 3.00; // Exact identical uniform level height across all long bars and cross bars
      const midZ = (zNorthWall + zSouthWall) / 2; // -4.00m

      // Black Satin Powder-Coated Structural Steel Material (matching photo's tubular beam and rafters)
      const blackSteelMat = new THREE.MeshStandardMaterial({
        color: 0x141618,
        roughness: 0.35,
        metalness: 0.78
      });

      // Clear / Translucent Polycarbonate / Tempered Architectural Glass Material
      const roofGlassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.88,
        opacity: 0.65,
        transparent: true,
        roughness: 0.06,
        metalness: 0.04,
        ior: 1.50,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        attenuationColor: new THREE.Color(0xa5e5db),
        attenuationDistance: 0.90,
        depthWrite: false,
        side: THREE.DoubleSide
      });

      // White / Off-White Satin PVC Downpipe Material (matching photo's corner PVC pipe)
      const pvcPipeMat = new THREE.MeshStandardMaterial({
        color: 0xedece6,
        roughness: 0.36,
        metalness: 0.05
      });

      // ----------------------------------------------------
      // 1. OUTER BLACK ROUND TUBULAR STEEL HEADER BEAM
      // ----------------------------------------------------
      // Prominent round tubular steel beam running along the outer edge of the roof (level from end to end)
      const tubeRadius = 0.046; // ~92mm outer diameter round pipe
      const headerTubeGeo = new THREE.CylinderGeometry(tubeRadius, tubeRadius, totalRoofDepth, 32);
      const headerTube = new THREE.Mesh(headerTubeGeo, blackSteelMat);
      // Perfectly horizontal along Z axis at exact uniform canopyY
      headerTube.rotation.x = Math.PI / 2;
      headerTube.position.set(roofEdgeX, canopyY, midZ);
      headerTube.castShadow = true;
      headerTube.receiveShadow = true;
      canopyGroup.add(headerTube);

      // Flanged wall anchor plates embedding tubular beam into North & South masonry walls at identical canopyY
      const wallPlateGeo = new THREE.BoxGeometry(0.12, 0.12, 0.02);
      const northPlate = new THREE.Mesh(wallPlateGeo, blackSteelMat);
      northPlate.position.set(roofEdgeX, canopyY, zNorthWall + 0.01);
      canopyGroup.add(northPlate);

      const southPlate = new THREE.Mesh(wallPlateGeo, blackSteelMat);
      southPlate.position.set(roofEdgeX, canopyY, zSouthWall - 0.01);
      canopyGroup.add(southPlate);

      // ----------------------------------------------------
      // 2. INNER WALL-MOUNTED STEEL LEDGER CHANNEL
      // ----------------------------------------------------
      // Structural ledger anchored flush along the house wall at identical canopyY
      const ledgerGeo = new THREE.BoxGeometry(0.04, 0.07, totalRoofDepth);
      const ledgerMesh = new THREE.Mesh(ledgerGeo, blackSteelMat);
      ledgerMesh.rotation.x = 0;
      ledgerMesh.position.set(wallEdgeX, canopyY, midZ);
      ledgerMesh.castShadow = true;
      canopyGroup.add(ledgerMesh);

      // Wall Anchor Brackets on Inner Ledger at identical canopyY
      [-0.85, -2.40, -4.00, -5.60, -7.15].forEach(wz => {
        const wBracket = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.10, 0.06), blackSteelMat);
        wBracket.position.set(wallEdgeX + (isCarportLeft ? 0.025 : -0.025), canopyY, wz);
        canopyGroup.add(wBracket);
      });

      // ----------------------------------------------------
      // 3. TRANSVERSE BLACK STEEL RAFTERS / PURLINS (8 Rafters)
      // ----------------------------------------------------
      // Spanning cleanly from house wall ledger to outer round tubular beam
      // All 8 cross bars share the EXACT same uniform height (canopyY = 3.00m)
      const numRafters = 8;
      const rafterSpan = gWidth;
      const rafterGeo = new THREE.BoxGeometry(rafterSpan, 0.042, 0.042);

      for (let ri = 0; ri < numRafters; ri++) {
        const t = ri / (numRafters - 1);
        const rz = zNorthWall - t * totalRoofDepth;

        const rafter = new THREE.Mesh(rafterGeo, blackSteelMat);
        rafter.rotation.x = 0;
        rafter.position.set(gMidX, canopyY, rz);
        rafter.castShadow = true;
        rafter.receiveShadow = true;
        canopyGroup.add(rafter);

        // Welded joint collar where rafter joins the outer round pipe at identical canopyY
        const saddleJointGeo = new THREE.CylinderGeometry(tubeRadius + 0.005, tubeRadius + 0.005, 0.05, 20);
        const saddleJoint = new THREE.Mesh(saddleJointGeo, blackSteelMat);
        saddleJoint.rotation.x = Math.PI / 2;
        saddleJoint.position.set(roofEdgeX, canopyY, rz);
        canopyGroup.add(saddleJoint);
      }

      // ----------------------------------------------------
      // 4. ARCHITECTURAL TRANSLUCENT ROOF PANELS
      // ----------------------------------------------------
      // Clean modular sheets covering the overhead canopy at uniform level height
      const numBays = numRafters - 1; // 7 bays
      const bayLength = totalRoofDepth / numBays;
      const glassThick = 0.010;
      const panelW = gWidth + 0.06; // slight overhang past tubular beam
      const panelY = canopyY + 0.021 + glassThick / 2;
      const cappingY = canopyY + 0.025 + glassThick;

      for (let bi = 0; bi < numBays; bi++) {
        const tMid = (bi + 0.5) / numBays;
        const panelZ = zNorthWall - tMid * totalRoofDepth;

        const panelGeo = new THREE.BoxGeometry(panelW, glassThick, bayLength - 0.012);
        const panelMesh = new THREE.Mesh(panelGeo, roofGlassMat);
        panelMesh.rotation.x = 0;
        const panelX = gMidX + (isCarportLeft ? -0.03 : 0.03);
        panelMesh.position.set(panelX, panelY, panelZ);
        panelMesh.castShadow = false; // lets sunlight stream through onto the floor!
        panelMesh.receiveShadow = true;

        panelMesh.userData.dimInfo = {
          label: "|-- 1200 mm Architectural Canopy Glass --|",
          p1: [isCarportLeft ? -1.50 : 0.30, panelY, panelZ],
          p2: [isCarportLeft ? -0.30 : 1.50, panelY, panelZ],
          axis: 'x'
        };
        interactables.push(panelMesh);
        canopyGroup.add(panelMesh);

        // Slim black weatherstripping capping profile along each rafter seam at level height
        const cappingGeo = new THREE.BoxGeometry(panelW + 0.02, 0.008, 0.028);
        const cappingMesh = new THREE.Mesh(cappingGeo, blackSteelMat);
        cappingMesh.rotation.x = 0;
        const rafterT = bi / numBays;
        cappingMesh.position.set(panelX, cappingY, zNorthWall - rafterT * totalRoofDepth);
        canopyGroup.add(cappingMesh);
      }

      // ----------------------------------------------------
      // 5. RAINWATER GUTTER & DOWNPIPE (After the Canopy at Outer Roof Edge)
      // ----------------------------------------------------
      // Collector gutter running along the south end and outer roof edge,
      // dropping down from after the canopy at the garden edge (X = -1.5m)
      const gutterGeo = new THREE.BoxGeometry(gWidth + 0.06, 0.07, 0.08);
      const gutterMesh = new THREE.Mesh(gutterGeo, blackSteelMat);
      gutterMesh.position.set(gMidX, canopyY - 0.035, zSouthWall + 0.04);
      canopyGroup.add(gutterMesh);

      // Downpipe Hopper / Dropper Collector at the outer roof edge (after the canopy)
      const pipeRadius = 0.034; // ~68mm PVC pipe
      const pipeCornerX = roofEdgeX + (isCarportLeft ? -0.05 : 0.05);
      const pipeCornerZ = zSouthWall + 0.11; // Flush against the inside face of the rear boundary wall
      const pipeTopY = canopyY - 0.02;
      const pipeFloorY = 0.05;
      const pipeHeight = pipeTopY - pipeFloorY;

      // Collector Hopper box connecting roof edge / gutter to the downpipe
      const hopperGeo = new THREE.BoxGeometry(0.12, 0.10, 0.12);
      const hopperMesh = new THREE.Mesh(hopperGeo, blackSteelMat);
      hopperMesh.position.set(pipeCornerX, pipeTopY - 0.03, pipeCornerZ);
      canopyGroup.add(hopperMesh);

      // Vertical White PVC Downpipe coming down after the canopy at the garden strip
      const vertPipeGeo = new THREE.CylinderGeometry(pipeRadius, pipeRadius, pipeHeight - 0.08, 24);
      const vertPipe = new THREE.Mesh(vertPipeGeo, pvcPipeMat);
      vertPipe.position.set(pipeCornerX, pipeFloorY + 0.08 + (pipeHeight - 0.08) / 2, pipeCornerZ);
      vertPipe.castShadow = true;
      canopyGroup.add(vertPipe);

      // Pipe wall brackets anchoring securely to the rear masonry boundary wall
      [0.6, 1.4, 2.2].forEach(py => {
        const bracketGeo = new THREE.CylinderGeometry(pipeRadius + 0.006, pipeRadius + 0.006, 0.02, 16);
        const bracket = new THREE.Mesh(bracketGeo, blackSteelMat);
        bracket.position.set(pipeCornerX, py, pipeCornerZ);
        canopyGroup.add(bracket);
      });

      // 90° PVC Elbow at Floor Level turning into the garden strip
      const elbowGeo = new THREE.TorusGeometry(0.045, pipeRadius, 16, 24, Math.PI / 2);
      const elbow = new THREE.Mesh(elbowGeo, pvcPipeMat);
      elbow.position.set(pipeCornerX, pipeFloorY + 0.045, pipeCornerZ);
      elbow.rotation.z = isCarportLeft ? Math.PI : 0;
      canopyGroup.add(elbow);

      // Horizontal PVC drain pipe running along the base of the rear boundary wall in the garden strip
      const horizPipeLen = 0.80;
      const horizPipeGeo = new THREE.CylinderGeometry(pipeRadius, pipeRadius, horizPipeLen, 24);
      const horizPipe = new THREE.Mesh(horizPipeGeo, pvcPipeMat);
      horizPipe.rotation.z = Math.PI / 2;
      const horizX = pipeCornerX + (isCarportLeft ? -horizPipeLen / 2 - 0.045 : horizPipeLen / 2 + 0.045);
      horizPipe.position.set(horizX, pipeFloorY, pipeCornerZ);
      horizPipe.castShadow = true;
      canopyGroup.add(horizPipe);

      houseGroup.add(canopyGroup);
    }

  });

  // 3. WALL BUILDER WITH PRECISE OPENINGS
  function addWallPiece(x1, z1, x2, z2, bottomY, topY, thickness, isWindowGlass = false) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.sqrt(dx * dx + dz * dz);
    if (len < 0.01) return;

    const height = topY - bottomY;
    if (height < 0.01) return;

    const angle = Math.atan2(dz, dx);
    const midX = (x1 + x2) / 2;
    const midZ = (z1 + z2) / 2;
    const midY = bottomY + height / 2;

    // Boundary walls (rear boundary wall Z = -7.25 and outdoor garden boundary walls) get authentic gray cement stucco matching photo
    const isOutdoorBoundary = !isWindowGlass && (
      (Math.abs(midZ - (-7.25)) < 0.15) || 
      (Math.abs(midX - (-2.50)) < 0.15 && midZ < -0.70) ||
      (Math.abs(midX - 2.50) < 0.15 && midZ < -0.70 && !houseData.carportOnLeft)
    );

    const selectedMat = isWindowGlass ? glassMat : (isOutdoorBoundary ? boundaryWallMat : wallMat);

    const geo = new THREE.BoxGeometry(len, height, thickness);
    const mesh = new THREE.Mesh(geo, selectedMat);
    mesh.position.set(midX, midY, midZ);
    mesh.rotation.y = -angle;
    mesh.castShadow = !isWindowGlass;
    mesh.receiveShadow = true;
    houseGroup.add(mesh);

    // Architectural SketchUp Edge Lines on solid walls
    if (!isWindowGlass) {
      const edges = new THREE.EdgesGeometry(geo);
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: 0x2d3238, linewidth: 1 })
      );
      mesh.add(line);
    }

    // Only add solid colliders for non-glass or full barrier
    // If it's a solid wall or window sill, add AABB collider
    if (!isWindowGlass) {
      // Calculate bounding box rotated
      const halfL = len / 2;
      const halfT = thickness / 2;
      const cos = Math.abs(Math.cos(angle));
      const sin = Math.abs(Math.sin(angle));
      const boundW = halfL * cos + halfT * sin;
      const boundD = halfL * sin + halfT * cos;

      colliders.push(new THREE.Box3(
        new THREE.Vector3(midX - boundW, bottomY, midZ - boundD),
        new THREE.Vector3(midX + boundW, topY, midZ + boundD)
      ));

      // Baseboard trim at bottom of wall
      if (bottomY < 0.05) {
        const baseTrim = new THREE.Mesh(new THREE.BoxGeometry(len, 0.08, thickness + 0.02), baseboardMat);
        baseTrim.position.set(midX, 0.04, midZ);
        baseTrim.rotation.y = -angle;
        houseGroup.add(baseTrim);
      }
    } else {
      // Window frame sill collider
      const halfL = len / 2;
      const halfT = thickness / 2;
      const cos = Math.abs(Math.cos(angle));
      const sin = Math.abs(Math.sin(angle));
      const boundW = halfL * cos + halfT * sin;
      const boundD = halfL * sin + halfT * cos;

      colliders.push(new THREE.Box3(
        new THREE.Vector3(midX - boundW, bottomY, midZ - boundD),
        new THREE.Vector3(midX + boundW, topY, midZ + boundD)
      ));

      // Add architectural window frame trim around glass
      const frameThickness = 0.06;
      const topFrame = new THREE.Mesh(new THREE.BoxGeometry(len, frameThickness, thickness + 0.04), windowFrameMat);
      topFrame.position.set(midX, topY - frameThickness / 2, midZ);
      topFrame.rotation.y = -angle;
      houseGroup.add(topFrame);

      const botFrame = new THREE.Mesh(new THREE.BoxGeometry(len, frameThickness, thickness + 0.04), windowFrameMat);
      botFrame.position.set(midX, bottomY + frameThickness / 2, midZ);
      botFrame.rotation.y = -angle;
      houseGroup.add(botFrame);

      // Vertical mullions for large windows
      if (len > 2.0) {
        const mullion = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, height, thickness + 0.02), windowFrameMat);
        mullion.position.set(midX, midY, midZ);
        mullion.rotation.y = -angle;
        houseGroup.add(mullion);
      }
    }
  }

  houseData.walls.forEach(w => {
    const dx = w.x2 - w.x1;
    const dz = w.z2 - w.z1;
    const totalLen = Math.sqrt(dx * dx + dz * dz);
    if (totalLen < 0.01) return;

    const ux = dx / totalLen;
    const uz = dz / totalLen;
    const wallBottom = w.bottom || 0;
    const wallH = w.height || houseData.ceilingHeight;

    if (!w.openings || w.openings.length === 0) {
      addWallPiece(w.x1, w.z1, w.x2, w.z2, wallBottom, wallH, w.thickness);
      return;
    }

    // Sort openings by offset
    const openings = [...w.openings].sort((a, b) => a.offset - b.offset);

    let currentPos = 0;
    openings.forEach(op => {
      const opStart = Math.max(0, Math.min(op.offset, totalLen));
      const opEnd = Math.max(0, Math.min(op.offset + op.width, totalLen));

      // Segment before the opening
      if (opStart > currentPos) {
        const segX1 = w.x1 + ux * currentPos;
        const segZ1 = w.z1 + uz * currentPos;
        const segX2 = w.x1 + ux * opStart;
        const segZ2 = w.z1 + uz * opStart;
        addWallPiece(segX1, segZ1, segX2, segZ2, wallBottom, wallH, w.thickness);
      }

      // Inside opening: check sill (bottom) and lintel (top)
      const opX1 = w.x1 + ux * opStart;
      const opZ1 = w.z1 + uz * opStart;
      const opX2 = w.x1 + ux * opEnd;
      const opZ2 = w.z1 + uz * opEnd;

      const opBottom = op.bottom || 0;
      const opTop = Math.min(wallH, opBottom + op.height);

      // Sill wall beneath window
      if (opBottom > 0) {
        addWallPiece(opX1, opZ1, opX2, opZ2, 0, opBottom, w.thickness);
      }

      // Lintel wall above door or window
      if (opTop < wallH) {
        addWallPiece(opX1, opZ1, opX2, opZ2, opTop, wallH, w.thickness);
      }

      // Window Glass pane
      if (op.type === 'window') {
        addWallPiece(opX1, opZ1, opX2, opZ2, opBottom, opTop, 0.05, true);
      }

      // Clean Architectural Door Frame (Open passageway with header and side jambs)
      if (op.type === 'door') {
        const frameW = 0.06;
        const angle = Math.atan2(dz, dx);
        const midX = (opX1 + opX2) / 2;
        const midZ = (opZ1 + opZ2) / 2;

        const doorHeader = new THREE.Mesh(new THREE.BoxGeometry(op.width + 0.04, frameW, w.thickness + 0.02), windowFrameMat);
        doorHeader.position.set(midX, opTop - frameW / 2, midZ);
        doorHeader.rotation.y = -angle;
        houseGroup.add(doorHeader);

        const leftJamb = new THREE.Mesh(new THREE.BoxGeometry(frameW, op.height, w.thickness + 0.02), windowFrameMat);
        leftJamb.position.set(opX1 + ux * (frameW / 2), opBottom + op.height / 2, opZ1 + uz * (frameW / 2));
        leftJamb.rotation.y = -angle;
        houseGroup.add(leftJamb);

        const rightJamb = new THREE.Mesh(new THREE.BoxGeometry(frameW, op.height, w.thickness + 0.02), windowFrameMat);
        rightJamb.position.set(opX2 - ux * (frameW / 2), opBottom + op.height / 2, opZ2 - uz * (frameW / 2));
        rightJamb.rotation.y = -angle;
        houseGroup.add(rightJamb);
      }

      currentPos = opEnd;
    });

    // Segment after last opening
    if (currentPos < totalLen) {
      const segX1 = w.x1 + ux * currentPos;
      const segZ1 = w.z1 + uz * currentPos;
      const segX2 = w.x2;
      const segZ2 = w.z2;
      addWallPiece(segX1, segZ1, segX2, segZ2, wallBottom, wallH, w.thickness);
    }
  });

  // 4. DIMENSION LINES & LABELS (For architectural plan inspection)
  if (houseData.dimensionLines) {
    const lineMat = new THREE.LineBasicMaterial({ color: 0x2288ee, linewidth: 2 });
    houseData.dimensionLines.forEach(dim => {
      const p1 = new THREE.Vector3(...dim.start);
      const p2 = new THREE.Vector3(...dim.end);
      const geo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const line = new THREE.Line(geo, lineMat);
      dimensionGroup.add(line);

      // Tick markers at ends
      const tick1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.25), new THREE.MeshBasicMaterial({ color: 0x2288ee }));
      tick1.position.copy(p1);
      dimensionGroup.add(tick1);

      const tick2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.25), new THREE.MeshBasicMaterial({ color: 0x2288ee }));
      tick2.position.copy(p2);
      dimensionGroup.add(tick2);

      // Canvas text sprite for dimension label
      const labelCanvas = document.createElement('canvas');
      labelCanvas.width = 512;
      labelCanvas.height = 128;
      const lCtx = labelCanvas.getContext('2d');
      lCtx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      lCtx.roundRect(10, 10, 492, 108, 16);
      lCtx.fill();
      lCtx.strokeStyle = '#38bdf8';
      lCtx.lineWidth = 4;
      lCtx.stroke();
      lCtx.font = 'bold 36px "Segoe UI", sans-serif';
      lCtx.fillStyle = '#ffffff';
      lCtx.textAlign = 'center';
      lCtx.textBaseline = 'middle';
      lCtx.fillText(dim.label, 256, 64);

      const spriteTex = new THREE.CanvasTexture(labelCanvas);
      const spriteMat = new THREE.SpriteMaterial({ map: spriteTex, depthTest: false });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(1.6, 0.4, 1.0);
      const mid = p1.clone().lerp(p2, 0.5);
      sprite.position.set(mid.x, 0.4, mid.z);
      dimensionGroup.add(sprite);
    });
  }

  // Add Furnishings, Kitchen Suite & Bedroom 1 Multi-Purpose Gaming Room
  buildFurniture(houseGroup, colliders);
  const kitchenGroup = buildKitchenSuite(houseGroup, colliders, houseData);
  if (kitchenGroup && kitchenGroup.userData && kitchenGroup.userData.interactables) {
    interactables.push(...kitchenGroup.userData.interactables);
  }
  const gamingRoomGroup = buildGamingRoom(houseGroup, colliders, houseData, interactables);

  houseGroup.add(ceilingGroup);
  houseGroup.add(dimensionGroup);
  scene.add(houseGroup);

  return {
    houseGroup,
    colliders,
    ceilingGroup,
    dimensionGroup,
    kitchenGroup,
    interactables,
    rooms: houseData.rooms,
    playerSpawn: houseData.playerSpawn
  };
}
