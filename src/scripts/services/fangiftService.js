import axios from "axios";
import LINKS from "../constants/links";
import spinner from "../utils/snip";

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
      const overlay = $(
        '<div class="fixed inset-0 screen bg-white z-[9999999] [body:over]"></div>'
      );
      $("html").append(overlay);
      spinner.spin(overlay[0]);

      try {
        const payload = JSON.parse(localStorage.getItem("payload"));
        const res = await fangiftService.post("/auth/refresh-session", {
          refreshToken: localStorage.getItem("refreshToken"),
          email: payload.email,
        });
        localStorage.setItem("accessToken", res.accessToken);
        localStorage.setItem("refreshToken", res.refreshToken);
        localStorage.setItem("exp", Number(res.exp) * 1000);
        localStorage.setItem("payload", JSON.stringify(res.payload));
        window.location.reload();
      } catch (err) {
        window.location.href = LINKS.login.path;
      }
    } else {
      return Promise.reject(err);
    }
  }
);

export default fangiftService;
