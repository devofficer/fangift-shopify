import axios from "axios";

const myStoreService = axios.create({
  baseURL: `${process.env.MYSTORE_API_URL}/app`,
});

myStoreService.interceptors.response.use((res) => {
  return res.data;
});

export default myStoreService;

export function getMyStoreDetails(userId) {
  return myStoreService.get(
    `/user/${userId}/preregister/vendor/store-details/?lang=en`
  );
}

export async function updateMyStoreDetails(userId, details) {
  const data = await myStoreService.put(
    `/user/${userId}/preregister/bio/?lang=en`,
    details
  );
  return data;
}

export async function getMyStoreCategories(userId) {
  const data = await myStoreService.get(
    `user/${userId}/preregister/vendor/categories/?lang=en`
  );
  return data;
}
export async function updateCategories(userId, categories) {
  const data = await myStoreService.put(
    `/user/${userId}/preregister/vendor/categories/?lang=en`,
    categories
  );
  return data.vendor_products;
}

export async function getMyStoreProducts(userId) {
  const data = await myStoreService.get(
    `/user/${userId}/preregister/vendor/product`,
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
    `/user/${userId}/preregister/vendor/product/?lang=en`,
    product
  );
  return data;
}

export async function deleteMyStoreProduct(userId, productId) {
  const data = await myStoreService.delete(
    `/user/${userId}/preregister/vendor/product/?lang=en`,
    {
      product_id: productId,
    }
  );
  return data;
}

export async function updateMyStoreProduct(userId, product) {
  const data = await myStoreService.put(
    `/user/${userId}/preregister/vendor/product/?lang=en`,
    product
  );
  return data;
}

export async function getMySizes(userId) {
  const data = await myStoreService.get(
    `/user/${userId}/preregister/sizes/?lang=en`
  );
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
    `/user/${userId}/preregister/sizes/?lang=en`,
    sizes
  );
  return data;
}

export async function getProducts({
  country,
  category,
  resultsPerPage = 20,
  page = 1,
}) {
  const data = await myStoreService.get(`/products`, {
    params: { country, category, resultsPerPage, page },
  });
  return data;
}

export async function getAddress(userId) {
  const data = await myStoreService.get(
    `/user/${userId}/account/address/?lang=en`
  );
  return data;
}

export async function updateAddress(userId, data) {
  const res = await myStoreService.put(
    `/user/${userId}/account/address/?lang=en`,
    data
  );
  return res;
}

export async function getMySocial(userId) {
  const data = await myStoreService.get(
    `/user/${userId}/account/social/?lang=en`
  );
  return data;
}

export async function updateMySocial(userId, socials) {
  const data = await myStoreService.put(
    `/user/${userId}/account/social/?lang=en`,
    socials
  );
  return data;
}

export async function getSuggestedProducts(country) {
  const { results } = await myStoreService.get(
    `/products/welcome/?lang=en&country=${country}`
  );
  return results.reduce(
    (acc, prod) => ({
      ...acc,
      [prod.category]: acc[prod.category]
        ? acc[prod.category].length >= 3
          ? acc[prod.category]
          : [...acc[prod.category], prod]
        : [prod],
    }),
    {}
  );
}

export async function addSuggestedProducts(userId, products) {
  const data = await myStoreService.post(
    `/user/${userId}/welcome-products/?lang=en`,
    {
      productArray: products.map((prod) => ({
        productId: prod.productId,
        variantId: prod.variantId,
        price: prod.price,
        description: prod.description,
        title: prod.title,
        imageUrl: prod.imageUrl,
      })),
    }
  );
  return data;
}
