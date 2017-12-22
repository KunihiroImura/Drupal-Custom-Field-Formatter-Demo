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
        var lang = drupalSettings.path.currentLanguage;
        $("div.gps-display-distance", context).each(function() {
          var distance = getDistanceFromLatLon(lang, $(this).data('lat'), $(this).data('lng'), coords.latitude, coords.longitude);
          if (lang === 'ja') {
            $(this).html('<span class="fa fa-map-signs">&nbsp;</span>' + ' 今の場所から ' + distance + ' 離れています。');
          } else {
            $(this).html('<span class="fa fa-map-marker">&nbsp;</span>' + ' ' + distance + ' miles away from you');
          }
        });
      })
      .fail(function(error) {
        // Fail state. Triggered for each item.
      });
    }
  };

  function getDistanceFromLatLon(lang, lat1,lng1,lat2,lng2) {
    var lat_average = Math.PI / 180 * ( lat1 + ((lat2 - lat1) / 2) ),
        lat_difference = Math.PI / 180 * ( lat1 - lat2 ),
        lon_difference = Math.PI / 180 * ( lng1 - lng2 ),
        curvature_radius_tmp = 1 - 0.00669438 * Math.pow(Math.sin(lat_average), 2),
        meridian_curvature_radius = 6335439.327 / Math.sqrt(Math.pow(curvature_radius_tmp, 3)),
        prime_vertical_circle_curvature_radius = 6378137 / Math.sqrt(curvature_radius_tmp),
        distance = 0,
        distance_unit = "";

    //２点間の距離をメートルで取得する（単位なし）
    distance = Math.pow(meridian_curvature_radius * lat_difference, 2) + Math.pow(prime_vertical_circle_curvature_radius * Math.cos(lat_average) * lon_difference, 2);
    distance = Math.sqrt(distance);
    distance = Math.round(distance);

    if (lang === 'ja') {
      // ２点間の距離を単位ありで取得する（1000m以上は、kmで表示）
      distance_unit = Math.round(distance);
      if (distance_unit < 1000) {
        distance_unit = distance_unit + "m";
      } else {
        distance_unit = Math.round(distance_unit / 100);
        distance_unit = (distance_unit / 10) + "km";
      }
    } else {
      distance_unit = Math.floor((distance / 1609.344) * 10) / 10;
    }

    return distance_unit;
  }

})(jQuery, Drupal);
