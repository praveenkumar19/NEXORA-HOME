/**
 * ============================================================================
 * NEXORA HOME — Smart Living OS (Full Build)
 * Vanilla JavaScript application architecture
 * ============================================================================
 */

(function () {
  'use strict';

  /* ==========================================================================
     SECTION 1 — DEFAULT STATE
     ========================================================================== */
  const DEFAULT_STATE = {
    theme: 'dark',
    activeRoomFilter: 'all',
    activeScene: 'home',
    energyPeriod: 'daily',
    ac: { power: true, temp: 24, mode: 'cool', speed: 'medium', ambient: 24.2 },
    security: {
      mode: 'arm',
      alertActive: true,
      alertTitle: 'Motion detected in Backyard',
      alertLocation: 'Backyard Camera #02',
      doorLocks: 'Locked',
      cameras: 'Online (4/4)',
      windows: 'All Secure',
      motion: 'Enabled'
    },
    settings: {
      userName: 'Praveen Kumar',
      homeName: 'NEXORA Residence',
      tempUnit: 'C',
      currency: '₹',
      simulation: true,
      sound: true
    },
    devices: [
      { id: 'dev-1',  name: 'Living Room Light',     room: 'Living Room', category: 'light',     icon: '💡', state: true,  statusText: '80% Brightness',      powerW: 18,   brightness: 80, extraType: 'slider' },
      { id: 'dev-2',  name: 'Air Conditioner',       room: 'Living Room', category: 'ac',        icon: '❄️', state: true,  statusText: 'Cooling to 24°C',     powerW: 1250, temp: 24,       extraType: 'ac' },
      { id: 'dev-3',  name: 'Ceiling Fan',           room: 'Living Room', category: 'fan',       icon: '🌀', state: true,  statusText: 'Speed 2 • High Flow', powerW: 65,   speed: 2,       extraType: 'speed' },
      { id: 'dev-4',  name: 'Smart OLED TV',         room: 'Living Room', category: 'tv',        icon: '📺', state: true,  statusText: 'HDMI 1 • 4K HDR',     powerW: 110,  volume: 24,     extraType: 'volume' },
      { id: 'dev-5',  name: 'Smart Door Lock',       room: 'Living Room', category: 'lock',      icon: '🔒', state: true,  statusText: 'Locked • Battery 94%',powerW: 2,                    extraType: 'lock' },
      { id: 'dev-6',  name: 'Security Camera',       room: 'Living Room', category: 'camera',    icon: '📷', state: true,  statusText: '1080p Live Stream',   powerW: 12,                   extraType: 'camera' },
      { id: 'dev-7',  name: 'Water Purifier',        room: 'Kitchen',     category: 'purifier',  icon: '💧', state: true,  statusText: 'TDS: 48 ppm',         powerW: 45,                   extraType: 'purifier' },
      { id: 'dev-8',  name: 'Smart Coffee Maker',    room: 'Kitchen',     category: 'coffee',    icon: '☕', state: false, statusText: 'Standby • Ready',     powerW: 850,                  extraType: 'coffee' },
      { id: 'dev-9',  name: 'Bedroom Ambient Light', room: 'Bedroom',     category: 'light',     icon: '💡', state: true,  statusText: '40% Warm Amber',      powerW: 12,   brightness: 40, extraType: 'slider' },
      { id: 'dev-10', name: 'Air Purifier Pro',      room: 'Bedroom',     category: 'airpurifier',icon:'🍃', state: true,  statusText: 'AQI: 24 • Good',      powerW: 32,                   extraType: 'air' },
      { id: 'dev-11', name: 'Study Desk Lamp',       room: 'Study Room',  category: 'light',     icon: '💡', state: false, statusText: 'Reading Profile (Off)',powerW: 14,  brightness: 90, extraType: 'slider' },
      { id: 'dev-12', name: 'Smart Geyser',          room: 'Bathroom',    category: 'heater',    icon: '🚿', state: false, statusText: 'Water Temp: 42°C',     powerW: 1800,                 extraType: 'heater' }
    ],
    rooms: [
      { name: 'Living Room', icon: '🏠', temp: 24.2, humidity: 62 },
      { name: 'Bedroom',     icon: '🛏️', temp: 23.5, humidity: 58 },
      { name: 'Kitchen',     icon: '🍳', temp: 25.0, humidity: 65 },
      { name: 'Bathroom',    icon: '🚿', temp: 24.8, humidity: 74 },
      { name: 'Study Room',  icon: '💼', temp: 23.0, humidity: 55 }
    ],
    automations: [
      { id: 'auto-1', title: 'Good Night',       icon: '🌙', conditions: 'Lights OFF, Lock doors, AC to 24°C', enabled: true,  action: 'night' },
      { id: 'auto-2', title: 'Morning Routine',  icon: '⏰', conditions: 'Bedroom light ON, Coffee brew',       enabled: true,  action: 'morning' },
      { id: 'auto-3', title: 'Away Mode',        icon: '🚪', conditions: 'All OFF, Lock doors, Cameras armed',  enabled: false, action: 'away' },
      { id: 'auto-4', title: 'Movie Night',      icon: '🎬', conditions: 'Living light 15%, TV ON, AC silent',  enabled: true,  action: 'movie' }
    ],
    notifications: [
      { id: 'n1', title: 'Security Notice: Motion in Backyard', time: '2 mins ago',  type: 'alert',   read: false, icon: '⚠️' },
      { id: 'n2', title: 'Energy consumption increased by 12%', time: '1 hour ago',  type: 'warning', read: false, icon: '⚡' },
      { id: 'n3', title: 'Front door locked successfully',      time: '3 hours ago', type: 'success', read: false, icon: '🔒' },
      { id: 'n4', title: 'Bedroom light has been ON for 4 hours',time:'4 hours ago', type: 'info',    read: true,  icon: '💡' }
    ],
    energyMetrics: { todayKwh: 3.2, weekKwh: 21.7, monthKwh: 87.4, costMultiplier: 8.5 }
  };

  let appState = deepClone(DEFAULT_STATE);
  let audioContext = null;
  const STORAGE_KEY = 'NEXORA_SMART_HOME_STATE_V2';

  /* ==========================================================================
     SECTION 2 — UTILITIES
     ========================================================================== */
  function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  function debounce(fn, wait) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  /* ==========================================================================
     SECTION 3 — PERSISTENCE
     ========================================================================== */
  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(appState)); }
    catch (e) { console.warn('localStorage save failed:', e); }
  }
  const saveStateDebounced = debounce(saveState, 250);

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      appState = { ...DEFAULT_STATE, ...parsed };
      if (parsed.devices)       appState.devices = parsed.devices;
      if (parsed.automations)   appState.automations = parsed.automations;
      if (parsed.ac)            appState.ac = { ...DEFAULT_STATE.ac, ...parsed.ac };
      if (parsed.settings)      appState.settings = { ...DEFAULT_STATE.settings, ...parsed.settings };
      if (parsed.security)      appState.security = { ...DEFAULT_STATE.security, ...parsed.security };
      if (parsed.notifications) appState.notifications = parsed.notifications;
    } catch (e) {
      console.warn('localStorage load failed, using defaults:', e);
      appState = deepClone(DEFAULT_STATE);
    }
  }

  /* ==========================================================================
     SECTION 4 — AUDIO HAPTICS
     ========================================================================== */
  function playHapticSound(type = 'click') {
    if (!appState.settings.sound) return;
    try {
      if (!audioContext) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) audioContext = new AudioCtx();
      }
      if (!audioContext) return;
      if (audioContext.state === 'suspended') audioContext.resume();

      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain); gain.connect(audioContext.destination);

      const now = audioContext.currentTime;
      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(620, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);
        gain.gain.setValueAtTime(0.075, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now); osc.stop(now + 0.04);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.07);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now); osc.stop(now + 0.2);
      } else if (type === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(330, now + 0.08);
        gain.gain.setValueAtTime(0.095, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
        osc.start(now); osc.stop(now + 0.24);
      }
    } catch (_) { /* autoplay restrictions silently ignored */ }
  }

  /* ==========================================================================
     SECTION 5 — TOASTS
     ========================================================================== */
  const toastContainer = document.getElementById('toast-container');

  function showToast(message, type = 'info', iconOverride = null) {
    if (!toastContainer) return;
    const icon = iconOverride || { success: '✓', alert: '⚠️', warning: '⚡', info: 'ℹ️' }[type] || 'ℹ️';

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-icon-circle">${icon}</div>
      <div class="toast-content"><div class="toast-message">${escapeHtml(message)}</div></div>
      <div class="toast-progress"></div>`;
    toastContainer.appendChild(toast);
    playHapticSound(type === 'alert' ? 'alert' : type === 'success' ? 'success' : 'click');

    while (toastContainer.children.length > 4) toastContainer.removeChild(toastContainer.firstChild);

    const timer = setTimeout(() => removeToast(toast), 3800);
    toast.addEventListener('click', () => { clearTimeout(timer); removeToast(toast); });
  }

  function removeToast(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.add('hiding');
    setTimeout(() => toast.parentNode && toast.parentNode.removeChild(toast), 260);
  }

  /* ==========================================================================
     SECTION 6 — THEME
     ========================================================================== */
  function initTheme() {
    document.documentElement.setAttribute('data-theme', appState.theme);
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) btn.addEventListener('click', () => toggleTheme());
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault(); toggleTheme();
      }
    });
  }

  function toggleTheme(forced = null) {
    appState.theme = forced || (appState.theme === 'dark' ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', appState.theme);
    saveState();
    playHapticSound('click');
    showToast(`Switched to ${appState.theme === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
    renderEnergyChart();
  }

  /* ==========================================================================
     SECTION 7 — GREETING & LIVE CLOCK
     ========================================================================== */
  function updateGreeting() {
    const heading = document.getElementById('greeting-title');
    const sub = document.getElementById('greeting-subtext');
    if (!heading) return;

    const hour = new Date().getHours();
    let greeting = 'Good Evening', icon = '🌙', subtext = "Here's what's happening in your home today.";

    if (hour >= 5 && hour < 12)       { greeting = 'Good Morning';   icon = '☀️'; subtext = 'Rise and shine — your home is ready.'; }
    else if (hour >= 12 && hour < 17) { greeting = 'Good Afternoon'; icon = '🌤️'; subtext = 'Everything looks great today.'; }
    else if (hour >= 17 && hour < 22) { greeting = 'Good Evening';   icon = '👋'; subtext = "Here's what's happening in your home today."; }
    else                              { greeting = 'Good Night';     icon = '🌙'; subtext = 'Your home is resting peacefully.'; }

    const firstName = (appState.settings.userName || 'Praveen').split(' ')[0];
    heading.textContent = `${greeting}, ${firstName} ${icon}`;
    if (sub) sub.textContent = subtext;

    const profileDisplay = document.getElementById('profile-name-display');
    if (profileDisplay) profileDisplay.textContent = appState.settings.userName;
  }

  function initLiveClock() {
    const el = document.getElementById('live-clock-text');
    if (!el) return;
    const tick = () => {
      const now = new Date();
      el.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    tick();
    setInterval(tick, 15000);
  }

  /* ==========================================================================
     SECTION 8 — DEVICES
     ========================================================================== */
  const devicesContainer = document.getElementById('devices-container');

  function renderDevices() {
    if (!devicesContainer) return;
    devicesContainer.innerHTML = '';

    const filter = appState.activeRoomFilter;
    const filtered = filter === 'all'
      ? appState.devices
      : appState.devices.filter(d => d.room.toLowerCase() === filter.toLowerCase());

    if (filtered.length === 0) {
      devicesContainer.innerHTML = `
        <div style="grid-column:1/-1;padding:3rem 2rem;text-align:center;color:var(--text-muted);background:var(--bg-card);border:1px dashed var(--border-card);border-radius:var(--radius-lg);">
          <div style="font-size:2.2rem;margin-bottom:0.5rem;opacity:0.6;">🔍</div>
          <p style="font-size:1rem;font-weight:700;color:var(--text-primary);">No devices in ${escapeHtml(filter)}</p>
          <p style="font-size:0.8rem;margin-top:0.3rem;">Try selecting "All" or add new accessories.</p>
        </div>`;
      return;
    }

    filtered.forEach(device => {
      const card = document.createElement('div');
      card.className = `device-card ${device.state ? 'active' : ''}`;
      card.id = `device-card-${device.id}`;
      card.setAttribute('data-device-id', device.id);

      const extraControlHtml = renderDeviceExtra(device);

      card.innerHTML = `
        <div class="device-card-top">
          <div class="device-icon-circle">${device.icon}</div>
          <label class="toggle-switch" for="toggle-${device.id}">
            <input type="checkbox" id="toggle-${device.id}" class="device-power-toggle" data-device-id="${device.id}" ${device.state ? 'checked' : ''} aria-label="Toggle power for ${escapeHtml(device.name)}">
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="device-meta">
          <span class="device-name" data-device-id="${device.id}">${escapeHtml(device.name)}</span>
          <span class="device-room">${escapeHtml(device.room)}</span>
        </div>
        ${extraControlHtml}
        <div class="device-status-badge-row">
          <span class="device-status-text">
            <span class="device-status-dot"></span>
            <span class="status-val">${device.state ? escapeHtml(device.statusText) : 'Power OFF'}</span>
          </span>
          <button class="device-config-btn" data-device-id="${device.id}">Config ⚙️</button>
        </div>`;
      devicesContainer.appendChild(card);
    });

    attachDeviceListeners();
  }

  function renderDeviceExtra(device) {
    if (device.extraType === 'slider') {
      return `<div class="device-extra-control">
        <div class="device-range-row">
          <span style="font-size:0.7rem;color:var(--text-muted);">Dim</span>
          <input type="range" class="range-slider device-slider" data-device-id="${device.id}" min="1" max="100" value="${device.brightness || 80}" ${!device.state ? 'disabled' : ''}>
          <span class="range-val-label" id="val-${device.id}">${device.brightness || 80}%</span>
        </div>
      </div>`;
    }
    if (device.extraType === 'speed') {
      return `<div class="device-extra-control">
        <div style="display:flex;gap:0.3rem;">
          ${[1,2,3].map(n => `<button class="btn-sm btn-outline fan-quick-speed ${device.speed===n?'active':''}" data-device-id="${device.id}" data-speed="${n}" style="flex:1;padding:0.22rem;font-size:0.7rem;" ${!device.state?'disabled':''}>${n}</button>`).join('')}
        </div>
      </div>`;
    }
    if (device.extraType === 'ac') {
      return `<div class="device-extra-control">
        <div style="display:flex;align-items:center;justify-content:space-between;font-size:0.74rem;">
          <span style="color:var(--text-muted);">Set Temp</span>
          <span style="font-weight:700;color:var(--accent-cyan);">${device.temp}°C • ${appState.ac.mode.toUpperCase()}</span>
        </div>
      </div>`;
    }
    if (device.extraType === 'coffee') {
      return `<div class="device-extra-control">
        <button class="btn-sm btn-outline brew-coffee-btn" data-device-id="${device.id}" style="width:100%;font-size:0.72rem;">☕ Brew Espresso</button>
      </div>`;
    }
    if (device.extraType === 'camera') {
      return `<div class="device-extra-control">
        <button class="btn-sm btn-outline open-camera-feed-btn" data-device-id="${device.id}" style="width:100%;font-size:0.72rem;">🔴 View Live Feed</button>
      </div>`;
    }
    return '';
  }

  function attachDeviceListeners() {
    document.querySelectorAll('.device-power-toggle').forEach(input => {
      input.addEventListener('change', e => toggleDevice(e.target.getAttribute('data-device-id'), e.target.checked));
    });

    document.querySelectorAll('.device-slider').forEach(slider => {
      slider.addEventListener('input', e => {
        const id = e.target.getAttribute('data-device-id');
        const val = e.target.value;
        const label = document.getElementById(`val-${id}`);
        if (label) label.textContent = `${val}%`;
        const dev = appState.devices.find(d => d.id === id);
        if (dev) {
          dev.brightness = parseInt(val, 10);
          dev.statusText = `${val}% Brightness`;
          const card = document.getElementById(`device-card-${id}`);
          const statusEl = card && card.querySelector('.status-val');
          if (statusEl && dev.state) statusEl.textContent = dev.statusText;
        }
      });
      slider.addEventListener('change', e => {
        const id = e.target.getAttribute('data-device-id');
        const dev = appState.devices.find(d => d.id === id);
        if (dev) { saveState(); showToast(`${dev.name} brightness set to ${dev.brightness}%`, 'info'); }
      });
    });

    document.querySelectorAll('.fan-quick-speed').forEach(btn => {
      btn.addEventListener('click', e => {
        const id = e.currentTarget.getAttribute('data-device-id');
        const speed = parseInt(e.currentTarget.getAttribute('data-speed'), 10);
        const dev = appState.devices.find(d => d.id === id);
        if (dev) {
          dev.speed = speed;
          dev.statusText = `Speed ${speed} • Flow active`;
          renderDevices(); saveState();
          showToast(`${dev.name} set to Speed ${speed}`, 'info');
        }
      });
    });

    document.querySelectorAll('.brew-coffee-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const dev = appState.devices.find(d => d.category === 'coffee');
        if (dev) { toggleDevice(dev.id, true); showToast('Smart Coffee Maker is brewing Espresso ☕', 'success'); }
      });
    });

    document.querySelectorAll('.open-camera-feed-btn').forEach(btn => {
      btn.addEventListener('click', () => openCameraModal());
    });

    document.querySelectorAll('.device-name, .device-config-btn').forEach(el => {
      el.addEventListener('click', e => openDeviceModal(e.currentTarget.getAttribute('data-device-id')));
    });
  }

  function toggleDevice(id, forceState = null) {
    const dev = appState.devices.find(d => d.id === id);
    if (!dev) return;
    dev.state = forceState !== null ? forceState : !dev.state;

    if (dev.category === 'ac') { appState.ac.power = dev.state; syncAcUi(); }
    if (dev.category === 'lock') dev.statusText = dev.state ? 'Locked • Battery 94%' : 'Unlocked';

    playHapticSound('click');
    saveStateDebounced();
    updateDashboard();
    renderDevices();

    const stateWord = dev.state ? 'turned ON' : 'turned OFF';
    showToast(`${dev.name} ${stateWord}`, dev.state ? 'success' : 'info');
    addNotification({ title: `${dev.name} was ${stateWord}`, time: 'Just now', type: dev.state ? 'success' : 'info', icon: dev.icon });
  }

  /* ==========================================================================
     SECTION 9 — AIR CONDITIONER
     ========================================================================== */
  function initAcControls() {
    const masterPower = document.getElementById('ac-master-power');
    const tempMinus = document.getElementById('ac-temp-minus');
    const tempPlus = document.getElementById('ac-temp-plus');

    if (masterPower) {
      masterPower.checked = appState.ac.power;
      masterPower.addEventListener('change', e => {
        const acDev = appState.devices.find(d => d.category === 'ac');
        if (acDev) toggleDevice(acDev.id, e.target.checked);
      });
    }
    if (tempMinus) tempMinus.addEventListener('click', () => adjustAcTemp(-1));
    if (tempPlus)  tempPlus.addEventListener('click',  () => adjustAcTemp(1));

    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        appState.ac.mode = btn.getAttribute('data-mode');
        saveState(); playHapticSound('click');
        syncAcUi();
        showToast(`AC Mode changed to ${appState.ac.mode.toUpperCase()}`, 'info');
      });
    });

    document.querySelectorAll('.speed-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        appState.ac.speed = tab.getAttribute('data-speed');
        saveState(); playHapticSound('click');
        syncAcUi();
        showToast(`AC Fan Speed set to ${appState.ac.speed.toUpperCase()}`, 'info');
      });
    });

    syncAcUi();
  }

  function adjustAcTemp(delta) {
    let t = appState.ac.temp + delta;
    if (t < 16) t = 16;
    if (t > 30) t = 30;
    appState.ac.temp = t;
    const acDev = appState.devices.find(d => d.category === 'ac');
    if (acDev) { acDev.temp = t; acDev.statusText = `Cooling to ${t}°C`; }
    syncAcUi(); saveState(); playHapticSound('click');
    showToast(`AC Target Temperature set to ${t}°C`, 'info');
  }

  function syncAcUi() {
    const tempDisplay = document.getElementById('ac-temp-display');
    const masterPower = document.getElementById('ac-master-power');
    const dialProgress = document.getElementById('dial-progress');
    const overviewTarget = document.getElementById('overview-target-temp');
    const ambientTemp = document.getElementById('ac-ambient-temp');

    if (tempDisplay) tempDisplay.textContent = appState.ac.temp;
    if (overviewTarget) overviewTarget.textContent = `${appState.ac.temp}°C`;
    if (ambientTemp) ambientTemp.textContent = `${appState.ac.ambient.toFixed(1)}°C`;
    if (masterPower) masterPower.checked = appState.ac.power;

    if (dialProgress) {
      const ratio = (appState.ac.temp - 16) / (30 - 16);
      const dashoffset = 565 - (ratio * 380);
      dialProgress.style.strokeDashoffset = dashoffset;
      dialProgress.style.stroke = appState.ac.power ? 'var(--accent-cyan)' : 'var(--border-subtle)';
    }

    document.querySelectorAll('.mode-btn').forEach(btn => {
      const match = btn.getAttribute('data-mode') === appState.ac.mode;
      btn.classList.toggle('active', match);
      btn.setAttribute('aria-checked', match.toString());
    });
    document.querySelectorAll('.speed-tab').forEach(tab => {
      const match = tab.getAttribute('data-speed') === appState.ac.speed;
      tab.classList.toggle('active', match);
      tab.setAttribute('aria-checked', match.toString());
    });
  }

  /* ==========================================================================
     SECTION 10 — ROOMS
     ========================================================================== */
  const roomsContainer = document.getElementById('rooms-container');

  function renderRooms() {
    if (!roomsContainer) return;
    roomsContainer.innerHTML = '';

    appState.rooms.forEach(room => {
      const roomDevices = appState.devices.filter(d => d.room.toLowerCase() === room.name.toLowerCase());
      const activeCount = roomDevices.filter(d => d.state).length;

      const card = document.createElement('div');
      card.className = 'room-card';
      card.setAttribute('data-room-name', room.name);
      card.innerHTML = `
        <div class="room-card-header">
          <div class="room-icon-badge">${room.icon}</div>
          <span class="room-temp-badge">${room.temp}°C</span>
        </div>
        <div class="room-info">
          <h3 class="room-title">${escapeHtml(room.name)}</h3>
          <span class="room-meta-stats">${roomDevices.length} Devices • Humidity ${room.humidity}%</span>
        </div>
        <div class="room-card-footer">
          <span class="room-active-pill"><span class="room-active-dot"></span>${activeCount} Active</span>
          <span class="room-view-link">View →</span>
        </div>`;
      card.addEventListener('click', () => updateRoom(room.name));
      roomsContainer.appendChild(card);
    });
  }

  function updateRoom(roomName) {
    appState.activeRoomFilter = roomName;
    document.querySelectorAll('.filter-pill').forEach(pill => {
      const match = pill.getAttribute('data-room').toLowerCase() === roomName.toLowerCase();
      pill.classList.toggle('active', match);
      pill.setAttribute('aria-selected', match.toString());
    });
    renderDevices(); playHapticSound('click');
    showToast(`Filtering devices for ${roomName}`, 'info');
    const devSection = document.getElementById('section-devices');
    if (devSection) devSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ==========================================================================
     SECTION 11 — ENERGY CHART
     ========================================================================== */
  function initEnergyMonitoring() {
    document.querySelectorAll('.chart-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.chart-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        appState.energyPeriod = btn.getAttribute('data-period');
        renderEnergyChart();
        playHapticSound('click');
      });
    });
    renderEnergyChart();
  }

  function renderEnergyChart() {
    const host = document.getElementById('energy-chart-svg-host');
    const tooltip = document.getElementById('chart-tooltip');
    if (!host) return;

    const width = 600, height = 230;
    const padding = { top: 20, right: 25, bottom: 38, left: 40 };

    let dataPoints;
    if (appState.energyPeriod === 'daily') {
      dataPoints = [
        { label: '00:00', kwh: 0.4 }, { label: '04:00', kwh: 0.3 }, { label: '08:00', kwh: 0.8 },
        { label: '12:00', kwh: 1.2 }, { label: '16:00', kwh: 1.4 }, { label: '20:00', kwh: 1.8 },
        { label: 'Now', kwh: 0.9 }
      ];
    } else if (appState.energyPeriod === 'weekly') {
      dataPoints = [
        { label: 'Mon', kwh: 3.1 }, { label: 'Tue', kwh: 2.8 }, { label: 'Wed', kwh: 3.4 },
        { label: 'Thu', kwh: 2.9 }, { label: 'Fri', kwh: 3.8 }, { label: 'Sat', kwh: 4.2 },
        { label: 'Sun', kwh: 3.5 }
      ];
    } else {
      dataPoints = [
        { label: 'W1', kwh: 22.4 }, { label: 'W2', kwh: 20.8 },
        { label: 'W3', kwh: 24.1 }, { label: 'W4', kwh: 20.1 }
      ];
    }

    const maxVal = Math.max(...dataPoints.map(d => d.kwh)) * 1.25;
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    const stepX = chartW / (dataPoints.length - 1);
    const barW = Math.min(28, stepX * 0.42);

    const coords = dataPoints.map((d, i) => ({
      x: padding.left + i * stepX,
      y: padding.top + chartH - (d.kwh / maxVal) * chartH,
      baseY: padding.top + chartH,
      ...d
    }));

    let linePath = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const a = coords[i], b = coords[i + 1];
      const cx = (a.x + b.x) / 2;
      linePath += ` C ${cx} ${a.y}, ${cx} ${b.y}, ${b.x} ${b.y}`;
    }
    const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${padding.top + chartH} L ${coords[0].x} ${padding.top + chartH} Z`;

    const isLight = appState.theme === 'light';
    const gridStroke = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';
    const textFill = isLight ? '#64748b' : '#94a3b8';
    const barFill = isLight ? 'rgba(8,145,178,0.14)' : 'rgba(34,211,238,0.09)';

    let svg = `
      <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" style="width:100%;height:100%;overflow:visible;">
        <defs>
          <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.42"/>
            <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <line x1="${padding.left}" y1="${padding.top}" x2="${width - padding.right}" y2="${padding.top}" stroke="${gridStroke}" stroke-dasharray="4"/>
        <line x1="${padding.left}" y1="${padding.top + chartH/2}" x2="${width - padding.right}" y2="${padding.top + chartH/2}" stroke="${gridStroke}" stroke-dasharray="4"/>
        <line x1="${padding.left}" y1="${padding.top + chartH}" x2="${width - padding.right}" y2="${padding.top + chartH}" stroke="${gridStroke}"/>
        <path d="${areaPath}" fill="url(#energyGrad)"/>
    `;

    coords.forEach(pt => {
      svg += `<rect x="${pt.x - barW/2}" y="${pt.y}" width="${barW}" height="${padding.top + chartH - pt.y}" fill="${barFill}" rx="3"/>`;
    });

    svg += `<path d="${linePath}" fill="none" stroke="#22d3ee" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 0 6px rgba(34,211,238,0.45));"/>`;

    coords.forEach((pt, i) => {
      svg += `
        <circle cx="${pt.x}" cy="${pt.y}" r="4.5" fill="#06090f" stroke="#22d3ee" stroke-width="2.2" class="chart-point" data-index="${i}" style="cursor:pointer;transition:r 0.2s;"/>
        <text x="${pt.x}" y="${padding.top + chartH + 20}" text-anchor="middle" font-size="10.5" fill="${textFill}" font-family="Plus Jakarta Sans, sans-serif" font-weight="600">${pt.label}</text>
      `;
    });

    svg += `</svg>`;
    host.innerHTML = svg;

    host.querySelectorAll('.chart-point').forEach(point => {
      point.addEventListener('mouseenter', e => {
        const idx = parseInt(e.target.getAttribute('data-index'), 10);
        const pt = coords[idx];
        e.target.setAttribute('r', '7.5');
        if (tooltip) {
          tooltip.style.display = 'block';
          tooltip.style.left = `${(pt.x / width) * 100}%`;
          tooltip.style.top = `${(pt.y / height) * 100}%`;
          tooltip.innerHTML = `<strong>${pt.label}</strong> · ${pt.kwh} kWh<br><span style="color:var(--status-warning);font-size:0.7rem;">Est. ₹${(pt.kwh * 8.5).toFixed(1)}</span>`;
        }
      });
      point.addEventListener('mouseleave', e => {
        e.target.setAttribute('r', '4.5');
        if (tooltip) tooltip.style.display = 'none';
      });
    });
  }

  /* ==========================================================================
     SECTION 12 — CAMERA CONTROLLER (Always re-prompts for permission)
     ========================================================================== */
  const CameraController = (() => {
    let mediaStream = null;
    let currentFacingMode = 'environment';
    let overlayAnimationId = null;
    let recStartTime = null;
    let recTimerId = null;
    let resizeHandler = null;
    let els = {};

    function cacheEls() {
      els = {
        modal:       document.getElementById('camera-modal'),
        promptState: document.getElementById('cam-state-prompt'),
        loadState:   document.getElementById('cam-state-loading'),
        errorState:  document.getElementById('cam-state-error'),
        errorTitle:  document.getElementById('cam-error-title'),
        errorText:   document.getElementById('cam-error-text'),
        viewport:    document.getElementById('camera-feed-viewport'),
        video:       document.getElementById('camera-video'),
        canvas:      document.getElementById('camera-overlay-canvas'),
        liveDot:     document.getElementById('cam-live-indicator'),
        subtitle:    document.getElementById('camera-modal-subtitle'),
        recLabel:    document.getElementById('cam-rec-label'),
        recTime:     document.getElementById('cam-rec-time'),
        sourceTag:   document.getElementById('cam-source-tag'),
        resLabel:    document.getElementById('cam-res-label'),
        fpsLabel:    document.getElementById('cam-fps-label'),
        sourceLabel: document.getElementById('cam-source-label'),
        flipBtn:     document.getElementById('cam-flip-btn')
      };
    }

    function showState(state) {
      [els.promptState, els.loadState, els.errorState, els.viewport].forEach(el => {
        if (el) el.style.display = 'none';
      });
      const map = {
        prompt:  els.promptState,
        loading: els.loadState,
        error:   els.errorState,
        live:    els.viewport
      };
      if (map[state]) map[state].style.display = 'flex';
    }

    function stopStream() {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => {
          try { track.stop(); } catch (_) {}
        });
        mediaStream = null;
      }
      if (els.video) els.video.srcObject = null;
      if (overlayAnimationId) {
        cancelAnimationFrame(overlayAnimationId);
        overlayAnimationId = null;
      }
      if (recTimerId) {
        clearInterval(recTimerId);
        recTimerId = null;
      }
      if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
        resizeHandler = null;
      }
      if (els.liveDot) els.liveDot.style.display = 'none';
    }

    /**
     * Attempt to force the browser to re-prompt for camera permission.
     * Chrome/Edge: revoke() makes the browser forget previous 'granted' state.
     * Firefox: revoke() is unsupported — a jittered constraint forces a re-prompt.
     * Safari: no reliable way — we rely on the user clearing site data.
     */
    async function revokePermissionIfPossible() {
      if (!navigator.permissions || !navigator.permissions.revoke) return false;
      try {
        const status = await navigator.permissions.query({ name: 'camera' });
        // 'granted' or 'prompt' — try to revoke so the browser asks again
        if (status.state === 'granted') {
          await navigator.permissions.revoke({ name: 'camera' });
          return true;
        }
      } catch (err) {
        // revoke() throws on Firefox/Safari — ignore, fall through to jitter
        console.info('[NEXORA] permissions.revoke not supported; using constraint jitter.');
      }
      return false;
    }

    /**
     * Build constraints. Includes a per-call jitter value so browsers that
     * cache the permission per-constraint-set will treat this as a new request.
     */
    function buildConstraints() {
      // Jitter: frameRate between 29.5 and 30.5 — enough to invalidate cache
      const jitter = 29.5 + Math.random();
      return {
        video: {
          facingMode: { ideal: currentFacingMode },
          width:  { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: jitter }
        },
        audio: false
      };
    }

    async function start(silent = false) {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showError(
          'Camera API Not Supported',
          'Your browser does not support camera access, or the page is not on a secure origin (HTTPS / localhost).'
        );
        return;
      }

      if (!silent) showState('loading');

      // Step 1: Try to reset permission state so the browser re-prompts
      await revokePermissionIfPossible();

      try {
        // Step 2: Request the stream — browser should now show the prompt
        const constraints = buildConstraints();
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

        if (els.video) {
          els.video.srcObject = mediaStream;
          els.video.classList.toggle('mirrored', currentFacingMode === 'user');
          els.video.style.display = '';
          try { await els.video.play(); } catch (_) {}
        }
        if (els.canvas) els.canvas.style.display = '';

        const track = mediaStream.getVideoTracks()[0];
        const settings = track.getSettings ? track.getSettings() : {};

        if (els.resLabel)    els.resLabel.textContent    = `RES: ${settings.width || '—'}×${settings.height || '—'}`;
        if (els.fpsLabel)    els.fpsLabel.textContent    = `FPS: ${settings.frameRate ? Math.round(settings.frameRate) : '30'}`;
        if (els.sourceLabel) els.sourceLabel.textContent = `SIG: ${track.label ? track.label.slice(0, 20) : 'LOCAL'}`;
        if (els.sourceTag)   els.sourceTag.textContent   = 'SOURCE: DEVICE CAMERA';
        if (els.subtitle)    els.subtitle.textContent    = 'Live feed • Local preview only';
        if (els.recLabel)    els.recLabel.textContent    = 'REC';
        if (els.flipBtn)     els.flipBtn.style.display   = 'inline-flex';
        if (els.liveDot)     els.liveDot.style.display   = 'block';

        showState('live');
        startRecTimer();
        startOverlay();
        showToast('📷 Live camera feed active', 'success');

      } catch (err) {
        console.warn('[NEXORA] Camera error:', err);

        let title = 'Camera Access Denied';
        let text  = 'Permission was blocked. Enable it in your browser settings, or use the simulated feed.';

        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          title = 'Camera Access Denied';
          text  = "You blocked camera access. Click the camera icon in your browser's address bar to allow, then click Retry.";
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          title = 'No Camera Detected';
          text  = 'No camera was found on this device. A simulated feed can be used instead.';
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          title = 'Camera In Use';
          text  = 'Another application is using the camera. Close it and retry.';
        } else if (err.name === 'SecurityError') {
          title = 'Insecure Context';
          text  = 'Camera access requires HTTPS or localhost. Serving from file:// may block the camera API on some browsers.';
        }

        showError(title, text);
      }
    }

    function showError(title, text) {
      if (els.errorTitle) els.errorTitle.textContent = title;
      if (els.errorText)  els.errorText.textContent  = text;
      if (els.subtitle)   els.subtitle.textContent   = 'Camera unavailable';
      showState('error');
      showToast(`📷 ${title}`, 'warning');
    }

    function useSimulatedFeed() {
      stopStream();
      if (els.video) els.video.style.display = 'none';
      if (els.canvas) els.canvas.style.display = 'none';

      if (els.subtitle)    els.subtitle.textContent    = 'Simulated feed • 1080p • Night Vision';
      if (els.sourceTag)   els.sourceTag.textContent   = 'SOURCE: SIMULATED';
      if (els.resLabel)    els.resLabel.textContent    = 'RES: 1920×1080';
      if (els.fpsLabel)    els.fpsLabel.textContent    = 'FPS: 30';
      if (els.sourceLabel) els.sourceLabel.textContent = 'SIG: 98% (5GHz)';
      if (els.recLabel)    els.recLabel.textContent    = 'REC';
      if (els.flipBtn)     els.flipBtn.style.display   = 'none';
      if (els.liveDot)     els.liveDot.style.display   = 'block';

      [els.promptState, els.loadState, els.errorState].forEach(el => { if (el) el.style.display = 'none'; });
      if (els.viewport) els.viewport.style.display = 'flex';

      startRecTimer();
      showToast('🎬 Simulated camera feed active', 'info');
    }

    function startRecTimer() {
      recStartTime = Date.now();
      if (recTimerId) clearInterval(recTimerId);
      const tick = () => {
        if (!els.recTime) return;
        const elapsed = Math.floor((Date.now() - recStartTime) / 1000);
        const h = String(Math.floor(elapsed / 3600)).padStart(2, '0');
        const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
        const s = String(elapsed % 60).padStart(2, '0');
        els.recTime.textContent = `[${h}:${m}:${s}]`;
      };
      tick();
      recTimerId = setInterval(tick, 1000);
    }

    function startOverlay() {
      const canvas = els.canvas;
      if (!canvas) return;

      const resize = () => {
        const rect = canvas.getBoundingClientRect();
        canvas.width  = Math.floor(rect.width) || 640;
        canvas.height = Math.floor(rect.height) || 360;
      };
      resize();
      resizeHandler = resize;
      window.addEventListener('resize', resize);

      const ctx = canvas.getContext('2d');
      let scanY = 0;
      let cornerPulse = 0;

      const draw = () => {
        if (!canvas.width || !canvas.height) {
          overlayAnimationId = requestAnimationFrame(draw);
          return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        scanY = (scanY + 1.2) % canvas.height;
        const grad = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
        grad.addColorStop(0,   'rgba(34,211,238,0)');
        grad.addColorStop(0.5, 'rgba(34,211,238,0.35)');
        grad.addColorStop(1,   'rgba(34,211,238,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, scanY - 30, canvas.width, 60);

        cornerPulse = (cornerPulse + 0.03) % (Math.PI * 2);
        const alpha = 0.55 + Math.sin(cornerPulse) * 0.25;
        ctx.strokeStyle = `rgba(34,211,238,${alpha})`;
        ctx.lineWidth = 2;
        const pad = 24, size = 22;
        const corners = [
          [pad, pad, 1, 1],
          [canvas.width - pad, pad, -1, 1],
          [pad, canvas.height - pad, 1, -1],
          [canvas.width - pad, canvas.height - pad, -1, -1]
        ];
        corners.forEach(([x, y, dx, dy]) => {
          ctx.beginPath();
          ctx.moveTo(x + dx * size, y);
          ctx.lineTo(x, y);
          ctx.lineTo(x, y + dy * size);
          ctx.stroke();
        });

        overlayAnimationId = requestAnimationFrame(draw);
      };
      overlayAnimationId = requestAnimationFrame(draw);
    }

    function takeSnapshot() {
      if (!mediaStream || !els.video || els.video.style.display === 'none') {
        showToast('📸 Snapshot saved to cloud storage (simulated)', 'success');
        return;
      }

      try {
        const w = els.video.videoWidth  || 1280;
        const h = els.video.videoHeight || 720;

        const snap = document.createElement('canvas');
        snap.width = w; snap.height = h;
        const sctx = snap.getContext('2d');

        if (els.video.classList.contains('mirrored')) {
          sctx.translate(w, 0);
          sctx.scale(-1, 1);
        }
        sctx.drawImage(els.video, 0, 0, w, h);

        sctx.font = '16px "JetBrains Mono", monospace';
        sctx.fillStyle = 'rgba(34,211,238,0.95)';
        sctx.shadowColor = 'rgba(0,0,0,0.9)';
        sctx.shadowBlur = 4;
        sctx.fillText(`NEXORA • ${new Date().toLocaleString()}`, 16, h - 16);

        snap.toBlob(blob => {
          if (!blob) { showToast('📸 Snapshot failed', 'alert'); return; }
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `nexora-snapshot-${Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          showToast('📸 Snapshot saved to your downloads', 'success');
        }, 'image/png', 0.92);
      } catch (err) {
        console.error('Snapshot failed:', err);
        showToast('📸 Snapshot failed', 'alert');
      }
    }

    async function flipCamera() {
      if (!mediaStream) return;
      currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
      stopStream();
      await start(true);
    }

    /**
     * Called every time the modal opens.
     * Unlike the previous version, we do NOT auto-start on cached permission.
     * We always drop the user into the prompt state so they must consciously click
     * "Enable Camera" and the browser re-asks (via revoke + jitter).
     */
    function onOpen() {
      cacheEls();
      stopStream();
      if (els.video) els.video.style.display = '';
      if (els.canvas) els.canvas.style.display = '';
      showState('prompt');
    }

    function onClose() { stopStream(); }

    return { onOpen, onClose, start, useSimulatedFeed, takeSnapshot, flipCamera, stopStream };
  })();

  /* ==========================================================================
     SECTION 13 — SECURITY HUB
     ========================================================================== */
  function initSecurityHub() {
    const armBtn      = document.getElementById('sec-btn-arm');
    const nightBtn    = document.getElementById('sec-btn-night');
    const disarmBtn   = document.getElementById('sec-btn-disarm');
    const dismissBtn  = document.getElementById('dismiss-alert-btn');
    const viewCamBtn  = document.getElementById('view-camera-alert-btn');
    const alertBanner = document.getElementById('security-alert-banner');
    const simulateBtn = document.getElementById('simulate-alert-btn');

    const updateMode = (mode) => {
      appState.security.mode = mode;
      [armBtn, nightBtn, disarmBtn].forEach(b => b && b.classList.remove('active'));
      const sub = document.getElementById('security-state-subtitle');
      const navBadge = document.getElementById('nav-badge-security');

      if (mode === 'arm') {
        armBtn && armBtn.classList.add('active');
        if (sub) sub.textContent = 'Full Perimeter Armed';
        if (navBadge) navBadge.textContent = 'Armed';
        showToast('Home Security Armed (Away mode)', 'success');
      } else if (mode === 'night') {
        nightBtn && nightBtn.classList.add('active');
        if (sub) sub.textContent = 'Night Perimeter Guard';
        if (navBadge) navBadge.textContent = 'Guard';
        showToast('Night Guard Activated: exterior sensors live', 'info');
      } else {
        disarmBtn && disarmBtn.classList.add('active');
        if (sub) sub.textContent = 'System Disarmed';
        if (navBadge) navBadge.textContent = 'Disarmed';
        showToast('Security System Disarmed', 'warning');
      }
      saveState(); playHapticSound('click');
    };

    if (armBtn)    armBtn.addEventListener('click', () => updateMode('arm'));
    if (nightBtn)  nightBtn.addEventListener('click', () => updateMode('night'));
    if (disarmBtn) disarmBtn.addEventListener('click', () => updateMode('disarm'));

    if (dismissBtn) dismissBtn.addEventListener('click', () => {
      appState.security.alertActive = false;
      if (alertBanner) alertBanner.style.display = 'none';
      showToast('Security alert dismissed', 'info');
      saveState();
    });

    if (viewCamBtn) viewCamBtn.addEventListener('click', () => openCameraModal());
    if (simulateBtn) simulateBtn.addEventListener('click', triggerSimulatedSecurityAlert);

    const enableBtn   = document.getElementById('cam-enable-btn');
    const skipBtn     = document.getElementById('cam-skip-btn');
    const retryBtn    = document.getElementById('cam-retry-btn');
    const fallbackBtn = document.getElementById('cam-fallback-btn');
    const sirenBtn    = document.getElementById('cam-siren-btn');
    const snapBtn     = document.getElementById('cam-snapshot-btn');
    const flipBtn     = document.getElementById('cam-flip-btn');
    const dismissCam  = document.getElementById('cam-dismiss-notice-btn');

    if (enableBtn)   enableBtn.addEventListener('click',   () => CameraController.start());
    if (skipBtn)     skipBtn.addEventListener('click',     () => CameraController.useSimulatedFeed());
    if (retryBtn)    retryBtn.addEventListener('click',    () => CameraController.start());
    if (fallbackBtn) fallbackBtn.addEventListener('click', () => CameraController.useSimulatedFeed());
    if (flipBtn)     flipBtn.addEventListener('click',     () => CameraController.flipCamera());
    if (sirenBtn)    sirenBtn.addEventListener('click',    () => { playHapticSound('alert'); showToast('🚨 110dB Siren triggered in Backyard', 'alert'); });
    if (snapBtn)     snapBtn.addEventListener('click',     () => CameraController.takeSnapshot());
    if (dismissCam)  dismissCam.addEventListener('click',  () => {
      appState.security.alertActive = false;
      if (alertBanner) alertBanner.style.display = 'none';
      closeModal('camera-modal');
      showToast('Alert resolved & clip archived', 'success');
    });
  }

  function triggerSimulatedSecurityAlert() {
    appState.security.alertActive = true;
    const banner = document.getElementById('security-alert-banner');
    if (banner) banner.style.display = 'flex';
    addNotification({ title: '🚨 Intrusion Detection: Zone B', time: 'Just now', type: 'alert', icon: '⚠️' });
    playHapticSound('alert');
    showToast('⚠️ Security Alert: Motion detected in Backyard', 'alert');
  }

  function openCameraModal() {
    openModal('camera-modal');
    setTimeout(() => CameraController.onOpen(), 60);
  }

  /* ==========================================================================
     SECTION 14 — AUTOMATIONS
     ========================================================================== */
  const automationContainer = document.getElementById('automation-container');

  function renderAutomations() {
    if (!automationContainer) return;
    automationContainer.innerHTML = '';

    appState.automations.forEach(auto => {
      const item = document.createElement('div');
      item.className = 'automation-item';
      item.setAttribute('data-auto-id', auto.id);
      item.innerHTML = `
        <div class="automation-left">
          <div class="auto-icon-box">${auto.icon}</div>
          <div class="auto-meta">
            <span class="auto-title">${escapeHtml(auto.title)}</span>
            <span class="auto-conditions">${escapeHtml(auto.conditions)}</span>
          </div>
        </div>
        <div class="automation-actions">
          <button class="btn-run-auto" data-auto-id="${auto.id}">Run</button>
          <label class="toggle-switch">
            <input type="checkbox" class="auto-enable-toggle" data-auto-id="${auto.id}" ${auto.enabled ? 'checked' : ''} aria-label="Toggle ${escapeHtml(auto.title)}">
            <span class="toggle-slider"></span>
          </label>
        </div>`;
      automationContainer.appendChild(item);
    });

    document.querySelectorAll('.auto-enable-toggle').forEach(t => {
      t.addEventListener('change', e => {
        const auto = appState.automations.find(a => a.id === e.target.getAttribute('data-auto-id'));
        if (auto) {
          auto.enabled = e.target.checked;
          saveState(); playHapticSound('click');
          showToast(`"${auto.title}" ${auto.enabled ? 'enabled' : 'disabled'}`, 'info');
        }
      });
    });
    document.querySelectorAll('.btn-run-auto').forEach(b => {
      b.addEventListener('click', e => runAutomation(e.currentTarget.getAttribute('data-auto-id')));
    });
  }

  function runAutomation(id) {
    const auto = appState.automations.find(a => a.id === id);
    if (!auto) return;
    const item = document.querySelector(`.automation-item[data-auto-id="${id}"]`);
    if (item) item.classList.add('running');

    playHapticSound('success');
    showToast(`Executing "${auto.title}"...`, 'info');

    if (auto.action === 'night') {
      appState.devices.forEach(d => {
        if (d.category === 'light') d.state = false;
        if (d.category === 'tv') d.state = false;
        if (d.category === 'lock') d.state = true;
        if (d.category === 'ac') { d.state = true; d.temp = 24; }
      });
      appState.ac.temp = 24; appState.ac.power = true;
    } else if (auto.action === 'morning') {
      const bed = appState.devices.find(d => d.name.includes('Bedroom'));
      if (bed) bed.state = true;
      const coffee = appState.devices.find(d => d.category === 'coffee');
      if (coffee) coffee.state = true;
    } else if (auto.action === 'away') {
      appState.devices.forEach(d => {
        if (d.category !== 'lock' && d.category !== 'camera') d.state = false;
        else d.state = true;
      });
      appState.ac.power = false;
    } else if (auto.action === 'movie') {
      const light = appState.devices.find(d => d.name === 'Living Room Light');
      if (light) { light.state = true; light.brightness = 15; light.statusText = '15% Brightness'; }
      const tv = appState.devices.find(d => d.category === 'tv');
      if (tv) tv.state = true;
    }

    saveState(); updateDashboard(); renderDevices(); syncAcUi();
    setTimeout(() => {
      if (item) item.classList.remove('running');
      showToast(`"${auto.title}" completed ✓`, 'success');
    }, 500);
  }

  /* ==========================================================================
     SECTION 15 — SCENES
     ========================================================================== */
  function initScenes() {
    document.querySelectorAll('.scene-card').forEach(btn => {
      btn.addEventListener('click', () => activateScene(btn.getAttribute('data-scene')));
    });
  }

  function activateScene(sceneName) {
    appState.activeScene = sceneName;
    document.querySelectorAll('.scene-card').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-scene') === sceneName);
    });
    playHapticSound('success');

    const labels = {
      morning: 'Morning Scene activated ☀️',
      night: 'Night Scene activated 🌙',
      home: 'Home Scene activated 🏠',
      away: 'Away Scene activated 🚪',
      movie: 'Movie Mode activated 🎬',
      sleep: 'Sleep Mode activated 💤'
    };

    if (sceneName === 'morning') {
      appState.devices.forEach(d => {
        if (d.category === 'light') { d.state = true; d.brightness = 100; d.statusText = '100% Brightness'; }
        if (d.category === 'coffee') d.state = true;
      });
    } else if (sceneName === 'night') {
      appState.devices.forEach(d => {
        if (d.category === 'light') d.state = false;
        if (d.category === 'tv') d.state = false;
        if (d.category === 'lock') d.state = true;
      });
    } else if (sceneName === 'home') {
      ['dev-1', 'dev-2', 'dev-3', 'dev-7'].forEach(id => {
        const d = appState.devices.find(x => x.id === id);
        if (d) d.state = true;
      });
    } else if (sceneName === 'away') {
      appState.devices.forEach(d => {
        if (d.category !== 'camera' && d.category !== 'lock') d.state = false;
      });
      appState.security.mode = 'arm';
    } else if (sceneName === 'movie') {
      const tv = appState.devices.find(d => d.category === 'tv');
      if (tv) tv.state = true;
      const lr = appState.devices.find(d => d.id === 'dev-1');
      if (lr) { lr.state = true; lr.brightness = 15; lr.statusText = '15% Dimmer'; }
    } else if (sceneName === 'sleep') {
      appState.devices.forEach(d => {
        if (d.category === 'light') d.state = false;
        if (d.category === 'ac') { d.state = true; d.temp = 24; }
      });
      appState.ac.temp = 24;
    }

    saveState(); updateDashboard(); renderDevices(); syncAcUi();
    showToast(labels[sceneName] || `Scene "${sceneName}" activated`, 'success');

    const lastRun = document.getElementById('scene-last-run');
    if (lastRun) lastRun.textContent = 'Last run: Just now';
  }

  /* ==========================================================================
     SECTION 16 — NOTIFICATIONS
     ========================================================================== */
  function initNotifications() {
    const bell = document.getElementById('notif-bell-btn');
    const dropdown = document.getElementById('notification-dropdown');
    const markAll = document.getElementById('notif-mark-all-read');
    const sidebarBtn = document.getElementById('sidebar-notifications-btn');

    const toggleDropdown = (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('active');
      playHapticSound('click');
    };
    if (bell) bell.addEventListener('click', toggleDropdown);
    if (sidebarBtn) sidebarBtn.addEventListener('click', toggleDropdown);

    document.addEventListener('click', e => {
      if (dropdown && !dropdown.contains(e.target) && e.target !== bell) dropdown.classList.remove('active');
    });

    if (markAll) markAll.addEventListener('click', () => {
      appState.notifications.forEach(n => n.read = true);
      renderNotificationList(); saveState();
      showToast('All notifications marked as read', 'info');
    });

    renderNotificationList();
  }

  function renderNotificationList() {
    const listEl = document.getElementById('notification-list');
    const headerBadge = document.getElementById('header-unread-badge');
    const sidebarCount = document.getElementById('sidebar-unread-count');
    const dropdownCount = document.getElementById('notif-header-count');
    if (!listEl) return;

    const unread = appState.notifications.filter(n => !n.read).length;
    if (headerBadge) { headerBadge.textContent = unread; headerBadge.style.display = unread ? 'flex' : 'none'; }
    if (sidebarCount) { sidebarCount.textContent = unread; sidebarCount.style.display = unread ? 'inline-block' : 'none'; }
    if (dropdownCount) dropdownCount.textContent = `${unread} unread`;

    listEl.innerHTML = '';
    if (!appState.notifications.length) {
      listEl.innerHTML = `<div style="padding:2rem;text-align:center;color:var(--text-muted);font-size:0.85rem;">No notifications</div>`;
      return;
    }

    appState.notifications.forEach(item => {
      const row = document.createElement('div');
      row.className = `notif-item ${!item.read ? 'unread' : ''}`;
      row.innerHTML = `
        <div class="notif-icon-circle">${item.icon || '🔔'}</div>
        <div class="notif-details">
          <div class="notif-title">${escapeHtml(item.title)}</div>
          <div class="notif-time">${escapeHtml(item.time)}</div>
        </div>`;
      row.addEventListener('click', () => {
        item.read = true;
        renderNotificationList(); saveState();
      });
      listEl.appendChild(row);
    });
  }

  function addNotification(item) {
    appState.notifications.unshift({
      id: 'notif-' + Date.now(),
      title: item.title,
      time: item.time || 'Just now',
      type: item.type || 'info',
      read: false,
      icon: item.icon || '🔔'
    });
    if (appState.notifications.length > 20) appState.notifications.pop();
    renderNotificationList();
    saveStateDebounced();
  }

  /* ==========================================================================
     SECTION 17 — COMMAND PALETTE
     ========================================================================== */
  let paletteSelectedIndex = 0;
  let paletteResults = [];

  function initSearch() {
    const trigger = document.getElementById('search-trigger');
    const input = document.getElementById('global-search-input');
    const closeBtn = document.getElementById('close-search-btn');

    if (trigger) trigger.addEventListener('click', () => {
      openModal('search-modal');
      setTimeout(() => input && input.focus(), 100);
    });
    if (closeBtn) closeBtn.addEventListener('click', () => closeModal('search-modal'));

    document.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openModal('search-modal');
        setTimeout(() => input && input.focus(), 100);
      }
    });

    if (input) {
      input.addEventListener('input', e => performSearch(e.target.value.trim()));
      input.addEventListener('keydown', handlePaletteKeys);
    }

    document.querySelectorAll('.search-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        if (input) { input.value = tag.getAttribute('data-filter'); performSearch(input.value); }
      });
    });

    performSearch('');
  }

  function performSearch(query) {
    const container = document.getElementById('search-results-container');
    if (!container) return;
    container.innerHTML = '';
    paletteSelectedIndex = 0;
    const q = query.toLowerCase();

    const results = [];

    appState.devices.forEach(dev => {
      if (!q || dev.name.toLowerCase().includes(q) || dev.room.toLowerCase().includes(q) || dev.category.toLowerCase().includes(q)) {
        results.push({
          type: 'device', title: dev.name,
          subtitle: `${dev.room} • ${dev.state ? 'ON' : 'OFF'}`,
          icon: dev.icon, id: dev.id,
          action: () => { closeModal('search-modal'); openDeviceModal(dev.id); }
        });
      }
    });
    appState.rooms.forEach(room => {
      if (!q || room.name.toLowerCase().includes(q)) {
        results.push({
          type: 'room', title: room.name,
          subtitle: `${room.temp}°C • ${room.icon}`,
          icon: room.icon,
          action: () => { closeModal('search-modal'); updateRoom(room.name); }
        });
      }
    });
    appState.automations.forEach(auto => {
      if (!q || auto.title.toLowerCase().includes(q) || auto.conditions.toLowerCase().includes(q)) {
        results.push({
          type: 'automation', title: auto.title,
          subtitle: auto.conditions, icon: auto.icon, id: auto.id,
          action: () => { closeModal('search-modal'); runAutomation(auto.id); }
        });
      }
    });

    paletteResults = results;

    if (!results.length) {
      container.innerHTML = `<div style="padding:1.5rem;text-align:center;color:var(--text-muted);font-size:0.85rem;">No matching results</div>`;
      return;
    }

    results.slice(0, 8).forEach((res, i) => {
      const item = document.createElement('div');
      item.className = 'search-result-item' + (i === 0 ? ' selected' : '');
      item.setAttribute('data-index', i);
      item.innerHTML = `
        <div class="res-left">
          <span style="font-size:1.2rem;">${res.icon}</span>
          <div><div class="res-title">${escapeHtml(res.title)}</div><div class="res-category">${escapeHtml(res.subtitle)}</div></div>
        </div>
        <span class="btn-sm btn-outline" style="font-size:0.7rem;">↵</span>`;
      item.addEventListener('click', () => res.action());
      container.appendChild(item);
    });
  }

  function handlePaletteKeys(e) {
    const items = document.querySelectorAll('.search-result-item');
    if (!items.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      paletteSelectedIndex = Math.min(paletteSelectedIndex + 1, items.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      paletteSelectedIndex = Math.max(paletteSelectedIndex - 1, 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const res = paletteResults[paletteSelectedIndex];
      if (res) res.action();
      return;
    }
    items.forEach((el, i) => el.classList.toggle('selected', i === paletteSelectedIndex));
  }

  /* ==========================================================================
     SECTION 18 — MODALS
     ========================================================================== */
  function initModals() {
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', e => {
        if (e.target === modal) {
          if (modal.id === 'camera-modal') CameraController.stopStream();
          closeModal(modal.id);
        }
      });
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.active').forEach(m => {
          if (m.id === 'camera-modal') CameraController.stopStream();
          closeModal(m.id);
        });
      }
    });

    const settingsBtn = document.getElementById('sidebar-settings-btn');
    const avatar = document.getElementById('header-avatar-btn');
    const userCard = document.getElementById('user-profile-trigger');

    const openSettings = () => { populateSettingsModal(); openModal('settings-modal'); };
    if (settingsBtn) settingsBtn.addEventListener('click', openSettings);
    if (avatar) avatar.addEventListener('click', openSettings);
    if (userCard) userCard.addEventListener('click', openSettings);

    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const cancelSettings = document.getElementById('cancel-settings-btn');
    const saveSettings = document.getElementById('save-settings-btn');
    if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', () => closeModal('settings-modal'));
    if (cancelSettings) cancelSettings.addEventListener('click', () => closeModal('settings-modal'));
    if (saveSettings) saveSettings.addEventListener('click', handleSaveSettings);

    const closeCam = document.getElementById('close-camera-modal-btn');
    if (closeCam) closeCam.addEventListener('click', () => {
      CameraController.stopStream();
      closeModal('camera-modal');
    });

    const closeDev = document.getElementById('close-device-modal-btn');
    const doneDev = document.getElementById('device-modal-done-btn');
    if (closeDev) closeDev.addEventListener('click', () => closeModal('device-modal'));
    if (doneDev) doneDev.addEventListener('click', () => closeModal('device-modal'));
  }

  function openModal(id) {
    const m = document.getElementById(id);
    if (m) { m.classList.add('active'); playHapticSound('click'); document.body.style.overflow = 'hidden'; }
  }
  function closeModal(id) {
    const m = document.getElementById(id);
    if (m) { m.classList.remove('active'); document.body.style.overflow = ''; }
  }

  function openDeviceModal(deviceId) {
    const dev = appState.devices.find(d => d.id === deviceId);
    if (!dev) return;

    document.getElementById('device-modal-title').textContent = dev.name;
    document.getElementById('device-modal-room').textContent = `${dev.room} • Smart Accessory`;
    document.getElementById('device-modal-icon').textContent = dev.icon;

    const body = document.getElementById('device-modal-content');
    body.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:1rem;border-radius:var(--radius-md);background:var(--bg-card);border:1px solid var(--border-subtle);">
        <div><strong style="font-size:0.92rem;">Power Switch</strong><div style="font-size:0.74rem;color:var(--text-muted);">${dev.state ? 'Device operational' : 'Device in standby'}</div></div>
        <label class="toggle-switch"><input type="checkbox" id="modal-power-toggle" ${dev.state ? 'checked' : ''}><span class="toggle-slider"></span></label>
      </div>
      <div style="display:flex;flex-direction:column;gap:0.55rem;padding:1rem;border-radius:var(--radius-md);background:var(--bg-card);border:1px solid var(--border-subtle);">
        <div style="display:flex;justify-content:space-between;font-size:0.82rem;"><span>Current Power Draw</span><strong style="color:var(--status-warning);">${dev.state ? dev.powerW : 0} W</strong></div>
        <div style="display:flex;justify-content:space-between;font-size:0.82rem;"><span>Protocol</span><strong style="color:var(--accent-cyan);">Matter / Thread</strong></div>
        <div style="display:flex;justify-content:space-between;font-size:0.82rem;"><span>Firmware</span><span style="color:var(--text-muted);">v2.4.1</span></div>
      </div>
      <div style="padding:1rem;border-radius:var(--radius-md);background:var(--bg-card);border:1px solid var(--border-subtle);">
        <div style="font-size:0.8rem;font-weight:600;margin-bottom:0.5rem;">Auto-Off Timer</div>
        <div style="display:flex;gap:0.5rem;">
          ${[15,30,60].map(m => `<button class="btn-sm btn-outline timer-btn" data-min="${m}">${m} min</button>`).join('')}
        </div>
      </div>`;

    const toggle = body.querySelector('#modal-power-toggle');
    if (toggle) toggle.addEventListener('change', e => toggleDevice(dev.id, e.target.checked));
    body.querySelectorAll('.timer-btn').forEach(btn => {
      btn.addEventListener('click', e => showToast(`Timer set: ${dev.name} will turn off in ${e.target.getAttribute('data-min')} min`, 'info'));
    });

    openModal('device-modal');
  }

  /* ==========================================================================
     SECTION 19 — SETTINGS
     ========================================================================== */
  function populateSettingsModal() {
    document.getElementById('setting-user-name').value = appState.settings.userName;
    document.getElementById('setting-home-name').value = appState.settings.homeName;
    document.getElementById('setting-currency').value = appState.settings.currency;
    document.getElementById('setting-simulation-toggle').checked = appState.settings.simulation;
    document.getElementById('setting-sound-toggle').checked = appState.settings.sound;
    document.querySelectorAll('.unit-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tempunit') === appState.settings.tempUnit);
    });
  }

  function handleSaveSettings() {
    appState.settings.userName = document.getElementById('setting-user-name').value.trim() || 'Praveen Kumar';
    appState.settings.homeName = document.getElementById('setting-home-name').value.trim() || 'NEXORA Residence';
    appState.settings.currency = document.getElementById('setting-currency').value;
    appState.settings.simulation = document.getElementById('setting-simulation-toggle').checked;
    appState.settings.sound = document.getElementById('setting-sound-toggle').checked;

    saveState(); updateGreeting(); updateDashboard();
    closeModal('settings-modal');
    showToast('System Settings updated ✓', 'success');
  }

  /* ==========================================================================
     SECTION 20 — DASHBOARD RECALC
     ========================================================================== */
  function updateDashboard() {
    const activeCount = appState.devices.filter(d => d.state).length;
    const totalCount = appState.devices.length;
    let totalWatts = 0;
    appState.devices.forEach(d => { if (d.state) totalWatts += d.powerW; });

    const overviewActive = document.getElementById('overview-active-devices');
    const navBadge = document.getElementById('nav-badge-devices');
    const overviewPower = document.getElementById('overview-power-draw');
    const overviewCost = document.getElementById('overview-cost-est');
    const statBill = document.getElementById('energy-stat-bill');

    if (overviewActive) overviewActive.textContent = activeCount;
    if (navBadge) navBadge.textContent = `${activeCount}/${totalCount}`;
    if (overviewPower) overviewPower.textContent = `${totalWatts.toLocaleString()} W`;

    const est = Math.round(appState.energyMetrics.monthKwh * appState.energyMetrics.costMultiplier);
    const curr = appState.settings.currency || '₹';
    if (overviewCost) overviewCost.textContent = `${curr}${est}`;
    if (statBill) statBill.textContent = `${curr}${est}`;

    const tempVal = document.getElementById('overview-temp-value');
    if (tempVal) tempVal.textContent = appState.ac.temp;

    renderRooms();
  }

  /* ==========================================================================
     SECTION 21 — SIMULATION ENGINE
     ========================================================================== */
  function initSimulationEngine() {
    setInterval(() => {
      if (!appState.settings.simulation) return;

      if (appState.ac.power) {
        const diff = appState.ac.temp - appState.ac.ambient;
        appState.ac.ambient += diff * 0.08;
      } else {
        appState.ac.ambient += (26.0 - appState.ac.ambient) * 0.03;
      }

      const activeWatts = appState.devices.filter(d => d.state).reduce((s, d) => s + d.powerW, 0);
      if (activeWatts > 0) {
        const add = (activeWatts / 1000) * (6 / 3600);
        appState.energyMetrics.todayKwh += add;
        appState.energyMetrics.monthKwh += add;
        const todayEl = document.getElementById('overview-energy-value');
        const statToday = document.getElementById('energy-stat-today');
        if (todayEl) todayEl.textContent = appState.energyMetrics.todayKwh.toFixed(1);
        if (statToday) statToday.innerHTML = `${appState.energyMetrics.todayKwh.toFixed(1)} <small>kWh</small>`;
      }

      const ambientLabel = document.getElementById('ac-ambient-temp');
      if (ambientLabel) ambientLabel.textContent = `${appState.ac.ambient.toFixed(1)}°C`;

      const camClock = document.getElementById('cam-live-clock');
      if (camClock) {
        const now = new Date();
        camClock.textContent = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
      }
    }, 6000);
  }

  /* ==========================================================================
     SECTION 22 — NAVIGATION
     ========================================================================== */
  function initNavigation() {
    const sidebar = document.getElementById('sidebar');
    const collapseBtn = document.getElementById('sidebar-collapse-btn');
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const backdrop = document.getElementById('sidebar-backdrop');

    if (collapseBtn) collapseBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      playHapticSound('click');
    });

    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        sidebar.classList.toggle('collapsed');
        playHapticSound('click');
      }
    });

    if (mobileBtn) mobileBtn.addEventListener('click', () => {
      sidebar.classList.add('mobile-open');
      backdrop.classList.add('active');
      playHapticSound('click');
    });
    if (backdrop) backdrop.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      backdrop.classList.remove('active');
    });

    document.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', e => updateRoom(e.currentTarget.getAttribute('data-room')));
    });

    document.querySelectorAll('.nav-link[data-section]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        const section = link.getAttribute('data-section');
        const map = {
          dashboard: 'main-content',
          rooms: 'section-rooms',
          devices: 'section-devices',
          energy: 'section-energy',
          analytics: 'section-energy',
          automation: 'section-automations',
          security: 'section-security-hub'
        };
        const target = document.getElementById(map[section]);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        sidebar.classList.remove('mobile-open');
        backdrop.classList.remove('active');
      });
    });

    const resetBtn = document.getElementById('reset-factory-data-btn');
    if (resetBtn) resetBtn.addEventListener('click', () => {
      if (confirm('Reset all smart home data to factory defaults?')) {
        localStorage.removeItem(STORAGE_KEY);
        appState = deepClone(DEFAULT_STATE);
        saveState();
        window.location.reload();
      }
    });

    document.querySelectorAll('.unit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.unit-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        appState.settings.tempUnit = btn.getAttribute('data-tempunit');
      });
    });

    const allDev = document.getElementById('all-devices-shortcut');
    if (allDev) allDev.addEventListener('click', () => updateRoom('all'));

    const manageZones = document.getElementById('manage-zones-btn');
    if (manageZones) manageZones.addEventListener('click', () => showToast('All 5 zones synced with Matter gateway', 'info'));

    const addAuto = document.getElementById('add-automation-btn');
    if (addAuto) addAuto.addEventListener('click', () => showToast('Rule Builder: choose trigger + action', 'info'));

    const scheduleBtn = document.getElementById('device-modal-schedule-btn');
    if (scheduleBtn) scheduleBtn.addEventListener('click', () => showToast('Schedule editor opened', 'info'));
  }

  /* ==========================================================================
     SECTION 23 — MASTER INIT
     ========================================================================== */
  function initializeApp() {
    loadState();
    initTheme();
    updateGreeting();
    initLiveClock();
    renderDevices();
    renderRooms();
    initAcControls();
    initEnergyMonitoring();
    initSecurityHub();
    renderAutomations();
    initScenes();
    initNotifications();
    initSearch();
    initModals();
    initNavigation();
    updateDashboard();
    initSimulationEngine();
    console.log('%cNEXORA HOME OS','background:linear-gradient(135deg,#22d3ee,#3b82f6);color:#fff;padding:4px 12px;border-radius:6px;font-weight:700;','initialized.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }

})();