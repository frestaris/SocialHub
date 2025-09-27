import { notification } from "antd";
import { getFirebaseErrorMessage } from "./firebaseErrorMessages";

export const handleError = (err, context = "Error", isRegister = false) => {
  let msg;

  // Network/server errors
  if (
    err?.status === "FETCH_ERROR" ||
    err?.originalStatus === 0 ||
    err?.name === "TypeError" ||
    err?.error?.message?.includes("Failed to fetch")
  ) {
    msg = "Our server is offline. Please try again later.";
    context = "Server error";
  }
  // Firebase Auth errors
  else if (err?.code && err.code.startsWith("auth/")) {
    msg = getFirebaseErrorMessage(err.code);
    context = isRegister ? "Registration failed" : context;
  }
  // Backend-provided errors
  else if (err?.data?.message || err?.data?.error || err?.message) {
    msg = err.data?.message || err.data?.error || err.message;
  }
  // Fallback
  else {
    console.error("Unhandled error:", err);
    msg = "Something went wrong";
  }

  notification.error({
    message: context,
    description: msg,
    duration: 4,
    placement: "topRight",
  });
};

export const handleWarning = (title, description, actions) => {
  notification.warning({
    message: title,
    description,
    actions,
    duration: 3,
    placement: "topRight",
  });
};

export const handleSuccess = (msg = "Success") => {
  notification.success({
    description: msg,
    duration: 2,
    placement: "topRight",
  });
};

export const clearNotifications = () => {
  notification.destroy();
};
