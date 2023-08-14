import fangiftService from "../services/fangiftService";
import $ from "jquery";
import LINKS from "../constants/links";

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
