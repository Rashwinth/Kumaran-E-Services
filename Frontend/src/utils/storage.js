import CryptoJS from "crypto-js";

const SECRET_KEY = `${import.meta.env.VITE_ENCRYPTION_SECRET_KEY}`; // In a real app, this should be in .env

export const saveEncrypted = (key, data) => {
  try {
    const stringifiedData = JSON.stringify(data);
    const encryptedData = CryptoJS.AES.encrypt(
      stringifiedData,
      SECRET_KEY
    ).toString();
    localStorage.setItem(key, encryptedData);
  } catch (error) {
    console.error("Encryption error:", error);
  }
};

export const getDecrypted = (key) => {
  try {
    const encryptedData = localStorage.getItem(key);
    if (!encryptedData) return null;
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};
