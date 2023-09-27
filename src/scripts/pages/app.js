import fangiftService from "../services/fangiftService";
import LINKS from "../constants/links";
import spinner from "../utils/snip";
import { getS3Url } from "../utils/string";

const updateUserInfo = (userInfo) => {
  window.gUserInfo = Object.freeze(
    Object.entries(
      userInfo ?? JSON.parse(localStorage.getItem("payload"))
    ).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key.replace("custom:", "")]: value,
      }),
      {}
    )
  );
  Object.defineProperty(window, "gUserInfo", {
    configurable: false,
    writable: false,
  });
};

$(function () {
  const pathname = location.pathname;
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
    updateUserInfo();

    if (gUserInfo.picture) {
      $("#img-avatar").prop("src", getS3Url(gUserInfo.picture));
    }

    if (gUserInfo.type === "creator") {
      $("#creator-menu").removeClass("hidden");
      $("#creator-menu").addClass("xl:flex");
    } else {
      $("#fan-menu").removeClass("hidden");
      $("#fan-menu").addClass("xl:flex");
    }

    $("body").removeClass("hidden");
  } else {
    const overlay = $('<div class="h-screen w-screen"></div>');
    $("html").append(overlay);
    spinner.spin(overlay[0]);

    fangiftService.get("/auth").then((userInfo) => {
      if (userInfo) {
        updateUserInfo(userInfo);

        $("body").removeClass("hidden");
        spinner.stop();
        overlay.detach();
      }
    });
  }

  $("#btn-signout").on("click", function () {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("exp");
    localStorage.removeItem("payload");
    localStorage.removeItem("refreshToken");
    location.href = "/account/login";
  });
});
