import LINKS from "../constants/links";
import PAGE_ROLES from "../constants/pageRoles";
import { getCountryInfo } from "../services/restcountriesService";
import { refreshSession } from "../utils/session";
import { getS3Url } from "../utils/string";

export function updateUserInfo(userInfo) {
  userInfo = userInfo ?? JSON.parse(localStorage.getItem("payload"));
  if (userInfo) {
    window.gUserInfo = Object.freeze(
      Object.entries(userInfo).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key.replace("custom:", "")]: value,
        }),
        {}
      )
    );
    Object.defineProperty(window, "window.gUserInfo", {
      configurable: false,
      writable: false,
    });
  }
}

const showProfileMenu = async (page) => {
  if (
    page.role === PAGE_ROLES.creator &&
    window.gUserInfo?.type !== PAGE_ROLES.creator
  ) {
    window.location.href = LINKS.orders.path;
    return;
  }

  if (window.gUserInfo?.picture) {
    $("#img-avatar").prop("src", getS3Url(window.gUserInfo?.picture));
  }

  if (window.gUserInfo?.type === PAGE_ROLES.creator) {
    $("#logo").prop("href", LINKS.wishlist.path);
    $("#link-public-wishlist").prop("href", `/${window.gUserInfo?.name}`);
    $(".shipping-country").addClass("md:flex");
    $(".shipping-country-mb").addClass("flex");
    $(".shipping-country-mb").removeClass("hidden");
    $(".creator-menu").addClass("lg:flex");
    $(".creator-menu-mb").removeClass("hidden");
    $(".creator-menu-mb").addClass("flex");

    try {
      const country = await getCountryInfo(window.gUserInfo?.country);
      $(".img-shipping-country").prop("src", country.flags.png);
      $(".text-shipping-country").text(country.name.common);
    } catch (err) {
      console.log(err);
    }
  } else {
    $("#logo").prop("href", LINKS.orders.path);
    $(".creator-only").remove();
    $(".fan-menu").addClass("lg:flex");
    $(".fan-menu-mb").removeClass("hidden");
    $(".fan-menu-mb").addClass("flex");
  }

  $("body").removeClass("hidden");
};

$(async function () {
  const pathname = location.pathname;
  const page = Object.values(LINKS).find((link) => pathname === link.path);
  const expiration = Number(localStorage.getItem("exp"));
  const validExp = new Date() < new Date(expiration);

  updateUserInfo();

  $("#btn-signout").on("click", function () {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("exp");
    localStorage.removeItem("payload");
    localStorage.removeItem("refreshToken");
    location.href = "/account/login";
  });

  if (page === undefined || page.role === PAGE_ROLES.unknown) {
    window.location.href = LINKS.home.path;
  } else if (page.role === PAGE_ROLES.public) {
    if (page.path === LINKS.home.path) {
      if (validExp) {
        const nextPage =
          window.gUserInfo?.type === PAGE_ROLES.creator
            ? LINKS.wishlist.path
            : LINKS.orders.path;
        window.location.href = nextPage;
      } else if (localStorage.getItem("refreshToken")) {
        refreshSession(true);
      } else {
        $("body").removeClass("hidden");
        $("#profile-settings").addClass("hidden");
      }
    } else {
      $("body").removeClass("hidden");
      $("#profile-settings").addClass("hidden");
    }
  } else if (validExp) {
    showProfileMenu(page);
  } else {
    await refreshSession();
  }
});
