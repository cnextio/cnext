import openSocket from 'socket.io-client';
const socket = openSocket(process.env.NEXT_PUBLIC_SERVER_SOCKET_ENDPOINT, {
    closeOnBeforeunload: false,
});
export default socket;
