import USER_ROLES from "./pageRoles";

const LINKS = {
  home: {
    path: "/",
    role: USER_ROLES.public,
  },
  vendor: {
    path: "/pages/become-a-vendor",
    role: USER_ROLES.public,
  },
  publicWishlist: {
    path: "/pages/public-wishlist",
    role: USER_ROLES.public,
  },
  howItWorks: {
    path: "/pages/how-it-works",
    role: USER_ROLES.public,
  },
  login: {
    path: "/account/login",
    role: USER_ROLES.public,
  },
  register: {
    path: "/account/register",
    role: USER_ROLES.public,
  },
  account: {
    path: "/pages/user",
    role: USER_ROLES.authenticated,
  },
  wishlist: {
    path: "/pages/wishlist",
    role: USER_ROLES.creator,
  },
  explore: {
    path: "/pages/creators",
    role: USER_ROLES.authenticated,
  },
  marketplace: {
    path: "/collections/all",
    role: USER_ROLES.creator,
  },
};
export default LINKS;
