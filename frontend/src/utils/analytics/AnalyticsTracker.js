import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// =============================================================
// AnalyticsTracker.js
// -------------------------------------------------------------
// React hook component that sends a GA page_view event whenever
// the route changes. Requires GA to be initialized first.
// =============================================================

export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    // Track page changes automatically via React Router
    if (window.gtag) {
      window.gtag("event", "page_view", {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return null;
}
