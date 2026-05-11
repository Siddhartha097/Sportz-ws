import express from "express";
import { matchRouter } from "./routes/matches.js"; // Added .js extension

const app = express();
const port = "5050";

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello from the server!");
});

app.use("/matches", matchRouter);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});