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
    id: room.roomSystemId,              // или room.roomSystemId, если хотите использовать системный ID
    name: room.roomName,
    temperature: Math.round(avgTemp),    // округляем до целого
    co2: Math.round(avgCo2),
    heaterLoad: 50,
    hasAlert: avgCo2 > 1000
    // heaterLoad, hasAlert добавите позже
  };
});

return rooms;
}

export async function getRoomById(token, roomId) {
  const data = await apiCall(`/api/me/rooms/${roomId}`, 'GET', token);

  const allSensors = data.devices.flatMap(device => device.sensors);

  const totalTemp = allSensors.reduce((sum, s) => sum + s.temperature, 0);
  const totalCo2  = allSensors.reduce((sum, s) => sum + s.co2Level, 0);
  const count     = allSensors.length;

  const avgTemp = count ? totalTemp / count : 0;
  const avgCo2  = count ? totalCo2  / count : 0;

  return {
    id: data.roomSystemId,
    name: data.roomName,
    temperature: Math.round(avgTemp),
    co2: Math.round(avgCo2),
    heaterLoad: 50,         // можно заменить на вычисляемое, если будет нужно
    hasAlert: avgCo2 > 1000, // пример: если высокий CO₂, выводим предупреждение
    devices: data.devices.map(dev => ({
      id: dev.deviceSystemId,
      name: dev.deviceName,
      temperature: dev.sensors.length
        ? Math.round(dev.sensors.reduce((sum, s) => sum + s.temperature, 0) / dev.sensors.length)
        : 0,
      isOn: true,           // добавь реальные данные при наличии
      hasTimer: false       // добавь реальные данные при наличии
    })),
    sensors: allSensors.map(s => ({
      id: s.sensorSystemId,
      name: `Сенсор ${s.sensorSystemId}`,        // либо получай название, если оно есть
      temperature: s.temperature,
      co2: s.co2Level,
      humidity: 45           // мок-значение, обнови по реальным данным при наличии
    }))
  };
}
