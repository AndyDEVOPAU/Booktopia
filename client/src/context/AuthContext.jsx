import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContextValue";
import api from "../api/axios";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();

        const fetchMe = async () => {
            console.log("fetchMe started");
            try {
                const { data } = await api.get("/auth/me", {
                    signal: controller.signal,
                });
                console.log("fetchMe succeeded");
                setUser(data.user);
            } catch (err) {
                console.log("fetchMe caught error:", err.code, err.message);
                if (err.code !== "ERR_CANCELED") {
                    setUser(null);
                }
            } finally {
                console.log(
                    "fetchMe finally, aborted:",
                    controller.signal.aborted,
                );
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchMe();

        return () => controller.abort();
    }, []);

    const register = async (name, email, password) => {
        const { data } = await api.post("/auth/register", {
            name,
            email,
            password,
        });
        setUser(data.user);
        return data;
    };

    const login = async (email, password) => {
        const { data } = await api.post("/auth/login", { email, password });
        setUser(data.user);
        return data;
    };

    const logout = async () => {
        await api.post("/auth/logout");
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{ user, loading, register, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};
