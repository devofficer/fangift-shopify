import $ from 'jquery';

$(function () {
  let username = '';
  let role = '';
  let email = '';
  let password = '';
  let passwordConfirmed = '';

  // handle submit of role selection form
  $('#form-role').on('submit', function (e) {
    e.preventDefault();
    role = $('input[name=role]:checked').val();

    $(this).hide();
    $(`#form-${role}`).show();
  });

  // handle submit of fan form
  $('#form-fan').on('submit', function (e) {
    e.preventDefault();
    $(this).hide();
    $('#form-details').show();
  });

  // handle submit of creator form
  $('#form-creator').on('submit', function (e) {
    e.preventDefault();
    $(this).hide();
    $('#form-details').show();
  });

  $('#form-details').on('submit', function (e) {
    e.preventDefault();
    $(this).hide();
    $('#form-country').show();
  });

  $('#form-country').on('submit', function (e) {
    e.preventDefault();
    $(this).hide();
    $('#form-about').show();
  });

  $('#form-about').on('submit', function (e) {
    e.preventDefault();
    $(this).hide();
    $('#lbl-email').html(email);
    $('#form-email').show();
  });

  const handleChangeUsername = (btn) =>
    function () {
      username = $(this).val();
      if (username) {
        if (username === '@') {
          $(this).val('');
          $(btn).prop('disabled', true);
        } else if (username.startsWith('@')) {
          $(btn).prop('disabled', false);
        } else {
          $(this).val(`@${username}`);
          $(btn).prop('disabled', false);
        }
      } else {
        $(btn).prop('disabled', true);
      }
      $('#lbl-username').html(username.replace('@', ''));
    };

  $('#username-creator').on('input', handleChangeUsername('#btn-next-creator'));
  $('#username-fan').on('input', handleChangeUsername('#btn-next-fan'));

  $('#btn-create-fan').on('click', function (e) {
    e.preventDefault();
    role = 'fan';
    $('#form-creator').hide();
    $('#form-fan').show();
  });

  $('#btn-create-creator').on('click', function (e) {
    e.preventDefault();
    role = 'creator';
    $('#form-fan').hide();
    $('#form-creator').show();
  });

  $('#btn-back-details').on('click', function () {
    $('#form-details').hide();
    $(`#form-${role}`).show();
  });

  $('#btn-register').on('click', function () {
    $('#form-details').hide();
    $('#form-country').show();
  });

  $('#btn-back-country').on('click', function () {
    $('#form-country').hide();
    $('#form-details').show();
  });

  $('#btn-back-about').on('click', function () {
    $('#form-about').hide();
    $('#form-country').show();
  });

  $('#btn-back-email').on('click', function () {
    $('#form-email').hide();
    $('#form-about').show();
  });

  function checkSignupAbility() {
    const ability =
      password === passwordConfirmed && /^[\w.-]+@[\w.-]+\.\w+$/.test(email);
    $('#btn-register').prop('disabled', !ability);
  }

  $('#txt-email').on('input', function () {
    email = $(this).val();
    checkSignupAbility();
  });

  $('#txt-password').on('input', function () {
    password = $(this).val();
    checkSignupAbility();
  });

  $('#txt-confirm-password').on('input', function () {
    passwordConfirmed = $(this).val();
    checkSignupAbility();
  });
});
