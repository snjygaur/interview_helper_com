const jwt = require("jsonwebtoken")
const userModel = require("../models/user.model")
const tokenBlacklistModel = require("../models/blacklist.model")

exports.authUser = async (req, res, next) => {
    try {
        const cookieToken = req.cookies?.token
        const authHeader = req.headers.authorization
        const bearerToken = authHeader?.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : null
        const token = cookieToken || bearerToken

        if (!token) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured")
        }

        const isBlacklisted = await tokenBlacklistModel.exists({ token })

        if (isBlacklisted) {
            return res.status(401).json({
                message: "Session expired. Please login again."
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await userModel.findById(decoded.id).select("_id username email")

        if (!user) {
            return res.status(401).json({ message: "User not found" })
        }

        req.user = user
        next()
    } catch (err) {
        console.error("AUTH ERROR:", err.message)
        return res.status(401).json({ message: "Unauthorized" })
    }
}
