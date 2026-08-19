const mongoose = require("mongoose");



const DbConnection = async () => {
    try {
        await mongoose.connect(process.env.MongoDb_String);

    } catch (error) {
        console.log("DataBase Connection Failed", error);
    }
}


module.exports = DbConnection