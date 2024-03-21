import {API_URL} from '@/lib/constant';

export default function createSocket() {
    const token = localStorage.getItem('token') || 'ping';
    return new WebSocket(`ws://${API_URL}/ws/admin/manager`);
}


