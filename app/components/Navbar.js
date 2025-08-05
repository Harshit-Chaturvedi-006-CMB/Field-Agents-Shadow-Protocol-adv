"use client";
import React from "react";
import { useUser } from "@/app/context/UserContext";
import { useRouter } from "next/navigation";
import "./navbar.css";

const Navbar = () => {
  const { user, setUser } = useUser();
  const router = useRouter();

  const handleLogout = () => {
    setUser(null);
    router.push("/home");
  };

  return (
    <nav className="navbar-ribbon">
      <div className="navbar-content" style={{ justifyContent: "space-between" }}>
        {/* Left: Logo and Title */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src="https://i.redd.it/w0lmb8i7odo51.png"
            alt="App Logo"
            className="navbar-logo"
          />
          <span className="navbar-title" style={{ marginLeft: "1rem" }}>
            Field Agents{" "}
            <span className="navbar-highlight">Shadow Protocol</span>
          </span>
        </div>

        {/* Right: User Info and Logout */}
        {user ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.2rem",
              color: "#111",
              fontFamily: "'Segoe UI', Tahoma, Geneva",
            }}
          >
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                {user.username}
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#555",
                  marginTop: "-0.15rem",
                  textTransform: "lowercase",
                }}
              >
                {user.email}
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: "#ff4d4d",
                border: "none",
                color: "#fff",
                padding: "8px 16px",
                borderRadius: "12px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e04343")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ff4d4d")}
            >
              Logout
            </button>
          </div>
        ) : (
          <div style={{ color: "#888" }}>Not logged in</div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
