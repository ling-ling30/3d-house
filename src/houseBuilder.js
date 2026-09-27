import * as THREE from 'three';
import {
  createWoodFloorTexture,
  createMarbleTileTexture,
  createPatioWoodTexture,
  createGardenCorridorTexture,
  createLawnTexture,
  createRugTexture,
  createCarportTexture
} from './textures.js';
import { buildFurniture } from './furnitureBuilder.js';


export function buildHouse(scene, houseData) {
  const houseGroup = new THREE.Group();
  houseGroup.name = "houseGroup";

  const colliders = []; // Array of THREE.Box3 objects for player collision
  const ceilingGroup = new THREE.Group();
  ceilingGroup.name = "ceilingGroup";
  const dimensionGroup = new THREE.Group();
  dimensionGroup.name = "dimensionGroup";

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
    if (room.id === 'covered_area') {
      const canopyGroup = new THREE.Group();
      canopyGroup.name = "canopyGroup";

      const gWidth = width;
      const gMidX = cx;
      const isCarportLeft = houseData.carportOnLeft;

      // Canopy steel rafters across the 1.2m width (from Z = -0.8 down to -7.2)
      const rafterMat = new THREE.MeshStandardMaterial({ color: 0x1f2328, roughness: 0.35, metalness: 0.8 });
      const numRafters = 6;
      for (let ri = 0; ri < numRafters; ri++) {
        const rz = -1.0 - ri * 1.18;
        const t = ri / (numRafters - 1);
        const ry = 3.05 - t * 0.25; // Gentle slope towards the rear wall

        const rafter = new THREE.Mesh(new THREE.BoxGeometry(gWidth + 0.04, 0.05, 0.05), rafterMat);
        rafter.position.set(gMidX, ry, rz);
        rafter.castShadow = true;
        canopyGroup.add(rafter);
      }

      // Longitudinal steel beam on the roof edge (dividing covered area from garden strip)
      const roofEdgeX = isCarportLeft ? b.minX : b.maxX;
      const longBeam = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, depth), rafterMat);
      longBeam.position.set(roofEdgeX, 2.92, cz);
      canopyGroup.add(longBeam);

      // Translucent polycarbonate clear roof sheet
      const polyMat = new THREE.MeshPhysicalMaterial({
        color: 0xc8d8e8,
        transparent: true,
        opacity: 0.40,
        roughness: 0.15,
        transmission: 0.82,
        ior: 1.48
      });
      const roofSheet = new THREE.Mesh(new THREE.PlaneGeometry(gWidth + 0.02, depth), polyMat);
      roofSheet.rotation.x = -Math.PI / 2 + 0.04;
      roofSheet.position.set(gMidX, 2.96, cz);
      canopyGroup.add(roofSheet);

      // Downpipe circle in blueprint (Roof edge, gutter, downpipe at the rear edge)
      const pipeMat = new THREE.MeshStandardMaterial({ color: 0xedebe6, roughness: 0.6 });
      const pipeX = roofEdgeX;
      const pipeZ = -7.15;
      const pipeGeo = new THREE.CylinderGeometry(0.045, 0.045, 2.85, 16);
      const pipeMesh = new THREE.Mesh(pipeGeo, pipeMat);
      pipeMesh.position.set(pipeX, 1.45, pipeZ);
      canopyGroup.add(pipeMesh);

      // Horizontal drain outlet pipe at the bottom
      const elbowGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.45, 16);
      const elbowMesh = new THREE.Mesh(elbowGeo, pipeMat);
      elbowMesh.rotation.z = Math.PI / 2;
      elbowMesh.position.set(pipeX + (isCarportLeft ? -0.2 : 0.2), 0.06, pipeZ);
      canopyGroup.add(elbowMesh);

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

  // Add Furnishings
  buildFurniture(houseGroup, colliders);

  houseGroup.add(ceilingGroup);
  houseGroup.add(dimensionGroup);
  scene.add(houseGroup);

  return {
    houseGroup,
    colliders,
    ceilingGroup,
    dimensionGroup,
    rooms: houseData.rooms,
    playerSpawn: houseData.playerSpawn
  };
}
