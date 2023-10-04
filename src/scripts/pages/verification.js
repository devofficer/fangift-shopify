$(function () {
  const params = new URLSearchParams(window.location.search);
  const reason = params.get("reason");

  if (reason === "email_verified") {
    $("#text-title").text("Account Verified");
    $("#text-subtitle").text(
      "Your email and account have been verfied. Please Login to continue"
    );
  } else if (reason) {
    $("#text-title").text("Failed to verify");
    $("#text-subtitle").text(reason);
  }
});
