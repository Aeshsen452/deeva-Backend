const express = require("express");
const env = require("dotenv");
const cors = require("cors");
env.config();

const DbConnection = require("./src/config/db.config.js");

DbConnection();

const app = express();
const port = process.env.Port;
const endPoint = require("./src/routes/EndPoints.js");
const origin = process.env.Origin_Url;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin,
    credentials: true

}))
app.use("/api", endPoint);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})



































