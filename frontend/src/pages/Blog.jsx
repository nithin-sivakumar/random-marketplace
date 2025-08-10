import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiFilter, FiLock, FiX } from "react-icons/fi";
import { marked } from "marked";
import Markdown from "react-markdown";
import { TiStarFullOutline } from "react-icons/ti";

// const CATEGORIES = [
//   "All",
//   "Tech",
//   "Design",
//   "Business",
//   "Lifestyle",
//   "Science",
// ];

export default function ArticlesPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [CATEGORIES, setCategories] = useState(["All"]);
  const [pricing, setPricing] = useState("All");

  const PRICING = ["All", "Free", "Premium"];

  useEffect(() => {
    async function fetchArticles() {
      const freeRes = await fetch("http://localhost:8000/api/content/free");
      const premiumRes = await fetch(
        "http://localhost:8000/api/content/premium"
      );
      const freeData = await freeRes.json();
      const premiumData = await premiumRes.json();

      const combined = [
        ...(freeData.payload || []),
        ...(premiumData.payload || []),
      ];

      // Fisher–Yates shuffle
      for (let i = combined.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [combined[i], combined[j]] = [combined[j], combined[i]];
      }

      setArticles(combined);
    }
    fetchArticles();
  }, []);

  console.log("Articles fetched:", articles);

  useEffect(() => {
    setCategories((prev) => [
      ...new Set([...prev, ...new Set(articles.map((a) => a.category))]),
    ]);
  }, [articles]);

  const filtered = useMemo(() => {
    let out = articles.filter((p) => {
      const matchesQuery = (p.title + p.content + p.category)
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Header />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters */}
          <aside className="hidden lg:block">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-6 bg-white border rounded-2xl p-6 shadow-sm space-y-5"
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
                      onClick={() => setPricing(p)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition ${
                        pricing === p
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-gray-700 border-gray-400"
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
                      onClick={() => setCategory(c)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition ${
                        category === c
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-gray-700 border-gray-400"
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
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
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
              <h2 className="text-2xl font-bold">Articles</h2>
              <button
                className="lg:hidden px-3 py-2 border rounded-lg flex items-center gap-2"
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
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="bg-white border-2 border-dashed hover:bg-indigo-200 hover:-translate-y-1 transition-all duration-150 rounded-2xl p-5 shadow-sm cursor-pointer space-y-3"
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
          </main>
        </div>

        {/* Mobile filters */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-50 lg:hidden flex flex-col"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold">Filters</h3>
                <button className="p-2" onClick={() => setFiltersOpen(false)}>
                  <FiX />
                </button>
              </div>
              <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                <SearchBox query={query} setQuery={setQuery} />
                <div>
                  <label className="block text-xs text-gray-500 mb-2">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCategory(c)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition ${
                          category === c
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-gray-700 border-gray-200"
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
              className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 bg-opacity-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="max-w-5xl w-full bg-white rounded-2xl shadow-xl p-6 overflow-y-hidden max-h-[90vh] space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold">
                      {selectedArticle.title}
                    </h3>
                    <div className="text-sm text-gray-500 mt-4">
                      <span className="bg-blue-500 font-semibold py-1 px-2 rounded-full text-white">
                        {selectedArticle.category}
                      </span>{" "}
                      {selectedArticle.isPremium && (
                        <span className="bg-amber-500 font-semibold ml-2 py-1 px-2 rounded-full text-white">
                          Premium
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="p-2 cursor-pointer rounded-full hover:bg-gray-300"
                  >
                    <FiX />
                  </button>
                </div>
                {/* <div>
                  <Markdown>{selectedArticle.content}</Markdown>
                  </div> */}
                <div
                  className="prose leading-relaxed max-w-none pr-2 overflow-y-auto max-h-[70vh] flex flex-col gap-2"
                  dangerouslySetInnerHTML={{
                    __html: marked.parse(selectedArticle.content),
                  }}
                ></div>
                <div className="my-4"></div>
              </motion.div>
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
        <div className="rounded-full bg-indigo-600 w-12 h-12 flex items-center justify-center text-white font-bold">
          NU
        </div>
        <div>
          <div className="text-xs text-gray-500">Blog</div>
          <div className="text-lg font-semibold">NextUnique Articles</div>
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
        className="pl-3 pr-3 py-2 w-full rounded-lg border text-sm"
      />
    </div>
  );
}
