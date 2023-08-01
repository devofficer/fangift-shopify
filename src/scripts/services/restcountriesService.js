import axios from "axios";

const restcountriesService = axios.create({
  baseURL: "https://restcountries.com/v3.1/",
});

restcountriesService.interceptors.response.use((res) => {
  return res.data;
});

export default restcountriesService;
