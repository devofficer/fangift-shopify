import axios from "axios";

const fangiftService = axios.create({
  baseURL: "http://localhost:3000",
});

fangiftService.interceptors.response.use((res) => {
  return res.data;
});

export default fangiftService;
