"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./login.css";
import { useUser } from "@/app/context/UserContext";

export default function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { user, setUser } = useUser();
  const router = useRouter();

  // Redirect immediately if user is already logged in
  useEffect(() => {
    if (user && user.username) {
      router.push("/play");
    }
  }, [user, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUsername, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser({ username: data.username, email: data.email || emailOrUsername });
        setMessage("Login successful!");
        setTimeout(() => {
          router.push("/play"); // Redirect after login
        }, 1000);
      } else {
        setMessage(data.error || "Login failed");
      }
    } catch (err) {
      setMessage("Network error");
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin} noValidate>
        <h2 className="login-title">Login</h2>
        <input
          type="text"
          className="login-input"
          placeholder="Username or Email"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          required
          aria-label="Username or Email"
        />
        <input
          type="password"
          className="login-input"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          aria-label="Password"
        />
        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? "Logging In..." : "Login"}
        </button>
        {message && (
          <p
            style={{
              color:
                message.toLowerCase().includes("error") || message.toLowerCase().includes("failed")
                  ? "#f39c12"
                  : "#00bfff",
              marginTop: "1rem",
              fontWeight: "600",
              textAlign: "center",
            }}
            role="alert"
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
