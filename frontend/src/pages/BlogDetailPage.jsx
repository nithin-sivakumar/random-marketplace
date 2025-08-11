// BlogDetailPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../constants/globals";
import { marked } from "marked";
import { FiArrowLeft } from "react-icons/fi";
import { HiSpeakerWave } from "react-icons/hi2";
import { motion } from "framer-motion";

export default function BlogDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  const emojiKeys = ["like", "love", "fire", "laugh", "wow", "sad"];
  const [bursts, setBursts] = useState([]);
  const [reactions, setReactions] = useState({
    like: 0,
    love: 0,
    fire: 0,
    laugh: 0,
    wow: 0,
    sad: 0,
  });

  const [isNarrating, setIsNarrating] = useState(false);
  const utteranceRef = useRef(null);

  const [comments, setComments] = useState([
    {
      id: "c1",
      name: "Ananya",
      avatar: "A",
      time: "2h",
      text: "Fantastic write-up — loved the practical examples. Saved this!",
      likes: 4,
      replies: [
        {
          id: "c1r1",
          name: "Rahul",
          avatar: "R",
          time: "1h",
          text: "Totally — that example on caching was golden.",
          likes: 1,
        },
      ],
    },
    {
      id: "c2",
      name: "Maya",
      avatar: "M",
      time: "5h",
      text: "This was a great refresher. Can you share sources for the research section?",
      likes: 2,
      replies: [],
    },
    {
      id: "c3",
      name: "Dev",
      avatar: "D",
      time: "1d",
      text: "Tried implementing the snippet — worked like a charm.",
      likes: 5,
      replies: [],
    },
  ]);

  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    let mounted = true;
    async function fetchArticle() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/content/view/${id}`);
        const data = await res.json();
        if (!mounted) return;
        setArticle(data.payload);
        // If backend sent reactions, seed them
        if (data.payload?.reactions) {
          setReactions((prev) => ({ ...prev, ...data.payload.reactions }));
        }
      } catch (err) {
        console.error("fetch article error", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchArticle();
    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    return () => {
      if (window && window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  //   const handleReaction = (key) => {
  //     setReactions((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
  //     // TODO: persist to backend
  //   };

  const handleNarrationToggle = () => {
    if (!article?.content || !window?.speechSynthesis) return;

    if (window.speechSynthesis.speaking || isNarrating) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
    } else {
      // convert markdown -> html -> plain text
      const html = marked.parse(article.content || "");
      const tmp = document.createElement("div");
      tmp.innerHTML = html;
      const plainText = tmp.textContent?.trim() || "";

      if (!plainText) return;
      const utt = new SpeechSynthesisUtterance(plainText);
      utt.lang = "en-US";
      utt.rate = 1;
      utt.pitch = 1;
      utt.onend = () => setIsNarrating(false);
      utt.onerror = () => setIsNarrating(false);
      utteranceRef.current = utt;
      window.speechSynthesis.speak(utt);
      setIsNarrating(true);
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const c = {
      id: "c" + Date.now(),
      name: "You",
      avatar: "Y",
      time: "now",
      text: newComment.trim(),
      likes: 0,
      replies: [],
    };
    setComments((prev) => [c, ...prev]);
    setNewComment("");
  };

  const handleBurst = (emoji) => {
    const id = Date.now();
    setBursts((prev) => [...prev, { id, emoji }]);
    setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== id));
    }, 1000); // remove after animation
  };

  const handleReaction = (type, emoji) => {
    setReactions((prev) => ({
      ...prev,
      [type]: prev[type] + 1,
    }));
    handleBurst(emoji);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-gray-300 to-white">
        <div className="animate-pulse text-gray-600 text-lg">Loading...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-gray-300 to-white">
        <p className="text-gray-500 text-lg">Blog not found</p>
      </div>
    );
  }

  const emojiSet = [
    { key: "like", emoji: "👍", label: "Like" },
    { key: "love", emoji: "❤️", label: "Love" },
    { key: "fire", emoji: "🔥", label: "Fire" },
    { key: "laugh", emoji: "😂", label: "Haha" },
    { key: "wow", emoji: "😮", label: "Wow" },
    { key: "sad", emoji: "😭", label: "Sad" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-300 to-white">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="bg-gradient-to-r from-gray-400 to-gray-300 md:sticky md:top-0 text-black py-8 px-6 shadow-lg z-20"
      >
        <div className="max-w-6xl mx-auto flex items-start justify-between gap-4">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm mb-2 hover:underline cursor-pointer"
            >
              <FiArrowLeft /> Back to Blogs
            </button>

            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
              {article.title}
            </h1>

            <div className="flex items-center gap-3 mt-3">
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                {article.category}
              </span>
              {article.isPremium && (
                <span className="bg-amber-400 text-black px-3 py-1 rounded-full text-sm">
                  Premium
                </span>
              )}
              <span className="text-sm text-gray-800">
                {article.createdAt
                  ? new Date(article.createdAt).toLocaleDateString()
                  : ""}
              </span>
            </div>
          </div>

          {/* Narrator button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleNarrationToggle}
              className="flex items-center gap-2 px-3 py-2 bg-white/90 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer"
              aria-pressed={isNarrating}
            >
              <HiSpeakerWave className="text-lg" />
              <span className="text-sm font-medium">
                {isNarrating ? "Stop" : "Listen"}
              </span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main 3-column area */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 px-6 py-8">
        {/* Left: vertical emoji bar */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.08 }}
          className="hidden md:flex md:col-span-1 items-start justify-center"
        >
          <div className="sticky top-28 flex flex-col items-center gap-4">
            {/* {emojiSet.map((e) => (
              <motion.button
                key={e.key}
                onClick={() => handleReaction(e.key)}
                whileTap={{ scale: 0.92 }}
                whileHover={{ y: -3, scale: 1.12 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="relative flex items-center bg-gradient-to-br from-white to-gray-300 rounded-full p-1 shadow-md border border-gray-200 cursor-pointer hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                aria-label={e.label}
              >
                <div className="text-2xl">{e.emoji}</div>
                <div className="mt-1 px-2 py-0.5 bg-transparent text-xs font-medium text-gray-600 rounded-full">
                  {reactions[e.key]}
                </div>
              </motion.button>
            ))} */}
            {emojiSet.map((e) => (
              <div key={e.key} className="relative">
                <motion.button
                  onClick={() => handleReaction(e.key, e.emoji)}
                  whileTap={{ scale: 0.92 }}
                  whileHover={{ y: -3, scale: 1.12 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="flex items-center bg-gradient-to-br from-white to-gray-300 rounded-full p-1 shadow-md border border-gray-200 cursor-pointer hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  <div className="text-2xl">{e.emoji}</div>
                  <div className="mt-1 px-2 py-0.5 bg-transparent text-xs font-medium text-gray-600 rounded-full">
                    {reactions[e.key]}
                  </div>
                </motion.button>

                {/* Floating emoji bursts for this button */}
                {bursts
                  .filter((b) => b.emoji === e.emoji)
                  .map((b) =>
                    Array.from({ length: 8 }).map((_, i) => (
                      <motion.div
                        key={`${b.id}-${i}`}
                        initial={{ opacity: 1, y: 0, scale: 1 }}
                        animate={{
                          opacity: 0,
                          y: -60 - Math.random() * 40,
                          x: (Math.random() - 0.5) * 60,
                          scale: 0.5 + Math.random(),
                        }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl pointer-events-none"
                      >
                        {b.emoji}
                      </motion.div>
                    ))
                  )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Center: article */}
        <motion.article
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="md:col-span-7 bg-white rounded-2xl shadow-lg p-8 h-[calc(100vh-220px)] overflow-y-auto"
        >
          <div
            className="prose prose-lg max-w-none text-gray-800"
            dangerouslySetInnerHTML={{ __html: marked.parse(article.content) }}
          />

          {/* Inline reaction bar for mobile (when left column hidden) */}
          <div className="md:hidden flex gap-3 mt-8 pt-4 border-t border-gray-200">
            {emojiSet.map((e) => (
              <motion.button
                key={e.key + "-m"}
                onClick={() => handleReaction(e.key)}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition cursor-pointer"
              >
                <span className="text-xl">{e.emoji}</span>
                <span className="text-sm">{reactions[e.key]}</span>
              </motion.button>
            ))}
          </div>
        </motion.article>

        {/* Right: comments */}
        <motion.aside
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="md:col-span-4 bg-white rounded-2xl shadow-lg p-6 h-[calc(100vh-220px)] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Comments</h2>
            <span className="text-sm text-gray-500">
              {comments.length} comments
            </span>
          </div>

          {/* New comment input (mock) */}
          <form onSubmit={handleAddComment} className="mb-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full border rounded-lg p-3 text-sm resize-none h-20 placeholder-gray-400"
            />
            <div className="flex items-center justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setNewComment("")}
                className="px-3 py-1 rounded-lg text-sm border cursor-pointer"
              >
                Clear
              </button>
              <button
                type="submit"
                className="px-4 py-1 rounded-lg bg-indigo-600 text-white text-sm cursor-pointer hover:bg-indigo-700 transition"
              >
                Add Comment
              </button>
            </div>
          </form>

          {/* Comments list */}
          <div className="space-y-4">
            {comments.map((c) => (
              <CommentItem
                key={c.id}
                comment={c}
                onLike={(id) =>
                  setComments((prev) =>
                    prev.map((x) =>
                      x.id === id ? { ...x, likes: x.likes + 1 } : x
                    )
                  )
                }
                onReply={(id, text) =>
                  setComments((prev) =>
                    prev.map((x) =>
                      x.id === id
                        ? {
                            ...x,
                            replies: [
                              ...x.replies,
                              {
                                id: `r${Date.now()}`,
                                name: "You",
                                avatar: "Y",
                                time: "now",
                                text,
                                likes: 0,
                              },
                            ],
                          }
                        : x
                    )
                  )
                }
              />
            ))}
          </div>
        </motion.aside>
      </div>
    </div>
  );
}

/* ---------- Subcomponents ---------- */

function CommentItem({ comment, onLike, onReply }) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");

  const submitReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReply(comment.id, replyText.trim());
    setReplyText("");
    setShowReplyBox(false);
  };

  return (
    <div className="border border-gray-100 rounded-lg p-3">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">
          {comment.avatar || comment.name?.[0]?.toUpperCase() || "U"}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">{comment.name}</div>
              <div className="text-xs text-gray-500">{comment.time}</div>
            </div>
            <div className="text-sm text-gray-600">{comment.likes} likes</div>
          </div>

          <p className="mt-2 text-gray-700 text-sm">{comment.text}</p>

          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={() => onLike(comment.id)}
              className="text-sm text-gray-600 hover:text-indigo-600 cursor-pointer"
            >
              Like
            </button>
            <button
              onClick={() => setShowReplyBox((s) => !s)}
              className="text-sm text-gray-600 hover:text-indigo-600 cursor-pointer"
            >
              Reply
            </button>
          </div>

          {/* Replies */}
          <div className="mt-3 space-y-3">
            {comment.replies?.map((r) => (
              <div key={r.id} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-semibold text-xs">
                  {r.avatar || r.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{r.name}</div>
                    <div className="text-xs text-gray-500">{r.time}</div>
                  </div>
                  <p className="text-gray-700 text-sm mt-1">{r.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Reply box */}
          {showReplyBox && (
            <form onSubmit={submitReply} className="mt-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="w-full border rounded-lg p-2 text-sm resize-none h-16"
              />
              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowReplyBox(false);
                    setReplyText("");
                  }}
                  className="px-3 py-1 rounded-lg text-sm border cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 rounded-lg bg-indigo-600 text-white text-sm cursor-pointer hover:bg-indigo-700 transition"
                >
                  Reply
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
