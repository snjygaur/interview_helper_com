const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")

const authRoutes = require("./routes/auth.routes")
const interviewRoutes = require("./routes/interview.routes")

const app = express()

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true)
        }

        return callback(new Error("CORS origin is not allowed"))
    },
    credentials: true
}))

app.use(express.json({ limit: "1mb" }))
app.use(cookieParser())

app.use("/api/auth", authRoutes)
app.use("/api/interview", interviewRoutes)

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Interview Helper backend is running"
    })
})

app.use((err, req, res, next) => {
    console.error("Unhandled error:", err)

    if (err.message === "CORS origin is not allowed") {
        return res.status(403).json({ message: err.message })
    }

    return res.status(500).json({ message: "Internal server error" })
})

module.exports = app
