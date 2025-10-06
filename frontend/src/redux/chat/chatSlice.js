import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    unread: {}, // { conversationId: count }
    activeConversationId: null, // ✅ helps for real-time filtering
  },
  reducers: {
    setUnreadCounts: (state, action) => {
      const updates = action.payload;
      if (typeof updates === "function") {
        state.unread = updates(state.unread);
      } else {
        state.unread = { ...updates };
      }
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
    setUserStatus: (state, action) => {
      const { userId, online, lastSeen } = action.payload;
      if (!state.userStatus) state.userStatus = {};
      state.userStatus[userId] = { online, lastSeen };
    },
  },
});

export const {
  setUnreadCounts,
  incrementUnread,
  clearUnread,
  setActiveConversation,
  setTyping,
  setUserStatus,
} = chatSlice.actions;

export default chatSlice.reducer;
