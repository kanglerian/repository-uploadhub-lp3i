const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 3032;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));
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
    const id = req.body.id;
    const type = req.body.type;
    const series = req.body.series;
    const typefile = req.body.typefile;
    const identity = req.body.identity;
    const fileData = Buffer.from(req.body.file, 'base64');
    const folderPath = path.join(__dirname, `uploads/${identity}`);
    const destination = path.join(__dirname, `uploads/${identity}`,`${identity}-${type}-${series}-${id}.${typefile}`);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true })
    }
    fs.writeFileSync(destination, fileData);
    return res.json({
      status: 200,
      message: 'Berhasil mengunggah berkas!'
    });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

app.delete('/delete/:identity/:filename', async (req, res) => {
  try {
    console.log(req.params);
    const identity = req.params.identity;
    const filename = req.params.filename;
    const destination = path.join(__dirname, `uploads/${identity}`, filename);
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
