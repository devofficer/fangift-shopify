import fangiftService from "../services/fangiftService";
import LINKS from "../constants/links";
import spinner from "../utils/snip";

function showOverlay() {
  const overlay = $('<div class="h-screen w-screen"></div>');
  $("html").append(overlay);
  spinner.spin(overlay[0]);
}

$(function () {
  const pathname = window.location.pathname;
  const isPublicPage = Object.values(LINKS)
    .filter((link) => link.public)
    .some((link) => pathname.startsWith(link.path));
  const expiration = Number(localStorage.getItem("exp"));
  const validExp = new Date() < new Date(expiration);

  if (isPublicPage) {
    $("body").removeClass("hidden");
  } else if (validExp) {
    if (pathname === LINKS.home.path) {
      showOverlay();
      window.location = LINKS.collections.path;
    } else {
      $("body").removeClass("hidden");
    }
  } else {
    showOverlay();
    fangiftService.get("/auth").then((userInfo) => {
      if (userInfo) {
        if (pathname === LINKS.home.path) {
          window.location.pathname = LINKS.collections.path;
        } else {
          window.userInfo = userInfo;
          $("body").removeClass("hidden");
          spinner.stop();
          overlay.detach();
        }
      }
    });
  }
});
