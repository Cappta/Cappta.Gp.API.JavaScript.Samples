// Search
function searchToggle(obj, evt) {
    var container = $(obj).closest('.search-wrapper');
    if (!container.hasClass('active')) {
        container.addClass('active');
        evt.preventDefault();
    } else if (container.hasClass('active') && $(obj).closest('.input-holder').length == 0) {
        container.removeClass('active');
        // clear input
        container.find('.search-input').val('');
    }
}

// sidebar
$('.menu-navbar .menu-navbar-left').on('click', function() {
    $('.menu-navbar-left').removeClass('active');
    $(this).addClass('active');
});

// Right Sidebar
$('.toggle-right-sidebar span').on('click', function() {

    if ($("#right-sidebar").hasClass("hide-right-bar-notifications")) {

        $(".btn-bottom-right-sidebar-close").fadeIn("fast"); //show the button close for sidebar notifications

        //insert class to left sidebar
        if (!$("#sidebar").hasClass('hide-left-bar')) {

            $("#sidebar").addClass("hide-left-bar");
            $("#main-content").addClass("merge-left");

            if ($("html").outerWidth() <= 750) {
                if ($('#sidebar').hasClass('show-left-bar-mobile')) {
                    $('#sidebar').removeClass("show-left-bar-mobile");
                }
            }

        } else {
            if ($("html").outerWidth() <= 750) {
                if ($('#sidebar').hasClass('show-left-bar-mobile')) {
                    $('#sidebar').removeClass("show-left-bar-mobile");
                }
            }
        }

        $("#right-sidebar").removeClass("hide-right-bar-notifications");

        $("#right-sidebar").addClass(" animated fadeInRight").one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
            $(this).removeClass(" animated fadeInRight");
        });

    } else {

        $(".btn-bottom-right-sidebar-close").fadeOut("fast"); //hide the button close for sidebar notifications

        //remove class to left sidebar
        if ($("#sidebar").hasClass('hide-left-bar')) {
            $("#sidebar").removeClass("hide-left-bar");
            $("#main-content").removeClass("merge-left");
        }

        $("#right-sidebar").addClass("hide-right-bar-notifications");

        $("#right-sidebar").addClass(" animated fadeOutRight").one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
            $(this).removeClass(" animated fadeOutRight");
        });
    }

});