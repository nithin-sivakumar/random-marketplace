import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiShoppingCart, FiFilter, FiX } from "react-icons/fi";

// Sample product data (digital content)
const SAMPLE_PRODUCTS = [
  {
    id: "p1",
    title: "Minimal UI Kit — Figma",
    category: "Design",
    price: 29,
    rating: 4.8,
    description:
      "A clean, minimal Figma UI kit for dashboards and admin panels. Components, tokens, and responsive frames included.",
  },
  {
    id: "p2",
    title: "React Data Grid — Pro",
    category: "Code",
    price: 49,
    rating: 4.6,
    description:
      "A performant, virtualized data grid built for React with filtering, sorting and export utilities.",
  },
  {
    id: "p3",
    title: "Cinematic Piano Loops Pack",
    category: "Audio",
    price: 15,
    rating: 4.4,
    description:
      "A collection of 50+ royalty-free cinematic piano loops for trailers and ambient music.",
  },
  {
    id: "p4",
    title: "Stock Photo Bundle — 2K+",
    category: "Photos",
    price: 39,
    rating: 4.7,
    description: "A curated set of 2000+ high-res photos for commercial use.",
  },
  {
    id: "p5",
    title: "3D Asset Pack — Low Poly",
    category: "3D",
    price: 59,
    rating: 4.9,
    description: "Low-poly 3D models (game-ready) with PBR textures.",
  },
  {
    id: "p6",
    title: "Productivity Notion Template",
    category: "Templates",
    price: 9,
    rating: 4.3,
    description:
      "A modular Notion workspace to manage projects, goals and habits.",
  },
];

const CATEGORIES = [
  "All",
  "Design",
  "Code",
  "Audio",
  "Photos",
  "3D",
  "Templates",
];

export default function MarketplaceApp() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const products = useMemo(() => SAMPLE_PRODUCTS, []);

  const filtered = useMemo(() => {
    let out = products.filter((p) => {
      const matchesQuery = (p.title + p.description + p.category)
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesCategory =
        category === "All" ? true : p.category === category;
      return matchesQuery && matchesCategory;
    });

    if (sort === "price-asc") out.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") out.sort((a, b) => b.price - a.price);
    if (sort === "rating") out.sort((a, b) => b.rating - a.rating);
    return out;
  }, [products, query, category, sort]);

  function addToCart(product) {
    setCart((c) => [...c, product]);
  }

  function removeFromCart(index) {
    setCart((c) => c.filter((_, i) => i !== index));
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <Header
          cartCount={cart.length}
          onCartClick={() => setFiltersOpen((v) => !v)}
        />

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters column */}
          <aside className="hidden lg:block">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-6 bg-white border rounded-2xl p-5 shadow-sm"
            >
              <h3 className="text-sm font-semibold mb-3">Filters</h3>
              <div className="space-y-3">
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

                <div>
                  <label className="block text-xs text-gray-500 mb-2">
                    Sort
                  </label>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>

                <div className="pt-2 border-t mt-2">
                  <p className="text-xs text-gray-500">Quick tips</p>
                  <p className="text-sm">
                    Sell templates, packs, or single-file assets. Use clear
                    previews.
                  </p>
                </div>
              </div>
            </motion.div>
          </aside>

          {/* Product grid */}
          <main className="lg:col-span-3">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Digital Marketplace</h2>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <button
                    className="lg:hidden inline-flex items-center gap-2 px-3 py-2 rounded-lg border"
                    onClick={() => setFiltersOpen(true)}
                  >
                    <FiFilter />
                    <span className="text-sm">Filters</span>
                  </button>
                </div>
              </div>
            </div>

            <motion.div
              layout
              className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {filtered.map((p) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    whileHover={{ translateY: -6 }}
                    className="bg-white border rounded-2xl p-4 shadow-sm cursor-pointer"
                  >
                    <div onClick={() => setSelectedProduct(p)}>
                      <ProductCard product={p} />
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-lg font-semibold">${p.price}</div>
                      <button
                        onClick={() => addToCart(p)}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm"
                      >
                        Add
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filtered.length === 0 && (
                <div className="col-span-full text-center text-gray-500 py-16">
                  No results. Try changing filters or search terms.
                </div>
              )}
            </motion.div>
          </main>
        </div>

        {/* Mobile filter drawer & cart drawer */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-50 lg:hidden"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold">Filters & Cart</h3>
                <button className="p-2" onClick={() => setFiltersOpen(false)}>
                  <FiX />
                </button>
              </div>

              <div className="p-4 space-y-4">
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

                <div>
                  <label className="block text-xs text-gray-500 mb-2">
                    Sort
                  </label>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>

                <div className="pt-2 border-t">
                  <h4 className="font-medium mb-2">Cart ({cart.length})</h4>
                  <div className="space-y-2">
                    {cart.length === 0 && (
                      <div className="text-sm text-gray-500">Cart is empty</div>
                    )}
                    {cart.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <div className="text-sm">{c.title}</div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-semibold">
                            ${c.price}
                          </div>
                          <button
                            onClick={() => removeFromCart(i)}
                            className="text-xs text-red-500"
                          >
                            remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Product modal */}
        <AnimatePresence>
          {selectedProduct && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold">
                      {selectedProduct.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedProduct.category} • {selectedProduct.rating} ★
                    </p>
                  </div>
                  <div className="text-lg font-semibold">
                    ${selectedProduct.price}
                  </div>
                </div>

                <div className="mt-4 text-gray-700">
                  {selectedProduct.description}
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <button
                    onClick={() => {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                  >
                    Buy & Download
                  </button>

                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="px-4 py-2 rounded-lg border"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------- Small UI subcomponents ---------- */

function Header({ cartCount, onCartClick }) {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-indigo-600 w-12 h-12 flex items-center justify-center text-white font-bold">
          NU
        </div>
        <div>
          <div className="text-xs text-gray-500">Marketplace</div>
          <div className="text-lg font-semibold">NextUnique</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <a className="hover:underline" href="#">
            Browse
          </a>
          <a className="hover:underline" href="#">
            Sell
          </a>
          <a className="hover:underline" href="#">
            About
          </a>
        </nav>

        <button
          onClick={onCartClick}
          className="relative inline-flex items-center gap-2 px-3 py-2 rounded-lg border"
        >
          <FiShoppingCart />
          <span className="text-sm">Cart</span>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

function ProductCard({ product }) {
  return (
    <div className="flex flex-col h-full">
      <div className="h-40 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center border mb-3">
        {/* Placeholder image - you can swap for previews */}
        <svg
          width="120"
          height="80"
          viewBox="0 0 120 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="120" height="80" rx="12" fill="#eef2ff" />
          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            fill="#6366f1"
            fontSize="12"
          >
            Preview
          </text>
        </svg>
      </div>

      <div className="flex-1">
        <div className="text-sm text-gray-500">{product.category}</div>
        <div className="font-semibold mt-1">{product.title}</div>
        <div className="text-xs text-gray-500 mt-2">
          {product.description.slice(0, 80)}
          {product.description.length > 80 ? "..." : ""}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm text-gray-500">{product.rating} ★</div>
      </div>
    </div>
  );
}

function SearchBox({ query, setQuery }) {
  return (
    <div className="relative">
      <FiSearch className="absolute left-3 top-3 text-gray-400" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products, categories..."
        className="pl-10 pr-3 py-2 w-full rounded-lg border text-sm"
      />
    </div>
  );
}
