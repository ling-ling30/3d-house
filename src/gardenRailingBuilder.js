import * as THREE from 'three';

/**
 * Builds an ultra-tidy, continuous architectural glass balustrade along the garden boundary.
 * Features a seamless straight profile, continuous smooth cylindrical handrail,
 * sleek low-profile base shoe channel, and modular crystal-clear tempered glass panels.
 */
export function buildGardenRailing(scene, colliders, houseData, interactablesList) {
  const isCarportLeft = houseData.carportOnLeft !== false;
  const railingGroup = new THREE.Group();
  railingGroup.name = "gardenRailingGroup";

  function mx(x) {
    return isCarportLeft ? x : -x;
  }

  // ----------------------------------------------------
  // Materials: Architectural Satin Stainless Steel & Tempered Glass
  // ----------------------------------------------------
  const stainlessMat = new THREE.MeshStandardMaterial({
    color: 0xdce0e6,
    roughness: 0.20,
    metalness: 0.92
  });

  const baseShoeMat = new THREE.MeshStandardMaterial({
    color: 0x2e3238,
    roughness: 0.35,
    metalness: 0.75
  });

  // Architectural Tempered Safety Glass
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xedf5fa,
    transparent: true,
    opacity: 0.28,
    roughness: 0.03,
    transmission: 0.95,
    ior: 1.52,
    reflectivity: 0.95,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03
  });

  const glassEdgeMat = new THREE.MeshStandardMaterial({
    color: 0x9bc2dc,
    roughness: 0.15,
    metalness: 0.2,
    transparent: true,
    opacity: 0.55
  });

  // ----------------------------------------------------
  // Precise Straight Alignment along the Garden Boundary
  // X = -1.50 (walkway edge), Z from -0.80 to -7.20 (Length = 6.40m)
  // ----------------------------------------------------
  const railX = -1.50;
  const startZ = -0.80;
  const endZ = -7.20;
  const totalLength = Math.abs(endZ - startZ); // 6.40m
  const midZ = (startZ + endZ) / 2; // -4.00m

  const railH = 0.95; // 950mm total height above floor
  const railR = 0.021; // 42mm diameter smooth cylindrical handrail
  const postR = 0.014; // 28mm diameter slim structural intermediate post
  const shoeW = 0.045; // 45mm wide base shoe channel
  const shoeH = 0.040; // 40mm high base shoe channel
  const glassThick = 0.012; // 12mm tempered safety glass

  // ----------------------------------------------------
  // 1. Sleek Continuous Base Shoe Channel (U-Channel)
  // Clean, flush-mounted floor profile holding the glass
  // ----------------------------------------------------
  const baseShoeGeo = new THREE.BoxGeometry(shoeW, shoeH, totalLength);
  const baseShoeMesh = new THREE.Mesh(baseShoeGeo, baseShoeMat);
  baseShoeMesh.position.set(mx(railX), shoeH / 2, midZ);
  baseShoeMesh.castShadow = true;
  baseShoeMesh.receiveShadow = true;
  railingGroup.add(baseShoeMesh);

  // Slim inner rubber glazing gasket
  const gasketGeo = new THREE.BoxGeometry(shoeW - 0.01, 0.006, totalLength);
  const gasketMat = new THREE.MeshBasicMaterial({ color: 0x181a1d });
  const gasketMesh = new THREE.Mesh(gasketGeo, gasketMat);
  gasketMesh.position.set(mx(railX), shoeH + 0.003, midZ);
  railingGroup.add(gasketMesh);

  // ----------------------------------------------------
  // 2. Smooth Continuous Cylindrical Top Rail (42mm Dia)
  // Completely straight, seamless, with 32 radial segments
  // ----------------------------------------------------
  const handrailGeo = new THREE.CylinderGeometry(railR, railR, totalLength, 32);
  const handrailMesh = new THREE.Mesh(handrailGeo, stainlessMat);
  handrailMesh.rotation.x = Math.PI / 2;
  handrailMesh.position.set(mx(railX), railH, midZ);
  handrailMesh.castShadow = true;
  handrailMesh.receiveShadow = true;

  if (interactablesList) {
    handrailMesh.userData.dimInfo = {
      label: "|-- 950 mm Glass Railing --|",
      p1: [mx(railX), railH, startZ],
      p2: [mx(railX), railH, endZ],
      axis: 'z'
    };
    interactablesList.push(handrailMesh);
  }
  railingGroup.add(handrailMesh);

  // Smooth Hemispherical Rounded End Caps at both ends
  const capGeo = new THREE.SphereGeometry(railR, 32, 16);
  const capNorth = new THREE.Mesh(capGeo, stainlessMat);
  capNorth.position.set(mx(railX), railH, startZ);
  railingGroup.add(capNorth);

  const capSouth = new THREE.Mesh(capGeo, stainlessMat);
  capSouth.position.set(mx(railX), railH, endZ);
  railingGroup.add(capSouth);

  // ----------------------------------------------------
  // 3. Modular Tempered Glass Panels with Uniform Reveals
  // 6 identical panels, perfectly spaced with 18mm clean gaps
  // ----------------------------------------------------
  const numPanels = 6;
  const panelGap = 0.018; // 18mm uniform reveal joint
  const panelLength = (totalLength - (numPanels + 1) * panelGap) / numPanels; // ~1.045m each
  const glassBottomY = shoeH;
  const glassTopY = railH - railR * 1.2;
  const panelH = glassTopY - glassBottomY; // ~0.88m

  for (let i = 0; i < numPanels; i++) {
    const pZ = startZ - panelGap - panelLength / 2 - i * (panelLength + panelGap);

    // Glass panel mesh
    const pGeo = new THREE.BoxGeometry(glassThick, panelH, panelLength);
    const pMesh = new THREE.Mesh(pGeo, glassMat);
    pMesh.position.set(mx(railX), glassBottomY + panelH / 2, pZ);
    pMesh.castShadow = false;
    pMesh.receiveShadow = true;

    if (interactablesList) {
      pMesh.userData.dimInfo = {
        label: `|-- ${Math.round(panelLength * 1000)} mm Glass Panel --|`,
        p1: [mx(railX), railH, pZ + panelLength / 2],
        p2: [mx(railX), railH, pZ - panelLength / 2],
        axis: 'z'
      };
      interactablesList.push(pMesh);
    }
    railingGroup.add(pMesh);

    // Top Polished Glass Edge Strip
    const edgeGeo = new THREE.BoxGeometry(glassThick + 0.002, 0.005, panelLength);
    const edgeMesh = new THREE.Mesh(edgeGeo, glassEdgeMat);
    edgeMesh.position.set(mx(railX), glassTopY, pZ);
    railingGroup.add(edgeMesh);
  }

  // ----------------------------------------------------
  // 4. Slim Cylindrical Intermediate Support Posts
  // Perfectly centered at the panel joints, connecting base to handrail
  // ----------------------------------------------------
  const numPosts = numPanels + 1; // 7 posts at ends and between panels
  for (let pi = 0; pi < numPosts; pi++) {
    const postZ = startZ - panelGap / 2 - pi * (panelLength + panelGap);

    // Slim post cylinder
    const postGeo = new THREE.CylinderGeometry(postR, postR, railH - shoeH, 32);
    const postMesh = new THREE.Mesh(postGeo, stainlessMat);
    postMesh.position.set(mx(railX), shoeH + (railH - shoeH) / 2, postZ);
    postMesh.castShadow = true;
    postMesh.receiveShadow = true;
    railingGroup.add(postMesh);

    // Neat beveled collar at base
    const collarGeo = new THREE.CylinderGeometry(postR * 1.3, postR * 1.45, 0.015, 32);
    const collarMesh = new THREE.Mesh(collarGeo, stainlessMat);
    collarMesh.position.set(mx(railX), shoeH + 0.008, postZ);
    railingGroup.add(collarMesh);

    // Top saddle connector cradling the round handrail
    const saddleGeo = new THREE.CylinderGeometry(postR * 0.9, postR * 0.9, 0.018, 16);
    const saddleMesh = new THREE.Mesh(saddleGeo, stainlessMat);
    saddleMesh.position.set(mx(railX), railH - railR * 0.7, postZ);
    railingGroup.add(saddleMesh);
  }

  // ----------------------------------------------------
  // 5. Clean Single Collider along Walkway Edge
  // Prevents player from falling into sunken garden
  // ----------------------------------------------------
  colliders.push(new THREE.Box3(
    new THREE.Vector3(Math.min(mx(railX - shoeW / 2), mx(railX + shoeW / 2)), 0, Math.min(startZ, endZ)),
    new THREE.Vector3(Math.max(mx(railX - shoeW / 2), mx(railX + shoeW / 2)), railH + 0.1, Math.max(startZ, endZ))
  ));

  scene.add(railingGroup);
  return railingGroup;
}
