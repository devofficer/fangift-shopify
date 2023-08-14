import fangiftService from "../services/fangiftService";
import LINKS from "../constants/links";
import spinner from "../utils/snip";

$(function () {
  const isPublicPage = Object.values(LINKS)
    .filter((link) => link.public)
    .some((link) => window.location.pathname.startsWith(link.path));

  if (isPublicPage) {
    $("body").removeClass("hidden");
  } else {
    const overlay = $('<div class="h-screen w-screen"></div>');
    $("html").append(overlay);
    spinner.spin(overlay[0]);

    fangiftService.get("/auth").then((userInfo) => {
      if (userInfo) {
        $("body").removeClass("hidden");
        spinner.stop();
        overlay.detach();
      }
    });
  }
});
