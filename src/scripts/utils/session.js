import spinner from "./snip";

export async function refreshSession() {
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
    window.location.reload();
  } catch (err) {
    window.location.href = LINKS.login.path;
  }
}
