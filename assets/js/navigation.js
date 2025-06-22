import {buttons, updateHeader} from "./header.js";

const windows = document.querySelectorAll("section");

export function showWindow(id) {
  windows.forEach(win => {
    if (win.id === id) {
      win.classList.remove('hidden');
    } else {
      win.classList.add('hidden');
    }
  });
  console.log('Показать окно:', id);
}

export function openMain() {
  showWindow('main-window');
  updateHeader({
    activeLabel: 'Комнаты',
    buttons: buttons
  });
}

export function openProfile() {
  showWindow('profile-window');
  updateHeader({
    activeLabel: 'Личный кабинет',
    buttons: buttons
  });
}

export function openNotifications() {
  showWindow('notifications-window');
  updateHeader({
    activeLabel: 'Уведомления',
    buttons: buttons
  });
}

document.addEventListener('DOMContentLoaded', openMain);