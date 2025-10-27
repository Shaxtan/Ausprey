import CryptoJS from "crypto-js";

 
const key = "AUSPREY-TECH!o23"; // 16-byte key
const fixedIV = "AUG0ld79AUG0ld79"; // Fixed IV (padded to 16 bytes internally)

  // AES encryption function with optional fixed IV
    function  encryptAES(plaintext, key, fixedIV = null) {
    let iv;
    if (fixedIV) {
      // Use the fixed IV and pad it to 16 bytes if necessary
      iv = CryptoJS.enc.Utf8.parse(fixedIV.padEnd(16, "0"));
    } else {
      iv = this.generateRandomIV();
    }

    const keyHex = CryptoJS.enc.Utf8.parse(key); // Convert the key to WordArray object

    // Encrypt the plaintext using AES
    const encrypted = CryptoJS.AES.encrypt(plaintext, keyHex, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7, // Use Pkcs7 padding
    });

    // Return the Base64-encoded ciphertext and the IV (concatenated)
    return ( 
      encrypted.ciphertext.toString(CryptoJS.enc.Base64)
    );
  } 

  // AES decryption function
    function decryptAES(data, key,iv=null) {
   // const parts = data.split(":"); // Split the IV and ciphertext from the input data
    //const iv = CryptoJS.enc.Base64.parse(parts[0]); // Parse IV from Base64
    const encrypted = CryptoJS.enc.Base64.parse(data); // Parse ciphertext from Base64
    const keyHex = CryptoJS.enc.Utf8.parse(key); // Convert the key to WordArray object

    // Perform AES decryption using CBC mode and Pkcs7 padding
    const decrypted = CryptoJS.AES.decrypt({ ciphertext: encrypted }, keyHex, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7, // Use Pkcs7 padding
    });

    return CryptoJS.enc.Utf8.stringify(decrypted).trim(); // Convert decrypted bytes to a string and return it
  } 


  export function    handleEncrypt  (plaintext)  {
  
 
     return encryptAES(plaintext, key, fixedIV);
     
  } 

  export function  handleDecrypt (encrypted) {
  
    return decryptAES(encrypted, key,fixedIV);
  }
 