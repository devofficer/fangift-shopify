import axios from "axios";

const restcountriesService = axios.create({
  baseURL: "https://restcountries.com/v3.1/",
});

restcountriesService.interceptors.response.use((res) => {
  return res.data;
});

export const getAllCountries = (fields = "name,flags,cca2") => {
  return restcountriesService.get("all", {
    params: {
      fields,
    },
  });
};

export const getCountryInfo = (code, fields = "name,flags") => {
  return restcountriesService.get(`alpha/${code}`, {
    params: {
      fields,
    },
  });
};

export default restcountriesService;
