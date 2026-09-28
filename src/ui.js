export class UIManager {
  constructor(app) {
    this.app = app;
    this.dom = {};
    this.menuVisible = false;
    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    const root = document.getElementById('app');
    root.innerHTML = `
      <!-- Crosshair for Walk Mode -->
      <div id="crosshair"></div>

      <!-- Interactive Object Action Prompt -->
      <div id="interaction-prompt" class="interaction-pill hidden">
        <span class="interact-key-badge">CLICK / F</span>
        <span id="interaction-label">Open</span>
      </div>

      <!-- Minimal Top-Left Header: Simple Room Badge + Menu Button -->
      <header id="hud-header">
        <div id="room-card" class="simple-room-badge">
          <span class="live-dot"></span>
          <span id="current-room-name">Living Room</span>
        </div>
        <button id="btn-toggle-menu" class="menu-toggle-btn" title="Toggle Controls & Rooms Menu">
          <svg class="menu-icon-bars" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
            <line x1="4" y1="7" x2="20" y2="7"></line>
            <line x1="4" y1="12" x2="20" y2="12"></line>
            <line x1="4" y1="17" x2="20" y2="17"></line>
          </svg>
          <span id="menu-btn-text">Menu</span>
        </button>
      </header>

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

      <!-- Quick Room Drawer / Teleporter Bar (Hidden by default) -->
      <div id="room-teleport-bar" class="menu-hidden">
        <button class="room-pill active" data-room="carport">Carport (2.8×4.2m)</button>
        <button class="room-pill" data-room="front_garden">Front Garden (2.2×2m)</button>
        <button class="room-pill" data-room="bedroom_1">Bedroom 1 (Gaming Room)</button>
        <button class="room-pill" data-room="living">Living Room (2.8×3.75m)</button>
        <button class="room-pill" data-room="kitchen_dining">Kitchen + Dining</button>
        <button class="room-pill" data-room="bathroom">Bathroom (2.2×1.8m)</button>
        <button class="room-pill" data-room="hallway">Hallway</button>
        <button class="room-pill" data-room="covered_area">Covered Area (1.2×6.5m)</button>
        <button class="room-pill" data-room="garden_strip">Garden Strip (1.0×6.5m)</button>
        <button class="room-pill" data-room="bedroom_2">Bedroom 2 (L-shape 4.3m)</button>
      </div>

      <!-- Bottom Control Toolbar (Hidden by default) -->
      <footer id="hud-toolbar" class="menu-hidden">
        <div class="toolbar-group">
          <button id="btn-mode-walk" class="tool-btn active" title="Walk Mode (Ground eye-level walkthrough with wall collisions)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="2"/><path d="m9 20 3-6 3 6"/><path d="m6 10 6 3 6-3"/></svg>
            <span>Walk Mode</span>
          </button>
          <button id="btn-mode-free" class="tool-btn" title="Free Camera Flight (Fly anywhere with WASD + Mouse / Mobile Swipe)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            <span>Free Fly</span>
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
          <button id="btn-toggle-roof" class="tool-btn active" title="Toggle Ceiling & Roof Glass Visibility">
            <span>🏠 Roof</span>
          </button>
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

      <!-- Virtual Touch Joystick for Free Fly & Walk Mode -->
      <div id="virtual-joystick" class="touch-ctrl" style="display: none;">
        <div id="joystick-base">
          <div id="joystick-knob"></div>
          <span class="j-dir j-up">▲</span>
          <span class="j-dir j-dn">▼</span>
          <span class="j-dir j-lf">◀</span>
          <span class="j-dir j-rt">▶</span>
        </div>
        <div class="j-label">MOVE / WALK</div>
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
    this.dom.btnModeFree = document.getElementById('btn-mode-free');
    this.dom.btnToggleRoof = document.getElementById('btn-toggle-roof');
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
    this.dom.roomPills = document.querySelectorAll('.room-pill');
    this.dom.btnToggleMenu = document.getElementById('btn-toggle-menu');
    this.dom.menuBtnText = document.getElementById('menu-btn-text');
    this.dom.hudToolbar = document.getElementById('hud-toolbar');
    this.dom.roomTeleportBar = document.getElementById('room-teleport-bar');
    this.dom.interactionPrompt = document.getElementById('interaction-prompt');
    this.dom.interactionLabel = document.getElementById('interaction-label');
  }

  showInteractionPrompt(label, key = 'CLICK / F') {
    if (this.dom.interactionLabel) this.dom.interactionLabel.innerText = label;
    const badge = this.dom.interactionPrompt ? this.dom.interactionPrompt.querySelector('.interact-key-badge') : null;
    if (badge) badge.innerText = key;
    if (this.dom.interactionPrompt) this.dom.interactionPrompt.classList.remove('hidden');
  }

  hideInteractionPrompt() {
    if (this.dom.interactionPrompt) this.dom.interactionPrompt.classList.add('hidden');
  }

  bindEvents() {
    // Interaction prompt click
    if (this.dom.interactionPrompt) {
      this.dom.interactionPrompt.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.app.triggerInteraction) {
          this.app.triggerInteraction();
        }
      });
    }

    // Menu toggle button
    if (this.dom.btnToggleMenu) {
      this.dom.btnToggleMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMenu();
      });
    }

    // Start Walk click
    if (this.dom.btnStartWalk) {
      this.dom.btnStartWalk.addEventListener('click', () => {
        this.app.setMode('walk');
        this.app.fpsController.lock();
      });
    }

    // Toolbar modes
    if (this.dom.btnModeWalk) {
      this.dom.btnModeWalk.addEventListener('click', () => {
        this.app.setMode('walk');
        this.app.fpsController.lock();
      });
    }

    if (this.dom.btnModeFree) {
      this.dom.btnModeFree.addEventListener('click', () => {
        this.app.setMode('free');
        this.app.freeCameraController.lock();
      });
    }

    // Roof toggle
    if (this.dom.btnToggleRoof) {
      this.dom.btnToggleRoof.addEventListener('click', () => {
        const vis = this.app.toggleRoof();
        this.dom.btnToggleRoof.classList.toggle('active', vis);
        this.dom.btnToggleRoof.querySelector('span').innerText = vis ? '🏠 Roof' : '🚫 No Roof';
      });
    }

    // Lighting
    if (this.dom.btnDay) this.dom.btnDay.addEventListener('click', () => this.app.setLighting('day'));
    if (this.dom.btnSunset) this.dom.btnSunset.addEventListener('click', () => this.app.setLighting('sunset'));
    if (this.dom.btnNight) this.dom.btnNight.addEventListener('click', () => this.app.setLighting('night'));

    // Dimensions toggle
    if (this.dom.btnDimensions) {
      this.dom.btnDimensions.addEventListener('click', () => {
        const active = this.app.toggleDimensions();
        this.dom.btnDimensions.classList.toggle('active', active);
      });
    }

    // Sound toggle
    if (this.dom.btnSound) {
      this.dom.btnSound.addEventListener('click', () => {
        const muted = this.app.toggleSound();
        this.dom.btnSound.classList.toggle('active', !muted);
        this.dom.btnSound.querySelector('span').innerText = muted ? '🔇 Muted' : '🔊 Sound';
      });
    }

    // Room quick teleport pills
    this.dom.roomPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const roomId = pill.getAttribute('data-room');
        this.app.teleportToRoom(roomId);
        this.dom.roomPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      });
    });

    // Quick Turn buttons (45 degree snappy turn)
    const btnTurnL = document.getElementById('btn-turn-left');
    if (btnTurnL) {
      btnTurnL.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.app.mode === 'walk') {
          this.app.fpsController.quickTurn(Math.PI / 4);
        } else {
          this.app.freeCameraController.quickTurn(Math.PI / 4);
        }
      });
    }

    const btnTurnR = document.getElementById('btn-turn-right');
    if (btnTurnR) {
      btnTurnR.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.app.mode === 'walk') {
          this.app.fpsController.quickTurn(-Math.PI / 4);
        } else {
          this.app.freeCameraController.quickTurn(-Math.PI / 4);
        }
      });
    }

    // Plan Editor Modal
    if (this.dom.btnCustomPlan) {
      this.dom.btnCustomPlan.addEventListener('click', () => {
        this.dom.planJsonInput.value = JSON.stringify(this.app.currentHouseData, null, 2);
        this.dom.planModal.classList.remove('hidden');
      });
    }

    if (this.dom.btnCloseModal) {
      this.dom.btnCloseModal.addEventListener('click', () => {
        this.dom.planModal.classList.add('hidden');
      });
    }

    if (this.dom.btnApplyPlan) {
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
    }

    if (this.dom.btnResetPlan) {
      this.dom.btnResetPlan.addEventListener('click', () => {
        this.dom.planJsonInput.value = JSON.stringify(this.app.currentHouseData, null, 2);
      });
    }
  }

  toggleMenu(forceState) {
    this.menuVisible = forceState !== undefined ? forceState : !this.menuVisible;
    if (this.dom.hudToolbar) {
      this.dom.hudToolbar.classList.toggle('menu-hidden', !this.menuVisible);
    }
    if (this.dom.roomTeleportBar) {
      this.dom.roomTeleportBar.classList.toggle('menu-hidden', !this.menuVisible);
    }
    if (this.dom.btnToggleMenu) {
      this.dom.btnToggleMenu.classList.toggle('active', this.menuVisible);
    }
    if (this.dom.menuBtnText) {
      this.dom.menuBtnText.innerText = this.menuVisible ? 'Close' : 'Menu';
    }
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

  update() {
    let playerX = 0, playerZ = 0;

    if (this.app.mode === 'walk') {
      const pos = (this.app.fpsController && typeof this.app.fpsController.getPosition === 'function')
        ? this.app.fpsController.getPosition()
        : this.app.camera.position;
      playerX = pos.x;
      playerZ = pos.z;

      const currentRoom = this.app.fpsController.getCurrentRoom();
      if (currentRoom) {
        if (this.dom.currentRoomName) this.dom.currentRoomName.innerText = currentRoom.name;
        if (this.dom.roomArea) this.dom.roomArea.innerText = currentRoom.area;

        this.dom.roomPills.forEach(pill => {
          pill.classList.toggle('active', pill.getAttribute('data-room') === currentRoom.id);
        });
      }

      if (this.dom.coordsText) {
        this.dom.coordsText.innerText = `X: ${playerX.toFixed(1)}m | Z: ${playerZ.toFixed(1)}m`;
      }
    } else {
      // Free Flight mode
      const cam = this.app.camera.position;
      playerX = cam.x;
      playerZ = cam.z;

      let currentRoom = null;
      if (this.app.fpsController && typeof this.app.fpsController.getRoomAt === 'function') {
        currentRoom = this.app.fpsController.getRoomAt(playerX, playerZ);
      } else if (this.app.fpsController && typeof this.app.fpsController.getCurrentRoom === 'function') {
        currentRoom = this.app.fpsController.getCurrentRoom();
      }

      if (currentRoom && currentRoom.id !== 'outside') {
        if (this.dom.currentRoomName) this.dom.currentRoomName.innerText = `Free Fly: ${currentRoom.name}`;
        if (this.dom.roomArea) this.dom.roomArea.innerText = currentRoom.area || '';
        this.dom.roomPills.forEach(pill => {
          pill.classList.toggle('active', pill.getAttribute('data-room') === currentRoom.id);
        });
      } else {
        if (this.dom.currentRoomName) this.dom.currentRoomName.innerText = "Free Fly Camera";
        if (this.dom.roomArea) this.dom.roomArea.innerText = "6-DOF Aerial Flight";
      }

      if (this.dom.coordsText) {
        this.dom.coordsText.innerText = `X: ${playerX.toFixed(1)}m | Y: ${cam.y.toFixed(1)}m | Z: ${playerZ.toFixed(1)}m`;
      }
    }
  }

  setModeUI(mode) {
    if (this.dom.btnModeWalk) this.dom.btnModeWalk.classList.toggle('active', mode === 'walk');
    if (this.dom.btnModeFree) this.dom.btnModeFree.classList.toggle('active', mode === 'free');

    const crosshair = document.getElementById('crosshair');
    if (crosshair) crosshair.style.display = 'block';

    const joystick = document.getElementById('virtual-joystick');
    if (joystick) joystick.style.display = 'flex';

    const lookControls = document.getElementById('touch-look-controls');
    if (lookControls) lookControls.style.display = 'flex';

    if (this.dom.overlay) {
      this.dom.overlay.classList.add('hidden');
    }

    this.showModeHint(mode);
  }

  showModeHint(mode) {
    let hint = document.getElementById('walk-mode-toast');
    if (!hint) {
      hint = document.createElement('div');
      hint.id = 'walk-mode-toast';
      document.body.appendChild(hint);
    }
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (mode === 'free') {
      hint.innerText = isTouch
        ? '✈️ Free Fly: Aim by swiping • Push joystick forward to fly where you look'
        : '✈️ Free Fly: WASD to fly where you look • Move mouse to aim • Shift to boost';
    } else {
      hint.innerText = isTouch
        ? '🚶 Walk Mode: Left pad to walk • Swipe screen to look around'
        : '🚶 Walk Mode: WASD to walk • Mouse to look around • Shift to sprint';
    }
    hint.style.display = 'block';
    hint.style.opacity = '1';
    clearTimeout(this.hintTimeout);
    this.hintTimeout = setTimeout(() => {
      hint.style.opacity = '0';
      setTimeout(() => { hint.style.display = 'none'; }, 500);
    }, 4500);
  }

  setLightingUI(preset) {
    if (this.dom.btnDay) this.dom.btnDay.classList.toggle('active', preset === 'day');
    if (this.dom.btnSunset) this.dom.btnSunset.classList.toggle('active', preset === 'sunset');
    if (this.dom.btnNight) this.dom.btnNight.classList.toggle('active', preset === 'night');
  }
}
