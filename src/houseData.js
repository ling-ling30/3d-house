// Architectural specifications matching the user's exact floor plan diagram (media_1790511801293.png)
// Total Dimensions: 5.00m Width × 14.50m Depth
// Front (Street) at Top (+Z), Rear at Bottom (-Z)
//
// Layout Orientation:
// By default: Carport on LEFT (2.8m × 4.2m), Bedrooms & Bath on RIGHT (2.2m)
// If mirrored: Carport on RIGHT (2.8m × 4.2m), Bedrooms & Bath on LEFT (2.2m)

function generatePlan(carportOnLeft = true, stripGardenSideWall = false) {
  // Coordinate ranges:
  // Total Width: 5.00m, from X = -2.50 to X = +2.50
  // Total Depth: 14.50m, from Z = -7.25 to Z = +7.25
  const carportX = carportOnLeft ? { minX: -2.50, maxX: 0.30 } : { minX: -0.30, maxX: 2.50 };
  const livingX = carportOnLeft ? { minX: -2.50, maxX: 0.30 } : { minX: -0.30, maxX: 2.50 };
  const frontGardenX = carportOnLeft ? { minX: 0.30, maxX: 2.50 } : { minX: -2.50, maxX: -0.30 };
  const bed1X = carportOnLeft ? { minX: 0.30, maxX: 2.50 } : { minX: -2.50, maxX: -0.30 };
  const kitchenX = carportOnLeft ? { minX: 0.30, maxX: 2.50 } : { minX: -2.50, maxX: -0.30 };
  const bathX = carportOnLeft ? { minX: 0.30, maxX: 2.50 } : { minX: -2.50, maxX: -0.30 };
  
  // Rear zone (Exact specifications from media_1790513327300.png):
  // - Covered area: 1.2m × 6.5m (clear roof, tiled walkway)
  // - Garden strip: 1.0m × 6.5m (open to sky, step down)
  // - Bedroom 2: 2.8m width × 4.3m depth (L-shape, with window facing covered area)
  const gardenStripX = carportOnLeft ? { minX: -2.50, maxX: -1.50 } : { minX: 1.50, maxX: 2.50 };
  const coveredAreaX = carportOnLeft ? { minX: -1.50, maxX: -0.30 } : { minX: 0.30, maxX: 1.50 };
  const bed2X = carportOnLeft ? { minX: -0.30, maxX: 2.50 } : { minX: -2.50, maxX: 0.30 };

  // Interior dividing positions:
  const divX = carportOnLeft ? 0.30 : -0.30;
  const coveredWallX = carportOnLeft ? -0.30 : 0.30; // Wall dividing Covered Area from Bedroom 2
  const roofEdgeX = carportOnLeft ? -1.50 : 1.50; // Roof edge / gutter between Covered Area and Garden Strip

  const rooms = [
    {
      id: "carport",
      name: "Carport",
      area: "11.8 m² (2.8m × 4.2m)",
      bounds: { ...carportX, minZ: 3.05, maxZ: 7.25 },
      floorType: "concrete_carport",
      wallColor: "#dedede",
      hasCeiling: false,
      description: "Front vehicle carport (2.8m × 4.2m) with main house door."
    },
    {
      id: "front_garden",
      name: "Front Garden",
      area: "4.4 m² (2.2m × 2.0m)",
      bounds: { ...frontGardenX, minZ: 5.25, maxZ: 7.25 },
      floorType: "lawn",
      wallColor: "#dedede",
      hasCeiling: false,
      description: "Front landscaped garden (2.2m × 2.0m) open to the sky."
    },
    {
      id: "bedroom_1",
      name: "Bedroom 1 (Gaming & WFH)",
      area: "7.0 m² (2.2m × 3.2m)",
      bounds: { ...bed1X, minZ: 2.05, maxZ: 5.25 },
      floorType: "wood_floor",
      wallColor: "#f7f5f0",
      hasCeiling: true,
      ceilingHeight: 3.0,
      description: "Repurposable Gaming & WFH Studio (2.2m × 3.2m): 1.5m executive desk, 34\" ultrawide curved monitor, acoustic slat wall, and convertible lounge daybed / guest bed."
    },
    {
      id: "living",
      name: "Living Room",
      area: "10.5 m² (2.8m × 3.75m)",
      bounds: { ...livingX, minZ: -0.75, maxZ: 3.05 },
      floorType: "marble_tile",
      wallColor: "#fbfaf8",
      hasCeiling: true,
      ceilingHeight: 4.6,
      description: "Main living room (2.8m × 3.75m) with high 4.6m ceiling, large windows, and open flow."
    },
    {
      id: "kitchen_dining",
      name: "Kitchen + Dining",
      area: "7.0 m² (2.2m × 3.2m)",
      bounds: { ...kitchenX, minZ: -1.15, maxZ: 2.05 },
      floorType: "marble_tile",
      wallColor: "#fbfaf8",
      hasCeiling: true,
      ceilingHeight: 4.6,
      description: "Modern Kitchen Suite: Matte black handleless cabinetry, white marble countertops, glazed beige ceramic backsplash, warm LED lighting, Modena 2-burner hob, undermount sink, oak microwave tower, and tall fridge housing."
    },
    {
      id: "bathroom",
      name: "Bathroom",
      area: "4.0 m² (2.2m × 1.8m)",
      bounds: { ...bathX, minZ: -2.95, maxZ: -1.15 },
      floorType: "marble_tile",
      wallColor: "#f0eeea",
      hasCeiling: true,
      ceilingHeight: 2.8,
      description: "Bathroom (2.2m × 1.8m) with side window and hallway door."
    },
    {
      id: "covered_area",
      name: "Covered Area",
      area: "7.8 m² (1.2m × 6.5m)",
      bounds: { ...coveredAreaX, minZ: -7.25, maxZ: -0.75 },
      floorType: "garden_corridor",
      wallColor: "#dedede",
      hasCeiling: false,
      description: "Covered patio walkway (1.2m × 6.5m) with translucent clear roof and tile floor."
    },
    {
      id: "garden_strip",
      name: "Garden Strip",
      area: "6.5 m² (1.0m × 6.5m)",
      bounds: { ...gardenStripX, minZ: -7.25, maxZ: -0.75 },
      floorType: "lawn",
      wallColor: "#dedede",
      hasCeiling: false,
      stepDown: true,
      description: "Open rear garden strip (1.0m × 6.5m), step-down, open to the sky."
    },
    {
      id: "hallway",
      name: "Hallway",
      area: "1.9 m² (0.6m × 3.15m)",
      bounds: { minX: Math.min(divX, coveredWallX), maxX: Math.max(divX, coveredWallX), minZ: -3.90, maxZ: -0.75 },
      floorType: "marble_tile",
      wallColor: "#fbfaf8",
      hasCeiling: true,
      ceilingHeight: 3.0,
      description: "Hallway connecting living room to bathroom, bedroom 2, and covered patio."
    },
    {
      id: "bedroom_2",
      name: "Bedroom 2 (L-shape)",
      area: "11.5 m² (4.3m deep L-shape)",
      bounds: { ...bed2X, minZ: -7.25, maxZ: -2.95 },
      subBounds: [
        // Front alcove under bathroom: 2.2m wide x 0.95m deep (Z from -3.90 to -2.95)
        { minX: bathX.minX, maxX: bathX.maxX, minZ: -3.90, maxZ: -2.95 },
        // Rear main room: 2.8m wide x 3.35m deep (Z from -7.25 to -3.90)
        { minX: Math.min(bathX.minX, coveredWallX), maxX: Math.max(bathX.maxX, coveredWallX), minZ: -7.25, maxZ: -3.90 }
      ],
      floorType: "wood_floor",
      wallColor: "#f7f5f0",
      hasCeiling: true,
      ceilingHeight: 3.0,
      description: "Rear master bedroom (4.3m deep L-shape) with hallway door."
    }
  ];

  const walls = [
    // ----------------------------------------------------
    // LOT PERIMETER WALLS (5.00m × 14.50m)
    // ----------------------------------------------------
    // West Boundary Wall (X = -2.50)
    // Carport boundary segment (Z in [3.05, 7.25])
    { x1: -2.50, z1: 7.25, x2: -2.50, z2: 3.05, height: 2.6, thickness: 0.15, openings: [] },

    // Living Room west wall (Z in [-0.75, 3.05])
    {
      x1: -2.50, z1: 3.05, x2: -2.50, z2: -0.75, height: 4.6, thickness: 0.15,
      openings: []
    },

    // Rear garden strip boundary wall (Z in [-7.25, -0.75])
    { x1: -2.50, z1: -0.75, x2: -2.50, z2: -7.25, height: 3.0, thickness: 0.15, openings: [] },

    // East Boundary Wall (X = +2.50)
    // Front & Bedroom 1 boundary (Z in [2.05, 7.25])
    { x1: 2.50, z1: 7.25, x2: 2.50, z2: 2.05, height: 3.0, thickness: 0.15, openings: [] },

    // Kitchen high-ceiling boundary (Z in [-1.15, 2.05])
    { x1: 2.50, z1: 2.05, x2: 2.50, z2: -1.15, height: 4.6, thickness: 0.15, openings: [] },

    // Bathroom & Bedroom 2 boundary (Z in [-7.25, -1.15])
    {
      x1: 2.50, z1: -1.15, x2: 2.50, z2: -7.25, height: 3.0, thickness: 0.15,
      openings: [
        // Side window for Bathroom (Z = -2.05)
        { offset: 0.90, width: 0.80, height: 0.70, bottom: 1.8, type: 'window' }
      ]
    },

    // Rear Boundary Wall (Z = -7.25)
    { x1: -2.50, z1: -7.25, x2: 2.50, z2: -7.25, height: 3.0, thickness: 0.15, openings: [] },

    // ----------------------------------------------------
    // FRONT ZONE
    // ----------------------------------------------------
    // Wall between Front Garden and Carport (Z in [5.25, 7.25], X = divX)
    { x1: divX, z1: 7.25, x2: divX, z2: 5.25, height: 0.6, thickness: 0.12, openings: [] },

    // Front wall of Bedroom 1 facing Front Garden (Z = 5.25)
    // Contains BEDROOM 1 WINDOW:
    {
      x1: frontGardenX.minX, z1: 5.25, x2: frontGardenX.maxX, z2: 5.25,
      height: 3.0, thickness: 0.15,
      openings: [
        { offset: 0.40, width: 1.40, height: 1.60, bottom: 0.8, type: 'window' }
      ]
    },

    // Wall dividing Bedroom 1 from Carport (X = divX, Z in [3.05, 5.25])
    { x1: divX, z1: 5.25, x2: divX, z2: 3.05, height: 3.0, thickness: 0.12, openings: [] },

    // ----------------------------------------------------
    // MAIN DOOR & LIVING ROOM (4.6m HIGH CEILING)
    // ----------------------------------------------------
    // Wall dividing Carport from Living Room (Z = 3.05, X in carportX)
    // Reaches 4.6m high ceiling with MAIN DOOR:
    {
      x1: carportX.minX, z1: 3.05, x2: carportX.maxX, z2: 3.05, height: 4.6, thickness: 0.15,
      openings: [
        { offset: 1.60, width: 0.95, height: 2.30, bottom: 0.0, type: 'door' }
      ]
    },

    // Solid wall segment between Bedroom 1 and Living Room (X = divX, Z in [2.05, 3.05])
    {
      x1: divX, z1: 3.05, x2: divX, z2: 2.05, height: 4.6, thickness: 0.12,
      openings: []
    },

    // Wall dividing Bedroom 1 from Kitchen + Dining (Z = 2.05, X in bed1X)
    // Reaches 4.6m high ceiling with BEDROOM 1 DOOR:
    {
      x1: bed1X.minX, z1: 2.05, x2: bed1X.maxX, z2: 2.05, height: 4.6, thickness: 0.12,
      openings: [
        { offset: 0.15, width: 0.85, height: 2.25, bottom: 0.0, type: 'door' }
      ]
    },

    // Upper Drop Wall at Z = -0.75 (from Y = 3.0m to Y = 4.6m)
    // Encloses the high ceiling of the Living Room, completely covering the zone above hallway:
    {
      x1: -2.50, z1: -0.75, x2: divX, z2: -0.75,
      bottom: 3.0, height: 4.6, thickness: 0.15,
      openings: []
    },

    // Upper Drop Wall at X = divX (from Z = -0.75 to Z = -1.15, Y = 3.0m to 4.6m)
    // Walls off the vertical gap between Living Room rear drop wall (Z = -0.75) and Kitchen rear wall (Z = -1.15):
    {
      x1: divX, z1: -0.75, x2: divX, z2: -1.15,
      bottom: 3.0, height: 4.6, thickness: 0.15,
      openings: []
    },


    // ----------------------------------------------------
    // REAR ZONE
    // ----------------------------------------------------
    // Wall dividing Kitchen from Bathroom (Z = -1.15, X in kitchenX)
    { x1: kitchenX.minX, z1: -1.15, x2: kitchenX.maxX, z2: -1.15, height: 4.6, thickness: 0.12, openings: [] },

    // Wall with Bathroom door (X = divX, Z in [-2.95, -1.15])
    {
      x1: divX, z1: -1.15, x2: divX, z2: -2.95, height: 3.0, thickness: 0.12,
      openings: [
        { offset: 0.45, width: 0.85, height: 2.20, bottom: 0.0, type: 'door' }
      ]
    },

    // Wall dividing Bathroom from Bedroom 2 (Z = -2.95, X in bathX)
    { x1: bathX.minX, z1: -2.95, x2: bathX.maxX, z2: -2.95, height: 3.0, thickness: 0.12, openings: [] },

    // Front section of Bedroom 2 wall facing Hallway (X = divX, Z in [-3.90, -2.95])
    // Contains BEDROOM 2 DOOR (facing into the hallway, matching blueprint!):
    {
      x1: divX, z1: -2.95, x2: divX, z2: -3.90, height: 3.0, thickness: 0.12,
      openings: [
        { offset: 0.05, width: 0.85, height: 2.25, bottom: 0.0, type: 'door' }
      ]
    },

    // Horizontal step wall of Bedroom 2 (Z = -3.90, X between divX and coveredWallX):
    {
      x1: Math.min(divX, coveredWallX), z1: -3.90, x2: Math.max(divX, coveredWallX), z2: -3.90,
      height: 3.0, thickness: 0.12,
      openings: []
    }
  ];

  // Wall dividing Bedroom 2 from Covered Area (X = coveredWallX, Z in [-7.25, -3.90])
  if (!stripGardenSideWall) {
    walls.push({
      x1: coveredWallX, z1: -3.90, x2: coveredWallX, z2: -7.25,
      height: 3.0, thickness: 0.15,
      openings: []
    });
  }


  // Dimension lines matching media_1790513327300.png annotations
  const dimensionLines = [
    { label: "Carport: 2.8m × 4.2m", start: [carportX.minX, 0.05, 5.15], end: [carportX.maxX, 0.05, 5.15] },
    { label: "Carport Depth: 4.2m", start: [carportOnLeft ? -2.65 : 2.65, 0.05, 7.25], end: [carportOnLeft ? -2.65 : 2.65, 0.05, 3.05] },
    { label: "Garden: 2.2m × 2.0m", start: [frontGardenX.minX, 0.05, 6.25], end: [frontGardenX.maxX, 0.05, 6.25] },
    { label: "Bedroom 1: 2.2m × 3.2m", start: [carportOnLeft ? 2.65 : -2.65, 0.05, 5.25], end: [carportOnLeft ? 2.65 : -2.65, 0.05, 2.05] },
    { label: "Living Room: 2.8m × 3.75m", start: [livingX.minX, 0.05, 1.15], end: [livingX.maxX, 0.05, 1.15] },
    { label: "Kitchen + Dining: 2.2m × 3.2m", start: [carportOnLeft ? 2.65 : -2.65, 0.05, 2.05], end: [carportOnLeft ? 2.65 : -2.65, 0.05, -1.15] },
    { label: "Bathroom: 2.2m × 1.8m", start: [carportOnLeft ? 2.65 : -2.65, 0.05, -1.15], end: [carportOnLeft ? 2.65 : -2.65, 0.05, -2.95] },
    { label: "Covered: 1.2m × 6.5m (clear roof)", start: [coveredAreaX.minX, 0.05, -4.0], end: [coveredAreaX.maxX, 0.05, -4.0] },
    { label: "Garden Strip: 1.0m × 6.5m (open)", start: [gardenStripX.minX, 0.05, -4.0], end: [gardenStripX.maxX, 0.05, -4.0] },
    { label: "Rear Depth: 6.5m", start: [carportOnLeft ? -2.65 : 2.65, 0.05, -0.75], end: [carportOnLeft ? -2.65 : 2.65, 0.05, -7.25] },
    { label: "Bedroom 2: L-shape 4.3m", start: [bed2X.minX, 0.05, -5.10], end: [bed2X.maxX, 0.05, -5.10] },
    { label: "Total Width: 5.0m", start: [-2.50, 0.05, 7.55], end: [2.50, 0.05, 7.55] },
    { label: "Total Length: 14.5m", start: [-2.85, 0.05, 7.25], end: [-2.85, 0.05, -7.25] }
  ];



  const playerSpawn = {
    x: carportOnLeft ? -0.80 : 0.80,
    y: 1.65,
    z: 5.20,
    rotY: Math.PI
  };

  return {
    name: carportOnLeft ? "Actual Floor Plan (Carport Left)" : "Actual Floor Plan (Carport Right)",
    carportOnLeft,
    ceilingHeight: 3.0,
    wallThickness: 0.15,
    innerWallThickness: 0.12,
    playerSpawn,
    rooms,
    walls,
    dimensionLines
  };
}

// Default is Carport on Left (Flipped from original render per user request)
export const DEFAULT_HOUSE_DATA = generatePlan(true, false);

export function getHouseData(carportOnLeft = true, stripGardenSideWall = false) {
  return generatePlan(carportOnLeft, stripGardenSideWall);
}

