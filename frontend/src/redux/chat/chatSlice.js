import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    unread: {}, // { conversationId: count }
    activeConversationId: null, // ✅ helps for real-time filtering
  },
  reducers: {
    setUnreadCounts: (state, action) => {
      // payload: { convId: count }
      state.unread = { ...action.payload };
    },
    incrementUnread: (state, action) => {
      const convId = action.payload;
      state.unread[convId] = (state.unread[convId] || 0) + 1;
    },
    clearUnread: (state, action) => {
      const convId = action.payload;
      state.unread[convId] = 0;
    },
    setActiveConversation: (state, action) => {
      state.activeConversationId = action.payload;
    },
    setTyping: (state, action) => {
      const { conversationId, userId, isTyping } = action.payload;
      if (!state.typing) state.typing = {};
      state.typing[conversationId] = isTyping ? userId : null;
    },
  },
});

export const {
  setUnreadCounts,
  incrementUnread,
  clearUnread,
  setActiveConversation,
  setTyping,
} = chatSlice.actions;

export default chatSlice.reducer;
