import { renderLoading, renderError, renderRoomDetail, renderRooms } from '../ui/render.js';
import { getRooms, getRoomById } from '../roomApi.js';

class RoomStateClass {
  constructor() {
    this.state = 'idle';
    this.data = null;
    this.error = null;
  }

  setLoading() {
    this.state = 'loading';
    this.data = null;
    this.error = null;
  }

  setSuccess(room) {
    this.state = 'success';
    this.data = room;
    this.error = null;
  }

  setError(message) {
    this.state = 'error';
    this.data = null;
    this.error = message;
  }
}

const roomState = new RoomStateClass();

export async function loadAllRooms(token) {
  console.log('>>> loadAllRooms start');
  roomState.setLoading();
  renderLoading(true);

  try {
    const rooms = await getRooms(token);
    roomState.setSuccess(rooms);
    renderRooms(roomState.data, roomId => loadRoomById(token, roomId));
    console.log('Rooms loaded:', rooms);
  } catch (e) {
    roomState.setError(e.message);
    console.error('Ошибка при загрузке комнат:', e);
    renderError(roomState.error);
  } finally {
    renderLoading(false);
  }
}

export async function loadRoomById(token, roomId) {
  roomState.setLoading();
  renderLoading(true);

  try {
    const room = await getRoomById(token, roomId);
    if (!room) throw new Error('Комната не найдена');

    await new Promise(resolve => setTimeout(resolve, 300));
    renderRoomDetail(room);
    console.log('Room loaded:', room);
  } catch (e) {
    roomState.setError(e.message);
    console.error('Ошибка при загрузке комнаты:', e);
    renderError(roomState.error);
  } finally {
    renderLoading(false);
  }
}
