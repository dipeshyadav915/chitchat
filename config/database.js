// db.js
const { Sequelize } = require("sequelize");

// Replace with your own DB credentials
const sequelize = new Sequelize({
  dialect: "mysql",
  host: "localhost",
  username: "root",
  password: "",
  database: "ChitChat",
  timezone: "+05:30",
  // logging: false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected!");
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
