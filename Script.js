const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');
const { nanoid } = require('nanoid');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const SITES_DIR = path.join(__dirname, 'sites');
if (!fs.existsSync(SITES_DIR)) fs.mkdirSync(SITES_DIR);

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

function safeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

app.post('/api/upload', upload.single('site'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const originalName = req.file.originalname || 'site';
    const ext = path.extname(originalName).toLowerCase();
    const slug = nanoid(8);
    const sitePath = path.join(SITES_DIR, slug);
    fs.mkdirSync(sitePath);

    if (ext === '.zip') {
      const zip = new AdmZip(req.file.buffer);
      zip.getEntries().forEach(entry => {
        if (entry.entryName.includes('..')) return;
        const outPath = path.join(sitePath, entry.entryName);
        if (entry.isDirectory) {
          fs.mkdirSync(outPath, { recursive: true });
        } else {
          fs.mkdirSync(path.dirname(outPath), { recursive: true });
          fs.writeFileSync(outPath, entry.getData());
        }
      });
    } else {
      fs.writeFileSync(path.join(sitePath, 'index.html'), req.file.buffer);
    }

    fs.writeFileSync(path.join(sitePath, '.meta.json'), JSON.stringify({
      createdAt: new Date().toISOString(),
      originalName,
      slug
    }, null, 2));

    res.json({ url: `/s/${slug}/` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/sites', express.static(SITES_DIR, { index: false }));

app.get('/s/:slug/*', (req, res) => {
  const requested = path.join(SITES_DIR, req.params.slug, req.params[0] || '');
  if (fs.existsSync(requested)) return res.sendFile(requested);
  res.status(404).send('Not found');
});

app.get('/s/:slug', (req, res) => {
  const indexPath = path.join(SITES_DIR, req.params.slug, 'index.html');
  if (fs.existsSync(indexPath)) return res.sendFile(indexPath);
  res.status(404).send('Site not found');
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
