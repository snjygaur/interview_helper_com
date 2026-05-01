const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")

const authRoutes = require("./routes/auth.routes")
const interviewRoutes = require("./routes/interview.routes")

const app = express()

app.use(cors({
    origin: "*",
    methods: ["GET","POST","PUT","DELETE"],
    allowedHeaders: ["Content-Type","Authorization"]
}))
app.use(express.json())
app.use(cookieParser())

// routes
app.use("/api/auth", authRoutes)
app.use("/api/interview", interviewRoutes)

// test
app.get("/", (req, res) => {
    res.send("Backend is running 🚀")
})

module.exports = app