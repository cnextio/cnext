import openSocket from 'socket.io-client';
export const CODE_SERVER_SOCKET_ENDPOINT = 'http://localhost:4000';
// export const CODE_SERVER_SOCKET_ENDPOINT = 'http://server:4000';
const socket = openSocket(CODE_SERVER_SOCKET_ENDPOINT);
export default socket;
