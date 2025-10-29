export function saveTokenInLocalStorage(tokenDetails) {
  tokenDetails.expireDate = new Date(new Date().getTime() + tokenDetails.expiresIn * 1000);
  localStorage.setItem("userDetails", JSON.stringify(tokenDetails));
}

/**
 * Function to clear the authentication token and session data.
 * Clears the 'userDetails' item from localStorage.
 */
export function removeTokenFromLocalStorage() {
  localStorage.removeItem("userDetails");
}
