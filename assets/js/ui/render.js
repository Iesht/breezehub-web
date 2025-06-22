//
// Управление UI
//
import {openMain, showWindow} from "../navigation.js";
import {buttons, updateHeader} from "../header.js";
import {openDeviceControlModal} from "../modal.js";

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
    clone.querySelector('.heater-percentage').textContent =
      room.heaterLoad + '%';

    const loadCircle = clone.querySelector('.load-circle');

    loadCircle.style.setProperty('--clip-path', 'inset(0 0 0 0)');

    requestAnimationFrame(() => {
      const unfilled = room.heaterLoad;
      loadCircle.style.setProperty(
        '--clip-path',
        `inset(0 0 ${unfilled}% 0)`
      );
    });

    if (room.hasAlert) {
      clone.querySelector('.room-card').classList.add('warning');
    }

    clone.querySelector('.room-settings').addEventListener('click', () => {
      onSettingsClick(room.id);
    });

    listContainer.appendChild(clone);
  });
}

export function renderLoading(isLoading) {
  const overlay = document.getElementById('loading-overlay');
  overlay.classList.toggle('hidden', !isLoading);
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
  updateHeader({
    activeLabel: '',
    buttons: buttons
  });

  const loadCircle = document.getElementById('room-load-circle');

  loadCircle.style.setProperty('--clip-path', 'inset(0 0 0 0)');

  const unfilled = room.heaterLoad;
  console.log(unfilled);

  loadCircle.style.setProperty('--clip-path', `inset(0 0 ${unfilled}% 0)`);

  // что реально хранится в переменной?
  console.log(getComputedStyle(loadCircle).getPropertyValue('--clip-path'));

  // что браузер решил для clip-path?
  console.log(getComputedStyle(loadCircle).clipPath);

  document.getElementById('room-name').innerHTML =  room.name + (room.hasAlert ? ' <span class="alert-icon">⚠️</span>' : '');
  document.getElementById('room-temp').textContent = room.temperature;
  document.getElementById('room-co2').textContent = room.co2;
  document.getElementById('room-load').textContent = room.heaterLoad + '%';

  const devContainer = document.getElementById('devices');
  devContainer.innerHTML = ''; // очищаем старые
  room.devices?.forEach(d => devContainer.appendChild(createDeviceCard(d)));

  const sensContainer = document.getElementById('sensors');
  sensContainer.innerHTML = '';
  room.sensors?.forEach(s => sensContainer.appendChild(createSensorCard(s)));
}

document.getElementById('room-back').addEventListener('click', () => {
  openMain();
});


function adjustButtonPosition(buttonId) {
  const btn = document.getElementById(buttonId);
  const footer = document.querySelector('footer');
  if (!btn || !footer) return;

  const footerRect = footer.getBoundingClientRect();
  const overlap = window.innerHeight - footerRect.top;

  btn.style.bottom = overlap > 0 ? `${overlap + 45}px` : '20px';
}

function adjustAllButtons() {
  adjustButtonPosition('create-room-button');
  adjustButtonPosition('room-back');
}

['scroll', 'resize'].forEach(event =>
  window.addEventListener(event, adjustAllButtons)
);
document.addEventListener('DOMContentLoaded', adjustAllButtons);

// Устройства
function createDeviceCard(dev){
  const card=document.createElement('div');
  card.className='card';
  card.innerHTML=`
      <div class="title">${dev.name}</div>
      <div class="menu"><i class="fa-solid fa-ellipsis"></i></div>
      <div class="pill">
        <div class="left"><i class="fa-solid fa-temperature-half"></i>${dev.temperature}°C</div>
        <div class="knob"></div>
        <div class="right" style="display:flex;align-items:center;gap:12px;">
          ${dev.hasTimer ? '<img src="/assets/images/icons/mdi--clipboard-text-time-outline.svg" alt="По расписанию"></img>' : ''}
          <div class="toggle ${dev.isOn ? '' : 'off'}" tabindex="0"></div>
        </div>
      </div>`;

  const toggle=card.querySelector('.toggle');
  toggle.addEventListener('click',()=>{
    toggle.classList.toggle('off');
    const lbl=toggle.previousElementSibling;
    lbl.textContent=toggle.classList.contains('off')?'OFF':'ON';
  });

  const dotsBtn = card.querySelector('.menu');
  dotsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openDeviceControlModal(dev);
  });

  return card;
}

function createSensorCard(s){
  const card=document.createElement('div');
  card.className='card';
  const statusClass=s.co2<=1000?'green':'orange';
  card.innerHTML=`
      <div class="title">${s.name}</div>
      <div class="pill">
        <div class="sensor-values"><i class="fa-solid fa-temperature-half"></i>${s.temperature}°C</div>
        <div class="sensor-values"><img src="/assets/images/icons/wi--raindrops.svg" alt="">${s.humidity}%</div>
        <div class="sensor-values"><span>${s.co2}</span> ppm <span class="status-dot ${statusClass}"></span></div>
      </div>`;
  return card;
}

function enableToggleKeyboard(){
  document.addEventListener('keydown',e=>{
    if(e.key==='Enter'&&document.activeElement.classList.contains('toggle')){
      document.activeElement.click();
    }
  });
}

/* Добавление устройств/датчиков TODO */
function wireAddButtons(){
  document.getElementById('add-device-btn').addEventListener('click',()=>{
    alert('TODO: форма добавления устройства');
  });
  document.getElementById('add-sensor-btn').addEventListener('click',()=>{
    alert('TODO: форма добавления датчика');
  });
}
