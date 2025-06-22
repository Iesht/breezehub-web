import { assignDevice, getDevices, changeModDevice } from './deviceApi.js';
import { createRoom } from "./roomApi.js";
import {
  addSchedules,
  removeSchedule,
  enableSchedule,
  disableSchedule,
  getDeviceWithSchedules
} from './scheduleApi.js';
import { Mode } from './deviceApi.js';
// Create room, modal

let acDevices = [];

document.getElementById('create-room-button').addEventListener('click', openCreateRoomModal);

function openCreateRoomModal() {
  const overlay = document.createElement('div');
  overlay.classList.add('modal-overlay');
  overlay.innerHTML = `
    <div class="modal">
      <span class="close-btn">×</span>
      <h2>Новая комната</h2>

      <div class="input-group">
        <input type="text" id="roomNameInput" placeholder="Введите название комнаты" />
      </div>

      <div class="room-list" id="roomList">
        <div>Офис</div>
        <div>Спальня</div>
        <div>Кабинет</div>
        <div>Балкон</div>
        <div>Ванная</div>
        <div>Столовая</div>
        <div>Детская</div>
      </div>

      <div class="button-wrapper">
        <button class="save-btn">
          Сохранить
          <img src="/assets/images/icons/mingcute--save-line.svg" alt="Иконка" class="btn-icon">
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('.save-btn').addEventListener('click', () => saveRoom(overlay));
  overlay.querySelector('.close-btn')
    .addEventListener('click', closeModal);
  overlay.querySelector('#roomList').addEventListener('click', function(e) {
    if (e.target && e.target.nodeName === 'DIV') {
      document.getElementById('roomNameInput').value = e.target.textContent;
    }
  });
}

async function saveRoom(overlay) {
  const roomName = document.getElementById('roomNameInput').value.trim();
  if (!roomName) {
    alert('Введите название комнаты!');
    return;
  }

  const token = localStorage.getItem('token');
  try {
    await createRoom(token, roomName);
    overlay.remove(); // <-- Закрытие окна
    location.reload();
  } catch {
    alert('Ошибка сохранения');
  }
}




// Devices, modal
document.getElementById('add-device-btn').addEventListener('click', openDeviceModal);

function openDeviceModal(){
  const html=`
    <div class="devices-modal">
      <span class="close-btn">×</span>
      <h2>Доступные устройства</h2>

      <div class="section">
        <div class="grid" id="ac-grid"></div>
      </div>
    </div>`;
  const overlay=createOverlay(html);
  const token = localStorage.getItem('token');
  getDevices(token).then(devices => {
    acDevices = devices;
    renderDevices('ac-grid', acDevices);
  });
  overlay.querySelector('.close-btn')
    .addEventListener('click', closeModal);
  overlay.addEventListener('click', e=>{ if(e.target===overlay)closeModal(); });
}


// Логика отрисовки устройств
function renderDevices(gridId, list) {
  const grid = document.getElementById(gridId);
  if (!grid) {
    console.warn(`Элемент с id="${gridId}" не найден!`);
    return;
  }
  grid.innerHTML = '';
  list.forEach(dev => {
    const tile = document.createElement('div');
    tile.className = 'device' + (dev.assigned ? ' assigned' : '');
    tile.textContent = dev.name;

    tile.addEventListener('click', e => {
      e.stopPropagation();
      closeMenus();
      showMenu(tile, dev);
    });

    grid.appendChild(tile);
  });
}

export async function openDeviceControlModal(dev) {
  const overlay = createOverlay(getDeviceModalHTML(dev));

  /* локальные ссылки */
  const powerToggle = overlay.querySelector('#togglePower');
  const roomBlock   = overlay.querySelector('#roomBlock');

  overlay.querySelector('#closeBtn').addEventListener('click', closeModal);
  /* ——— 4.2 Вкл/выкл питание ——— */

  /* ——— 4.4 Виджеты режима, температуры, графика ——— */
  console.log(dev);
  overlay.querySelectorAll('.mode-btn').forEach(btn => {
  const mode = btn.querySelector('span').textContent.trim();

  // Устанавливаем активную кнопку при загрузке
  if (mode === dev.mod) {
    btn.classList.add('active');
  } else {
    btn.classList.remove('active');
  }

  // Назначаем обработчик на клик
  btn.addEventListener('click', async () => {
    overlay.querySelector('.mode-btn.active')?.classList.remove('active');
    btn.classList.add('active');

    const newMode = btn.querySelector('span').textContent.trim();
    const token = localStorage.getItem('token');
    await changeModDevice(token, dev, newMode)

    dev.mode = newMode; // Обновляем локально
  });
});


  overlay.querySelectorAll('.round-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = overlay.querySelector('.temp-val.target');
      let v = parseInt(target.textContent);
      v += btn.dataset.action === 'increase' ? 1 : -1;
      target.textContent = `${v}°C`;
    });
  });

  // Загрузка существующих расписаний для dev.id
const token = localStorage.getItem('token');
const fullDev = await getDeviceWithSchedules(token, dev.id);

const addBtn   = overlay.querySelector('.add-btn');
  const editZone = overlay.querySelector('#schedule-edit-zone');
  const listZone = overlay.querySelector('.schedule-list');
// fullDev.schedules — это массив { systemId, action, cron }
fullDev.schedules.forEach(sch => {
  // преобразуем cron обратно в "HH:MM"
  const [ , minute, hour ] = sch.cron.split(' ');
  const badge = document.createElement('span');
  badge.className = 'time-slot';
  badge.textContent = `${hour.padStart(2,'0')}:${minute.padStart(2,'0')}`;
  badge.onclick = async () => {
    // по клику удаляем это расписание
    await removeSchedule(token, sch.systemId);
    badge.remove();
  };
  listZone.appendChild(badge);
});

  /* ——— 4.5 График (добавление интервалов) ——— */
  
  addBtn.addEventListener('click', () => createEditor());

  function createEditor(t1 = '', t2 = '') {
    const slot = document.createElement('div');
    slot.className = 'edit-slot';
    slot.innerHTML = `
      <span>с</span><input type="time" class="start" value="${t1}">
      <span>до</span><input type="time" class="end" value="${t2}">
      <button class="ok-btn">ok</button>
      <button class="del"><img src="/assets/images/icons/lineicons--trash-3.svg" alt="Удалить"</button>
    `;
    slot.querySelector('.del').onclick = () => slot.remove();
    slot.querySelector('.ok-btn').onclick = async () => {
      const s = slot.querySelector('.start').value || '00:00';
      const e = slot.querySelector('.end').value   || '00:00';
      const badge = document.createElement('span');
      badge.className = 'time-slot';
      badge.textContent = `${s} – ${e}`;
      badge.onclick = () => badge.remove();
      listZone.appendChild(badge);
      const [sh, sm] = s.split(':').map(Number);
const [eh, em] = e.split(':').map(Number);
const cronStart = `0 ${sm} ${sh} * * *`;
const cronEnd   = `0 ${em} ${eh} * * *`;
console.log(dev);
await addSchedules(token, [
  // включение в выбранном режиме dev.mod
  { systemId: dev.id, mod: Mode[dev.mod], cron: cronStart },
  // выключение
  { systemId: dev.id, mod: Mode.off, cron: cronEnd }
]);
      slot.remove();
    };
    editZone.appendChild(slot);
  }

  /* ——— 4.6 Коммутация чекбокса «По графику» ——— */
  overlay.querySelector('.schedule-header input')
  .addEventListener('change', async e => {
    const enabled = e.target.checked;
    const token = localStorage.getItem('token');

    for (const sch of fullDev.schedules) {
      if (enabled) {
        await enableSchedule(token, sch.systemId);
      } else {
        await disableSchedule(token, sch.systemId);
      }
    }
  });


  /* ——— 4.7 Авто-обновление фактической температуры ——— */

  overlay.addEventListener('remove', () => clearInterval(tInt));   // сбросить таймер
  /* ——— локальные генераторы блоков ——— */
}

function ensureDeviceModalCSS() {
  if (!document.getElementById('device-modal-css')) {
    const link = document.createElement('link');
    link.id = 'device-modal-css';
    link.rel = 'stylesheet';
    link.href = './assets/css/device-modal.css';
    document.head.appendChild(link);
  }
}

function getDeviceModalHTML(dev) {
  ensureDeviceModalCSS();
  return `
  <div class="modal">
    <button class="close-btn" id="closeBtn">✕</button>
    <div>
      <h2 id="deviceTitle">${dev.name}
        <span class="toggle ${dev.power ? 'on' : ''}" id="togglePower"></span>
      </h2>

      <!-- Режимы работы -->
      <div class="widget mode-widget">
        <h3>Режим работы</h3>
        <div class="modes">
            <button class="mode-btn active">
              <svg viewBox="0 0 24 24" class="icon"><path d="m21.067 11.857l-.642-.388zm-8.924-8.924l-.388-.642zM21.25 12A9.25 9.25 0 0 1 12 21.25v1.5c5.937 0 10.75-4.813 10.75-10.75zM12 21.25A9.25 9.25 0 0 1 2.75 12h-1.5c0 5.937 4.813 10.75 10.75 10.75zM2.75 12A9.25 9.25 0 0 1 12 2.75v-1.5C6.063 1.25 1.25 6.063 1.25 12zm12.75 2.25A5.75 5.75 0 0 1 9.75 8.5h-1.5a7.25 7.25 0 0 0 7.25 7.25zm4.925-2.781A5.75 5.75 0 0 1 15.5 14.25v1.5a7.25 7.25 0 0 0 6.21-3.505zM9.75 8.5a5.75 5.75 0 0 1 2.781-4.925l-.776-1.284A7.25 7.25 0 0 0 8.25 8.5zM12 2.75a.38.38 0 0 1-.268-.118a.3.3 0 0 1-.082-.155c-.004-.031-.002-.121.105-.186l.776 1.284c.503-.304.665-.861.606-1.299c-.062-.455-.42-1.026-1.137-1.026zm9.71 9.495c-.066.107-.156.109-.187.105a.3.3 0 0 1-.155-.082a.38.38 0 0 1-.118-.268h1.5c0-.717-.571-1.075-1.026-1.137c-.438-.059-.995.103-1.299.606z"/></svg>
              <span>quiet</span>
            </button>
            <button class="mode-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none"><g clip-path="url(#siSunLine0)"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="1.5" d="M3 12H1m22 0h-2m-9 9v2m0-22v2M5.636 18.364l-1.414 1.414M19.778 4.222l-1.414 1.414m-12.728 0L4.222 4.222m15.556 15.556l-1.414-1.414M18 12a6 6 0 1 1-12 0a6 6 0 0 1 12 0"/></g><defs><clipPath id="siSunLine0"><path fill="#fff" d="M0 0h24v24H0z"/></clipPath></defs></g></svg>
              <span>normal</span>
            </button>
            <button class="mode-btn">
              <svg viewBox="0 0 24 24" class="icon"><path d="M4 13h4v7H4zm6-6h4v13h-4zm6 3h4v10h-4z"/></svg>
              <span>strong</span>
            </button>
            <button class="mode-btn">
              <svg viewBox="0 0 24 24" class="icon"><path d="M13 2L3 14h7v8l10-12h-7z"/></svg>
              <span>turbo</span>
            </button>
          </div>


        <div class="schedule-header">
          <span class="title">По&nbsp;графику</span>
          <label class="switch">
            <input type="checkbox" unchecked>
            <span class="slider"></span>
          </label>
          <button class="add-btn">+</button>
        </div>

        <div id="schedule-edit-zone"></div>
        <div class="schedule-list">
        </div>
      </div>

      <div class="widget temp-widget">
        <h3>Температура</h3>
        <div class="temp-box">
          <div class="set-temp">
            <span class="label">Заданная</span>
            <div class="adjust">
              <button class="round-btn" data-action="decrease">−</button>
              <span class="temp-val target">22°C</span>
              <button class="round-btn" data-action="increase">+</button>
            </div>
          </div>

          <div class="actual-temp">
            <span class="label">Фактическая</span>
            <span class="temp-val actual">23°C</span>
          </div>
        </div>
      </div>

      <div class="widget alerts-widget">
        <h3>Тревоги</h3>
        <div class="alert-box">
          <span class="alert-msg">Система стабильна</span>
        </div>
      </div>
    </div>
  </div>`;
}

/* модалка со списком всех устройств */

function showMenu(tileEl, dev) {
  const menu = document.createElement('div');
  menu.className = 'tile-menu';
  const btn = document.createElement('button');
  btn.innerHTML = dev.assigned
    ? 'Удалить из комнаты'
    : 'Добавить в комнату';
  btn.addEventListener('click', e => {
    e.stopPropagation();
    toggleAssign(dev, tileEl);
    closeMenus();
  });
  menu.appendChild(btn);
  tileEl.appendChild(menu);
}

async function toggleAssign(dev, tileEl) {
  const roomId = document.getElementById('room-name')?.dataset.roomId;

  dev.assigned = !dev.assigned;
  dev.roomName = dev.assigned ? Number(roomId) : 0;
  tileEl.classList.toggle('assigned');

  console.log(dev);
  
  const token = localStorage.getItem('token');
  await assignDevice(token, dev);
  location.reload();
}

function createOverlay(htmlInner){
  const overlay=document.createElement('div');
  overlay.classList.add('modal-overlay');
  overlay.innerHTML=htmlInner;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal();
  });
  return overlay;
}

function closeMenus() { document.querySelectorAll('.tile-menu').forEach(m => m.remove()); }

function closeModal() {
  document.querySelector('.modal-overlay')?.remove();
  document.querySelector('.modal')?.remove();
  closeMenus();
}
