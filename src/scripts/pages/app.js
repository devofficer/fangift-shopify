import fangiftService from "../services/fangiftService";
import LINKS from "../constants/links";

$(function () {
  const isPublicPage = Object.values(LINKS)
    .filter((link) => link.public)
    .some((link) => window.location.pathname.startsWith(link.path));

  if (isPublicPage) {
    $("body").removeClass("hidden");
  } else {
    fangiftService.get("/auth").then((userInfo) => {
      if (userInfo) {
        $("body").removeClass("hidden");
      }
    });
  }
});
