import {openMain, showWindow} from "./navigation.js";
import { apiCall } from './api.js';

export async function openAuthWindow() {
 showWindow('auth-window');

 document.getElementById('site-header').classList.add('hidden');

  const form = document.getElementById('auth-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const login = document.getElementById('auth-login').value.trim();
    const password = document.getElementById('auth-password').value.trim();

    if (login === '' || password === '') {
      alert('Введите данные.');
      return;
    }

    try {
        const response = await apiCall("auth/login", "POST", "", { username: login, password: password });

        const token = response.message;
        localStorage.setItem('token', token);

        console.log('Успешный вход. Токен:', token);

        localStorage.setItem('token', token);
        document.getElementById('site-header').classList.remove('hidden');
        openMain();

        } catch (error) {
          console.error(error);
          alert('Неверный логин или пароль');
        }
  }, { once: true });  // Важно: { once: true } — чтобы обработчик добавился 1 раз
}

function logout() {
  localStorage.removeItem('token');
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