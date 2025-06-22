import {loadAllRooms} from "./controllers/roomController.js";
import {openAuthWindow} from "./auth.js";

// Старт
document.addEventListener('DOMContentLoaded', () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  if (isLoggedIn) {
    loadAllRooms();
  } else {
    openAuthWindow();
  }
});