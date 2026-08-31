const multer = require("multer");
const path = require("path");
const fs = require("fs");

const dirName = "ExcelFiles";
const FolderPath = path.join(process.cwd(), dirName);


if (!fs.existsSync(FolderPath)) {
    fs.mkdirSync(FolderPath, { recursive: true });
}


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, dirName);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);

    }
})


const upload = multer({ storage });

module.exports = upload;