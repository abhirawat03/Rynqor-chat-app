/**
 * Compresses an image file by resizing it (if it exceeds maxWidth/maxHeight)
 * and compressing it using canvas.toBlob with JPEG format and quality settings.
 * 
 * @param {File} file - The original image file.
 * @param {Object} options - Compression options.
 * @param {number} options.maxWidth - Maximum width of the compressed image (default: 1600).
 * @param {number} options.maxHeight - Maximum height of the compressed image (default: 1600).
 * @param {number} options.quality - JPEG compression quality, between 0 and 1 (default: 0.75).
 * @returns {Promise<File>} A promise that resolves to the compressed File object.
 */
export const compressImage = (file, { maxWidth = 1600, maxHeight = 1600, quality = 0.75 } = {}) => {
  return new Promise((resolve) => {
    // Only compress images, skip GIF to preserve animation
    if (!file.type.startsWith("image/") || file.type === "image/gif") {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate dimensions to maintain aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            // Create a new File object from the blob
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });

            // If compressed file is larger, keep the original to be safe
            if (compressedFile.size >= file.size) {
              resolve(file);
            } else {
              resolve(compressedFile);
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = event.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};
