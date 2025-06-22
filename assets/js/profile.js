document.addEventListener('DOMContentLoaded', () => {
  const profileCard = document.querySelector('#profile-window .field');
  const btnEdit = document.getElementById('btn-edit');
  const btnSave = document.getElementById('btn-save');
  const inputField = document.querySelector('.profile-input input');

  if (!profileCard || !btnEdit || !btnSave || !inputField) {
    console.warn('Ошибка, нет элементов на странице');
    return;
  }

  profileCard.classList.remove('editing');

  btnEdit.addEventListener('click', () => {
    profileCard.classList.toggle('editing');

    if (profileCard.classList.contains('editing')) {
      inputField.focus();
    }
  });

  btnSave.addEventListener('click', () => {
    const newName = inputField.value.trim();
    if (newName) {
      const titleEl = profileCard.querySelector('#profile-window .field__title');
      titleEl.textContent = newName;
    }
    profileCard.classList.remove('editing');
  });
});