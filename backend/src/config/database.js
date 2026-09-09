const mongoose = require("mongoose")

async function connectToDB() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not configured")
        }

        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected to Database")
    } catch (err) {
        console.error("DB Error:", err.message)
        throw err
    }
}

module.exports = connectToDB
