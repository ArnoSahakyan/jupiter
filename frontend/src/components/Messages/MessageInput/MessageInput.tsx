import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Socket } from 'socket.io-client';
import { TFriendBack, sendMessage } from '../../../store/features/friends/friendsSlice';
import { getUserID } from '../../../store/features/userInfo/userInfoSlice';
import { AppDispatch } from '../../../store/setup';
import './MessageInput.scss';

// must match the backend limit (messages.message is varchar(255))
const MAX_LENGTH = 255;
const MAX_ROWS_HEIGHT = 120; // the field grows up to about five lines

export default function MessageInput({ friend, socket }: { friend: TFriendBack, socket: Socket | null }) {
  const userId = useSelector(getUserID)
  const dispatch = useDispatch<AppDispatch>();
  const [text, setText] = useState('');
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const message = text.trim();
  const canSend = message.length > 0 && socket !== null;

  // Grow with the text; start fresh (and focused) when switching chats.
  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    field.style.height = 'auto';
    field.style.height = `${Math.min(field.scrollHeight, MAX_ROWS_HEIGHT)}px`;
  }, [text]);

  useEffect(() => {
    setText('');
    fieldRef.current?.focus();
  }, [friend.id]);

  const send = () => {
    if (!canSend) return;
    const newMessage = { message, receiverId: friend.id, senderId: userId };
    socket.emit('send_message', { ...newMessage, room: friend.friendshipId });
    dispatch(sendMessage(newMessage));
    setText('');
  };

  return (
    <form className='MessageInput' onSubmit={(e) => { e.preventDefault(); send(); }}>
      <div className='MessageInput__field'>
        <textarea
          ref={fieldRef}
          rows={1}
          value={text}
          maxLength={MAX_LENGTH}
          placeholder={`Message ${friend.fname.split(' ')[0]}…`}
          aria-label={`Message ${friend.fname}`}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            // Enter sends, Shift+Enter adds a new line
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              send();
            }
          }}
        />
        {text.length > MAX_LENGTH - 55 && (
          <span className={`count ${text.length >= MAX_LENGTH ? 'full' : ''}`}>{MAX_LENGTH - text.length}</span>
        )}
      </div>
      <button type='submit' aria-label='Send message' disabled={!canSend}>
        <svg viewBox='0 0 16 16' width='18' height='18' fill='currentColor' aria-hidden='true'>
          <path d='M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z' />
        </svg>
      </button>
    </form>
  );
}
