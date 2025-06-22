import {openMain, showWindow} from "./navigation.js";

export async function openAuthWindow() {
 showWindow('auth-window');

 document.getElementById('site-header').classList.add('hidden');

  const form = document.getElementById('auth-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const login = document.getElementById('auth-login').value.trim();

    if (login === '') {
      alert('Введите ключ.');
      return;
    }

    if (login !== 'admin') {
      alert('Неправильный ключ. У вас нет доступа.');
      return;
    }

    try {

      console.log(`Авторизация успешна: ${login}`);
      localStorage.setItem('isLoggedIn', 'true');
      document.getElementById('site-header').classList.remove('hidden');
      openMain();
    } catch (error) {
      console.error(error);
      alert('Ошибка авторизации');
    }
  }, { once: true });  // Важно: { once: true } — чтобы обработчик добавился 1 раз
}

function logout() {
  localStorage.removeItem('isLoggedIn');
  openAuthWindow();
}

function generateCheckerboard() {
  const container = document.getElementById('background');
  container.innerHTML = '';

  const rowCount = Math.ceil(window.innerHeight / 150) + 1;
  const colCount = Math.ceil(window.innerWidth / 250) + 1;

  for (let r = 0; r < rowCount; r++) {
    const row = document.createElement('div');
    row.className = 'row';
    if (r % 2 !== 0) row.classList.add('offset');

    for (let c = 0; c < colCount; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.textContent = 'Modern Climat Solution';
      row.appendChild(cell);
    }

    container.appendChild(row);
  }
}

window.addEventListener('resize', generateCheckerboard);
generateCheckerboard();