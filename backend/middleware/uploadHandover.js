// Photos for pickup/return reports and disputes, stored on Cloudinary.
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: "wheelz-handover",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "heic"],
    transformation: [{ width: 1600, height: 1600, crop: "limit", quality: "auto" }],
    public_id: `${req.params.id}-${req.user._id}-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
  }),
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 10 },
  fileFilter: (req, file, cb) =>
    /^image\//.test(file.mimetype) ? cb(null, true) : cb(new Error("Only photos can be uploaded")),
});

// Up to 10 photos in "photos", with a matching "labels" array in the body.
const photos = (req, res, next) =>
  upload.array("photos", 10)(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });

// Uploaded files paired with their labels ("front", "odometer"...).
const uploadedPhotos = (req) => {
  const labels = [].concat(req.body.labels || []);
  return (req.files || []).map((f, i) => ({ url: f.path, label: labels[i] || `photo ${i + 1}` }));
};

module.exports = { photos, uploadedPhotos };
