import axios from "axios";

const myStoreService = axios.create({
  baseURL: process.env.MYSTORE_API_URL,
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  },
});

myStoreService.interceptors.response.use((res) => {
  return res.data;
});

export default myStoreService;

export function getMyStoreDetails(userId) {
  return myStoreService.get(
    `app/user/${userId}/preregister/vendor/store-details/?lang=en`
  );
}

export async function updateMyStoreDetails(userId, details) {
  const data = await myStoreService.put(
    `app/user/${userId}/preregister/bio/?lang=en`,
    details
  );
  return data;
}

export async function updateCategories(userId, categories) {
  const data = await myStoreService.put(
    `app/user/${userId}/preregister/vendor/categories/?lang=en`,
    categories
  );
  return data;
}

export async function createProduct(userId, product) {
  const data = await myStoreService.post(
    `app/user/${userId}/preregister/vendor/product/?lang=en`,
    product
  );
  return data;
}

export async function deleteProduct(userId, product) {
  const data = await myStoreService.post(
    `app/user/${userId}/preregister/vendor/product/?lang=en`,
    product
  );
  return data;
}
