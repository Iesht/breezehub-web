import { apiCall } from './api.js';

export async function getSensors(token) {
  const data = await apiCall('/api/me/sensors', 'GET', token);

  return data
    .filter(sensor => sensor.systemId !== 0) 
    .map((sensor, index) => ({
      id: sensor.systemId,
      name: `S-${String(sensor.systemId).padStart(4, '0')}`,
      assigned: Boolean(sensor.deviceId !== 0)
    }));
}