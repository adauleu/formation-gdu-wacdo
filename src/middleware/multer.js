"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (_req, file, cb) {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1000) + '-' + file.originalname);
    }
});
const fileFilter = (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const isExtensionValid = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const isMimeTypeValid = allowedTypes.test(file.mimetype);
    if (isExtensionValid && isMimeTypeValid) {
        cb(null, true);
    }
    else {
        cb(new Error('Only images are allowed (jpeg, jpg, png, gif, webp)'));
    }
};
exports.upload = (0, multer_1.default)({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit
