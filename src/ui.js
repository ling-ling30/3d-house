export class UIManager {
  constructor(app) {
    this.app = app;
    this.dom = {};
    this.initDOM();
    this.initMinimap();
    this.bindEvents();
  }

  initDOM() {
    const root = document.getElementById('app');
    root.innerHTML = `
      <!-- Crosshair for Walk Mode -->
      <div id="crosshair"></div>

      <!-- Header & Room Badge -->
      <header id="hud-header">
        <div class="brand">
          <span class="brand-badge">3D ARCHITECT</span>
          <h1 id="project-title">Modern Villa (5.00m × 14.50m)</h1>
        </div>
        <div id="room-card">
          <div class="room-indicator">
            <span class="live-dot"></span>
            <span id="current-room-name">Dollhouse 3D Overview</span>
          </div>
          <div class="room-meta">
            <span id="room-area">5.00m × 14.50m Lot</span>
            <span class="meta-divider">•</span>
            <span id="coords-text">X: 0.0m | Z: 0.0m</span>
          </div>
        </div>
      </header>

      <!-- Minimap Container -->
      <div id="minimap-wrapper">
        <div class="minimap-header">
          <span>FLOOR PLAN</span>
          <span class="minimap-hint">Click to jump</span>
          <button id="btn-toggle-minimap" class="minimap-toggle-btn" title="Toggle Minimap">✕</button>
        </div>
        <canvas id="minimap-canvas" width="160" height="300"></canvas>
      </div>
      <button id="btn-floating-map" class="floating-map-btn" style="display: none;" title="Open Floor Plan">🗺️ Plan</button>

      <!-- Click to Enter Walk Mode Overlay -->
      <div id="click-overlay" class="hidden">
        <div class="overlay-modal">
          <div class="overlay-icon">🏡</div>
          <h2>First-Person Walkthrough</h2>
          <p>Explore this 5.00m × 14.50m house in first-person mode with realistic scale and lighting.</p>
          
          <div class="controls-guide">
            <div class="key-row"><span class="key-pill">W</span><span class="key-pill">A</span><span class="key-pill">S</span><span class="key-pill">D</span> <span>Walk (or Arrow Keys)</span></div>
            <div class="key-row"><span class="key-pill">Q</span><span class="key-pill">E</span> <span>Turn Left / Right</span></div>
            <div class="key-row"><span class="key-pill">MOUSE</span> <span>Look Around (Drag or Click)</span></div>
            <div class="key-row"><span class="key-pill">SHIFT</span> <span>Sprint</span></div>
            <div class="key-row"><span class="key-pill">ESC</span> <span>Release Mouse Pointer</span></div>
          </div>

          <button id="btn-start-walk" class="btn-primary">
            <span>Enter Walkthrough</span>
            <span class="btn-arrow">→</span>
          </button>
        </div>
      </div>

      <!-- Quick Room Drawer / Teleporter Bar -->
      <div id="room-teleport-bar">
        <button class="room-pill active" data-room="carport">Carport (2.8×4.2m)</button>
        <button class="room-pill" data-room="front_garden">Front Garden (2.2×2m)</button>
        <button class="room-pill" data-room="bedroom_1">Bedroom 1 (2.2×3.2m)</button>
        <button class="room-pill" data-room="living">Living Room (2.8×3.75m)</button>
        <button class="room-pill" data-room="kitchen_dining">Kitchen + Dining</button>
        <button class="room-pill" data-room="bathroom">Bathroom (2.2×1.8m)</button>
        <button class="room-pill" data-room="hallway">Hallway</button>
        <button class="room-pill" data-room="covered_area">Covered Area (1.2×6.5m)</button>
        <button class="room-pill" data-room="garden_strip">Garden Strip (1.0×6.5m)</button>
        <button class="room-pill" data-room="bedroom_2">Bedroom 2 (L-shape 4.3m)</button>
      </div>



      <!-- Bottom Control Toolbar -->
      <footer id="hud-toolbar">
        <div class="toolbar-group">
          <button id="btn-mode-dollhouse" class="tool-btn active" title="Overhead 3D Dollhouse View (SketchUp style)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>Dollhouse 3D</span>
          </button>
          <button id="btn-mode-walk" class="tool-btn" title="First-Person Walk Mode">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 4v16"/><path d="M17 4v16"/><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13"/></svg>
            <span>Walk Mode</span>
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <div class="toolbar-group">
          <button id="btn-preset-day" class="tool-btn active" title="Daylight">
            <span>☀️ Day</span>
          </button>
          <button id="btn-preset-sunset" class="tool-btn" title="Golden Sunset">
            <span>🌅 Sunset</span>
          </button>
          <button id="btn-preset-night" class="tool-btn" title="Night Lights">
            <span>🌙 Night</span>
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <div class="toolbar-group">
          <button id="btn-toggle-dimensions" class="tool-btn" title="Toggle Metric Dimension Lines">
            <span>📐 Dimensions</span>
          </button>
          <button id="btn-toggle-sound" class="tool-btn" title="Toggle Footstep Sounds">
            <span>🔊 Sound</span>
          </button>
          <button id="btn-custom-plan" class="tool-btn" title="Open Custom Plan & Measurements Editor">
            <span>📋 Edit JSON</span>
          </button>
        </div>
      </footer>

      <!-- Virtual Touch Joystick for Walk Mode -->
      <div id="virtual-joystick" class="touch-ctrl" style="display: none;">
        <div id="joystick-base">
          <div id="joystick-knob"></div>
          <span class="j-dir j-up">▲</span>
          <span class="j-dir j-dn">▼</span>
          <span class="j-dir j-lf">◀</span>
          <span class="j-dir j-rt">▶</span>
        </div>
        <div class="j-label">SWIPE TO MOVE</div>
      </div>

      <!-- Quick Turn & Swipe-to-Look Controls -->
      <div id="touch-look-controls" class="touch-ctrl" style="display: none;">
        <div class="look-turn-btns">
          <button id="btn-turn-left" class="turn-chip" title="Turn Left 45°">↺ 45°</button>
          <button id="btn-turn-right" class="turn-chip" title="Turn Right 45°">45° ↻</button>
        </div>
        <div class="look-hint-pill">👉 Swipe screen to look around</div>
      </div>

      <!-- Custom Plan / Measurements Editor Modal -->
      <div id="plan-modal" class="modal-backdrop hidden">
        <div class="plan-dialog">
          <div class="dialog-header">
            <div>
              <h3>House Measurements & Layout Editor</h3>
              <p>View or adjust the exact architectural metrics, room sizes, or load your custom plan.</p>
            </div>
            <button id="btn-close-modal" class="btn-close">&times;</button>
          </div>
          <div class="dialog-body">
            <label for="plan-json-input"><strong>Layout Configuration (JSON):</strong></label>
            <textarea id="plan-json-input" spellcheck="false"></textarea>
            <div class="json-tips">
              <span>💡 You can edit room widths, depths, or add custom rooms. All numbers are in meters.</span>
            </div>
          </div>
          <div class="dialog-footer">
            <button id="btn-reset-plan" class="btn-secondary">Reset to Default</button>
            <button id="btn-apply-plan" class="btn-primary">Apply & Rebuild 3D House</button>
          </div>
        </div>
      </div>
    `;

    // Cache elements
    this.dom.currentRoomName = document.getElementById('current-room-name');
    this.dom.roomArea = document.getElementById('room-area');
    this.dom.coordsText = document.getElementById('coords-text');
    this.dom.overlay = document.getElementById('click-overlay');
    this.dom.btnStartWalk = document.getElementById('btn-start-walk');
    this.dom.btnModeWalk = document.getElementById('btn-mode-walk');
    this.dom.btnModeDollhouse = document.getElementById('btn-mode-dollhouse');
    this.dom.btnDay = document.getElementById('btn-preset-day');
    this.dom.btnSunset = document.getElementById('btn-preset-sunset');
    this.dom.btnNight = document.getElementById('btn-preset-night');
    this.dom.btnDimensions = document.getElementById('btn-toggle-dimensions');
    this.dom.btnSound = document.getElementById('btn-toggle-sound');
    this.dom.btnCustomPlan = document.getElementById('btn-custom-plan');
    this.dom.planModal = document.getElementById('plan-modal');
    this.dom.btnCloseModal = document.getElementById('btn-close-modal');
    this.dom.btnApplyPlan = document.getElementById('btn-apply-plan');
    this.dom.btnResetPlan = document.getElementById('btn-reset-plan');
    this.dom.planJsonInput = document.getElementById('plan-json-input');
    this.dom.minimapCanvas = document.getElementById('minimap-canvas');
    this.dom.roomPills = document.querySelectorAll('.room-pill');
  }

  initMinimap() {
    this.mmCtx = this.dom.minimapCanvas.getContext('2d');
    // Map bounds: X: [-2.9, 2.9], Z: [-8.0, 8.0] (Exact 5m x 14.5m proportion)
    this.mapBounds = { minX: -2.9, maxX: 2.9, minZ: -8.0, maxZ: 8.0 };
  }

  bindEvents() {
    // Start Walk click
    this.dom.btnStartWalk.addEventListener('click', () => {
      this.app.setMode('walk');
      this.app.fpsController.lock();
    });

    // Toolbar modes
    this.dom.btnModeWalk.addEventListener('click', () => {
      this.app.setMode('walk');
      this.app.fpsController.lock();
    });

    this.dom.btnModeDollhouse.addEventListener('click', () => {
      this.app.setMode('dollhouse');
    });

    // Lighting
    this.dom.btnDay.addEventListener('click', () => this.app.setLighting('day'));
    this.dom.btnSunset.addEventListener('click', () => this.app.setLighting('sunset'));
    this.dom.btnNight.addEventListener('click', () => this.app.setLighting('night'));

    // Dimensions toggle
    this.dom.btnDimensions.addEventListener('click', () => {
      const active = this.app.toggleDimensions();
      this.dom.btnDimensions.classList.toggle('active', active);
    });

    // Sound toggle
    this.dom.btnSound.addEventListener('click', () => {
      const muted = this.app.toggleSound();
      this.dom.btnSound.classList.toggle('active', !muted);
      this.dom.btnSound.querySelector('span').innerText = muted ? '🔇 Muted' : '🔊 Sound';
    });

    // Room quick teleport pills
    this.dom.roomPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const roomId = pill.getAttribute('data-room');
        this.app.teleportToRoom(roomId);
        this.dom.roomPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      });
    });

    // Minimap click-to-teleport
    this.dom.minimapCanvas.addEventListener('click', (e) => {
      const rect = this.dom.minimapCanvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const worldPos = this.minimapToWorld(clickX, clickY);
      this.app.teleportToCoords(worldPos.x, worldPos.z);
    });

    // Quick Turn buttons (45 degree snappy turn)
    const btnTurnL = document.getElementById('btn-turn-left');
    if (btnTurnL) {
      btnTurnL.addEventListener('click', (e) => {
        e.stopPropagation();
        this.app.fpsController.quickTurn(Math.PI / 4);
      });
    }

    const btnTurnR = document.getElementById('btn-turn-right');
    if (btnTurnR) {
      btnTurnR.addEventListener('click', (e) => {
        e.stopPropagation();
        this.app.fpsController.quickTurn(-Math.PI / 4);
      });
    }

    // Minimap toggle for clean mobile screen
    const btnToggleMap = document.getElementById('btn-toggle-minimap');
    const btnFloatMap = document.getElementById('btn-floating-map');
    const mapWrap = document.getElementById('minimap-wrapper');

    if (btnToggleMap && btnFloatMap && mapWrap) {
      btnToggleMap.addEventListener('click', (e) => {
        e.stopPropagation();
        mapWrap.style.display = 'none';
        btnFloatMap.style.display = 'flex';
      });

      btnFloatMap.addEventListener('click', (e) => {
        e.stopPropagation();
        mapWrap.style.display = 'flex';
        btnFloatMap.style.display = 'none';
      });
    }

    // Plan Editor Modal
    this.dom.btnCustomPlan.addEventListener('click', () => {
      this.dom.planJsonInput.value = JSON.stringify(this.app.currentHouseData, null, 2);
      this.dom.planModal.classList.remove('hidden');
    });

    this.dom.btnCloseModal.addEventListener('click', () => {
      this.dom.planModal.classList.add('hidden');
    });

    this.dom.btnApplyPlan.addEventListener('click', () => {
      try {
        const parsed = JSON.parse(this.dom.planJsonInput.value);
        const res = this.app.loadCustomHouse(parsed);
        if (res.success) {
          this.dom.planModal.classList.add('hidden');
        } else {
          alert('Error loading house: ' + res.error);
        }
      } catch (e) {
        alert('Invalid JSON: ' + e.message);
      }
    });

    this.dom.btnResetPlan.addEventListener('click', () => {
      this.dom.planJsonInput.value = JSON.stringify(this.app.currentHouseData, null, 2);
    });
  }

  updateAfterPlanReload() {
    this.dom.roomPills = document.querySelectorAll('.room-pill');
    this.dom.roomPills.forEach(pill => {
      pill.onclick = () => {
        const roomId = pill.getAttribute('data-room');
        this.app.teleportToRoom(roomId);
        this.dom.roomPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      };
    });
  }

  worldToMinimap(wx, wz) {
    const b = this.mapBounds;
    const w = this.dom.minimapCanvas.width;
    const h = this.dom.minimapCanvas.height;
    const nx = (wx - b.minX) / (b.maxX - b.minX);
    const nz = (wz - b.minZ) / (b.maxZ - b.minZ);
    return {
      x: nx * w,
      y: (1 - nz) * h
    };
  }

  minimapToWorld(mx, my) {
    const b = this.mapBounds;
    const w = this.dom.minimapCanvas.width;
    const h = this.dom.minimapCanvas.height;
    const nx = mx / w;
    const ny = 1 - (my / h);
    return {
      x: b.minX + nx * (b.maxX - b.minX),
      z: b.minZ + ny * (b.maxZ - b.minZ)
    };
  }

  update() {
    let playerX = 0, playerZ = 0, headingAngle = 0;

    if (this.app.mode === 'walk') {
      const pos = (this.app.fpsController && typeof this.app.fpsController.getPosition === 'function')
        ? this.app.fpsController.getPosition()
        : this.app.camera.position;
      playerX = pos.x;
      playerZ = pos.z;
      headingAngle = (this.app.fpsController && typeof this.app.fpsController.getYaw === 'function')
        ? this.app.fpsController.getYaw()
        : this.app.camera.rotation.y;

      const currentRoom = this.app.fpsController.getCurrentRoom();
      if (currentRoom) {
        this.dom.currentRoomName.innerText = currentRoom.name;
        this.dom.roomArea.innerText = currentRoom.area;

        this.dom.roomPills.forEach(pill => {
          pill.classList.toggle('active', pill.getAttribute('data-room') === currentRoom.id);
        });
      }

      this.dom.coordsText.innerText = `X: ${playerX.toFixed(1)}m | Z: ${playerZ.toFixed(1)}m`;
    } else {
      // Dollhouse mode
      const cam = this.app.camera.position;
      this.dom.currentRoomName.innerText = "Dollhouse 3D Overview";
      this.dom.roomArea.innerText = "5.00m × 14.50m Lot";
      this.dom.coordsText.innerText = "Architectural Model";
    }

    this.renderMinimap(playerX, playerZ, headingAngle);
  }

  renderMinimap(playerX, playerZ, headingAngle) {
    const ctx = this.mmCtx;
    const w = this.dom.minimapCanvas.width;
    const h = this.dom.minimapCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Subtle grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let gx = 0; gx < w; gx += 22) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, h);
      ctx.stroke();
    }
    for (let gy = 0; gy < h; gy += 22) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();
    }

    // Draw rooms
    const rooms = this.app.currentHouseData.rooms || [];
    rooms.forEach(r => {
      if (r.id === 'garden_strip' || r.id === 'front_garden') {
        ctx.fillStyle = 'rgba(34, 197, 94, 0.25)';
        ctx.strokeStyle = '#22c55e';
      } else if (r.id === 'covered_area') {
        ctx.fillStyle = 'rgba(251, 146, 60, 0.25)';
        ctx.strokeStyle = '#fb923c';
      } else if (r.id === 'carport') {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.2)';
        ctx.strokeStyle = '#94a3b8';
      } else {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.strokeStyle = '#38bdf8';
      }

      ctx.lineWidth = 1.5;
      const boxes = (r.subBounds && r.subBounds.length > 0) ? r.subBounds : [r.bounds];
      boxes.forEach(b => {
        const p1 = this.worldToMinimap(b.minX, b.maxZ);
        const p2 = this.worldToMinimap(b.maxX, b.minZ);
        const rw = p2.x - p1.x;
        const rh = p2.y - p1.y;
        ctx.fillRect(p1.x, p1.y, rw, rh);
        ctx.strokeRect(p1.x, p1.y, rw, rh);
      });

      // Room short label (centered on primary bounding box)
      const b = r.bounds;
      const p1 = this.worldToMinimap(b.minX, b.maxZ);
      const p2 = this.worldToMinimap(b.maxX, b.minZ);
      const rw = p2.x - p1.x;
      const rh = p2.y - p1.y;
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 9px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      const shortName = r.name.split(' ')[0];
      ctx.fillText(shortName, p1.x + rw / 2, p1.y + rh / 2 + 3);
    });

    // Draw player position in Walk mode
    if (this.app.mode === 'walk') {
      const playerMapPos = this.worldToMinimap(playerX, playerZ);

      // Vision cone
      ctx.save();
      ctx.translate(playerMapPos.x, playerMapPos.y);
      const mapAngle = -headingAngle - Math.PI / 2;
      ctx.rotate(mapAngle);

      ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 26, -Math.PI / 4, Math.PI / 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Player dot
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(playerMapPos.x, playerMapPos.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  setModeUI(mode) {
    this.dom.btnModeWalk.classList.toggle('active', mode === 'walk');
    this.dom.btnModeDollhouse.classList.toggle('active', mode === 'dollhouse');
    const crosshair = document.getElementById('crosshair');
    if (crosshair) crosshair.style.display = mode === 'walk' ? 'block' : 'none';

    const joystick = document.getElementById('virtual-joystick');
    if (joystick) joystick.style.display = mode === 'walk' ? 'flex' : 'none';

    const lookControls = document.getElementById('touch-look-controls');
    if (lookControls) lookControls.style.display = mode === 'walk' ? 'flex' : 'none';

    if (mode === 'dollhouse') {
      this.dom.overlay.classList.add('hidden');
    }
  }

  setLightingUI(preset) {
    this.dom.btnDay.classList.toggle('active', preset === 'day');
    this.dom.btnSunset.classList.toggle('active', preset === 'sunset');
    this.dom.btnNight.classList.toggle('active', preset === 'night');
  }
}
