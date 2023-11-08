import axios from "axios";

const myStoreService = axios.create({
  baseURL: `${process.env.MYSTORE_API_URL}/app/user`,
});

myStoreService.interceptors.response.use((res) => {
  return res.data;
});

export default myStoreService;

export function getMyStoreDetails(userId) {
  return myStoreService.get(
    `${userId}/preregister/vendor/store-details/?lang=en`
  );
}

export async function updateMyStoreDetails(userId, details) {
  const data = await myStoreService.put(
    `${userId}/preregister/bio/?lang=en`,
    details
  );
  return data;
}

export async function getMyStoreCategories(userId) {
  const data = await myStoreService.get(
    `/${userId}/preregister/vendor/categories/?lang=en`
  );
  return data;
}
export async function updateCategories(userId, categories) {
  const data = await myStoreService.put(
    `${userId}/preregister/vendor/categories/?lang=en`,
    categories
  );
  return data.vendor_products;
}

export async function getMyStoreProducts(userId) {
  const data = await myStoreService.get(
    `${userId}/preregister/vendor/product`,
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
    `${userId}/preregister/vendor/product/?lang=en`,
    product
  );
  return data;
}

export async function deleteMyStoreProduct(userId, productId) {
  const data = await myStoreService.delete(
    `${userId}/preregister/vendor/product/?lang=en`,
    {
      product_id: productId,
    }
  );
  return data;
}

export async function updateMyStoreProduct(userId, product) {
  const data = await myStoreService.put(
    `${userId}/preregister/vendor/product/?lang=en`,
    product
  );
  return data;
}

export async function getMySizes(userId) {
  const data = await myStoreService.get(`${userId}/preregister/sizes/?lang=en`);
  return Object.entries(data).reduce(
    (acc, [key, val]) => ({
      ...acc,
      [key.replace(/_([a-z])/g, (g) => g[1].toUpperCase())]: val,
    }),
    {}
  );
}

export async function updateMySizes(userId, sizes) {
  const data = await myStoreService.put(
    `${userId}/preregister/sizes/?lang=en`,
    sizes
  );
  return data;
}
