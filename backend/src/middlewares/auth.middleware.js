const jwt = require("jsonwebtoken")
const userModel = require("../models/user.model")

exports.authUser = async (req, res, next) => {

    try {

        // 🔥 TOKEN GET
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Unauthorized"
            })
        }

        // 🔥 TOKEN EXTRACT
        const token = authHeader.split(" ")[1]

        // 🔥 VERIFY
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // 🔥 USER FIND
        const user = await userModel.findById(decoded.id)

        if (!user) {
            return res.status(401).json({
                message: "User not found"
            })
        }

        req.user = user

        next()

    } catch (err) {

        console.log("AUTH ERROR:", err)

        return res.status(401).json({
            message: "Unauthorized"
        })
    }
}