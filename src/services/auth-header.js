export default function authHeader() {
  const userAuth = JSON.parse(localStorage.getItem("userDetails"));

  if (userAuth && userAuth.jwtToken) {
    return { Authorization: "Bearer " + userAuth.jwtToken };
  } else {
    return {};
  }
}
