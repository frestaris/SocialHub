export const getFirebaseErrorMessage = (code) => {
  switch (code) {
    case "auth/invalid-email":
      return "The email address is not valid. Please check and try again.";

    case "auth/user-not-found":
      return "No account found with this email address.";

    case "auth/missing-email":
      return "Please enter your email address.";

    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "The email or password is incorrect. Please try again.";

    case "auth/email-already-in-use":
      return "This email is already registered. Try logging in instead.";

    case "auth/too-many-requests":
      return "Too many login attempts. Please wait and try again.";

    case "auth/account-exists-with-different-credential":
      return "This email is already linked with another provider. Please log in with that provider first, then link this one in your settings.";

    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";

    // 🔹 Password reset–specific cases
    case "auth/expired-action-code":
      return "Your password reset link has expired. Please request a new one.";

    case "auth/invalid-action-code":
      return "This password reset link is invalid. Please request a new one.";

    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";

    default:
      return `Something went wrong. (${code})`;
  }
};
