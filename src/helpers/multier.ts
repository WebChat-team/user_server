import multer from "multer";
import path from "path";
import getBase64UID from "./getIdFile";

// Настройка Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = file.mimetype.startsWith('video/') ? 'video' :
            file.mimetype.startsWith('image/') ? 'photo' : 'other';

        cb(null, `./uploads/${dir}`);
    },
    filename: (req, file, cb) => {
        cb(null, getBase64UID() + path.extname(file.originalname));
    },
});
const upload = multer({
    storage: storage,
    limits: { fileSize: Infinity }, // Ограничение на размер файла (100MB)
    fileFilter: (req, file, cb) => {
        // Проверяем тип файла
        if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only videos and images are allowed.'));
        }
    },
});

export default upload;