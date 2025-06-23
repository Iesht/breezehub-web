import { openMain, showWindow } from '../navigation.js';
import { buttons, updateHeader } from '../header.js';
import { openDeviceControlModal } from '../modal.js';
import { powerDevice } from '../deviceApi.js';

export function renderRooms(rooms, onSettingsClick) {
  const listContainer = document.getElementById('rooms-list');
  const template = document.getElementById('room-template').content;
  listContainer.innerHTML = '';
  rooms.forEach(room => {
    const clone = document.importNode(template, true);
    clone.querySelector('.room-name').innerHTML =
      room.name + (room.hasAlert ? ' <span class="alert-icon">⚠️</span>' : '');
    clone.querySelector('.temperature').textContent = room.temperature;
    clone.querySelector('.co2-value').textContent = room.co2;
    clone.querySelector('.heater-percentage').textContent = room.heaterLoad + '%';
    const loadCircle = clone.querySelector('.load-circle');
    loadCircle.style.setProperty('--clip-path', 'inset(0 0 0 0)');
    requestAnimationFrame(() => {
      loadCircle.style.setProperty(
        '--clip-path',
        `inset(0 0 ${room.heaterLoad}% 0)`
      );
    });
    if (room.hasAlert) clone.querySelector('.room-card').classList.add('warning');
    clone.querySelector('.room-settings').addEventListener('click', () => onSettingsClick(room.id));
    listContainer.appendChild(clone);
  });
}

export function renderLoading(isLoading) {
  document.getElementById('loading-overlay').classList.toggle('hidden', !isLoading);
}

export function renderError(error) {
  document.getElementById('error-message').textContent = error;
  document.getElementById('error-container').classList.remove('hidden');
}

document.getElementById('error-close').addEventListener('click', () => {
  document.getElementById('error-container').classList.add('hidden');
});

export function renderRoomDetail(room) {
  showWindow('room-window');
  updateHeader({ activeLabel: '', buttons });
  const loadCircle = document.getElementById('room-load-circle');
  loadCircle.style.setProperty('--clip-path', 'inset(0 0 0 0)');
  loadCircle.style.setProperty('--clip-path', `inset(0 0 ${room.heaterLoad}% 0)`);
  document.getElementById('room-name').innerHTML =
    room.name + (room.hasAlert ? ' <span class="alert-icon">⚠️</span>' : '');
  document.getElementById('room-name').dataset.roomId = room.id;
  document.getElementById('room-temp').textContent = room.temperature;
  document.getElementById('room-co2').textContent = room.co2;
  document.getElementById('room-load').textContent = room.heaterLoad + '%';
  const devContainer = document.getElementById('devices');
  devContainer.innerHTML = '';
  room.devices?.forEach(d => devContainer.appendChild(createDeviceCard(d)));
  const sensContainer = document.getElementById('sensors');
  sensContainer.innerHTML = '';
  room.sensors?.forEach(s => sensContainer.appendChild(createSensorCard(s)));
}

document.getElementById('room-back').addEventListener('click', openMain);

function adjustButtonPosition(buttonId) {
  const btn = document.getElementById(buttonId);
  const footer = document.querySelector('footer');
  if (!btn || !footer) return;
  const overlap = window.innerHeight - footer.getBoundingClientRect().top;
  btn.style.bottom = overlap > 0 ? `${overlap + 45}px` : '20px';
}

function adjustAllButtons() {
  adjustButtonPosition('create-room-button');
  adjustButtonPosition('room-back');
}

window.addEventListener('scroll', adjustAllButtons);
window.addEventListener('resize', adjustAllButtons);

document.addEventListener('DOMContentLoaded', adjustAllButtons);

function createDeviceCard(dev) {
  const modeSvgs = {
    quiet: `
      <svg viewBox="0 0 24 24" class="icon">
        <path d="m21.067 11.857l-.642-.388zm-8.924-8.924l-.388-.642zM21.25 12A9.25 9.25 0 0 1 12 21.25v1.5c5.937 0 10.75-4.813 10.75-10.75zM12 21.25A9.25 9.25 0 0 1 2.75 12h-1.5c0 5.937 4.813 10.75 10.75 10.75zM2.75 12A9.25 9.25 0 0 1 12 2.75v-1.5C6.063 1.25 1.25 6.063 1.25 12zm12.75 2.25A5.75 5.75 0 0 1 9.75 8.5h-1.5a7.25 7.25 0 0 0 7.25 7.25zm4.925-2.781A5.75 5.75 0 0 1 15.5 14.25v1.5a7.25 7.25 0 0 0 6.21-3.505zM9.75 8.5a5.75 5.75 0 0 1 2.781-4.925l-.776-1.284A7.25 7.25 0 0 0 8.25 8.5zM12 2.75a.38.38 0 0 1-.268-.118a.3.3 0 0 1-.082-.155c-.004-.031-.002-.121.105-.186l.776 1.284c.503-.304.665-.861.606-1.299c-.062-.455-.42-1.026-1.137-1.026zm9.71 9.495c-.066.107-.156.109-.187.105a.3.3 0 0 1-.155-.082a.38.38 0 0 1-.118-.268h1.5c0-.717-.571-1.075-1.026-1.137c-.438-.059-.995.103-1.299.606z"/>
      </svg>
    `, normal: `
      <svg viewBox="0 0 24 24" class="icon">
        <g fill="none"><g clip-path="url(#sunClip)"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M3 12H1m22 0h-2m-9 9v2m0-22v2M5.636 18.364l-1.414 1.414M19.778 4.222l-1.414 1.414m-12.728 0L4.222 4.222m15.556 15.556l-1.414-1.414M18 12a6 6 0 1 1-12 0a6 6 0 0 1 12 0"/>
        </g><defs><clipPath id="sunClip"><path fill="#fff" d="M0 0h24v24H0z"/></clipPath></defs></g>
      </svg>
    `, strong: `
      <svg viewBox="0 0 24 24" class="icon">
        <path d="M4 13h4v7H4zm6-6h4v13h-4zm6 3h4v10h-4z"/>
      </svg>
    `, turbo: `
      <svg viewBox="0 0 24 24" class="icon">
        <path d="M13 2L3 14h7v8l10-12h-7z"/>
      </svg>
    `
  };

  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div class="title">${dev.name}</div>
    <div class="menu"><i class="fa-solid fa-ellipsis"></i></div>
    <div class="pill">
      <div class="left">
        <i class="fa-solid fa-temperature-half"></i>${dev.temperature}°C
      </div>
      <div class="knob" data-tooltip="${getModeName(dev.mode)}">
        ${modeSvgs[dev.mode] || modeSvgs.normal}
      </div>
      <div class="right" style="display:flex;align-items:center;gap:12px;">
        ${dev.hasTimer ? '<img src="/assets/images/icons/mdi--clipboard-text-time-outline.svg" alt="По расписанию">' : ''}
        <div class="status-label">${dev.isOn ? 'ON' : 'OFF'}</div>
        <div class="toggle ${dev.isOn ? '' : 'off'}" tabindex="0"></div>
      </div>
    </div>`;
  const toggle = card.querySelector('.toggle');
  toggle.addEventListener('click', async () => {
    toggle.classList.add('disabled');
    const prevState = dev.isOn;
    const newState = !prevState;
    toggle.classList.toggle('off', !newState);
    try {
      const token = localStorage.getItem('token');
      dev.isOn = newState;
      await powerDevice(token, dev);
    } catch {
      dev.isOn = prevState;
      toggle.classList.toggle('off', !prevState);
    } finally {
      toggle.classList.remove('disabled');
    }
  });
  card.querySelector('.menu').addEventListener('click', e => {
    e.stopPropagation();
    openDeviceControlModal(dev);
  });
  return card;
}

function getModeName(mode) {
  const names = {
    quiet: 'Тихий',
    normal: 'Обычный',
    strong: 'Сильный',
    turbo: 'Турбо'
  };
  return names[mode] || names.normal;
}

function createSensorCard(s) {
  const card = document.createElement('div');
  card.className = 'card';
  const statusClass = s.co2 <= 1000 ? 'green' : 'orange';
  card.innerHTML = `
      <div class="title">${s.name}</div>
      <div class="pill">
        <div class="sensor-values"><i class="fa-solid fa-temperature-half"></i>${s.temperature}°C</div>
        <div class="sensor-values"><img src="/assets/images/icons/wi--raindrops.svg" alt="">${s.humidity}%</div>
        <div class="sensor-values"><span>${s.co2}</span> ppm <span class="status-dot ${statusClass}"></span></div>
      </div>`;
  return card;
}
