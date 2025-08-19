const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
const cors = require("cors");
const Datastore = require("nedb");
const { v4: uuidv4 } = require("uuid");

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
app.use(cors());

const db = new Datastore({ filename: "photos.db", autoload: true });

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload API: lưu url và id vào NeDB
app.post("/api/upload", upload.single("photo"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const stream = cloudinary.uploader.upload_stream(
    { resource_type: "image", folder: "graduation_photos" },
    (error, result) => {
      if (error) return res.status(500).json({ error });
      const id = uuidv4();
      const photoDoc = { id, url: result.secure_url, createdAt: new Date() };
      db.insert(photoDoc, (err, newDoc) => {
        if (err) return res.status(500).json({ error: "DB error" });
        res.json({
          id,
          url: result.secure_url,
          shareLink: `https://graduation-8rv9.onrender.com/api/photo/${id}`,
        });
      });
    }
  );
  stream.end(req.file.buffer);
});
// API lấy danh sách tất cả ảnh
app.get("/api/photos", (req, res) => {
  db.find({}, (err, docs) => {
    if (err) return res.status(500).json({ success: false, error: "DB error" });
    res.json({ success: true, photos: docs });
  });
});
// API lấy ảnh theo id
app.get("/api/photo/:id", (req, res) => {
  const { id } = req.params;
  db.findOne({ id }, (err, doc) => {
    if (err || !doc) return res.status(404).json({ error: "Not found" });
    res.json({ url: doc.url });
  });
});

app.listen(5000, () => {
  console.log("Server running on https://graduation-8rv9.onrender.com");
});
