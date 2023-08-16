export const getUserInfo = () => {
  const payload = localStorage.getItem("payload");
  const userInfo = JSON.parse(payload);
  return userInfo;
};
