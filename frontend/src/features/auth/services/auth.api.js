import axios from "axios"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
})

// 🔥 TOKEN attach
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export async function register({ username, email, password }) {
    try {
        const res = await api.post("/api/auth/register", {
            username, email, password
        })
        return res.data
    } catch (err) {
        console.log("REGISTER ERROR:", err.response?.data || err.message)
        return null
    }
}

export async function login({ email, password }) {
    try {
        const res = await api.post("/api/auth/login", {
            email, password
        })

        if (res.data.token) {
            localStorage.setItem("token", res.data.token)
        }

        return res.data
    } catch (err) {
        console.log("LOGIN ERROR:", err.response?.data || err.message)
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
    localStorage.removeItem("token")
}