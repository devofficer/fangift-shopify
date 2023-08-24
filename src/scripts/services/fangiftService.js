import axios from "axios";
import LINKS from "../constants/links";

const fangiftService = axios.create({
  baseURL: process.env.API_URL,
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  },
});

fangiftService.interceptors.response.use(
  (res) => {
    return res.data;
  },
  (err) => {
    if (err.response.status === 401) {
      location.pathname = LINKS.login.path;
    } else {
      return Promise.reject(err);
    }
  }
);

export default fangiftService;
