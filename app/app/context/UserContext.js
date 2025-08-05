"use client";
import React, { createContext, useState, useContext, useEffect } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false); // NEW

  useEffect(() => {
    const stored = window.localStorage.getItem("fieldAgentsUser");
    if (stored) setUser(JSON.parse(stored));
    setMounted(true); // signal that we finished loading user
  }, []);

  useEffect(() => {
    if (user) {
      window.localStorage.setItem("fieldAgentsUser", JSON.stringify(user));
    } else {
      window.localStorage.removeItem("fieldAgentsUser");
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser, mounted }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
