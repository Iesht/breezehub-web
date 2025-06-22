import { openMain, openNotifications, openProfile } from './navigation.js';

export function updateHeader({ buttons = [], activeLabel = '' }) {
  const nav = document.getElementById('header-actions');
  nav.innerHTML = '';
  buttons.forEach(btn => {
    const button = document.createElement('button');
    button.classList.add('header-btn');
    const text = document.createElement('span');
    text.className = 'btn-text';
    text.textContent = btn.label;
    button.appendChild(text);
    if (btn.icon) {
      const wrapper = document.createElement('span');
      wrapper.className = 'btn-icon';
      const img = document.createElement('img');
      img.src = `./assets/images/icons/${btn.icon}`;
      img.alt = '';
      wrapper.appendChild(img);
      button.appendChild(wrapper);
    }
    button.addEventListener('click', btn.onClick);
    if (btn.label === activeLabel) button.classList.add('active');
    nav.appendChild(button);
  });
}

export const buttons = [
  { label: 'Комнаты', icon: 'home.svg', onClick: openMain },
  { label: 'Личный кабинет', icon: 'user.svg', onClick: openProfile },
  { label: 'Уведомления', icon: 'message.svg', onClick: openNotifications }
];