import {loadAllRooms} from "./controllers/roomController.js";
import {openAuthWindow} from "./auth.js";

// Старт
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (token !== null) {
    loadAllRooms(token);
  } else {
    openAuthWindow();
  }
});