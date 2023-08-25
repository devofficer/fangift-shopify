import fangiftService from "../services/fangiftService";
import LINKS from "../constants/links";
import spinner from "../utils/snip";
import { getS3Url } from "../utils/string";

$(function () {
  const pathname = window.location.pathname;
  const isPublicPage =
    pathname === "/" ||
    Object.values(LINKS)
      .filter((link) => link.public)
      .some((link) => pathname.startsWith(link.path));
  const expiration = Number(localStorage.getItem("exp"));
  const validExp = new Date() < new Date(expiration);

  if (isPublicPage) {
    $("body").removeClass("hidden");
  } else if (validExp) {
    if (pathname === LINKS.home.path) {
      const overlay = $('<div class="h-screen w-screen"></div>');
      $("html").append(overlay);
      spinner.spin(overlay[0]);
      window.location = LINKS.wishlist.path;
    } else {
      window.gUserInfo = Object.freeze(
        JSON.parse(localStorage.getItem("payload"))
      );
      Object.defineProperty(window, "gUserInfo", {
        configurable: false,
        writable: false,
      });

      if (gUserInfo.picture) {
        $("#img-avatar").prop("src", getS3Url(gUserInfo.picture));
      }

      $("body").removeClass("hidden");
    }
  } else {
    const overlay = $('<div class="h-screen w-screen"></div>');
    $("html").append(overlay);
    spinner.spin(overlay[0]);
    fangiftService.get("/auth").then((userInfo) => {
      if (userInfo) {
        if (pathname === LINKS.home.path) {
          window.location.pathname = LINKS.wishlist.path;
        } else {
          window.gUserInfo = Object.freeze(gUserInfo);
          Object.defineProperty(window, "gUserInfo", {
            configurable: false,
            writable: false,
          });
          $("body").removeClass("hidden");
          spinner.stop();
          overlay.detach();
        }
      }
    });
  }
});
