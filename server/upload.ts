import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { storage } from './storage';
import { textExtractionService } from './services/text-extraction';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configure multer for memory storage
const storageConfig = multer.memoryStorage();

// File filter to allow all file types
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow all file types
  cb(null, true);
};

// Configure multer
export const upload = multer({
  storage: storageConfig,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for various file types
  }
});

// Helper function to save file metadata to database
export const saveFileMetadata = async (file: Express.Multer.File, userId: string, isTrainingData: boolean = false) => {
  let extractedText: string | undefined;

  // Extract text if this is a training data file and the file type is supported
  if (isTrainingData && textExtractionService.isSupportedType(file.mimetype)) {
    const extractionResult = await textExtractionService.extractText(
      file.buffer,
      file.mimetype,
      file.originalname
    );

    if (extractionResult.success && extractionResult.text) {
      extractedText = extractionResult.text;
    } else {
      console.warn(`Text extraction failed for ${file.originalname}: ${extractionResult.error}`);
    }
  }

  const fileData = {
    filename: file.originalname, // Use original name as filename since we're not generating unique names
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    data: file.buffer, // Store the binary data
    url: `/api/files/`, // Base URL, ID will be appended
    uploadedBy: new mongoose.Types.ObjectId(userId),
    // AI Training Data fields
    isTrainingData,
    extractedText,
    trainingEnabled: isTrainingData // Enable by default if marked as training data
  };

  const savedFile = await storage.createFile(fileData);
  // Update URL with the actual ID
  savedFile.url = `/api/files/${savedFile._id}`;
  await savedFile.save();

  return savedFile;
};