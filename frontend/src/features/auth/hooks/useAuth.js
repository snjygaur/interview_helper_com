import { useContext, useEffect } from "react"
import { AuthContext } from "../auth.context"
import { login, register, logout, getMe } from "../services/auth.api"

export const useAuth = () => {
    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context

    const handleLogin = async ({ email, password }) => {
        setLoading(true)

        try {
            const data = await login({ email, password })

            if (!data?.user) {
                return false
            }

            setUser(data.user)
            return true
        } catch (err) {
            console.error("LOGIN ERROR:", err)
            return false
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)

        try {
            const data = await register({ username, email, password })

            if (!data?.user) {
                return false
            }

            setUser(data.user)
            return true
        } catch (err) {
            console.error("REGISTER ERROR:", err)
            return false
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        await logout()
        setUser(null)
        setLoading(false)
    }

    useEffect(() => {
        let mounted = true

        const init = async () => {
            const data = await getMe()

            if (!mounted) return

            setUser(data?.user || null)
            setLoading(false)
        }

        init()

        return () => {
            mounted = false
        }
    }, [setLoading, setUser])

    return { user, loading, handleLogin, handleRegister, handleLogout }
}
