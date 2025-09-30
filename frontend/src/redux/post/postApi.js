import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseURL } from "../../utils/baseURL";
import { auth } from "../../firebase";

// Post API slice (RTK Query)
// Handles CRUD operations for posts, user feeds, views, and likes

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
    // ---- CREATE POST ----
    createPost: builder.mutation({
      query: (newPost) => ({
        url: `/`,
        method: "POST",
        body: newPost,
      }),
      invalidatesTags: ["Post", "Feed"], // force refresh
    }),

    // ---- GET ALL POSTS (supports search, category, pagination, sort) ----
    getPosts: builder.query({
      query: ({
        searchQuery = "",
        category = "",
        skip = 0,
        limit = 20,
        sort = "newest",
      }) => {
        const params = new URLSearchParams();
        if (searchQuery) params.append("search_query", searchQuery);
        if (category) params.append("category", category);
        params.append("skip", skip);
        params.append("limit", limit);
        if (sort) params.append("sort", sort);
        return `?${params.toString()}`;
      },
      serializeQueryArgs: ({ queryArgs }) => {
        // Cache key based only on query filters, not pagination
        return {
          searchQuery: queryArgs.searchQuery || "",
          category: queryArgs.category || "",
          sort: queryArgs.sort || "newest",
        };
      },
      merge: (currentCache, newCache, { arg }) => {
        if (arg.skip === 0) {
          return newCache; // reset on first page
        }

        // Append new posts while avoiding duplicates
        const existingIds = new Set(currentCache?.posts?.map((p) => p._id));
        const mergedPosts = [
          ...(currentCache?.posts || []),
          ...newCache.posts.filter((p) => !existingIds.has(p._id)),
        ];

        return {
          ...currentCache,
          posts: mergedPosts,
          total: newCache.total ?? currentCache?.total,
        };
      },
      forceRefetch({ currentArg, previousArg }) {
        // Refetch when filters OR skip change
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

          // Remove from all cached getPosts queries
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

          // Remove from getPostsByUser
          dispatch(
            postApi.util.updateQueryData(
              "getPostsByUser",
              { userId, sort: sort || "newest" },
              (draft) => {
                draft.posts = draft.posts?.filter((p) => p._id !== id);
              }
            )
          );

          // Remove from getUserFeed
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

    // ---- INCREMENT POST VIEWS ----
    incrementPostViews: builder.mutation({
      query: (postId) => ({
        url: `/${postId}/views`,
        method: "PATCH",
      }),
      async onQueryStarted(postId, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          const state = getState();
          const queries = state.postApi.queries;

          // ✅ Update getPostById
          dispatch(
            postApi.util.updateQueryData("getPostById", postId, (draft) => {
              if (draft?.post) {
                draft.post.views = data.views;
              }
            })
          );

          // ✅ Update all getPosts caches
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

          // ✅ Update all getUserFeed caches
          Object.entries(queries).forEach(([cacheKey, entry]) => {
            if (cacheKey.startsWith("getUserFeed") && entry.originalArgs) {
              dispatch(
                postApi.util.updateQueryData(
                  "getUserFeed",
                  entry.originalArgs,
                  (draft) => {
                    const idx = draft.feed?.findIndex((f) => f._id === postId);
                    if (idx !== -1) {
                      draft.feed[idx].views = data.views;
                    }
                  }
                )
              );
            }
          });

          // ✅ Update all getPostsByUser caches
          Object.entries(queries).forEach(([cacheKey, entry]) => {
            if (cacheKey.startsWith("getPostsByUser") && entry.originalArgs) {
              dispatch(
                postApi.util.updateQueryData(
                  "getPostsByUser",
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

    // ---- TOGGLE LIKE POST ----
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

          // Update all cached getPosts queries
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

          // Update getUserFeed
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

          // Update getPostsByUser
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

          // Update getPostById
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

    // ---- TOGGLE HIDE POST ----
    toggleHidePost: builder.mutation({
      query: (id) => ({
        url: `/${id}/hide`,
        method: "PATCH",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          const state = getState();
          const queries = state.postApi.queries;

          // Update all cached getPosts queries
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

          // Update getUserFeed queries
          Object.entries(queries).forEach(([cacheKey, entry]) => {
            if (cacheKey.startsWith("getUserFeed") && entry.originalArgs) {
              dispatch(
                postApi.util.updateQueryData(
                  "getUserFeed",
                  entry.originalArgs,
                  (draft) => {
                    const idx = draft.feed?.findIndex((f) => f._id === id);
                    if (idx !== -1) draft.feed[idx] = data.post;
                  }
                )
              );
            }
          });

          // Update getPostsByUser queries too
          Object.entries(queries).forEach(([cacheKey, entry]) => {
            if (cacheKey.startsWith("getPostsByUser") && entry.originalArgs) {
              dispatch(
                postApi.util.updateQueryData(
                  "getPostsByUser",
                  entry.originalArgs,
                  (draft) => {
                    const idx = draft.posts?.findIndex((p) => p._id === id);
                    if (idx !== -1) draft.posts[idx] = data.post;
                  }
                )
              );
            }
          });

          // Update single post cache
          dispatch(
            postApi.util.updateQueryData("getPostById", id, (draft) => {
              draft.post = data.post;
            })
          );
        } catch (err) {
          console.error("❌ toggleHidePost cache update failed:", err);
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
  useToggleHidePostMutation,
} = postApi;
