const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary with YOUR credentials
cloudinary.config({
  cloud_name: "563879755855487", // ✅ Your cloud name
  api_key: "NtVwMWB7aD5OoImsqw7_CooDE2g", // ✅ Your API key
  api_secret: "YOUR_API_SECRET_HERE", // ⚠️ Replace with your actual API secret
});

// Create Cloudinary storage
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
