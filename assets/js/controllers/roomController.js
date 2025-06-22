import { renderLoading, renderError, renderRoomDetail, renderRooms }
  from '../ui/render.js';
import {getRooms, getRoomById} from "../roomApi.js";

class RoomStateClass {
  constructor() {
    this.state = 'idle';  // 'idle' | 'loading' | 'success' | 'error'
    this.data = null;  // комната или null
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
    // const rooms = [
    //   { id: 1, name: 'Гостиная', temperature: 22, co2: 450, heaterLoad: 60 },
    //   { id: 2, name: 'Кухня',   temperature: 25, co2: 2000, heaterLoad: 30, hasAlert: true }
    // ];
    roomState.setSuccess(rooms);
    renderRooms(roomState.data, roomId => loadRoomById('mock-token', roomId));
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
    const mockRooms = [
      { id: 1, name: 'Гостиная', temperature: 22, co2: 450, heaterLoad: 60 },
      { id: 2, name: 'Кухня',   temperature: 25, co2: 2000, heaterLoad: 30, hasAlert: true }
    ];
    const room = mockRooms.find(r => r.id === roomId);
    if (!room) throw new Error('Комната не найдена');

    await new Promise(resolve => setTimeout(resolve, 300));
    renderRoomDetail(room);

    // const room = await getRoomById(token, roomId);
    // roomState.setSuccess(room);
    // renderRoomDetail(roomState.data);
  } catch (e) {
    roomState.setError(e.message);
    console.error('Ошибка при загрузке комнаты:', e);
    renderError(roomState.error);
  } finally {
    renderLoading(false);
  }
}

