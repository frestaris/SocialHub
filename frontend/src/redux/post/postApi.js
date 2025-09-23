import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseURL } from "../../utils/baseURL";
import { auth } from "../../firebase";

export const postApi = createApi({
  reducerPath: "postApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseURL}/posts`,
    prepareHeaders: async (headers) => {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Post", "Feed"],
  endpoints: (builder) => ({
    // ---- CREATE ----
    createPost: builder.mutation({
      query: (newPost) => ({
        url: `/`,
        method: "POST",
        body: newPost,
      }),
      invalidatesTags: ["Post", "Feed"],
    }),

    // ---- GET ALL POSTS ----
    getPosts: builder.query({
      query: ({ searchQuery = "", category = "", skip = 0, limit = 20 }) => {
        const params = new URLSearchParams();
        if (searchQuery) params.append("search_query", searchQuery);
        if (category) params.append("category", category);
        params.append("skip", skip);
        params.append("limit", limit);
        return `?${params.toString()}`;
      },
      serializeQueryArgs: ({ queryArgs }) => {
        return {
          searchQuery: queryArgs.searchQuery || "",
          category: queryArgs.category || "",
        };
      },
      merge: (currentCache, newCache, { arg }) => {
        if (arg.skip === 0) {
          return newCache;
        }
        return {
          ...newCache,
          posts: [...(currentCache?.posts || []), ...newCache.posts],
          total: newCache.total ?? currentCache?.total,
        };
      },
      forceRefetch({ currentArg, previousArg }) {
        return (
          currentArg?.searchQuery !== previousArg?.searchQuery ||
          currentArg?.category !== previousArg?.category ||
          currentArg?.skip !== previousArg?.skip
        );
      },
      providesTags: ["Post"],
    }),

    // ---- GET POSTS BY USER ----
    getPostsByUser: builder.query({
      query: ({ userId, sort }) => `/user/${userId}?sort=${sort}`,
      providesTags: (result, error, { userId }) => [
        { type: "Post", id: userId },
      ],
    }),
    // ---- GET POST BY ID ----
    getPostById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "Post", id }],
    }),

    // ---- GET USER FEED ----
    getUserFeed: builder.query({
      query: ({ userId, sort }) => `/feed/${userId}?sort=${sort || "newest"}`,
      providesTags: ["Feed"],
    }),

    // ---- UPDATE POST ----
    updatePost: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: "PUT",
        body: patch,
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          const state = getState();
          const queries = state.postApi.queries;

          // ✅ Update all cached getPosts queries
          Object.entries(queries).forEach(([cacheKey, entry]) => {
            if (cacheKey.startsWith("getPosts") && entry.originalArgs) {
              dispatch(
                postApi.util.updateQueryData(
                  "getPosts",
                  entry.originalArgs,
                  (draft) => {
                    const idx = draft.posts?.findIndex((p) => p._id === id);
                    if (idx !== -1) draft.posts[idx] = data.post;
                  }
                )
              );
            }
          });

          // ✅ Update getPostsByUser
          dispatch(
            postApi.util.updateQueryData(
              "getPostsByUser",
              { userId: data.post.userId._id, sort: "newest" },
              (draft) => {
                const idx = draft.posts?.findIndex((p) => p._id === id);
                if (idx !== -1) draft.posts[idx] = data.post;
              }
            )
          );

          // ✅ Update getUserFeed
          dispatch(
            postApi.util.updateQueryData(
              "getUserFeed",
              { userId: data.post.userId._id, sort: "newest" },
              (draft) => {
                const idx = draft.feed?.findIndex((f) => f._id === id);
                if (idx !== -1) draft.feed[idx] = data.post;
              }
            )
          );

          // ✅ Update getPostById
          dispatch(
            postApi.util.updateQueryData("getPostById", id, (draft) => {
              draft.post = data.post;
            })
          );
        } catch (err) {
          console.error("Cache update failed:", err);
        }
      },
      invalidatesTags: ["Post", "Feed"],
    }),

    // ---- DELETE POST ----
    deletePost: builder.mutation({
      query: ({ id }) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted(
        { id, userId, sort },
        { dispatch, queryFulfilled, getState }
      ) {
        try {
          await queryFulfilled;
          const state = getState();
          const queries = state.postApi.queries;

          // ✅ Remove from all cached getPosts queries
          Object.entries(queries).forEach(([cacheKey, entry]) => {
            if (cacheKey.startsWith("getPosts") && entry.originalArgs) {
              dispatch(
                postApi.util.updateQueryData(
                  "getPosts",
                  entry.originalArgs,
                  (draft) => {
                    draft.posts = draft.posts?.filter((p) => p._id !== id);
                  }
                )
              );
            }
          });

          // ✅ Remove from getPostsByUser cache
          dispatch(
            postApi.util.updateQueryData(
              "getPostsByUser",
              { userId, sort: sort || "newest" },
              (draft) => {
                draft.posts = draft.posts?.filter((p) => p._id !== id);
              }
            )
          );

          // ✅ Remove from getUserFeed cache
          dispatch(
            postApi.util.updateQueryData(
              "getUserFeed",
              { userId, sort: sort || "newest" },
              (draft) => {
                draft.feed = draft.feed?.filter((f) => f._id !== id);
              }
            )
          );
        } catch (err) {
          console.error("Cache update after delete failed:", err);
        }
      },
      invalidatesTags: ["Post", "Feed"],
    }),

    //  ---- INCREMENT VIEWS ----
    incrementPostViews: builder.mutation({
      query: (postId) => ({
        url: `/${postId}/views`,
        method: "PATCH",
      }),
      async onQueryStarted(postId, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;

          // ✅ Update getPostById cache
          dispatch(
            postApi.util.updateQueryData("getPostById", postId, (draft) => {
              if (draft?.post) {
                draft.post.views = data.views;
              }
            })
          );

          // ✅ Update ALL getPosts caches
          const state = getState();
          const queries = state.postApi.queries;

          Object.entries(queries).forEach(([cacheKey, entry]) => {
            if (cacheKey.startsWith("getPosts") && entry.originalArgs) {
              dispatch(
                postApi.util.updateQueryData(
                  "getPosts",
                  entry.originalArgs,
                  (draft) => {
                    const idx = draft.posts?.findIndex((p) => p._id === postId);
                    if (idx !== -1) {
                      draft.posts[idx].views = data.views;
                    }
                  }
                )
              );
            }
          });
        } catch (err) {
          console.error("Increment views error:", err);
        }
      },
    }),

    toggleLikePost: builder.mutation({
      query: (id) => ({
        url: `/${id}/like`,
        method: "PATCH",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;

          const state = getState();
          const queries = state.postApi.queries;

          Object.entries(queries).forEach(([cacheKey, entry]) => {
            if (cacheKey.startsWith("getPosts") && entry.originalArgs) {
              dispatch(
                postApi.util.updateQueryData(
                  "getPosts",
                  entry.originalArgs,
                  (draft) => {
                    const idx = draft.posts?.findIndex((p) => p._id === id);
                    if (idx !== -1) {
                      draft.posts[idx] = data.post;
                    }
                  }
                )
              );
            }
          });

          // Also log  updates

          dispatch(
            postApi.util.updateQueryData(
              "getUserFeed",
              { userId: data.post.userId._id, sort: "newest" },
              (draft) => {
                const idx = draft.feed?.findIndex((f) => f._id === id);
                if (idx !== -1) {
                  draft.feed[idx] = data.post;
                }
              }
            )
          );

          dispatch(
            postApi.util.updateQueryData(
              "getPostsByUser",
              { userId: data.post.userId._id, sort: "newest" },
              (draft) => {
                const idx = draft.posts?.findIndex((p) => p._id === id);
                if (idx !== -1) {
                  draft.posts[idx] = data.post;
                }
              }
            )
          );

          dispatch(
            postApi.util.updateQueryData("getPostById", id, (draft) => {
              draft.post = data.post;
            })
          );
        } catch (err) {
          console.error("❌ Toggle like cache update failed:", err);
        }
      },
    }),
  }),
});

export const {
  useCreatePostMutation,
  useGetPostsQuery,
  useGetPostsByUserQuery,
  useGetUserFeedQuery,
  useGetPostByIdQuery,
  useUpdatePostMutation,
  useDeletePostMutation,
  useIncrementPostViewsMutation,
  useToggleLikePostMutation,
} = postApi;
