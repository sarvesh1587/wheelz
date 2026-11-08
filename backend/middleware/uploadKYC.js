const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Credentials come from the environment, never from source control.
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.warn("⚠️ Cloudinary: CLOUDINARY_* env vars not set, KYC uploads will fail");
}
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "wheelz-kyc",
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    transformation: [{ width: 800, height: 600, crop: "limit" }],
    public_id: (req, file) => {
      const uniqueSuffix = `${req.user.id}-${Date.now()}-${file.fieldname}`;
      return uniqueSuffix;
    },
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, or PDF files are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const kycUpload = upload.fields([
  { name: "drivingLicenseFront", maxCount: 1 },
  { name: "drivingLicenseBack", maxCount: 1 },
  { name: "aadhaarFront", maxCount: 1 },
  { name: "aadhaarBack", maxCount: 1 },
]);

module.exports = kycUpload;
