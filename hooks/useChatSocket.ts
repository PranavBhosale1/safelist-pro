// hooks/useChatSocket.ts
import { useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('https://socket-ma94.onrender.com'); // replace with prod URL if hosted

export const useChatSocket = ({
  chatId,
  onMessage,
}: {
  chatId: string;
  onMessage: (message: any) => void;
}) => {
  
  useEffect(() => {
    if (!chatId) return;

    socket.emit('join_chat', chatId);

    socket.on('new_message', (message) => {
      if (message.chat_id === chatId) {
        onMessage(message);
      }
    });

    return () => {
      socket.off('new_message');
      socket.emit('leave_chat', chatId);
    };
  }, [chatId]);
};

export const sendMessage = (data: {
  chat_id: string;
  sender_id: string;
  content: string;
}) => {
  socket.emit('send_message', data);
};
