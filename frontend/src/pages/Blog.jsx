import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiFilter, FiX } from "react-icons/fi";
import { marked } from "marked";
import { TiStarFullOutline } from "react-icons/ti";
import { HiSpeakerWave } from "react-icons/hi2";

export default function ArticlesPage() {
  const searchParams = new URLSearchParams(window.location.search);

  // Initialize state from URL params (fallback to defaults)
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [category, setCategory] = useState(
    searchParams.get("category") || "All"
  );
  const [sort, setSort] = useState(searchParams.get("sort") || "featured");
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [CATEGORIES, setCategories] = useState(["All"]);
  const [pricing, setPricing] = useState(searchParams.get("pricing") || "All");

  // Pagination state
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [limit, setLimit] = useState(Number(searchParams.get("limit")) || 10);
  const [total, setTotal] = useState(0);

  const PRICING = ["All", "Free", "Premium"];

  const [debouncedQuery, setDebouncedQuery] = useState(query);

  const emojis = ["👍", "❤️", "💀", "😂", "😭", "🔥"];

  const topRef = useRef(null);

  const [isNarrating, setIsNarrating] = useState(false);

  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behaviour: "smooth" });
    }
  }, [page]);

  // Sync state → URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (category) params.set("category", category);
    if (pricing) params.set("pricing", pricing);
    if (sort) params.set("sort", sort);
    params.set("page", page);
    params.set("limit", limit);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
  }, [query, category, pricing, sort, page, limit]);

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 1000); // 1000ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // Fetch articles when filters/pagination/debouncedQuery change
  useEffect(() => {
    async function fetchArticles() {
      const allRes = await fetch(
        `http://localhost:8000/api/content/all?page=${page}&limit=${limit}&category=${category}&pricing=${pricing}&query=${encodeURIComponent(
          debouncedQuery
        )}`
      );
      const allData = await allRes.json();

      // Shuffle for "featured"
      if (sort === "featured") {
        for (let i = allData.payload.data.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allData.payload.data[i], allData.payload.data[j]] = [
            allData.payload.data[j],
            allData.payload.data[i],
          ];
        }
      }

      setArticles(allData.payload.data);
      setTotal(allData.payload.total || 0);
    }
    fetchArticles();
  }, [page, limit, category, pricing, debouncedQuery]);

  // Extract unique categories dynamically
  useEffect(() => {
    setCategories((prev) => [
      ...new Set(["All", ...articles.map((a) => a.category)]),
    ]);
  }, [articles]);

  const filtered = useMemo(() => {
    let out = articles.filter((p) => {
      const matchesQuery = (p.title + p.caption)
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesCategory =
        category === "All" ? true : p.category === category;
      const matchesPricing =
        pricing === "All"
          ? true
          : pricing === "Free"
          ? !p.isPremium
          : p.isPremium;
      return matchesQuery && matchesCategory && matchesPricing;
    });
    if (sort === "title") out.sort((a, b) => a.title.localeCompare(b.title));
    return out;
  }, [articles, query, category, sort, pricing]);

  const handleNarrateToggle = () => {
    if (!selectedArticle?.content) return;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
    } else {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = selectedArticle.content;
      const plainText = tempDiv.textContent.trim();

      const utterance = new SpeechSynthesisUtterance(plainText);
      utterance.lang = "en-US";
      utterance.rate = 1;
      utterance.pitch = 1;

      // When narration ends, reset button label
      utterance.onend = () => setIsNarrating(false);
      utterance.onerror = () => setIsNarrating(false);

      window.speechSynthesis.speak(utterance);
      setIsNarrating(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-400 via-gray-200 to-white px-6">
      <div ref={topRef}></div>
      <div className="max-w-7xl py-6 mx-auto space-y-6">
        <Header />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters */}
          <aside className="hidden lg:block">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-6 border-2 border-gray-500 bg-gray-300/40 backdrop-blur-2xl rounded-2xl p-6 shadow-sm space-y-5"
            >
              <h3 className="text-sm font-semibold">Filters</h3>
              <SearchBox query={query} setQuery={setQuery} />
              <div>
                <label className="block text-xs text-gray-500 mb-2">
                  Pricing
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRICING.map((p, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setPage(1);
                        setPricing(p);
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm border transition cursor-pointer ${
                        pricing === p
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-gray-200 text-gray-700 border-gray-400"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setPage(1);
                        setCategory(c);
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm border transition cursor-pointer ${
                        category === c
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-gray-200 text-gray-700 border-gray-400"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2">Sort</label>
                <select
                  value={sort}
                  onChange={(e) => {
                    setPage(1);
                    setSort(e.target.value);
                  }}
                  className="w-full cursor-pointer rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="featured">Featured</option>
                  <option value="title">Title</option>
                </select>
              </div>
            </motion.div>
          </aside>

          {/* Articles */}
          <main className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {pricing === "Premium"
                  ? "Curated"
                  : pricing === "Free"
                  ? "Top"
                  : ""}{" "}
                {pricing} articles
              </h2>
              <button
                className="lg:hidden px-3 py-2 border rounded-lg flex items-center gap-2 cursor-pointer bg-gray-300"
                onClick={() => setFiltersOpen(true)}
              >
                <FiFilter /> Filters
              </button>
            </div>

            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              <AnimatePresence>
                {filtered.map((p, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-200 border-2 border-dashed hover:-translate-y-2 transition-all duration-200 ease-in-out rounded-2xl p-5 shadow-sm hover:shadow-2xl cursor-pointer space-y-3"
                    onClick={() => setSelectedArticle(p)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold text-lg">{p.title}</div>
                      {p.isPremium && (
                        <span>
                          <TiStarFullOutline className="bg-yellow-500 p-1 rounded-full text-white text-2xl" />
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{p.category}</div>
                    <div className="text-xs text-gray-600">{p.caption}</div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {filtered.length === 0 && (
                <div className="col-span-full text-center text-gray-500 py-16">
                  No articles found
                </div>
              )}
            </motion.div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-indigo-600 cursor-pointer hover:bg-indigo-600 hover:text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <span>
                Page {page} of {Math.ceil(total / limit) || 1}
              </span>
              <button
                onClick={() =>
                  setPage((p) => (p < Math.ceil(total / limit) ? p + 1 : p))
                }
                disabled={page >= Math.ceil(total / limit)}
                className="px-3 py-1 border border-indigo-600 cursor-pointer hover:bg-indigo-600 hover:text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
              <select
                value={limit}
                onChange={(e) => {
                  setPage(1);
                  setLimit(Number(e.target.value));
                }}
                className="ml-4 cursor-pointer border rounded px-2 py-1"
              >
                {[10, 20, 30].map((n) => (
                  <option key={n} value={n}>
                    {n} / page
                  </option>
                ))}
              </select>
            </div>
          </main>
        </div>

        {/* Mobile filters */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-gray-300 rounded-l-2xl shadow-xl z-50 lg:hidden flex flex-col"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold">Filters</h3>
                <button
                  className="p-2 cursor-pointer hover:bg-gray-400 rounded-full"
                  onClick={() => setFiltersOpen(false)}
                >
                  <FiX />
                </button>
              </div>
              <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                <SearchBox query={query} setQuery={setQuery} />
                <div>
                  <label className="block text-xs text-gray-700 mb-2">
                    Pricing
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRICING.map((p, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setPage(1);
                          setPricing(p);
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm border transition cursor-pointer ${
                          pricing === p
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-gray-200 text-gray-700 border-gray-400"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-700 mb-2">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCategory(c)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition cursor-pointer ${
                          category === c
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-gray-200 text-gray-700 border-gray-200"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Article Modal */}
        <AnimatePresence>
          {selectedArticle && (
            <motion.div
              className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-black/80 bg-opacity-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="max-w-5xl w-full bg-gray-300 rounded-2xl shadow-xl p-6 overflow-y-hidden max-h-[90vh] space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="w-full">
                    <h3 className="text-xl font-bold">
                      {selectedArticle.title}
                    </h3>
                    <div className="text-sm text-gray-500 mt-4 flex items-center justify-between w-full">
                      <div>
                        <span className="bg-blue-500 font-semibold py-1 px-2 rounded-full text-white">
                          {selectedArticle.category}
                        </span>
                        {selectedArticle.isPremium && (
                          <span className="bg-amber-500 font-semibold ml-2 py-1 px-2 rounded-full text-white">
                            Premium
                          </span>
                        )}
                      </div>
                      <div
                        onClick={handleNarrateToggle}
                        className="ml-4 text-black cursor-pointer hover:bg-gray-400 border border-gray-700 px-4 py-1 rounded-xl"
                      >
                        <span className="font-semibold">
                          {isNarrating ? "Stop narration" : "Narrate article"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="p-2 cursor-pointer rounded-full hover:bg-gray-300"
                  >
                    <FiX />
                  </button>
                </div>
                <div
                  className="prose leading-relaxed max-w-none pr-2 overflow-y-auto max-h-[70vh] flex flex-col"
                  dangerouslySetInnerHTML={{
                    __html: marked.parse(selectedArticle.content),
                  }}
                ></div>
              </motion.div>
              <div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="mt-2 select-none bg-gray-300 rounded-2xl shadow-xl px-6 py-2 flex items-center justify-center gap-2"
              >
                {emojis.map((e, index) => {
                  return (
                    <button
                      key={index}
                      className="text-2xl grayscale-50 hover:grayscale-0 cursor-pointer hover:scale-150 transition-all duration-150 active:scale-75"
                    >
                      {e}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ rotateX: 0 }}
          animate={{
            rotate: 360,
            transition: { duration: 1.4, repeat: Infinity },
          }}
          className="rounded-full bg-indigo-600 w-12 h-12 flex items-center justify-center text-white font-bold"
        >
          RM
        </motion.div>
        <div>
          <div className="text-xs text-gray-500">Blog</div>
          <div className="text-lg font-semibold">Random Marketplace</div>
        </div>
      </div>
    </header>
  );
}

function SearchBox({ query, setQuery }) {
  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search articles..."
        className="pl-3 pr-3 bg-gray-300 py-2 w-full rounded-lg border text-sm"
      />
    </div>
  );
}
