import * as Network from 'expo-network';

async function getOnline() {
    const state = await Network.getNetworkStateAsync();
    const reachable = state.isInternetReachable ?? true;
    return Boolean(state.isConnected && reachable);
}

export const NetInfoService = {
    subscribe(callback, intervalMs = 1500) {
        let stopped = false;
        let timer = null;
        let last = null;

        const tick = async () => {
            if (stopped) return;
            try {
                const online = await getOnline();
                if (online !== last) {
                    last = online;
                    callback(online);
                }
            } finally {
                timer = setTimeout(tick, intervalMs);
            }
        };

        tick();

        return () => {
            stopped = true;
            if (timer) clearTimeout(timer);
        };
    },

    async isConnected() {
        return getOnline();
    },
};