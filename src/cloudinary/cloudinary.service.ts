import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';
import { extractPublicIdFromUrl } from './utils/extract-public-id';

@Injectable()
export class CloudinaryService {
  
  uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadApiResponse> {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `reports/${folder}`,
          allowed_formats: ["png", "jpg", "jpeg"]
        },
        (error, result) => {
          if (error) {
            console.log(error);
          }
          if (!result) {
            return reject(new Error('Upload result is undefined'));
          }
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadFiles(
    files: Express.Multer.File[],
    folder: string,
  ): Promise<UploadApiResponse[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteImage(imageUrl: string): Promise<boolean> {
    try {
      const publicId = extractPublicIdFromUrl(imageUrl);
      const result = await cloudinary.uploader.destroy(publicId);
      console.log(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      return false;
    }
  }

  async deleteFolderWithImages(folderName: string) {
    try {
      const result = await cloudinary.api.delete_resources_by_prefix(`reports/${folderName}/`, {
        all: true,
      });
      await cloudinary.api.delete_folder(`reports/${folderName}`);
      return result;
    } catch (error) {
      console.error('Error deleting folder with images from Cloudinary:', error);
      throw new InternalServerErrorException();
    }
  }
}