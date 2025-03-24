export function extractPublicIdFromUrl(url: string): string {
  const parts = url.split('/');
  const uploadIndex = parts.indexOf('reports');
  if (uploadIndex === -1) throw new Error('Invalid Cloudinary URL');

  const relevantParts = parts.slice(uploadIndex);
  const publicIdWithExtension = relevantParts.join('/');
  
  return publicIdWithExtension.split('.')[0];
}