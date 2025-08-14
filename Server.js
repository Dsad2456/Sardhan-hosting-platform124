const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static("public"));

// Create uploads folder if not exists
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads"),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

// Upload route
app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).send("No file uploaded");
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

app.listen(PORT, () => {
    console.log(`🚀 Sardhan Hosting Platform running at http://localhost:${PORT}`);
});
