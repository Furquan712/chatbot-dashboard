'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketMessage {
  event: string;
  data: string;
}

export function Chat() {
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messageHistory, setMessageHistory] = useState<string[]>([]);

  useEffect(() => {
    const newSocket = io('http://localhost:8000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
    });

    newSocket.on('message', (newMessage: string) => {
      setMessageHistory((prev) => [...prev, newMessage]);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && socket) {
      const payload: SocketMessage = {
        event: 'message',
        data: message,
      };
      socket.emit('message', payload);
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-grow p-4 overflow-y-auto">
        {messageHistory.map((msg, index) => (
          <div key={index} className="p-2 my-2 bg-white rounded-md shadow-md">
            {msg}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex p-4 bg-white border-t">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-grow p-2 border rounded-l-md"
          placeholder="Type a message..."
        />
        <button type="submit" className="px-4 py-2 text-white bg-blue-500 rounded-r-md" disabled={!socket}>
          Send
        </button>
      </form>
    </div>
  );
}