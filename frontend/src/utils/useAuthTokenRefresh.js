import { useEffect } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { auth } from "../firebase";
import { useDispatch } from "react-redux";
import { setToken, logout } from "../redux/auth/authSlice";

export default function useAuthTokenRefresh() {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsub = onIdTokenChanged(auth, async (user) => {
      if (user) {
        const fresh = await user.getIdToken();
        dispatch(setToken(fresh));
      } else {
        dispatch(logout());
      }
    });
    return () => unsub();
  }, [dispatch]);
}
