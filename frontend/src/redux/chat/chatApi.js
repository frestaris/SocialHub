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
      transformResponse: (res) => res.messages,
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

    // ---- Delete conversation (soft delete for user) ----
    deleteConversation: builder.mutation({
      query: (conversationId) => ({
        url: `/${conversationId}/hide`,
        method: "PATCH",
      }),
      // Immediately remove it from local cache
      async onQueryStarted(conversationId, { dispatch, queryFulfilled }) {
        // Optimistic UI update
        const patchResult = dispatch(
          chatApi.util.updateQueryData(
            "getConversations",
            undefined,
            (draft) => {
              draft.conversations = draft.conversations.filter(
                (c) => c._id !== conversationId
              );
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo(); // rollback on failure
        }
      },
      invalidatesTags: ["Conversation"],
    }),
    //  ---- Delete message ----
    deleteMessage: builder.mutation({
      query: ({ messageId }) => ({
        url: `/message/${messageId}`,
        method: "DELETE",
      }),
      async onQueryStarted(
        { messageId, conversationId },
        { dispatch, queryFulfilled }
      ) {
        // Optimistic mark as deleted
        dispatch(
          chatApi.util.updateQueryData(
            "getMessages",
            conversationId,
            (draft = []) => {
              const msg = draft.find((m) => m._id === messageId);
              if (msg) {
                msg.deleted = true;
                msg.content = "";
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch (err) {
          console.error("deleteMessage failed:", err);
        }
      },
    }),
    // ---- Edit message ----
    editMessage: builder.mutation({
      query: ({ messageId, content }) => ({
        url: `/message/${messageId}`,
        method: "PATCH",
        body: { content },
      }),
      async onQueryStarted(
        { messageId, conversationId, content },
        { dispatch, queryFulfilled }
      ) {
        // Optimistic update
        const patch = dispatch(
          chatApi.util.updateQueryData(
            "getMessages",
            conversationId,
            (draft = []) => {
              const msg = draft.find((m) => m._id === messageId);
              if (msg) {
                msg.content = content;
                msg.edited = true;
              }
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
  }),
});

export const {
  useStartConversationMutation,
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useDeleteConversationMutation,
  useDeleteMessageMutation,
  useEditMessageMutation,
} = chatApi;
