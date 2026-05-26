import { useEffect, useMemo, useRef, useState } from "react";
import { searchPlayers } from "../services/playerSearchService";

function normalizeQuery(value) {
  return String(value || "").trim();
}

export default function PlayerSearch({
  placeholder = "Search player…",
  role = "player",
  onSelect,
  initialValue = null,
  className = "",
}) {
  const [query, setQuery] = useState(initialValue?.name || "");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    setQuery(initialValue?.name || "");
  }, [initialValue]);

  useEffect(() => {
    const normalized = normalizeQuery(query);
    let active = true;
    let timer = null;

    async function lookup() {
      setLoading(true);
      setError(null);
      try {
        const response = await searchPlayers(normalized, role);
        if (!active) return;
        setOptions(response.players || []);
        setError(response.error || null);
      } catch (err) {
        if (!active) return;
        setOptions([]);
        setError(err.message || "Unable to search players.");
      } finally {
        if (active) setLoading(false);
      }
    }

    timer = window.setTimeout(() => lookup(), 180);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query, role]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const visibleOptions = useMemo(() => options.slice(0, 50), [options]);

  const handleSelect = (player) => {
    setQuery(player.name);
    setOpen(false);
    setHighlightIndex(0);
    if (onSelect) onSelect(player);
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightIndex((current) => Math.min(current + 1, visibleOptions.length - 1));
      setOpen(true);
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightIndex((current) => Math.max(current - 1, 0));
      setOpen(true);
    }
    if (event.key === "Enter" && open && visibleOptions.length > 0) {
      event.preventDefault();
      handleSelect(visibleOptions[highlightIndex]);
    }
    if (event.key === "Escape") {
      setOpen(false);
    }
  };

  const displaySelected = initialValue || null;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-gray-400">
            <path d="M10.5 18a7.5 7.5 0 1 1 5.3-2.2l4.2 4.2a1 1 0 0 1-1.4 1.4l-4.2-4.2A7.45 7.45 0 0 1 10.5 18Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>

        <input
          type="search"
          aria-label="Search player"
          value={query}
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);
            setOpen(true);
            if (onSelect && value !== initialValue?.name) {
              onSelect(null);
            }
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-3xl border border-white/10 bg-zinc-950/95 px-12 py-3 text-sm text-white outline-none transition focus:border-ipl-cyan focus:ring-2 focus:ring-ipl-cyan/20"
        />
        {loading && (
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            Loading…
          </div>
        )}
      </div>

      {displaySelected && !open && (
        <div className="mt-3 rounded-3xl border border-white/10 bg-white/5 p-3 text-sm text-gray-200 shadow-sm">
          <p className="font-semibold text-white">{displaySelected.name}</p>
          <p className="mt-1 text-xs text-gray-400">
            {displaySelected.team || displaySelected.country || "Player"} • {displaySelected.role || "player"}
          </p>
        </div>
      )}

      {open && (
        <div className="absolute left-0 right-0 z-20 mt-2 max-h-80 overflow-y-auto rounded-3xl border border-white/10 bg-zinc-950/95 shadow-2xl shadow-black/50 backdrop-blur-xl">
          <div className="px-4 py-3 border-b border-white/10 text-xs uppercase tracking-[0.26em] text-gray-400">
            Search results{query ? ` for "${query}"` : ""}
          </div>
          {error ? (
            <div className="p-4 text-sm text-red-200">{error}</div>
          ) : visibleOptions.length > 0 ? (
            visibleOptions.map((player, index) => (
              <button
                key={`${player.id || player.name}-${index}`}
                type="button"
                onClick={() => handleSelect(player)}
                onMouseEnter={() => setHighlightIndex(index)}
                className={`flex w-full items-center justify-between gap-3 px-4 py-4 text-left text-sm transition ${
                  index === highlightIndex ? "bg-white/5" : "hover:bg-white/5"
                }`}
              >
                <div>
                  <p className="font-semibold text-white">{player.name}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {player.team || player.country || "Player"} • {player.role || "player"}
                  </p>
                </div>
                {player.apiId && (
                  <span className="rounded-full bg-ipl-cyan/10 px-2 py-1 text-[10px] uppercase tracking-[0.28em] text-ipl-cyan">
                    API
                  </span>
                )}
              </button>
            ))
          ) : (
            <div className="p-5 text-sm text-gray-300">
              No players found. Try a full name or common nickname like Kohli, Bumrah, Dhoni, or Rohit.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
