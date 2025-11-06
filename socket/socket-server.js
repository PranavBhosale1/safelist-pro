
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { Server } = require('socket.io');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Not anon!
);

const io = new Server({
  cors: {
    origin: "*", // Update with frontend URL in prod
  },
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('send_message', async (data) => {
    const { chat_id, sender_id, content } = data;

    // 1. Save to Supabase
    const { error } = await supabase.from('messages').insert([{ chat_id, sender_id, content }]);

    if (error) {
      console.error('Supabase insert error:', error.message);
      return;
    }

    // 2. Emit to all clients in the chat room
    io.to(chat_id).emit('new_message', {
      chat_id,
      sender_id,
      content,
      created_at: new Date().toISOString(), // Optional
    });
  });

  socket.on('join_chat', (chat_id) => {
    socket.join(chat_id);
    console.log(`Socket ${socket.id} joined chat ${chat_id}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

io.listen(3001); // Choose a port
console.log('Socket server running on port 3001');
