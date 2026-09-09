import axios from "axios"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
    withCredentials: true
})

export async function register({ username, email, password }) {
    try {
        const res = await api.post("/api/auth/register", {
            username,
            email,
            password
        })
        return res.data
    } catch (err) {
        console.error("REGISTER ERROR:", err.response?.data || err.message)
        return null
    }
}

export async function login({ email, password }) {
    try {
        const res = await api.post("/api/auth/login", {
            email,
            password
        })
        return res.data
    } catch (err) {
        console.error("LOGIN ERROR:", err.response?.data || err.message)
        return null
    }
}

export async function getMe() {
    try {
        const res = await api.get("/api/auth/get-me")
        return res.data
    } catch (err) {
        return null
    }
}

export async function logout() {
    try {
        const res = await api.get("/api/auth/logout")
        return res.data
    } catch (err) {
        console.error("LOGOUT ERROR:", err.response?.data || err.message)
        return null
    }
}
