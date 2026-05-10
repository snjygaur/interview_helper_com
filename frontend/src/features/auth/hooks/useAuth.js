import { useContext, useEffect } from "react"
import { AuthContext } from "../auth.context"
import { login, register, logout, getMe } from "../services/auth.api"

export const useAuth = () => {

    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context

    // ✅ LOGIN
   const handleLogin = async ({ email, password }) => {
    setLoading(true)

    try {
        const data = await login({ email, password })

        console.log("LOGIN RESPONSE:", data) // 🔥 DEBUG

        if (!data || !data.user) {
            return false
        }

        setUser(data.user)

        // 🔥 TOKEN save (IMPORTANT)
        if (data.token) {
            localStorage.setItem("token", data.token)
        }

        return true

    } catch (err) {
        console.log("LOGIN ERROR:", err)
        return false
    } finally {
        setLoading(false)
    }
}

    // ✅ REGISTER
    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password })

            if (!data) return false

            return true
        } catch (err) {
            return false
        } finally {
            setLoading(false)
        }
    }

    // ✅ LOGOUT
    const handleLogout = async () => {
        setLoading(true)
        await logout()
        setUser(null)
        setLoading(false)
    }

    // ✅ AUTO LOGIN (IMPORTANT FIX)
    useEffect(() => {
        const init = async () => {
            const data = await getMe()

            if (data && data.user) {
                setUser(data.user)
            } else {
                setUser(null)
            }

            setLoading(false)
        }

        init()
    }, [])

    return { user, loading, handleLogin, handleRegister, handleLogout }
}