// export const isAuthenticated = (state) => {
//   let userDetails = localStorage.getItem("userDetails");
//   if (userDetails) {
//     userDetails = JSON.parse(userDetails);
//   }

//   if (userDetails) {
//     return true;
//   } else {
//     return false;
//   }
// };
export const isAuthenticated = () => {
  const userDetails = localStorage.getItem("userDetails");
  return userDetails !== null; // Directly check for existence
};
