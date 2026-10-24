import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { storage } from './storage';
import { textExtractionService } from './services/text-extraction';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const ALLOWED_MIMETYPES = new Set([
  'text/plain',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/mp4',
  'audio/wav',
  'audio/webm',
]);

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (!ALLOWED_MIMETYPES.has(file.mimetype)) {
    const err = new Error(`File type not allowed: ${file.mimetype}`) as Error & { status?: number };
    err.status = 415;
    return cb(err);
  }
  cb(null, true);
};

const sanitizeFilename = (name: string): string => {
  const basename = path.basename(name).replace(/[\x00-\x1f\x7f"\\]/g, '');
  return basename.slice(0, 255) || 'unnamed';
};

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const safeName = sanitizeFilename(file.originalname);
    const ext = path.extname(safeName);
    const base = path.basename(safeName, ext);
    cb(null, `${base}-${uniqueSuffix}${ext}`);
  }
});

export const upload = multer({
  storage: diskStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  }
});

export const saveFileMetadata = async (file: Express.Multer.File, userId: string, isTrainingData: boolean = false) => {
  let extractedText: string | undefined;

  if (isTrainingData && textExtractionService.isSupportedType(file.mimetype)) {
    const fileBuffer = await fs.promises.readFile(file.path);
    const extractionResult = await textExtractionService.extractText(
      fileBuffer,
      file.mimetype,
      file.originalname
    );

    if (extractionResult.success && extractionResult.text) {
      extractedText = extractionResult.text;
    } else {
      console.warn(`Text extraction failed for ${file.originalname}: ${extractionResult.error}`);
    }
  }

  const safeName = sanitizeFilename(file.originalname);
  const relativePath = path.relative(UPLOADS_DIR, file.path);

  const savedFile = await storage.createFile({
    filename: safeName,
    originalName: safeName,
    mimetype: file.mimetype,
    size: file.size,
    filePath: relativePath,
    url: `/api/files/`,
    uploadedBy: new mongoose.Types.ObjectId(userId),
    isTrainingData,
    extractedText,
    trainingEnabled: isTrainingData
  });

  savedFile.url = `/api/files/${savedFile._id}`;
  await savedFile.save();

  return savedFile;
};
