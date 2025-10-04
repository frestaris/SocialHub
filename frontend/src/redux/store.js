import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import chatReducer from "./chat/chatSlice";
import { authApi } from "./auth/authApi";
import { userApi } from "./user/userApi";
import { postApi } from "./post/postApi";
import { commentApi } from "./comment/commentApi";
import { replyApi } from "./reply/replyApi";
import { notificationApi } from "./notification/notificationApi";
import { chatApi } from "./chat/chatApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [postApi.reducerPath]: postApi.reducer,
    [commentApi.reducerPath]: commentApi.reducer,
    [replyApi.reducerPath]: replyApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      userApi.middleware,
      postApi.middleware,
      commentApi.middleware,
      replyApi.middleware,
      notificationApi.middleware,
      chatApi.middleware
    ),
});
