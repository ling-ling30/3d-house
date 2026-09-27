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
  createGlassRoughnessMap
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

    // Architectural Clear Roof Canopy and Downpipe for Covered Area (matching media_1790513327300.png)
    // Architectural Smooth Roof Glass Canopy & Downpipe for Covered Area Walkway
    if (room.id === 'covered_area') {
      const canopyGroup = new THREE.Group();
      canopyGroup.name = "canopyGroup";

      const gWidth = width;
      const gMidX = cx;
      const isCarportLeft = houseData.carportOnLeft;
      const roofEdgeX = isCarportLeft ? b.minX : b.maxX; // Outer edge facing garden (-1.5m if carport left)
      const wallEdgeX = isCarportLeft ? b.maxX : b.minX; // Inner edge facing house wall (-0.3m if carport left)

      // Satin Architectural Charcoal / Titanium Structural Frame Material
      const pergolaFrameMat = new THREE.MeshStandardMaterial({
        color: 0x22262a,
        roughness: 0.28,
        metalness: 0.82
      });

      // Stainless Steel 316 Hardware & Spider Fittings Material
      const stainlessSteelMat = new THREE.MeshStandardMaterial({
        color: 0xd8e0e8,
        roughness: 0.18,
        metalness: 0.95
      });

      // Highly Realistic Architectural Tempered Glass Material
      const glassTex = createArchitecturalGlassTexture();
      const glassNormal = createGlassNormalMap();
      const glassRoughness = createGlassRoughnessMap();

      const roofGlassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        map: glassTex,
        normalMap: glassNormal,
        normalScale: new THREE.Vector2(0.06, 0.06),
        roughnessMap: glassRoughness,
        roughness: 0.05,
        metalness: 0.08,
        transmission: 0.89,
        thickness: 0.015,
        ior: 1.52,
        reflectivity: 0.95,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        attenuationColor: new THREE.Color(0x78d4c2), // Emerald/cyan tinted float-glass absorption
        attenuationDistance: 0.50,
        transparent: true,
        opacity: 0.90,
        depthWrite: false,
        side: THREE.DoubleSide
      });

      // Polished Jade-Tinted Glass Bevel Edge Material
      const glassBevelEdgeMat = new THREE.MeshStandardMaterial({
        color: 0x247a6b,
        roughness: 0.12,
        metalness: 0.25,
        transparent: true,
        opacity: 0.70
      });

      const zNorthWall = -0.75;
      const zSouthWall = -7.25;
      const totalRoofDepth = Math.abs(zSouthWall - zNorthWall); // 6.50m
      const slopeAngle = 0.03538; // ~2.03 degrees runoff slope

      // ----------------------------------------------------
      // 1. GROUNDED STRUCTURAL SUPPORT COLUMNS (No More Floating!)
      // ----------------------------------------------------
      // 3 Architectural Box Columns (70mm x 70mm) along the garden boundary line (roofEdgeX)
      // anchored firmly into the patio tile floor with heavy-duty base plates and stainless bolts
      const colZPositions = [-0.85, -4.00, -7.15];
      const colWidth = 0.07;

      colZPositions.forEach((colZ, idx) => {
        const t = Math.abs(colZ - zNorthWall) / totalRoofDepth;
        const colTopY = 3.05 - t * 0.23;
        const colHeight = colTopY; // from floor Y=0 to beam Y=colTopY

        // Vertical column post
        const colGeo = new THREE.BoxGeometry(colWidth, colHeight, colWidth);
        const colMesh = new THREE.Mesh(colGeo, pergolaFrameMat);
        colMesh.position.set(roofEdgeX, colHeight / 2, colZ);
        colMesh.castShadow = true;
        colMesh.receiveShadow = true;
        canopyGroup.add(colMesh);

        // Add to colliders so player cannot walk through the solid structural posts
        const colBox = new THREE.Box3(
          new THREE.Vector3(roofEdgeX - colWidth / 2, 0, colZ - colWidth / 2),
          new THREE.Vector3(roofEdgeX + colWidth / 2, colTopY, colZ + colWidth / 2)
        );
        colliders.push(colBox);

        // Flanged Steel Base Plate at ground (Y = 0)
        const basePlateGeo = new THREE.BoxGeometry(0.16, 0.016, 0.16);
        const basePlate = new THREE.Mesh(basePlateGeo, pergolaFrameMat);
        basePlate.position.set(roofEdgeX, 0.008, colZ);
        basePlate.castShadow = true;
        canopyGroup.add(basePlate);

        // 4 Stainless Steel Anchor Bolts on Base Plate
        const boltGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.025, 12);
        const boltOffset = 0.055;
        [
          [-boltOffset, -boltOffset],
          [boltOffset, -boltOffset],
          [-boltOffset, boltOffset],
          [boltOffset, boltOffset]
        ].forEach(([bx, bz]) => {
          const bolt = new THREE.Mesh(boltGeo, stainlessSteelMat);
          bolt.position.set(roofEdgeX + bx, 0.02, colZ + bz);
          canopyGroup.add(bolt);
        });

        // Top Column Connector / Beam Saddle Flange
        const topFlangeGeo = new THREE.BoxGeometry(0.11, 0.016, 0.14);
        const topFlange = new THREE.Mesh(topFlangeGeo, pergolaFrameMat);
        topFlange.position.set(roofEdgeX, colTopY, colZ);
        canopyGroup.add(topFlange);

        // Sleek 45° Architectural Knee Braces connecting column to longitudinal beam
        if (idx !== 0) {
          // North-pointing knee brace
          const braceGeo = new THREE.BoxGeometry(0.04, 0.38, 0.04);
          const braceNorth = new THREE.Mesh(braceGeo, pergolaFrameMat);
          braceNorth.rotation.x = -Math.PI / 4;
          braceNorth.position.set(roofEdgeX, colTopY - 0.13, colZ + 0.13);
          braceNorth.castShadow = true;
          canopyGroup.add(braceNorth);
        }
        if (idx !== colZPositions.length - 1) {
          // South-pointing knee brace
          const braceGeo = new THREE.BoxGeometry(0.04, 0.38, 0.04);
          const braceSouth = new THREE.Mesh(braceGeo, pergolaFrameMat);
          braceSouth.rotation.x = Math.PI / 4;
          braceSouth.position.set(roofEdgeX, colTopY - 0.13, colZ - 0.13);
          braceSouth.castShadow = true;
          canopyGroup.add(braceSouth);
        }
      });

      // ----------------------------------------------------
      // 2. CONTINUOUS STRUCTURAL HEADER & LEDGER BEAMS
      // ----------------------------------------------------
      // Outer Header Fascia Beam along roofEdgeX (Z: -0.75 to -7.25, 6.50m long)
      const outerBeamGeo = new THREE.BoxGeometry(0.06, 0.10, totalRoofDepth);
      const outerBeam = new THREE.Mesh(outerBeamGeo, pergolaFrameMat);
      outerBeam.rotation.x = slopeAngle;
      outerBeam.position.set(roofEdgeX, 2.935, (zNorthWall + zSouthWall) / 2);
      outerBeam.castShadow = true;
      canopyGroup.add(outerBeam);

      // Solid Wall Anchor Plates anchoring outer beam to walls at both ends
      const wallPlateGeo = new THREE.BoxGeometry(0.12, 0.18, 0.018);
      const northPlate = new THREE.Mesh(wallPlateGeo, pergolaFrameMat);
      northPlate.position.set(roofEdgeX, 3.05, zNorthWall + 0.009);
      canopyGroup.add(northPlate);

      const southPlate = new THREE.Mesh(wallPlateGeo, pergolaFrameMat);
      southPlate.position.set(roofEdgeX, 2.82, zSouthWall - 0.009);
      canopyGroup.add(southPlate);

      // Inner Wall Ledger Beam along wallEdgeX (Z: -0.75 to -7.25, 6.50m long)
      // Supports the inner side of all rafters, anchored securely into the house walls
      const innerLedgerGeo = new THREE.BoxGeometry(0.05, 0.08, totalRoofDepth);
      const innerLedger = new THREE.Mesh(innerLedgerGeo, pergolaFrameMat);
      innerLedger.rotation.x = slopeAngle;
      innerLedger.position.set(wallEdgeX, 2.935, (zNorthWall + zSouthWall) / 2);
      innerLedger.castShadow = true;
      canopyGroup.add(innerLedger);

      // Wall Anchor Brackets on Inner Ledger
      [-0.85, -2.40, -4.00, -5.60, -7.15].forEach(wz => {
        const t = Math.abs(wz - zNorthWall) / totalRoofDepth;
        const wy = 3.05 - t * 0.23;
        const wBracket = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.12, 0.08), pergolaFrameMat);
        wBracket.position.set(wallEdgeX + (isCarportLeft ? 0.03 : -0.03), wy, wz);
        canopyGroup.add(wBracket);
      });

      // ----------------------------------------------------
      // 3. TRANSVERSE STRUCTURAL RAFTERS (7 Rafters)
      // ----------------------------------------------------
      const numRafters = 7;
      const rafterW = 0.045;
      const rafterH = 0.065;

      for (let ri = 0; ri < numRafters; ri++) {
        const t = ri / (numRafters - 1);
        const rz = -0.85 - t * (7.15 - 0.85);
        const ry = 3.05 - t * 0.23 + 0.04;

        // Rectangular structural rafter spanning from ledger to outer header beam
        const rafterGeo = new THREE.BoxGeometry(gWidth, rafterH, rafterW);
        const rafter = new THREE.Mesh(rafterGeo, pergolaFrameMat);
        rafter.rotation.x = slopeAngle;
        rafter.position.set(gMidX, ry, rz);
        rafter.castShadow = true;
        canopyGroup.add(rafter);

        // Welded end connection brackets at outer and inner junctions
        const endConnGeo = new THREE.BoxGeometry(0.03, 0.08, 0.055);
        const outerConn = new THREE.Mesh(endConnGeo, pergolaFrameMat);
        outerConn.position.set(roofEdgeX, ry, rz);
        canopyGroup.add(outerConn);

        const innerConn = new THREE.Mesh(endConnGeo, pergolaFrameMat);
        innerConn.position.set(wallEdgeX, ry, rz);
        canopyGroup.add(innerConn);
      }

      // ----------------------------------------------------
      // 4. REALISTIC TEXTURED TEMPERED ROOF GLASS PANELS
      // ----------------------------------------------------
      const numBays = numRafters - 1; // 6 bays
      const spanZ = 7.15 - 0.85;
      const bayLength = spanZ / numBays;
      const glassThick = 0.012; // 12mm laminated architectural tempered safety glass
      const panelGlassW = gWidth - 0.03;
      const panelGlassL = bayLength - 0.016; // 16mm silicone expansion joint

      for (let bi = 0; bi < numBays; bi++) {
        const tMid = (bi + 0.5) / numBays;
        const panelZ = -0.85 - tMid * spanZ;
        const panelY = 3.05 - tMid * 0.23 + rafterH / 2 + glassThick / 2 + 0.04;

        // Main Textured Glass Pane
        const panelGeo = new THREE.BoxGeometry(panelGlassW, glassThick, panelGlassL);
        const panelMesh = new THREE.Mesh(panelGeo, roofGlassMat);
        panelMesh.rotation.x = slopeAngle;
        panelMesh.position.set(gMidX, panelY, panelZ);
        panelMesh.castShadow = false;
        panelMesh.receiveShadow = true;

        panelMesh.userData.dimInfo = {
          label: "|-- 1200 mm Architectural Glass Canopy --|",
          p1: [isCarportLeft ? -1.50 : 0.30, panelY, panelZ],
          p2: [isCarportLeft ? -0.30 : 1.50, panelY, panelZ],
          axis: 'x'
        };
        interactables.push(panelMesh);
        canopyGroup.add(panelMesh);

        // Polished Jade Bevel Edge Frame around perimeter of each glass sheet
        const bevelBorderGeo = new THREE.BoxGeometry(panelGlassW + 0.004, glassThick + 0.002, panelGlassL + 0.004);
        const bevelBorder = new THREE.Mesh(bevelBorderGeo, glassBevelEdgeMat);
        bevelBorder.rotation.x = slopeAngle;
        bevelBorder.position.set(gMidX, panelY, panelZ);
        canopyGroup.add(bevelBorder);

        // Stainless Steel Spider Rotule Clamps (4 Point-Fixing discs per panel)
        const rotuleRadius = 0.020; // 40mm diameter disc
        const rotuleGeo = new THREE.CylinderGeometry(rotuleRadius, rotuleRadius, 0.014, 20);
        const rotuleOffsetX = panelGlassW * 0.40;
        const rotuleOffsetZ = panelGlassL * 0.40;

        [
          [-rotuleOffsetX, -rotuleOffsetZ],
          [rotuleOffsetX, -rotuleOffsetZ],
          [-rotuleOffsetX, rotuleOffsetZ],
          [rotuleOffsetX, rotuleOffsetZ]
        ].forEach(([rx, rz]) => {
          const rotule = new THREE.Mesh(rotuleGeo, stainlessSteelMat);
          rotule.position.set(gMidX + rx, panelY + glassThick / 2 + 0.007, panelZ + rz);
          canopyGroup.add(rotule);

          // Central Allen bolt head
          const allenBolt = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.005, 12), pergolaFrameMat);
          allenBolt.position.set(gMidX + rx, panelY + glassThick / 2 + 0.015, panelZ + rz);
          canopyGroup.add(allenBolt);
        });

        // Weatherproof Aluminum Glazing Cap Profile over each transverse joint
        const battenGeo = new THREE.BoxGeometry(gWidth + 0.02, 0.010, 0.028);
        const battenMesh = new THREE.Mesh(battenGeo, pergolaFrameMat);
        battenMesh.rotation.x = slopeAngle;
        const rafterT = bi / numBays;
        battenMesh.position.set(gMidX, 3.05 - rafterT * 0.23 + rafterH / 2 + glassThick + 0.045, -0.85 - rafterT * spanZ);
        canopyGroup.add(battenMesh);
      }

      // ----------------------------------------------------
      // 5. RAINWATER MANAGEMENT: GUTTER & INTEGRATED DOWNPIPE
      // ----------------------------------------------------
      const gutterMat = new THREE.MeshStandardMaterial({ color: 0x22262a, roughness: 0.3, metalness: 0.85 });
      const gutterGeo = new THREE.BoxGeometry(gWidth + 0.08, 0.08, 0.09);
      const gutter = new THREE.Mesh(gutterGeo, gutterMat);
      gutter.position.set(gMidX, 2.78, zSouthWall + 0.06);
      canopyGroup.add(gutter);

      // Downpipe anchored down the rear Column (colZ = -7.15)
      const pipeMat = new THREE.MeshStandardMaterial({ color: 0x282c32, roughness: 0.25, metalness: 0.85 });
      const pipeX = roofEdgeX + (isCarportLeft ? 0.06 : -0.06);
      const pipeZ = -7.15;
      const pipeGeo = new THREE.CylinderGeometry(0.032, 0.032, 2.78, 24);
      const pipeMesh = new THREE.Mesh(pipeGeo, pipeMat);
      pipeMesh.position.set(pipeX, 1.39, pipeZ);
      canopyGroup.add(pipeMesh);

      // Pipe Wall Clamps
      [0.6, 1.4, 2.2].forEach(py => {
        const clamp = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.02, 20), stainlessSteelMat);
        clamp.position.set(pipeX, py, pipeZ);
        canopyGroup.add(clamp);
      });

      // Ground Drain Collar
      const drainCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.04, 20), gutterMat);
      drainCollar.position.set(pipeX, 0.02, pipeZ);
      canopyGroup.add(drainCollar);

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

    const geo = new THREE.BoxGeometry(len, height, thickness);
    const mesh = new THREE.Mesh(geo, isWindowGlass ? glassMat : wallMat);
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
