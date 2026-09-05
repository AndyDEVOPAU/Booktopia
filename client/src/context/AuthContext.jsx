import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContextValue";
import api from "../api/axios";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();

        const fetchMe = async () => {
            try {
                const { data } = await api.get("/auth/me", {
                    signal: controller.signal,
                });
                setUser(data.user);
            } catch (err) {
                if (err.code !== "ERR_CANCELED") {
                    setUser(null);
                }
            } finally {
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
