import mongoose from "mongoose"

const connectionString = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@ez-linkedin-clone-5-8.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000`

if (!connectionString) {
    throw new Error("Please provide valid connection string")
}

const connectDB = async () => {
    if (mongoose.connection?.readyState >= 1) {
        return;
    }

    try {
        await mongoose.connect(connectionString);

    } catch (error) {
        console.error('Error connecting to MongoDB: ', error);
    }

}

export default connectDB;



