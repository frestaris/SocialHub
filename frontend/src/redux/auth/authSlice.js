import { createSlice } from "@reduxjs/toolkit";

// Load persisted state from localStorage
const userFromStorage = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user"))
  : null;

const tokenFromStorage = localStorage.getItem("token")
  ? localStorage.getItem("token")
  : null;

const initialState = {
  user: userFromStorage, // current logged-in user (from MongoDB)
  token: tokenFromStorage, // Firebase ID token
  loading: false,
  error: null,
};

// Auth slice: manages user state, token, login/logout
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Save user + token (on login)
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;

      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("token", action.payload.token);
    },

    // Update user profile (after editing settings)
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(state.user));
    },

    // Clear user + token (on logout)
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
  },
});

export const { setCredentials, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
