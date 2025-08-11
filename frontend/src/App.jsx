import React from "react";
import { Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Blog from "./pages/Blog";
import BlogDetailPage from "./pages/BlogDetailPage";

const App = () => {
  return (
    <Routes>
      {/* <Route path="/" element={<Landing />} /> */}
      <Route path="/" element={<Blog />} />
      <Route path="/blog/:id" element={<BlogDetailPage />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/signup" element={<Signup />} />
    </Routes>
  );
};

export default App;
