$(document).on('click', 'input[type="checkbox"]', function() {      
    $('input[type="checkbox"]').not(this).prop('checked', false);      
});
