const multer = require("multer");
const maxSize = 2 * 1024 * 1024;
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/Banners");
  },
  filename: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    cb(null, `IMG-${Date.now()}` + ext);
  },
});

const imageFileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error("File format not supported."), false);
  }
  cb(null, true);
};

const uploads = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: maxSize },
}).single("blogBanner");

module.exports = uploads;
