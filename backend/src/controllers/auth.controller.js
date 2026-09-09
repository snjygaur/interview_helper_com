const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")

const isProduction = process.env.NODE_ENV === "production"

const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/"
}

const clearCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/"
}

function signToken(user) {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured")
    }

    return jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )
}

function userResponse(user) {
    return {
        id: user._id,
        username: user.username,
        email: user.email
    }
}

async function registerUserController(req, res) {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
        return res.status(400).json({ message: "Please provide username, email and password" })
    }

    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const normalizedUsername = username.trim()

    const isUserAlreadyExists = await userModel.findOne({
        $or: [{ username: normalizedUsername }, { email: normalizedEmail }]
    })

    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "Account already exists with this email address or username"
        })
    }

    const hash = await bcrypt.hash(password, 10)
    const user = await userModel.create({
        username: normalizedUsername,
        email: normalizedEmail,
        password: hash
    })

    const token = signToken(user)
    res.cookie("token", token, cookieOptions)

    return res.status(201).json({
        message: "User registered successfully",
        token,
        user: userResponse(user)
    })
}

async function loginUserController(req, res) {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" })
    }

    const user = await userModel.findOne({ email: email.trim().toLowerCase() })

    if (!user) {
        return res.status(400).json({ message: "Invalid email or password" })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid email or password" })
    }

    const token = signToken(user)
    res.cookie("token", token, cookieOptions)

    return res.status(200).json({
        message: "User loggedIn successfully.",
        token,
        user: userResponse(user)
    })
}

async function logoutUserController(req, res) {
    const token = req.cookies?.token || (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : null)

    if (token) {
        await tokenBlacklistModel.create({ token })
    }

    res.clearCookie("token", clearCookieOptions)

    return res.status(200).json({ message: "User logged out successfully" })
}

async function getMeController(req, res) {
    const user = await userModel.findById(req.user.id).select("_id username email")

    if (!user) {
        return res.status(401).json({ message: "User not found" })
    }

    return res.status(200).json({
        message: "User details fetched successfully",
        user: userResponse(user)
    })
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}
