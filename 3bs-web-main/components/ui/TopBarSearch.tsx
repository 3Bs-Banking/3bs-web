"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { searchOptions } from "@/utils/searchOptions";

export default function TopBarSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState<{ label: string; path: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (query.trim() === "") {
      setFiltered([]);
      setShowSuggestions(false);
      return;
    }

    const matches = searchOptions.filter((item) =>
      item.label.toLowerCase().includes(query.toLowerCase())
    );
    setFiltered(matches);
    setShowSuggestions(true);
  }, [query]);

  const handleSelect = (path: string) => {
    setQuery("");
    setShowSuggestions(false);
    router.push(path);
  };

  return (
    <div className="relative w-72">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <Input
        placeholder="Search here..."
        className="pl-10 border-gray-300 rounded-full"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {showSuggestions && filtered.length > 0 && (
        <div className="absolute z-50 bg-white mt-1 w-full border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleSelect(item.path)}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
            >
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
