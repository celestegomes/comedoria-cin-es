import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

const connect = async () => {
    const connectionState = mongoose.connection.readyState;

    if (connectionState === 1) {
        console.log("Database is already connected");
        return;
    }

    if (connectionState === 2) {
        console.log("Connecting...");
        return;
    }

    try {
        await mongoose.connect(MONGODB_URI!, {
            dbName: 'comedoriaes',
            bufferCommands: true
        });
        console.log("Connected to MongoDB");
    } catch (err: unknown) {  // Use unknown instead of any
        if (err instanceof Error) {
            console.log("Error connecting to MongoDB:", err.message);
            throw new Error(`Error: ${err.message}`);
        } else {
            console.log("An unknown error occurred");
            throw new Error("An unknown error occurred");
        }
    }
};

export default connect;
