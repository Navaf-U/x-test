import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { RootState } from './store/store';

export const socket = io("http://localhost:3008", {
    autoConnect: false, 
    withCredentials: true,
    transports: ["websocket", "polling"],
});

function useConnectSocket() {
    const { user } = useSelector((state: RootState) => state.auth);
    console.log("user socket", user);
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
            console.log('Socket connected');
            
            if (user?._id) {
                socket.emit("join", user._id);
            }
        });

        socket.on('connect_error', (error) => {
            console.log('Socket connection error:', error);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        return () => {
            socket.disconnect();
        };
    }, [user]);

    return socket;
}

export default useConnectSocket;
