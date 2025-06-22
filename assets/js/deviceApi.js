import { apiCall } from './api.js';

export const Mode = {
  off: 0,
  quiet: 1,
  normal: 2,
  strong: 3,
  turbo: 4
};

export async function getDevices(token) {
  const data = await apiCall('/api/me/devices', 'GET', token);
  return data
    .filter(device => device.systemId !== 0)
    .map(device => ({
      id: device.systemId,
      name: device.name ?? `AC-${String(device.systemId).padStart(2, '0')}`,
      assigned: Boolean(device.roomId !== 0)
    }));
}

export async function updateDevice(token, name, systemId, roomId, mod) {
  const body = [{ name, systemId, roomId, mod }];
  console.log('Request body:', JSON.stringify(body));
  return apiCall('/api/updateDevices', 'POST', token, body);
}

export async function assignDevice(token, device) {
  const current = await getDeviceById(token, device.id);
  return updateDevice(token, current.name, current.id, device.roomName, current.mod);
}

export async function getDeviceById(token, id) {
  const data = await apiCall(`/api/me/devices/${id}`, 'GET', token);
  return {
    id: data.id,
    name: data.name ?? `AC-${String(data.id).padStart(2, '0')}`,
    assigned: Boolean(data.roomId !== 0),
    roomName: data.roomName,
    roomId: data.roomId,
    mod: Mode[data.mod]
  };
}

export async function powerDevice(token, device) {
  const current = await getDeviceById(token, device.id);
  return updateDevice(
    token,
    current.name,
    current.id,
    current.roomId,
    device.isOn ? Mode.normal : Mode.off
  );
}

export async function changeModDevice(token, device, mod) {
  const current = await getDeviceById(token, device.id);
  return updateDevice(token, current.name, current.id, current.roomId, Mode[mod]);
}
