import express from "express";

const app = express();
const port = "5050";

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello from the server!");
});

app.listen(port, () => {
    console.log(`server is running at http://localhost:${port}`);
});
