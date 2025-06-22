import { apiCall } from './api.js';

const TEMP_MIN = 20;
const TEMP_MAX = 40;
const CO2_MIN  = 150;
const CO2_MAX  = 3000;

/** Вычисляет средние значения температуры и CO₂ по сенсорам */
function computeAverages(sensors) {
  const totalTemp = sensors.reduce((sum, s) => sum + s.temperature, 0);
  const totalCo2 = sensors.reduce((sum, s) => sum + s.co2Level, 0);
  const count = sensors.length;

  return {
    avgTemp: count ? totalTemp / count : 0,
    avgCo2: count ? totalCo2 / count : 0,
  };
}

/** Преобразует "room" объект в краткий формат */
function transformRoomSummary(room) {
  const allSensors = room.devices.flatMap(d => d.sensors);
  const { avgTemp, avgCo2 } = computeAverages(allSensors);

  return {
    id: room.roomSystemId,
    name: room.roomName,
    temperature: Math.round(avgTemp),
    co2: Math.round(avgCo2),
    heaterLoad: calculateHeaterLoad(Math.round(avgTemp), Math.round(avgCo2)),
    hasAlert: avgCo2 > 1000,
  };
}

/** Преобразует "room" объект в расширенный формат с devices и sensors */
function transformRoomDetail(room) {
  const allSensors = room.devices.flatMap(d => d.sensors);
  const { avgTemp, avgCo2 } = computeAverages(allSensors);

  return {
    id: room.roomSystemId,
    name: room.roomName,
    temperature: Math.round(avgTemp),
    co2: Math.round(avgCo2),
    heaterLoad: calculateHeaterLoad(Math.round(avgTemp), Math.round(avgCo2)),
    hasAlert: avgCo2 > 1000,
    devices: room.devices.map(dev => ({
      id: dev.deviceSystemId,
      name: dev.deviceName,
      temperature: dev.sensors.length
        ? Math.round(dev.sensors.reduce((sum, s) => sum + s.temperature, 0) / dev.sensors.length)
        : 0,
      isOn: dev.mod !== "off",
      hasTimer: false,
      mod: dev.mod,
    })),
    sensors: allSensors.map(s => ({
      id: s.sensorSystemId,
      name: `Сенсор ${s.sensorSystemId}`,
      temperature: s.temperature,
      co2: s.co2Level,
      humidity: calculateHumidity(s.temperature, s.co2Level),
    })),
  };
}

export async function getRooms(token) {
  const data = await apiCall("/api/me", 'GET', token);
  return data.rooms.map(transformRoomSummary);
}

export async function getRoomById(token, roomId) {
  const data = await apiCall(`/api/me/rooms/${roomId}`, 'GET', token);
  return transformRoomDetail(data);
}

function calculateHumidity(temperature, co2) {
  const tempRatio = (temperature - TEMP_MIN) / (TEMP_MAX - TEMP_MIN); // от 0 до 1
  const co2Ratio = (co2 - CO2_MIN) / (CO2_MAX - CO2_MIN); // от 0 до 1

  const drop = (tempRatio + co2Ratio) / 2; // среднее влияние
  const humidity = 60 - drop * 30; // от 60 до 30

  return Math.round(Math.max(30, Math.min(60, humidity)));
}

function calculateHeaterLoad(temperature, co2) {
  const tempRatio = (temperature - TEMP_MIN) / (TEMP_MAX - TEMP_MIN);
  const co2Ratio = (co2 - CO2_MIN) / (CO2_MAX - CO2_MIN);

  const avgRatio = (tempRatio + co2Ratio) / 2;
  const heaterLoad = avgRatio * 100;

  return Math.round(Math.max(0, Math.min(100, heaterLoad)));
}

export async function createRoom(token, roomName) {
  // 1. Получаем список существующих комнат
  const existingRooms = await apiCall('/api/me/rooms', 'GET', token);
  const existingIds = new Set(existingRooms.map(r => r.systemId));

  // 2. Генерируем уникальный systemId от 1 до 1000
  let newId;
  do {
    newId = Math.floor(Math.random() * 1000) + 1;
  } while (existingIds.has(newId));

  // 3. Готовим и отправляем тело запроса
  const payload = [
    {
      name: roomName,
      systemId: newId,
    },
  ];
  await apiCall('/api/updateRooms', 'POST', token, payload);

  // 4. Возвращаем краткий формат новой комнаты
  return {
    id: newId,
    name: roomName,
    temperature: 0,
    co2: 0,
    heaterLoad: calculateHeaterLoad(0, 0),
    hasAlert: false,
  };
}
