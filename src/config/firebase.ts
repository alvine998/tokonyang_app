// Image upload utilities for React Native
// Note: Firebase JS SDK is not compatible with React Native Blob implementation
// This module provides utilities for handling images - either storing locally or uploading to a backend API

// Convert image URI to base64 using fetch (for display purposes)
export const getBase64FromUri = async (uri: string): Promise<string | null> => {
  try {
    // This is a placeholder - in a real implementation you might use
    // react-native-fs or react-native-blob-util for proper file handling
    return null;
  } catch (error) {
    console.error('Error converting to base64:', error);
    return null;
  }
};

// Upload image to backend API
export const uploadImageToApi = async (
  uri: string,
  apiEndpoint: string,
  headers: Record<string, string>,
): Promise<string | null> => {
  try {
    const formData = new FormData();

    // Create file object for React Native
    const filename = uri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
      uri: uri,
      name: filename,
      type: type,
    } as any);

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    const result = await response.json();

    // Adjust this based on your API response structure
    return result.url || result.data?.url || result.file_url || null;
  } catch (error) {
    console.error('Error uploading to API:', error);
    throw error;
  }
};

// Upload multiple images to backend API
export const uploadMultipleImagesToApi = async (
  uris: string[],
  apiEndpoint: string,
  headers: Record<string, string>,
  onProgress?: (completed: number, total: number) => void,
): Promise<string[]> => {
  const uploadedUrls: string[] = [];

  for (let i = 0; i < uris.length; i++) {
    const uri = uris[i];

    try {
      const url = await uploadImageToApi(uri, apiEndpoint, headers);
      if (url) {
        uploadedUrls.push(url);
      }

      if (onProgress) {
        onProgress(i + 1, uris.length);
      }
    } catch (error) {
      console.error(`Error uploading image ${i + 1}:`, error);
      throw error;
    }
  }

  return uploadedUrls;
};

// For now, just return the local URIs (images will be displayed from local storage)
// When submitting the ad, you can either:
// 1. Upload images to your backend and get URLs
// 2. Send images as part of the form data when creating the ad
export const processSelectedImages = (uris: string[]): string[] => {
  return uris;
};
