import { createApi } from "@reduxjs/toolkit/query/react";
import authorizedBaseQuery from "../utils/authorizedBaseQuery";
import { auth } from "../../firebase";

// Prevent queries from firing before Firebase auth is ready
const baseQueryWithAuthCheck = async (args, api, extraOptions) => {
  if (!auth.currentUser) {
    return { error: { status: 401, data: "No Firebase user yet" } };
  }
  return authorizedBaseQuery("/conversations")(args, api, extraOptions);
};

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: baseQueryWithAuthCheck,
  tagTypes: ["Conversation", "Message"],
  endpoints: (builder) => ({
    // ---- Start new conversation ----
    startConversation: builder.mutation({
      query: (targetUserId) => ({
        url: `/`,
        method: "POST",
        body: { targetUserId },
      }),
      invalidatesTags: ["Conversation"],
    }),

    // ---- Get all conversations ----
    getConversations: builder.query({
      query: () => `/`,
      transformResponse: (res) => ({
        conversations: res.conversations,
        userId: res.userId, // keep current user id for ChatList
      }),
      providesTags: ["Conversation"],
    }),

    // ---- Get messages in a conversation ----
    getMessages: builder.query({
      query: (conversationId) => `/${conversationId}/messages`,
      transformResponse: (res) => res.messages, // only keep the array
      providesTags: (result, error, conversationId) => [
        { type: "Message", id: conversationId },
      ],
    }),

    // ---- Send message via REST (fallback if socket not connected) ----
    sendMessage: builder.mutation({
      query: ({ conversationId, content }) => ({
        url: `/${conversationId}/messages`,
        method: "POST",
        body: { content },
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        { type: "Message", id: conversationId },
      ],
    }),
  }),
});

export const {
  useStartConversationMutation,
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
} = chatApi;
