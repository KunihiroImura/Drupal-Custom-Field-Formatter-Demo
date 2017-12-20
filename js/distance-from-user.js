(function ($, Drupal) {
  'use strict';

  /**
   * @namespace
   */
  Drupal.distanceFromUser = Drupal.distanceFromUser || {};

  // Create promise for checking user position so request is only made once.
  Drupal.distanceFromUser.deferred = $.Deferred();
  var geo_options = {
    enableHighAccuracy: true,
    maximumAge        : 30000,
    timeout           : 27000
  };
  navigator.geolocation.getCurrentPosition(function(pos){
    // Success. Resolve promise with user coordinates.
    Drupal.distanceFromUser.deferred.resolve({latitude: pos.coords.latitude, longitude: pos.coords.longitude});
  }, function(error){
    // Fail state. Triggered only once.
    switch (error.code) {
      case error.PERMISSION_DENIED:
        // Permission denied or not https.
        console.log(error.message);
        break;
      case error.POSITION_UNAVAILABLE:
        console.log(error.message);
        break;
      case error.TIMEOUT:
        console.log(error.message);
        break;
    }
    Drupal.distanceFromUser.deferred.reject(error);
  }, geo_options);

  /**
   * Calculate and display distance from user for given gps coordinates.
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   *   Attaches functionality to relevant fields.
   */
  Drupal.behaviors.distanceFromUser = {
    attach: function (context) {
      // Wait for geolocation to return a result.
      Drupal.distanceFromUser.deferred.promise().done(function(coords) {
        // Calculate distance for each item.
        $("div.gps-display-distance", context).each(function() {
          var distance = getDistanceFromLatLonInMiles($(this).data('lat'), $(this).data('lng'), coords.latitude, coords.longitude);
          $(this).html('<span class="fa fa-map-marker">&nbsp;</span>' + distance + ' miles away from you');
        });
      })
      .fail(function(error) {
        // Fail state. Triggered for each item.
      });
    }
  };

  function getDistanceFromLatLonInMiles(lat1,lon1,lat2,lon2) {
    var R = 3959; // Radius of the earth in miles
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon/2) * Math.sin(dLon/2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return Math.round(d * 10) / 10;
  }

  function deg2rad(deg) {
    return deg * (Math.PI/180)
  }

})(jQuery, Drupal);
