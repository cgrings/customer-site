(function() {
  /* Send Page Hit to Tracker API */
  trackPageView = function(clientKey, pageUrl) {
      if (typeof (pageUrl) !== "string") {
          pageUrl = window.location.href;
      }
      var hitData = {
          url : pageUrl,
          dtz : new Date().toISOString()
      };
      postJsonData('/page/hit', hitData);
  };

  /* Send Form Data to Tracker API */
  trackFormSubmit = function($form) {
    // Serialize form data
    var array = $form.serializeArray();
    var formData = {};
    $.each(array, function() {
      formData[this.name] = this.value || '';
    });
    // Verify UserId
    var emailAddress = formData['email'];
    if (emailAddress !== '') {
      var tUserId = tUserIdGet();
      if(tUserId == emailAddress) {
        console.log('Tracker user-id already defined: ' + emailAddress)
        return;
      }
      tUserIdSet(emailAddress);
      postJsonData('/contact', formData);
    }
  }

  /* Return Tracker Session Id (create if not exists) */
  tSessionIdGet = function() {
    var cookieName = "tsessionid";
    var tUserId = tUserIdGet();
    // create new Session Id
    if (typeof tUserId === 'undefined') {
      tUserIdSet('');
    }
    var cookieValue = cookieGet(cookieName);
    if (typeof cookieValue === 'undefined') {
      // create new Session Id
      cookieValue = tSessionIdSet();
    }
    return cookieValue;
  }
  /* Set Tracker Session Id */
  tSessionIdSet = function(val) {
    var cookieName = "tsessionid";
    var cookieValue = (typeof val === 'undefined' ) ? Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) : val;
    cookieSet(cookieName, cookieValue, (30*60));
    return cookieValue;
  }

  /* Return Tracker User Id (undefined if not exists) */
  tUserIdGet = function() {
    return cookieGet("tuserid");
  }
  /* Set Tracker User Id */
  tUserIdSet = function(val) {
    var cookieValueOld = tUserIdGet();
    var cookieName = "tuserid";
    var cookieValue = (typeof val === 'undefined' ) ? '' : val;
    //console.log('::' + cookieName + ' = ' + cookieValue);
    cookieSet(cookieName, cookieValue);
    if (cookieValueOld != '') {
      tSessionIdSet();
    }
    return cookieValue;
  }

  /* Cookie Methods */
  cookieGet = function(cookieName) {
    var cookieValue = undefined;
    if(typeof cookieName === 'string') {
      var cookies = document.cookie ? document.cookie.split('; ') : [];
      //console.log('Cookies: ' + cookies);
      for (var i = 0; i < cookies.length; i++) {
        var parts = cookies[i].split('=');
        if (cookieName === parts[0]) {
          cookieValue = parts[1];
          break;
        }
      }
    }
    //console.log('Cookie: ' + cookieName + ' = ' + cookieValue);
    return cookieValue;
  }
  cookieSet = function(cookieName, cookieValue, cookieMaxAge) {
    var cookieString = cookieName + "=" + cookieValue + "; path/";
    if(typeof cookieMaxAge === 'number') {
      cookieString = cookieString + "; max-age=" + cookieMaxAge;
    }
    //console.log('cookieString: ' + cookieString);
    document.cookie = cookieString;
  }
  /* Send Data to Tracker API */
  postJsonData = function(path, rawData) {
    var tSessionId = tSessionIdGet();
    rawData['sid'] = tSessionId;
    var tUserId = tUserIdGet();
    if(tUserId !== '') {
      rawData['uid'] = tUserId;
    }
    var jsonData = JSON.stringify(rawData);
    console.log('Post path:' + path + ' data: ' + jsonData);
    //return;
    var uri = "https://rdtracker-api.herokuapp.com/api";
    //uri = "http://localhost:8080/api"
    var request = $.ajax({
      url : uri + path,
      method : "post",
      dataType : 'json',
      contentType : "application/json; charset=utf-8",
      data : jsonData
    });
    request.always(function(jqXHR) {
      if (jqXHR.status !== 201) {
          console.log(jqXHR.status + ' - ' + jqXHR.statusText);
      }
    });
  }
})();

$(function() {
  trackPageView();
  $("form").submit(function(event) {
      event.preventDefault();
      trackFormSubmit($(this));
  });
});
