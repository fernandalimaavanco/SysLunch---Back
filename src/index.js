import Server from "./server.js";
// import dotenv from 'dotenv';
// dotenv.config();

const server = new Server();
try {
  server.start();
  server.checkDB();

} catch (error) {
  console.error("Error starting server:", error);
}
