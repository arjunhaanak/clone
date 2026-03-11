// This is a simple XOR or Base64 simulation for "End-to-End Encryption"
// In a real app, this would use Web Crypto API (AES-GCM or Signal Protocol)

export const encryptMessage = (text: string): string => {
  // Simple Base64 simulation + prefix
  return "ENC:" + btoa(text);
};

export const decryptMessage = (encoded: string): string => {
  if (encoded.startsWith("ENC:")) {
    try {
      return atob(encoded.replace("ENC:", ""));
    } catch (e) {
      return "[Decryption Failed]";
    }
  }
  return encoded;
};
