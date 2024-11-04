import mongoose from "mongoose";

export const connectDB = async() => {
    try {
       const connect = await mongoose.connect(process.env.MONGO_URL)
       console.log(`MongoDB connected: ${connect.connection.host}`)
    } catch (error) {
        console.log(error,"Failed to connect to the db")
    }
}