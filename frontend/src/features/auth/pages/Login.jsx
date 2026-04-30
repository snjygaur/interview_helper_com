import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const Login = () => {

    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()

        const success = await handleLogin({ email, password })

        if (success) {
            navigate('/dashboard')   // ✅ FIX
        } else {
            alert("Login failed")
        }
    }

    if (loading) {
        return <h1>Loading...</h1>
    }

    return (
        <main>
            <div className="form-container">
                <h1>Login</h1>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Email</label>
                        <input onChange={(e) => setEmail(e.target.value)} type="email" />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input onChange={(e) => setPassword(e.target.value)} type="password" />
                    </div>

                    <button className='button primary-button'>Login</button>
                </form>

                <p>
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
            </div>
        </main>
    )
}

export default Login