import PAGE_ROLES from "./pageRoles";

const LINKS = {
  home: {
    path: "/",
    role: PAGE_ROLES.public,
  },
  vendor: {
    path: "/pages/become-a-vendor",
    role: PAGE_ROLES.public,
  },
  publicWishlist: {
    path: "/pages/public-wishlist",
    role: PAGE_ROLES.public,
  },
  publicMarketPlace: {
    path: "/pages/marketpalce",
    role: PAGE_ROLES.public,
  },
  howItWorks: {
    path: "/pages/how-it-works",
    role: PAGE_ROLES.public,
  },
  login: {
    path: "/account/login",
    role: PAGE_ROLES.public,
  },
  register: {
    path: "/account/register",
    role: PAGE_ROLES.public,
  },
  account: {
    path: "/pages/user",
    role: PAGE_ROLES.public,
  },
  wishlist: {
    path: "/pages/wishlist",
    role: PAGE_ROLES.creator,
  },
  explore: {
    path: "/pages/creators",
    role: PAGE_ROLES.public,
  },
  marketplace: {
    path: "/pages/fangifts",
    role: PAGE_ROLES.creator,
  },
  orders: {
    path: "/pages/orders",
    role: PAGE_ROLES.authenticated,
  },
  settings: {
    path: "/pages/settings",
    role: PAGE_ROLES.authenticated,
  },
  verification: {
    path: "/pages/verification",
    role: PAGE_ROLES.public,
  },
  resetPassword: {
    path: "/pages/reset-password",
    role: PAGE_ROLES.public,
  },
  confirmPassword: {
    path: "/pages/confirm-password",
    role: PAGE_ROLES.public,
  },
};
export default LINKS;
