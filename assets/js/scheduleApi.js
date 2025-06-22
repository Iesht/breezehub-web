import { apiCall } from './api.js';

export async function getDeviceWithSchedules(token, deviceId) {
  return await apiCall(`/api/me/devices/${deviceId}`, 'GET', token);
}

export async function addSchedules(token, requests) {
    console.log(requests);
  return await apiCall('/api/schedule/add', 'POST', token, requests);
}


export async function removeSchedule(token, scheduleId) {
  return await apiCall(`/api/schedule/${scheduleId}`, 'DELETE', token);
}


export async function enableSchedule(token, scheduleId) {
  return await apiCall(`/api/schedule/${scheduleId}/enable`, 'POST', token);
}


export async function disableSchedule(token, scheduleId) {
  return await apiCall(`/api/schedule/${scheduleId}/disable`, 'POST', token);
}


export async function getScheduleStatus(token, scheduleId) {
  return await apiCall(`/api/schedule/${scheduleId}/status`, 'GET', token);
}
