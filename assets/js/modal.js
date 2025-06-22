import {apiCall} from "./api.js";

document.getElementById('create-room-button').addEventListener('click', openCreateRoomModal);

function openCreateRoomModal() {
  const overlay = document.createElement('div');
  overlay.classList.add('modal-overlay');
  overlay.innerHTML = `
    <div class="modal">
      <span class="close-btn" onclick="closeModal()">×</span>
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

  overlay.querySelector('.save-btn').addEventListener('click', saveRoom);
  overlay.querySelector('#roomList').addEventListener('click', function(e) {
    if (e.target && e.target.nodeName === 'DIV') {
      document.getElementById('roomNameInput').value = e.target.textContent;
    }
  });
}

function saveRoom() {
  const roomName = document.getElementById('roomNameInput').value.trim();
  if (!roomName) {
    alert('Введите название комнаты!');
    return;
  }

  console.log(`TODO: Отправка на сервер: ${roomName}`);

  fetch('/api/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: roomName })
  })
    .then(() => alert(`Комната "${roomName}" сохранена! (заглушка)`))
    .catch(() => alert('Ошибка сохранения (заглушка)'));
}



//2
document.getElementById('add-device-btn').addEventListener('click', openDeviceModal);
function openDeviceModal(){
  const html=`
    <div class="devices-modal">
      <span class="close-btn" onclick="closeModal()">×</span>
      <h2>Доступные устройства</h2>

      <div class="section">
        <h3>Кондиционеры</h3>
        <div class="grid" id="ac-grid"></div>
      </div>

      <div class="section">
        <h3>Датчики</h3>
        <div class="grid" id="sensor-grid"></div>
      </div>
    </div>`;
  const overlay=createOverlay(html);
  renderDevices('ac-grid', acDevices);
  renderDevices('sensor-grid', sensorDevices);
  overlay.addEventListener('click', e=>{ if(e.target===overlay)closeModal(); });
}

// ===== Логика отрисовки устройств =====
function renderDevices(gridId, list) {
  const grid = document.getElementById(gridId);
  grid.innerHTML = '';
  list.forEach(dev => {
    const tile = document.createElement('div');
    tile.className = 'device' + (dev.assigned ? ' assigned' : '');
    tile.textContent = dev.name;

    /* Старое меню «добавить | удалить» */
    tile.addEventListener('click', e => {
      e.stopPropagation();
      closeMenus();
      showMenu(tile, dev);
    });

    grid.appendChild(tile);
  });
}

export function openDeviceControlModal(dev) {
  const overlay = createOverlay(getDeviceModalHTML(dev));

  /* локальные ссылки */
  const powerToggle = overlay.querySelector('#togglePower');
  const roomBlock   = overlay.querySelector('#roomBlock');

  overlay.querySelector('#closeBtn').addEventListener('click', closeModal);
  /* ——— 4.2 Вкл/выкл питание ——— */
  powerToggle.addEventListener('click', () => {
    dev.power = !dev.power;
    powerToggle.classList.toggle('on');
    apiCall('/device/power', 'PUT', { id: dev.id, power: dev.power });
  });

  /* ——— 4.3 Блок комнат «Добавить / Удалить» ——— */
  if (dev.assigned) attachRemove(roomBlock.querySelector('.remove-btn'));
  else               attachAdd   (roomBlock.querySelector('.add-room-btn'));

  function attachRemove(btn) {
    btn.addEventListener('click', async () => {
      await apiCall('/device/remove-from-room', 'DELETE', { id: dev.id });
      dev.assigned = false;
      dev.roomName = '';
      roomBlock.replaceWith(getFreeRoomBlock());
    });
  }
  function attachAdd(btn) {
    btn.addEventListener('click', async () => {
      await apiCall('/device/add-to-room', 'POST', { id: dev.id, room: 'Гостиная' });
      dev.assigned = true;
      dev.roomName = 'Гостиная';
      roomBlock.replaceWith(getBusyRoomBlock());
    });
  }

  /* ——— 4.4 Виджеты режима, температуры, графика ——— */
  overlay.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      overlay.querySelector('.mode-btn.active')?.classList.remove('active');
      btn.classList.add('active');
      const mode = btn.querySelector('span').textContent.trim();
      apiCall('/device/mode', 'PUT', { id: dev.id, mode });
    });
  });

  overlay.querySelectorAll('.round-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = overlay.querySelector('.temp-val.target');
      let v = parseInt(target.textContent);
      v += btn.dataset.action === 'increase' ? 1 : -1;
      target.textContent = `${v}°C`;
      apiCall('/device/target-temp', 'PUT', { id: dev.id, value: v });
    });
  });

  /* ——— 4.5 График (добавление интервалов) ——— */
  const addBtn   = overlay.querySelector('.add-btn');
  const editZone = overlay.querySelector('#schedule-edit-zone');
  const listZone = overlay.querySelector('.schedule-list');
  addBtn.addEventListener('click', () => createEditor());

  function createEditor(t1 = '', t2 = '') {
    const slot = document.createElement('div');
    slot.className = 'edit-slot';
    slot.innerHTML = `
      <span>c</span><input type="time" class="start" value="${t1}">
      <span>до</span><input type="time" class="end" value="${t2}">
      <button class="ok-btn">ok</button>
      <button class="del">🗑️</button>
    `;
    slot.querySelector('.del').onclick = () => slot.remove();
    slot.querySelector('.ok-btn').onclick = () => {
      const s = slot.querySelector('.start').value || '00:00';
      const e = slot.querySelector('.end').value   || '00:00';
      const badge = document.createElement('span');
      badge.className = 'time-slot';
      badge.textContent = `${s} – ${e}`;
      badge.onclick = () => badge.remove();
      listZone.appendChild(badge);
      apiCall('/device/schedule', 'POST', { id: dev.id, start: s, end: e });
      slot.remove();
    };
    editZone.appendChild(slot);
  }

  /* ——— 4.6 Коммутация чекбокса «По графику» ——— */
  overlay.querySelector('.schedule-header input').addEventListener('change', e => {
    apiCall('/device/schedule/enabled', 'PUT', { id: dev.id, enabled: e.target.checked });
  });

  /* ——— 4.7 Авто-обновление фактической температуры ——— */
  const actualSpan = overlay.querySelector('.temp-val.actual');
  const tInt = setInterval(() => {
    apiCall('/device/temp/actual', 'GET', { id: dev.id }).then(r => {
      /* здесь вместо заглушки обновляем значение */
      // actualSpan.textContent = r.temp + '°C';
    });
  }, 30_000);
  overlay.addEventListener('remove', () => clearInterval(tInt));   // сбросить таймер
  /* ——— локальные генераторы блоков ——— */
  function getBusyRoomBlock() {
    const b = document.createElement('div');
    b.className = 'room-block';
    b.innerHTML = `<span class="room-text">Находится в: ${dev.roomName}</span>
                   <button class="remove-btn">Удалить</button>`;
    attachRemove(b.querySelector('.remove-btn'));
    return b;
  }
  function getFreeRoomBlock() {
    const b = document.createElement('div');
    b.className = 'room-block';
    b.innerHTML = `<span class="room-text">Устройство свободно</span>
                   <button class="add-room-btn">Добавить</button>`;
    attachAdd(b.querySelector('.add-room-btn'));
    return b;
  }
}

/* ==== 5. Генератор HTML для большой модалки =========================== */
function getDeviceModalHTML(dev) {
  return `
  <div class="modal">
    <button class="close-btn" id="closeBtn">✕</button>
    <div>
      <h2 id="deviceTitle">${dev.name}
        <span class="toggle ${dev.power ? 'on' : ''}" id="togglePower"></span>
      </h2>

      <div class="room-block" id="roomBlock">
        ${dev.assigned
    ? `<span class="room-text">Находится в: ${dev.roomName}</span>
             <button class="remove-btn">Удалить</button>`
    : `<span class="room-text">Устройство свободно</span>
             <button class="add-room-btn">Добавить</button>`}
      </div>

      <!-- ==== MODE WIDGET ==== -->
      <div class="widget mode-widget">
        <h3>Режим работы</h3>
        <div class="modes">
          <button class="mode-btn active"><span>Тихий</span></button>
          <button class="mode-btn"><span>Обычный</span></button>
          <button class="mode-btn"><span>Сильный</span></button>
          <button class="mode-btn"><span>Турбо</span></button>
        </div>

        <div class="schedule-header">
          <span class="title">По&nbsp;графику</span>
          <label class="switch">
            <input type="checkbox" checked>
            <span class="slider"></span>
          </label>
          <button class="add-btn">+</button>
        </div>

        <div id="schedule-edit-zone"></div>
        <div class="schedule-list">
          <span class="time-slot">10:00 – 14:00</span>
          <span class="time-slot">20:00 – 05:00</span>
        </div>
      </div>

      <!-- ==== TEMPERATURE WIDGET ==== -->
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

      <!-- ==== ALERTS WIDGET ==== -->
      <div class="widget alerts-widget">
        <h3>Тревоги</h3>
        <div class="alert-box">
          <span class="alert-msg">Система стабильна</span>
        </div>
      </div>
    </div>
  </div>`;
}

/* ==== 7. Инициализация страницы ======================================= */
document.addEventListener('DOMContentLoaded', () => {
  /* рендер начальной сетки устройств */
  renderDevices('ac-grid',     acDevices);
  renderDevices('sensor-grid', sensorDevices);

  /* если нужен «плюсик» для отдельного окна устройств */
  const btn = document.getElementById('add-device-btn');
  if (btn) btn.addEventListener('click', openDeviceSelectorModal);
});

/* ==== 8. (опционально) модалка со списком всех устройств ============== */
function openDeviceSelectorModal() {
  const html = `
    <div class="modal">
      <button class="close-btn" id="closeBtn">✕</button>
      <h2>Доступные устройства</h2>
      <div class="section"><h3>Кондиционеры</h3><div class="grid" id="ac-grid"></div></div>
      <div class="section"><h3>Датчики</h3><div class="grid" id="sensor-grid"></div></div>
    </div>`;
  createOverlay(html);

  renderDevices('ac-grid', acDevices);
  renderDevices('sensor-grid', sensorDevices);

  document.getElementById('closeBtn').addEventListener('click', closeModal);
}











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
function toggleAssign(dev, tileEl) {
  dev.assigned = !dev.assigned;
  dev.roomName = dev.assigned ? 'Гостиная' : '';
  tileEl.classList.toggle('assigned');
  apiCall('/device/assign', 'PUT', { id: dev.id, assigned: dev.assigned });
}

const acDevices = [
  { id: 1, name: 'AC-01', assigned: true },
  { id: 2, name: 'AC-02', assigned: false },
  { id: 3, name: 'AC-03', assigned: true },
  { id: 4, name: 'AC-04', assigned: true }
];
const sensorDevices = [
  { id: 5, name: 'S-01', assigned: false },
  { id: 6, name: 'S-02', assigned: true },
  { id: 7, name: 'S-03', assigned: true },
  { id: 8, name: 'S-04', assigned: true }
];

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
  closeMenus();
}
