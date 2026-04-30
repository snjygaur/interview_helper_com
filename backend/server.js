require("dotenv").config()
const app = require("./src/app")
const connectToDB = require("./src/config/database")

connectToDB()

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})


// senior full stack developer want to join microsoft apply for step internship give me some iimporntan question that neccessary 
// i am a full stack developr strong command on backend or frontend fully oriented on mern developer know node.js and express and html