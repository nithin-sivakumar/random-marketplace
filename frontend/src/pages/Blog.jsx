import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiFilter, FiX } from "react-icons/fi";
import { BACKEND_URL } from "../constants/globals";
import { FadeLoader } from "react-spinners";
import { TiStarFullOutline } from "react-icons/ti";
import { useNavigate } from "react-router-dom";

export default function ArticlesPage() {
  const searchParams = new URLSearchParams(window.location.search);
  const navigate = useNavigate();

  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [category, setCategory] = useState(
    searchParams.get("category") || "All"
  );
  const [sort, setSort] = useState(searchParams.get("sort") || "featured");
  const [articles, setArticles] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [CATEGORIES, setCategories] = useState(["All"]);
  const [pricing, setPricing] = useState(searchParams.get("pricing") || "All");

  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [limit, setLimit] = useState(Number(searchParams.get("limit")) || 10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const PRICING = ["All", "Free", "Premium"];
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const topRef = useRef(null);

  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behaviour: "smooth" });
    }
  }, [page]);

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

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 1000);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    async function fetchArticles() {
      setLoading(true);
      const allRes = await fetch(
        `${BACKEND_URL}/api/content/all?page=${page}&limit=${limit}&category=${category}&pricing=${pricing}&query=${encodeURIComponent(
          debouncedQuery
        )}`
      );
      const allData = await allRes.json();

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
      setLoading(false);
    }
    fetchArticles();
  }, [page, limit, category, pricing, debouncedQuery]);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-300 via-gray-200 to-white px-6">
      <div ref={topRef}></div>
      <div className="max-w-7xl py-6 mx-auto space-y-6">
        <Header />

        {loading && (
          <div className="fixed z-[100] top-0 right-0 h-full w-full bg-gray-400/90 flex items-center justify-center">
            <FadeLoader color={"#fff"} loading={loading} size={150} />
          </div>
        )}

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
                      className={`px-3 py-1.5 rounded-full text-sm border ${
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
                      className={`px-3 py-1.5 rounded-full text-sm border ${
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
              <h2 className="text-2xl font-bold">
                {pricing === "Premium"
                  ? "Curated"
                  : pricing === "Free"
                  ? "Top"
                  : ""}{" "}
                {pricing} articles
              </h2>
              <button
                className="lg:hidden px-3 py-2 border rounded-lg flex items-center gap-2 bg-gray-300"
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
                    onClick={() => navigate(`/blog/${p._id}`)}
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

            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-indigo-600 hover:bg-indigo-600 hover:text-white rounded disabled:opacity-50"
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
                className="px-3 py-1 border border-indigo-600 hover:bg-indigo-600 hover:text-white rounded disabled:opacity-50"
              >
                Next
              </button>
              <select
                value={limit}
                onChange={(e) => {
                  setPage(1);
                  setLimit(Number(e.target.value));
                }}
                className="ml-4 border rounded px-2 py-1"
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
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="flex items-center gap-3">
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
      <FiSearch className="absolute top-[10px] right-2" />
    </div>
  );
}
