import * as fs from 'fs';
import * as path from 'path';
import multer from 'multer';

class FaceRecognitionService {
  // Configuración de multer para subida de archivos
  public upload = this.getMulterConfig();
  
  getMulterConfig() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadsDir = path.join(__dirname, '../../uploads/faces');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
      },
      filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;
        cb(null, uniqueName);
      }
    });

    return multer({
      storage,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Solo se permiten archivos de imagen'));
        }
      }
    });
  }

  async saveFaceImage(imageBuffer: Buffer, clientId: string): Promise<string> {
    const uploadsDir = path.join(__dirname, '../../uploads/faces');
    
    // Crear directorio si no existe
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `${clientId}_${Date.now()}.jpg`;
    const filePath = path.join(uploadsDir, fileName);
    
    fs.writeFileSync(filePath, imageBuffer);
    
    return filePath;
  }

  deleteFaceImage(imagePath: string): void {
    try {
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
    }
  }

  // Método para validar si existe una imagen
  imageExists(imagePath: string): boolean {
    return fs.existsSync(imagePath);
  }

  // Método para obtener la ruta relativa de la imagen
  getRelativeImagePath(fullPath: string): string {
    const uploadsIndex = fullPath.indexOf('uploads');
    return uploadsIndex !== -1 ? fullPath.substring(uploadsIndex) : fullPath;
  }
}

export default new FaceRecognitionService(); 