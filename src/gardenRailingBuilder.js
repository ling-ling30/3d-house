import * as THREE from 'three';

/**
 * Builds an architectural glass balustrade with a smooth cylindrical handrail,
 * rounded posts, stainless steel glass clamps, and tempered safety glass panels
 * along the garden boundary.
 */
export function buildGardenRailing(scene, colliders, houseData, interactablesList) {
  const isCarportLeft = houseData.carportOnLeft !== false;
  const railingGroup = new THREE.Group();
  railingGroup.name = "gardenRailingGroup";

  function mx(x) {
    return isCarportLeft ? x : -x;
  }

  // ----------------------------------------------------
  // Materials: Premium Satin Stainless Steel & Tempered Glass
  // ----------------------------------------------------
  const handrailMat = new THREE.MeshStandardMaterial({
    color: 0xd2d7df,
    roughness: 0.22,
    metalness: 0.90
  });

  const postMat = new THREE.MeshStandardMaterial({
    color: 0xc4cbd5,
    roughness: 0.25,
    metalness: 0.85
  });

  const clampMat = new THREE.MeshStandardMaterial({
    color: 0x24272c,
    roughness: 0.3,
    metalness: 0.8
  });

  const curbMat = new THREE.MeshStandardMaterial({
    color: 0xd8d4cc,
    roughness: 0.65,
    metalness: 0.05
  });

  // Architectural Tempered Safety Glass
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xe8f2f8,
    transparent: true,
    opacity: 0.35,
    roughness: 0.04,
    transmission: 0.92,
    ior: 1.52,
    reflectivity: 0.95,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05
  });

  const glassEdgeMat = new THREE.MeshStandardMaterial({
    color: 0xa8c4d8,
    roughness: 0.15,
    metalness: 0.3,
    transparent: true,
    opacity: 0.6
  });

  // Helper: Add Cylinder
  function addCylinder(rTop, rBot, h, segs, mat, x, y, z, rotX = 0, rotZ = 0) {
    const geo = new THREE.CylinderGeometry(rTop, rBot, h, segs);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(mx(x), y, z);
    mesh.rotation.x = rotX;
    mesh.rotation.z = isCarportLeft ? rotZ : -rotZ;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    railingGroup.add(mesh);
    return mesh;
  }

  // Helper: Add Sphere (for smooth rounded end caps and corner joints)
  function addSphere(r, mat, x, y, z) {
    const geo = new THREE.SphereGeometry(r, 32, 16);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(mx(x), y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    railingGroup.add(mesh);
    return mesh;
  }

  // Helper: Add Box
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

    railingGroup.add(mesh);
    return mesh;
  }

  // ----------------------------------------------------
  // Railing Dimensions & Specifications
  // ----------------------------------------------------
  const railH = 0.95; // 950mm total height above floor
  const railR = 0.024; // 48mm diameter smooth cylindrical handrail
  const postR = 0.019; // 38mm diameter smooth cylindrical post
  const curbW = 0.12; // 120mm wide curb
  const curbH = 0.045; // 45mm high curb
  const glassBottomY = 0.08;
  const glassTopY = railH - railR * 1.5;
  const glassH = glassTopY - glassBottomY;
  const glassThick = 0.012; // 12mm tempered safety glass

  // ----------------------------------------------------
  // Section A: Living Room Overlook Balustrade
  // Z = -0.75, X from -2.45 to -1.50 (Length = 0.95m)
  // ----------------------------------------------------
  const secAZ = -0.75;
  const secAX1 = -2.45;
  const secAX2 = -1.50;
  const secALen = Math.abs(secAX2 - secAX1);
  const secAMidX = (secAX1 + secAX2) / 2;

  // Curb along Living Room edge
  addBox(secALen, curbH, curbW, curbMat, secAMidX, curbH / 2, secAZ);

  // Smooth Horizontal Cylindrical Handrail along X
  const handrailA = addCylinder(railR, railR, secALen, 32, handrailMat, secAMidX, railH, secAZ, 0, Math.PI / 2);

  // Terminal Spherical End Cap at West wall (X = -2.45)
  addSphere(railR, handrailMat, secAX1, railH, secAZ);

  // Smooth Spherical Corner Joint at (X = -1.50, Z = -0.75) where Living Room meets Patio Railing
  addSphere(railR * 1.05, handrailMat, secAX2, railH, secAZ);

  // Vertical Posts for Section A (at X = -2.35 and X = -1.55)
  [secAX1 + 0.10, secAX2 - 0.05].forEach(px => {
    // Post collar
    addCylinder(postR * 1.35, postR * 1.45, 0.02, 32, postMat, px, curbH + 0.01, secAZ);
    // Smooth cylindrical post
    addCylinder(postR, postR, railH - curbH - railR, 32, postMat, px, (railH + curbH) / 2, secAZ);
  });

  // Tempered Glass Panel for Section A
  const glassAW = secALen - 0.22;
  const glassAMesh = addBox(glassAW, glassH, glassThick, glassMat, secAMidX, glassBottomY + glassH / 2, secAZ, 0, {
    label: "|-- 950 mm Glass Balustrade --|",
    p1: [secAX1, railH, secAZ],
    p2: [secAX2, railH, secAZ],
    axis: 'x'
  });
  // Polished glass edge highlight
  addBox(glassAW, 0.006, glassThick + 0.002, glassEdgeMat, secAMidX, glassTopY, secAZ);

  // Glass clamp spigots for Section A
  [secAMidX - glassAW * 0.28, secAMidX + glassAW * 0.28].forEach(cx => {
    addBox(0.04, 0.06, 0.03, clampMat, cx, glassBottomY + 0.03, secAZ);
  });

  // Collider for Section A
  colliders.push(new THREE.Box3(
    new THREE.Vector3(Math.min(mx(secAX1), mx(secAX2)), 0, secAZ - curbW / 2),
    new THREE.Vector3(Math.max(mx(secAX1), mx(secAX2)), railH + 0.1, secAZ + curbW / 2)
  ));

  // ----------------------------------------------------
  // Section B: Covered Patio Railing (North Section)
  // X = -1.50, Z from -0.75 to -1.80 (Length = 1.05m)
  // ----------------------------------------------------
  const secBX = -1.50;
  const secBZ1 = -0.75;
  const secBZ2 = -1.80;
  const secBLen = Math.abs(secBZ2 - secBZ1);
  const secBMidZ = (secBZ1 + secBZ2) / 2;

  // Curb
  addBox(curbW, curbH, secBLen, curbMat, secBX, curbH / 2, secBMidZ);

  // Smooth Cylindrical Handrail along Z
  addCylinder(railR, railR, secBLen, 32, handrailMat, secBX, railH, secBMidZ, Math.PI / 2, 0);

  // Terminal Return at Garden Gate entrance (Z = -1.80)
  addSphere(railR, handrailMat, secBX, railH, secBZ2);

  // Vertical Posts for Section B
  [secBZ1 + 0.10, secBZ2 - 0.08].forEach(pz => {
    addCylinder(postR * 1.35, postR * 1.45, 0.02, 32, postMat, secBX, curbH + 0.01, pz);
    addCylinder(postR, postR, railH - curbH - railR, 32, postMat, secBX, (railH + curbH) / 2, pz);
  });

  // Tempered Glass Panel for Section B
  const glassBW = secBLen - 0.20;
  addBox(glassThick, glassH, glassBW, glassMat, secBX, glassBottomY + glassH / 2, secBMidZ, 0, {
    label: "|-- 950 mm Glass Balustrade --|",
    p1: [secBX, railH, secBZ1],
    p2: [secBX, railH, secBZ2],
    axis: 'z'
  });
  addBox(glassThick + 0.002, 0.006, glassBW, glassEdgeMat, secBX, glassTopY, secBMidZ);

  // Glass clamps for Section B
  [secBMidZ - glassBW * 0.28, secBMidZ + glassBW * 0.28].forEach(cz => {
    addBox(0.03, 0.06, 0.04, clampMat, secBX, glassBottomY + 0.03, cz);
  });

  // Collider for Section B
  colliders.push(new THREE.Box3(
    new THREE.Vector3(Math.min(mx(secBX - curbW / 2), mx(secBX + curbW / 2)), 0, Math.min(secBZ1, secBZ2)),
    new THREE.Vector3(Math.max(mx(secBX - curbW / 2), mx(secBX + curbW / 2)), railH + 0.1, Math.max(secBZ1, secBZ2))
  ));

  // ----------------------------------------------------
  // Garden Step-Down Threshold (Access Gate)
  // X = -1.50, Z from -1.80 to -2.65 (Clear opening: 0.85m)
  // ----------------------------------------------------
  const gateZ1 = -1.80;
  const gateZ2 = -2.65;
  const gateMidZ = (gateZ1 + gateZ2) / 2;
  const gateW = Math.abs(gateZ2 - gateZ1);

  // Architectural basalt transition step paver leading into the garden
  const stepMat = new THREE.MeshStandardMaterial({ color: 0x484b52, roughness: 0.8 });
  addBox(0.36, 0.035, gateW - 0.06, stepMat, secBX - 0.12, 0.018, gateMidZ);

  // ----------------------------------------------------
  // Section C: Covered Patio Railing (Main South Section)
  // X = -1.50, Z from -2.65 to -7.15 (Length = 4.50m)
  // Divided into 4 modular glass panels with smooth cylindrical handrails
  // ----------------------------------------------------
  const secCZ1 = -2.65;
  const secCZ2 = -7.15;
  const secCLen = Math.abs(secCZ2 - secCZ1);
  const secCMidZ = (secCZ1 + secCZ2) / 2;

  // Curb along South Section
  addBox(curbW, curbH, secCLen, curbMat, secBX, curbH / 2, secCMidZ);

  // Continuous Smooth Cylindrical Handrail along Z (4.50m)
  addCylinder(railR, railR, secCLen, 32, handrailMat, secBX, railH, secCMidZ, Math.PI / 2, 0);

  // Terminal Spherical End Caps at both ends of Section C
  addSphere(railR, handrailMat, secBX, railH, secCZ1);
  addSphere(railR, handrailMat, secBX, railH, secCZ2);

  // 5 Vertical Support Posts evenly spaced along Section C
  const numPosts = 5;
  const postSpacing = secCLen / (numPosts - 1);
  for (let pi = 0; pi < numPosts; pi++) {
    const pz = secCZ1 - pi * postSpacing;
    // Base collar
    addCylinder(postR * 1.35, postR * 1.45, 0.02, 32, postMat, secBX, curbH + 0.01, pz);
    // Smooth cylindrical post
    addCylinder(postR, postR, railH - curbH - railR, 32, postMat, secBX, (railH + curbH) / 2, pz);
    // Top saddle bracket under handrail
    addCylinder(postR * 0.75, postR * 0.75, 0.025, 16, postMat, secBX, railH - railR * 0.8, pz);
  }

  // 4 Modular Tempered Glass Panels
  const numPanels = 4;
  const panelGap = 0.035; // 35mm reveal gap between glass panels
  const panelW = (secCLen - (numPanels + 1) * panelGap) / numPanels;

  for (let gi = 0; gi < numPanels; gi++) {
    const gz = secCZ1 - panelGap - panelW / 2 - gi * (panelW + panelGap);
    
    // Tempered Glass Panel
    const glassMesh = addBox(glassThick, glassH, panelW, glassMat, secBX, glassBottomY + glassH / 2, gz, 0, {
      label: `|-- ${Math.round(panelW * 1000)} mm Glass Panel --|`,
      p1: [secBX, railH, gz + panelW / 2],
      p2: [secBX, railH, gz - panelW / 2],
      axis: 'z'
    });

    // Top Polished Glass Edge Strip
    addBox(glassThick + 0.002, 0.006, panelW, glassEdgeMat, secBX, glassTopY, gz);

    // 2 Heavy-duty Stainless Glass Clamps per panel
    [gz + panelW * 0.30, gz - panelW * 0.30].forEach(cz => {
      addBox(0.03, 0.06, 0.04, clampMat, secBX, glassBottomY + 0.03, cz);
    });
  }

  // Collider for Section C
  colliders.push(new THREE.Box3(
    new THREE.Vector3(Math.min(mx(secBX - curbW / 2), mx(secBX + curbW / 2)), 0, Math.min(secCZ1, secCZ2)),
    new THREE.Vector3(Math.max(mx(secBX - curbW / 2), mx(secBX + curbW / 2)), railH + 0.1, Math.max(secCZ1, secCZ2))
  ));

  scene.add(railingGroup);
  return railingGroup;
}
