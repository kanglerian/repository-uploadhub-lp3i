const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 3032;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('Repository LP3I Upload HUb');
});

app.get('/download', (req, res) => {
  const identity = req.query.identity;
  const filename = req.query.filename;
  const filePath = path.join(__dirname, `uploads/${identity}`, `${filename}`);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.sendFile(filePath);
});

app.post('/upload', async (req, res) => {
  try {
    const identity = req.body.identity;
    const type = req.body.type;
    const series = req.body.series;
    const typefile = req.body.typefile;
    const fileData = Buffer.from(req.body.file, 'base64');
    const folderPath = path.join(__dirname, `uploads/${identity}`);
    const destination = path.join(__dirname, `uploads/${identity}`, `${identity}-${type}-${series}.${typefile}`);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true })
    }
    fs.writeFileSync(destination, fileData);
    return res.json({
      status: 200
    });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

app.delete('/delete', async (req, res) => {
  try {
    const identity = req.body.identity;
    const type = req.body.type;
    const series = req.body.series;
    const typefile = req.body.typefile;
    const destination = path.join(__dirname, `uploads/${identity}`, `${identity}-${type}-${series}.${typefile}`);
    fs.access(destination, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(404).json({ error: 'Berkas tidak ditemukan.' });
      }

      fs.unlink(destination, (err) => {
        if (err) {
          return res.json(err);
        }
        return res.json({ message: 'Berkas berhasil dihapus!' })
      })
    });
  } catch (error) {
    return res.status(500).json({ error: "Terjadi kesalahan pada server." });
  }
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
})
