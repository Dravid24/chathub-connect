const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB connected successfully ${connect.connection.host}`);
  } catch (error) {
    console.log(`Error to connect DB: ${error.message}`);
    process.exit();
  }
};

module.exports = connectDB;
