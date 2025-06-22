import { apiCall } from './api.js'; 

export async function getRooms(token) {
  const data = await apiCall("/api/me", 'GET', token);
  
  const rooms = data.rooms.map((room, index) => {
  // 1) Собираем все сенсоры из всех устройств комнаты
  const allSensors = room.devices.flatMap(device => device.sensors);

  // 2) Считаем средние значения
  const totalTemp = allSensors.reduce((sum, s) => sum + s.temperature, 0);
  const totalCo2  = allSensors.reduce((sum, s) => sum + s.co2Level,   0);
  const count     = allSensors.length;

  const avgTemp = count ? totalTemp / count : 0;
  const avgCo2  = count ? totalCo2  / count : 0;

  // 3) Формируем итоговый объект
  return {
    id: index + 1,              // или room.roomSystemId, если хотите использовать системный ID
    name: room.roomName,
    temperature: Math.round(avgTemp),    // округляем до целого
    co2: Math.round(avgCo2),
    heaterLoad: 50,
    hasAlert: false
    // heaterLoad, hasAlert добавите позже
  };
});

return rooms;
}

export function getRoomById(token, roomId) {
  return apiCall(`/me/rooms/${roomId}`, 'GET', token);
}