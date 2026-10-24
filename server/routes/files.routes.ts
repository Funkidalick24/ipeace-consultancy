import { Router } from 'express';
import { storage } from '../storage';
import { upload, saveFileMetadata } from '../upload';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { textExtractionService } from '../services/text-extraction';
import path from 'path';
import fs from 'fs';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

export const filesRoutes = Router();

filesRoutes.post('/upload', authenticateToken, upload.single('file'), async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileRecord = await saveFileMetadata(req.file, req.user._id.toString());

    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        id: fileRecord._id.toString(),
        filename: fileRecord.filename,
        originalName: fileRecord.originalName,
        url: fileRecord.url,
        size: fileRecord.size,
        mimetype: fileRecord.mimetype
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to upload file"
    });
  }
});

filesRoutes.post('/upload/multiple', authenticateToken, upload.array('files', 10), async (req: any, res) => {
  try {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const files = req.files as Express.Multer.File[];
    const uploadedFiles = [];

    for (const file of files) {
      const fileRecord = await saveFileMetadata(file, req.user._id.toString());

      uploadedFiles.push({
        id: fileRecord._id.toString(),
        filename: fileRecord.filename,
        originalName: fileRecord.originalName,
        url: fileRecord.url,
        size: fileRecord.size,
        mimetype: fileRecord.mimetype
      });
    }

    res.json({
      success: true,
      message: `${uploadedFiles.length} files uploaded successfully`,
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Multiple file upload error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to upload files"
    });
  }
});

filesRoutes.get('/files', authenticateToken, async (req: any, res) => {
  try {
    const files = await storage.getFilesByUser(req.user._id.toString());
    const filesWithIds = files.map(file => ({
      id: file._id.toString(),
      filename: file.filename,
      originalName: file.originalName,
      url: file.url,
      size: file.size,
      mimetype: file.mimetype,
      createdAt: file.createdAt
    }));

    res.json({ files: filesWithIds });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: "Failed to get files" });
  }
});

filesRoutes.delete('/files/:id', authenticateToken, async (req: any, res) => {
  try {
    const fileId = req.params.id;

    const file = await storage.getFile(fileId);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    if (file.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (file.filePath) {
      const fullPath = path.resolve(UPLOADS_DIR, file.filePath);
      try {
        await fs.promises.unlink(fullPath);
      } catch (unlinkError) {
        console.error('Failed to delete file from disk:', unlinkError);
      }
    }

    const deleted = await storage.deleteFile(fileId);
    if (!deleted) {
      return res.status(404).json({ error: "File not found" });
    }

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

filesRoutes.get('/files/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const file = await storage.getFile(id);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const INLINE_MIMETYPES = new Set([
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
      'application/pdf',
    ]);

    const safeFilename = String(file.originalName).replace(/[\x00-\x1f\x7f"\\]/g, '').slice(0, 255) || 'file';

    res.set({
      'Content-Type': INLINE_MIMETYPES.has(file.mimetype) ? file.mimetype : 'application/octet-stream',
      'Content-Length': file.size,
      'Content-Disposition': `${INLINE_MIMETYPES.has(file.mimetype) ? 'inline' : 'attachment'}; filename="${safeFilename}"; filename*=UTF-8''${encodeURIComponent(safeFilename)}`,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=31536000'
    });

    if (file.filePath) {
      const fullPath = path.resolve(UPLOADS_DIR, file.filePath);
      if (!fs.existsSync(fullPath)) {
        return res.status(404).json({ error: 'File not found on disk' });
      }
      const fileStream = fs.createReadStream(fullPath);
      fileStream.pipe(res);
    } else if (file.data) {
      const { PassThrough } = await import('stream');
      const bufferStream = new PassThrough();
      bufferStream.end(file.data);
      bufferStream.pipe(res);
    } else {
      return res.status(404).json({ error: 'File data not found' });
    }
  } catch (error) {
    console.error('File serving error:', error);
    res.status(500).json({ error: 'Failed to serve file' });
  }
});

filesRoutes.post('/admin/training/upload', authenticateToken, requireAdmin, upload.single('file'), async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileRecord = await saveFileMetadata(req.file, req.user._id.toString(), true);

    res.json({
      success: true,
      message: 'Training file uploaded successfully',
      file: {
        id: fileRecord._id.toString(),
        filename: fileRecord.filename,
        originalName: fileRecord.originalName,
        url: fileRecord.url,
        size: fileRecord.size,
        mimetype: fileRecord.mimetype,
        isTrainingData: fileRecord.isTrainingData,
        trainingEnabled: fileRecord.trainingEnabled,
        extractedText: fileRecord.extractedText ? 'Text extracted successfully' : 'Text extraction failed or not supported'
      }
    });
  } catch (error) {
    console.error('Training file upload error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to upload training file"
    });
  }
});

filesRoutes.get('/admin/training/files', authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const trainingFiles = await storage.getTrainingFiles();
    const filesWithIds = trainingFiles.map(file => ({
      id: file._id.toString(),
      filename: file.filename,
      originalName: file.originalName,
      url: file.url,
      size: file.size,
      mimetype: file.mimetype,
      isTrainingData: file.isTrainingData,
      trainingEnabled: file.trainingEnabled,
      extractedText: file.extractedText,
      createdAt: file.createdAt
    }));

    res.json({ files: filesWithIds });
  } catch (error) {
    console.error('Get training files error:', error);
    res.status(500).json({ error: "Failed to get training files" });
  }
});

filesRoutes.patch('/admin/training/files/:id/status', authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { trainingEnabled } = req.body;

    if (typeof trainingEnabled !== 'boolean') {
      return res.status(400).json({ error: 'trainingEnabled must be a boolean' });
    }

    const updatedFile = await storage.updateFileTrainingStatus(id, true, trainingEnabled);
    if (!updatedFile) {
      return res.status(404).json({ error: "Training file not found" });
    }

    res.json({
      success: true,
      message: `Training file ${trainingEnabled ? 'enabled' : 'disabled'} successfully`,
      file: {
        id: updatedFile._id.toString(),
        trainingEnabled: updatedFile.trainingEnabled
      }
    });
  } catch (error) {
    console.error('Update training file status error:', error);
    res.status(500).json({ error: "Failed to update training file status" });
  }
});
