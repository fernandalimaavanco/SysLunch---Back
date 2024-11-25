import cors from "cors";
import express from "express";
import pool from "./Database/pg.js";
import orderRoutes from "./routes/orderRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import loginRoutes from "./routes/loginRoutes.js";
import fs from "fs";
import path from "path";

class Server {
  constructor() {
    this.app = express()
  }

  start() {

    const __dirname = path.resolve();
    const uploadDir = path.join(__dirname, 'uploads');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    this.app.use(cors());
    this.app.use(express.json());
    this.app.use("/api", orderRoutes, itemRoutes, paymentRoutes, userRoutes, loginRoutes)
    this.app.listen(8000, () => {
      console.log("Server is running on port 8000");
    });
  }
  checkDB() {
    pool.query("SELECT NOW()", (err, res) => {
      if (err) {
        throw err;
      } else {
        console.log("DB is connected");
      }
    });
  }
}
export default Server;
