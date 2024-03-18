import {API_URL} from '@/lib/constant';

export default function createSocket() {
    const token = localStorage.getItem('token') || 'ping';
    const manager = new WebSocket(`ws://${API_URL}/ws/manager`);
    let heartbeatInterval;
    const startHeartbeat = () => {
        heartbeatInterval = setInterval(() => {
            manager.send('ping');
        }, 1000);
    };
    const stopHeartbeat = () => {
        clearInterval(heartbeatInterval);
    };
    manager.onopen = function () {
        manager.send(token || 'ping');
        startHeartbeat();
    };

    manager.onclose = function () {
        stopHeartbeat();
    };
    return manager
}


