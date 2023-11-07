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

export async function getMyStoreCategories(userId) {
  const data = await myStoreService.get(
    `/app/user/${userId}/preregister/vendor/categories/?lang=en`
  );
  return data;
}
export async function updateCategories(userId, categories) {
  const data = await myStoreService.put(
    `app/user/${userId}/preregister/vendor/categories/?lang=en`,
    categories
  );
  return data.vendor_products;
}

export async function getMyStoreProducts(userId) {
  const data = await myStoreService.get(
    `app/user/${userId}/preregister/vendor/product`,
    {
      params: {
        lang: "en",
      },
    }
  );
  return data.vendor_products;
}

export async function createMyStoreProduct(userId, product) {
  const data = await myStoreService.post(
    `app/user/${userId}/preregister/vendor/product/?lang=en`,
    product
  );
  return data;
}

export async function deleteMyStoreProduct(userId, productId) {
  const data = await myStoreService.delete(
    `app/user/${userId}/preregister/vendor/product/?lang=en`,
    { productId }
  );
  return data;
}

export async function updateMyStoreProduct(userId, product) {
  const data = await myStoreService.put(
    `app/user/${userId}/preregister/vendor/product/?lang=en`,
    product
  );
  return data;
}
