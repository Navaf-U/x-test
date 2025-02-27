import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { RootState } from './store/store';

export const socket = io("http://localhost:3008", {
    autoConnect: false,
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

function useConnectSocket() {
    const { user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!user || !user._id) {
            console.warn("User not found, skipping socket connection");
            return;
        }

        if (token) {
            socket.auth = { token };
        }

        socket.connect();

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
            
            // Emit 'join' event to register the user
            if (user?._id) {
                socket.emit("join", user._id);
            }
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
        });

        socket.on('disconnect', (reason) => {
            console.warn(`Socket disconnected: ${reason}`);
            
            // Optional: Auto-reconnect
            if (reason !== "io server disconnect") {
                socket.connect();
            }
        });

        return () => {
            console.log('Disconnecting socket...');
            socket.disconnect();
        };

    }, [user]);

    return socket;
}

export default useConnectSocket;
