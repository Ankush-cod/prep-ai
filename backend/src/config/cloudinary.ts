// src/config/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';
import { env, serviceStatus } from './env';

if (serviceStatus.hasCloudinary) {
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
  });
}

export async function uploadResumeToCloudinary(
  buffer: Buffer,
  fileName: string,
  userId: string
): Promise<{ url: string; publicId: string } | null> {
  if (!serviceStatus.hasCloudinary) {
    return null;
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `prepai/resumes/${userId}`,
        resource_type: 'raw',
        public_id: `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`,
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Cloudinary upload failed.'));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );
    stream.end(buffer);
  });
}
