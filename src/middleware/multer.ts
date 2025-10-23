import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage(
    {
        destination: function (_req, _file, cb) {
            cb(null, 'uploads/');
        },
        filename: function (_req, file, cb) {
            cb(null, Date.now() + '-' + Math.round(Math.random() * 1000) + '-' + file.originalname);
        }
    }
);
const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const isExtensionValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const isMimeTypeValid = allowedTypes.test(file.mimetype);
    if (isExtensionValid && isMimeTypeValid) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed (jpeg, jpg, png, gif, webp)'));
    }
}
export const upload = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit