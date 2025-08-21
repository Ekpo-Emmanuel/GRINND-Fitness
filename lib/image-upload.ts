import { createClient } from '@/lib/supabase/client';

export const compressImage = (file: File, maxWidth: number = 400, quality: number = 0.8): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to compress image'));
        }
      }, 'image/jpeg', quality);
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const validateImage = (file: File): { isValid: boolean; error?: string } => {
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'Please select a valid image file' };
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { isValid: false, error: 'Image size must be less than 5MB' };
  }

  return { isValid: true };
};

export const uploadProfileImage = async (file: File, userId: string): Promise<string> => {
  const validation = validateImage(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const supabase = createClient();
  const compressedImage = await compressImage(file);
  
  const fileName = `${userId}-${Date.now()}.jpg`;
  const { error } = await supabase.storage
    .from('profile-images')
    .upload(fileName, compressedImage, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('profile-images')
    .getPublicUrl(fileName);

  return publicUrl;
}; 