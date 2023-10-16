import LINKS from "../constants/links";
import spinner from "./snip";
import fangiftService from "../services/fangiftService";

export async function refreshSession(redirectToHome = false) {
  const overlay = $('<div class="fixed inset-0 bg-white z-[9999999]"></div>');
  $("html").append(overlay);
  spinner.spin(overlay[0]);

  try {
    const payload = JSON.parse(localStorage.getItem("payload"));
    const res = await fangiftService.post("/auth/refresh-session", {
      refreshToken: localStorage.getItem("refreshToken"),
      email: payload.email,
    });
    localStorage.setItem("accessToken", res.accessToken);
    localStorage.setItem("refreshToken", res.refreshToken);
    localStorage.setItem("exp", Number(res.exp) * 1000);
    localStorage.setItem("payload", JSON.stringify(res.payload));
    if (redirectToHome) {
      window.location.href =
        payload.type === PAGE_ROLES.creator
          ? LINKS.wishlist.path
          : LINKS.explore.path;
    } else {
      window.location.reload();
    }
  } catch (err) {
    window.location.href = LINKS.login.path;
  }
}
