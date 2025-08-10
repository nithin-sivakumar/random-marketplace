import mongoose from "mongoose";
import variables from "../global/variables.js";

const connectToDb = async () => {
  console.log(`Attempting to connect to database...`);
  try {
    await mongoose.connect(variables.DB_URL);
    const conn = mongoose.connection;
    console.log(`Connected to database.`);
    console.log(variables.ENVIRONMENT === "dev" && `[DEV] Host: ${conn.host}`);
    console.log(variables.ENVIRONMENT === "dev" && `[DEV] Port: ${conn.port}`);
    console.log(
      variables.ENVIRONMENT === "dev" && `[DEV] Database: ${conn.name}`
    );
  } catch (error) {
    console.log(`Failed to connect to database.`);
    console.log(variables.ENVIRONMENT === "dev" && `[DEV] ${error}`);
    process.exit(1);
  }
};

export default connectToDb;
