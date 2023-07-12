$(function () {
  let username = '';
  let role = '';

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
  });
  

  // handle submit of creator form
  $('#form-creator').on('submit', function (e) {
    e.preventDefault();
  });


  const handleChangeUsername = (btn) => function() {
    username = $(this).val();
    if (username) {
      if (username === '@') {
        $(this).val('');
        $(btn).prop("disabled", true);
      } else if (username.startsWith('@')) {
        $(btn).prop("disabled", false);
      } else {
        $(this).val(`@${username}`);
        $(btn).prop("disabled", false);
      }
    } else {
      $(btn).prop("disabled", true);
    }
  }

  $('#username-creator').on('input', handleChangeUsername('#btn-next-creator'));
  $('#username-fan').on('input', handleChangeUsername('#btn-next-fan'));
  $('#btn-create-fan').on('click', function(e) {
    e.preventDefault();
    $('#form-creator').hide();
    $('#form-fan').show();
  });
  $('#btn-create-creator').on('click', function(e) {
    e.preventDefault();
    $('#form-fan').hide();
    $('#form-creator').show();
  });

});