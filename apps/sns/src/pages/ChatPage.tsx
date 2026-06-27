import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { apiFetch } from '../lib/apiClient';
import type { Conversation, Message, User } from '../types';

type MessageHandler = (message: Message) => void;

type RealtimeClient = {
  joinConversation: (conversationId: number) => void;
  onNewMessage: (handler: MessageHandler) => () => void;
  sendMessage: (conversationId: number, content: string) => boolean;
  disconnect: () => void;
};

function createSocketIoClient(socketUrl: string): RealtimeClient {
  const socket: Socket = io(`${socketUrl}/chat`, {
    withCredentials: true,
  });

  return {
    joinConversation: (conversationId) => {
      socket.emit('joinConversation', { conversationId });
    },
    onNewMessage: (handler) => {
      socket.on('newMessage', handler);
      return () => socket.off('newMessage', handler);
    },
    sendMessage: (conversationId, content) => {
      socket.emit('sendMessage', { conversationId, content });
      return true;
    },
    disconnect: () => socket.disconnect(),
  };
}

function createWebSocketClient(socketUrl: string): RealtimeClient {
  const wsUrl = `${socketUrl}/chat`.replace(/^http/, 'ws');
  const socket = new WebSocket(wsUrl);
  const joinedConversationIds = new Set<number>();
  const handlers = new Set<MessageHandler>();

  const sendJson = (payload: unknown) => {
    if (socket.readyState !== WebSocket.OPEN) return false;
    socket.send(JSON.stringify(payload));
    return true;
  };

  socket.addEventListener('open', () => {
    joinedConversationIds.forEach((conversationId) => {
      sendJson({ type: 'joinConversation', conversationId });
    });
  });
  socket.addEventListener('message', (event) => {
    const packet = JSON.parse(event.data) as {
      type?: string;
      message?: Message;
    };
    if (packet.type !== 'newMessage' || packet.message === undefined) return;
    handlers.forEach((handler) => handler(packet.message as Message));
  });

  return {
    joinConversation: (conversationId) => {
      joinedConversationIds.add(conversationId);
      sendJson({ type: 'joinConversation', conversationId });
    },
    onNewMessage: (handler) => {
      handlers.add(handler);
      return () => handlers.delete(handler);
    },
    sendMessage: (conversationId, content) =>
      sendJson({ type: 'sendMessage', conversationId, content }),
    disconnect: () => socket.close(),
  };
}

function createRealtimeClient(socketUrl: string): RealtimeClient {
  if (import.meta.env.VITE_REALTIME_DRIVER === 'websocket') {
    return createWebSocketClient(socketUrl);
  }

  return createSocketIoClient(socketUrl);
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [meId, setMeId] = useState<number | null>(null);
  const [username, setUsername] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const socketRef = useRef<RealtimeClient | null>(null);

  // 1. WebSocket接続（マウント時に1回だけ。アンマウントで切断）
  useEffect(() => {
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ?? import.meta.env.VITE_API_URL;
    const socket = createRealtimeClient(socketUrl);
    socketRef.current = socket;
    return () => {
      socket.disconnect();
    };
  }, []);

  // 2. 会話一覧と自分のIDを取得（REST）
  useEffect(() => {
    apiFetch<Conversation[]>('/conversations')
      .then(setConversations)
      .catch((e) =>
        setError(e instanceof Error ? e.message : 'エラーが発生しました'),
      );
    apiFetch<User>('/auth/me').then((me) => setMeId(me.id));
  }, []);

  // 3. 会話を選んだら: 履歴を取得し、roomに入り、newMessageを購読
  useEffect(() => {
    if (selected === null) return;
    const socket = socketRef.current;
    if (socket === null) return;

    apiFetch<Message[]>(`/conversations/${selected.id}/messages`)
      .then(setMessages)
      .catch((e) =>
        setError(e instanceof Error ? e.message : 'エラーが発生しました'),
      );
    socket.joinConversation(selected.id);

    const handleNewMessage = (message: Message) => {
      if (message.conversationId !== selected.id) return;
      setMessages((prev) => [...prev, message]);
    };
    return socket.onNewMessage(handleNewMessage);
  }, [selected]);

  const startConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === '') return;
    try {
      const conversation = await apiFetch<Conversation>('/conversations', {
        method: 'POST',
        body: JSON.stringify({ username }),
      });
      setConversations((prev) =>
        prev.some((c) => c.id === conversation.id)
          ? prev
          : [conversation, ...prev],
      );
      setSelected(conversation);
      setUsername('');
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected === null || text.trim() === '') return;
    const sent = socketRef.current?.sendMessage(selected.id, text) ?? false;
    if (sent) {
      setText('');
    } else {
      setError('リアルタイム接続中です。少し待ってから再送してください。');
    }
  };

  return (
    <div className="chat-layout">
      <aside className="chat-sidebar">
        <form onSubmit={startConversation}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ユーザー名"
          />
          <button type="submit">会話を開始</button>
        </form>
        {error !== '' && <p>{error}</p>}
        <ul>
          {conversations.map((c) => (
            <li key={c.id}>
              <button onClick={() => setSelected(c)}>
                <strong>{c.partner.displayName}</strong>
                <br />
                <small>
                  {c.lastMessage?.content ?? '（メッセージはまだありません）'}
                </small>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <main className="chat-main">
        {selected === null ? (
          <p>左の一覧から会話を選ぶか、新しい会話を開始してください。</p>
        ) : (
          <>
            <h2>{selected.partner.displayName} さんとの会話</h2>
            <div className="chat-messages">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={
                    m.senderId === meId ? 'message message-mine' : 'message'
                  }
                >
                  <p>{m.content}</p>
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="メッセージを入力"
                maxLength={1000}
              />
              <button type="submit">送信</button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
