import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:3000/api",
    withCredentials: true
})

// 🔥 token auto attach
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export async function register({ username, email, password }) {
    try {
        const res = await api.post("/auth/register", {
            username, email, password
        })
        return res.data
    } catch (err) {
        console.log(err)
        return null
    }
}

export async function login({ email, password }) {
    try {
        const res = await api.post("/auth/login", {
            email, password
        })

        // 🔥 IMPORTANT
        if (res.data.token) {
            localStorage.setItem("token", res.data.token)
        }

        return res.data
    } catch (err) {
        console.log(err)
        return null
    }
}

export async function logout() {
    localStorage.removeItem("token")
    return true
}

export async function getMe() {
    try {
        const res = await api.get("/auth/get-me")
        return res.data
    } catch (err) {
        return null
    }
}