import NetInfo from '@react-native-community/netinfo';

export const NetInfoService = {
    subscribe(callback) {
        return NetInfo.addEventListener(state => {
            callback(state.isConnected);
        });
    },

    async isConnected() {
        const state = await NetInfo.fetch();
        return state.isConnected;
    }
};
