import fangiftService from "../services/fangiftService";
import LINKS from "../constants/links";

const isPublicPage = Object.values(LINKS)
  .filter((link) => link.public)
  .some((link) => window.location.pathname.startsWith(link.path));

if (isPublicPage) {
  document.getElementsByTagName("body")[0].classList.remove("hidden");
} else {
  fangiftService.get("/auth").then((userInfo) => {
    if (userInfo) {
      document.getElementsByTagName("body")[0].classList.remove("hidden");
    }
  });
}
