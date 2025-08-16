const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" });

// Serve static files (HTML, CSS, JS)
app.use(express.static("public"));
app.use(express.static("uploads"));

// Upload endpoint
app.post("/upload", upload.single("file"), (req, res) => {
  const id = Math.floor(100000 + Math.random() * 900000).toString(); // random 6-digit number
  const ext = path.extname(req.file.originalname) || ".html";
  const newPath = path.join("uploads", id + ext);

  fs.renameSync(req.file.path, newPath);

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Upload Success</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-900 text-white flex items-center justify-center min-h-screen">
      <div class="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
        <h1 class="text-2xl font-bold mb-4">✅ File Uploaded</h1>
        <p class="mb-2">Your public link:</p>
        <a href="/${id + ext}" target="_blank" 
           class="text-indigo-400 hover:underline text-lg font-mono">
          http://<your-ip>:3000/${id + ext}
        </a>
        <div class="mt-6">
          <a href="/" class="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg shadow-lg">Upload Another</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.listen(3000, () => console.log("🚀 Hosting running at http://localhost:3000"));
