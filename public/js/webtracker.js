(function() {
    pageView = function(clientId, clientKey, pageUrl) {
        if (typeof (pageUrl) !== "string") {
            pageUrl = window.location.href;
        }
        var tuid = trackerUid();
        var dataJSON = JSON.stringify({
            id : tuid,
            url : pageUrl,
            dtz : new Date().toISOString()
        });
        //console.log('data: ' + dataJSON);
        var request = $.ajax({
            url : "https://rdtracker-api.herokuapp.com/api/page/hit",
            method : "post",
            dataType : 'json',
            contentType : "application/json; charset=utf-8",
            data : dataJSON
        });
        request.always(function(jqXHR) {
            if (jqXHR.status !== 201) {
                console.log(jqXHR.status + ' - ' + jqXHR.statusText);
            }
        });
    };
    trackerUid = function() {
        var tuid = undefined;
        var cookieName = "tuid";
        var cookies = document.cookie.split('; ');
        console.log('cookies: ' + cookies);
        for (var i = 0; i < cookies.length; i++) {
            var cookieSplitted = cookies[i].split('=');
            if (cookieName === cookieSplitted[0]) {
                tuid = cookieSplitted[1];
                break;
            }
        }
        if (typeof tuid === 'undefined') {
            tuid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            var cookieExpiration = new Date();
            cookieExpiration.setFullYear(cookieExpiration.getFullYear() + 1);
            var cookieString = cookieName + "=" + tuid + "; path/; expires=" + cookieExpiration.toGMTString();
            //console.log('cookieString: ' + cookieString);
            document.cookie = cookieString;
        }
        return tuid;
    }
})();

$(function() {
    $("form").submit(function(event) {
        event.preventDefault();
        var array = $(this).serializeArray();
        var dataJSON = {};
        $.each(array, function() {
            dataJSON[this.name] = this.value || '';
        });
        if (dataJSON['email'] !== '') {
            var tuid = trackerUid();
            dataJSON['tracker'] = tuid;
            dataJSON = JSON.stringify(dataJSON);
            //console.log('data: ' + dataJSON);
            var request = $.ajax({
                url : "https://rdtracker-api.herokuapp.com/api/contact",
                method : "post",
                dataType : 'json',
                contentType : "application/json; charset=utf-8",
                data : dataJSON
            });
            request.always(function(jqXHR) {
                if (jqXHR.status === 201) {
                    $('#form').trigger("reset");
                } else {
                    console.log(jqXHR.status + ' - ' + jqXHR.statusText);
                }
            });
        }
    });
});
