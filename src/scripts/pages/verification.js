$(function () {
  const params = new URLSearchParams(window.location.search);
  const reason = params.get("reason");

  if (reason === "email_verified") {
    $("#text-title").html(`
      <svg height="32px" width="32px" viewBox="0 0 32 32">
	  		<polygon style="fill:#008100;" points="11.941,28.877 0,16.935 5.695,11.24 11.941,17.486 26.305,3.123 32,8.818"/>
      </svg>  
      Account Verified
    `);
    $("#text-subtitle").text(
      "Your email and account have been verfied. Please Login to continue."
    );
    $("#btn-login").removeClass("hidden");
  } else if (reason) {
    $("#text-title").text("Verification Failed");
    $("#text-subtitle").text("Please re-register again here.");
    $("#btn-register").removeClass("hidden");
  }
});
