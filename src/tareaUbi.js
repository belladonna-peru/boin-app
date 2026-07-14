import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVER_URL } from './config';

export const TAREA_UBI = 'boin-ubi-fondo';

TaskManager.defineTask(TAREA_UBI, async ({ data, error }) => {
  if (error || !data) return;
  try {
    const { locations } = data;
    const loc = locations && locations[0];
    if (!loc) return;
    const id = await AsyncStorage.getItem('boinDevId');
    if (!id) return;
    await fetch(SERVER_URL + '/ubi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, lat: loc.coords.latitude, lng: loc.coords.longitude }),
    });
  } catch (e) {}
});