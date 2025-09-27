import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

// Custom hook to sync search bar input with URL query params
export default function useSearchHandler() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const searchQuery = searchParams.get("search_query") || "";
  const [inputValue, setInputValue] = useState(searchQuery);

  // Keep local input state in sync with URL
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  const handleSearch = (val) => {
    const trimmed = val.trim();

    if (!trimmed) {
      setSearchParams({});
      navigate("/explore");
      return;
    }

    setSearchParams({ search_query: trimmed });
    navigate(`/explore?search_query=${encodeURIComponent(trimmed)}`);
  };

  return {
    inputValue,
    setInputValue,
    searchQuery,
    handleSearch,
  };
}
