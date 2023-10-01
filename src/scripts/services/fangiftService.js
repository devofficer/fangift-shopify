import axios from "axios";
import { refreshSession } from "../utils/session";

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
  async (err) => {
    if (err.response.status === 401) {
      await refreshSession();
    } else {
      return Promise.reject(err);
    }
  }
);

export default fangiftService;
