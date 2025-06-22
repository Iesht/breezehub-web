const API_URL = 'http://46.160.189.134:8000/';

export async function getRooms(token) {
  const res = await fetch(`${API_URL}/me/rooms`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ошибка ${res.status}: ${text}`);
  }
  return await res.json(); // массив RoomDTO
}

export async function getRoomById(token, roomId) {
  const res = await fetch(`${API_URL}/me/rooms/${roomId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ошибка ${res.status}: ${text}`);
  }
  return await res.json(); // RoomDTO
}
