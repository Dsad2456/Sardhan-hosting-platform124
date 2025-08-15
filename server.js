const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static("public"));

// Create uploads folder if it doesn't exist
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads"),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Upload API
app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).send("No file uploaded");
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

// HTML UI
app.get("/", (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
<title>Sardhan Hosting Platform</title>
<style>
body { font-family: Arial, sans-serif; background: #121212; color: #fff; display: flex; justify-content: center; align-items: center; height: 100vh; }
.container { text-align: center; padding: 20px; background: #1e1e1e; border-radius: 10px; width: 400px; box-shadow: 0 0 20px rgba(0,0,0,0.5); }
input[type=file] { margin: 20px 0; }
.progress { width: 100%; background: #333; border-radius: 5px; overflow: hidden; height: 20px; }
.progress-bar { height: 100%; background: #00e676; width: 0%; transition: width 0.3s; }
</style>
</head>
<body>
<div class="container">
<h1>Sardhan Hosting Platform</h1>
<input type="file" id="fileInput"><br>
<button onclick="uploadFile()">Upload</button>
<div class="progress"><div class="progress-bar" id="progressBar"></div></div>
<p id="status"></p>
<p id="fileLink"></p>
</div>
<script>
function uploadFile() {
    const file = document.getElementById('fileInput').files[0];
    if (!file) return alert("Select a file first!");
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", e => {
        if (e.lengthComputable) {
            const percent = (e.loaded / e.total) * 100;
            document.getElementById("progressBar").style.width = percent + "%";
        }
    });
    xhr.onload = () => {
        if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            document.getElementById("status").innerText = "✅ Upload complete!";
            document.getElementById("fileLink").innerHTML = \`<a href="\${response.url}" target="_blank" style="color:#00e676">View File</a>\`;
        } else {
            document.getElementById("status").innerText = "❌ Upload failed.";
        }
    };
    xhr.open("POST", "/upload");
    xhr.send(formData);
}
</script>
</body>
</html>
    `);
});

// Listen on all network interfaces for Termux/ngrok
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Sardhan Hosting Platform running at http://0.0.0.0:${PORT}`);
});
