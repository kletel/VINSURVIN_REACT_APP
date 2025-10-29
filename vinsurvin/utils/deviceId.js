import * as SecureStore from 'expo-secure-store';

function uuid4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

export async function getOrCreateDeviceId() {
    let id = await SecureStore.getItemAsync('deviceUUID');
    if (!id) {
        id = uuid4();
        await SecureStore.setItemAsync('deviceUUID', id);
        console.log('[DeviceId] created & saved:', id);
    } else {
        console.log('[DeviceId] loaded from SecureStore:', id);
    }
    return id;
}