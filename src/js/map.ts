import { Map, Marker, Popup, GeolocateControl } from 'mapbox-gl';

import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

interface SimpleLngLat {
  lng: number;
  lat: number;
}

// @TODO: This gets passed client-side, so it's not a secret, but it'd be nifty
// if it weren't in the codebase. Env var to Parcel at build-time?
const accessToken =
  'pk.eyJ1IjoidHNtaXRoNTEyIiwiYSI6ImNreGp2NDQ2ODBvMHkybnBuYmk5bXJ5a3QifQ.5W22pLLWNQVOVj6pLgaE6Q';

/**
 * Look up a given position with Mapbox's Tilequery API to see what TX district
 * the position falls into and raise a popup on the map with the info.
 *
 * @param position (SimpleLngLat) position to query for
 */
const getTxDistrict = (position: SimpleLngLat): void => {
  fetch(
    `https://api.mapbox.com/v4/tsmith512.ccvoi5im/tilequery/${position.lng},${position.lat}.json?access_token=${accessToken}`
  )
    .then((res) => res.json())
    .then((payload) => {
      const district = payload?.features[0]?.id || false;
      marker.remove().setLngLat(position).addTo(map);
      popup.remove().setLngLat(position).addTo(map);
      if (district == 37) {
        popup.setHTML(`You're with us in <strong>District 37!</strong>`);
      } else if (district) {
        popup.setHTML(`You're in <strong>District ${district}.</strong>`);
      } else {
        popup.setHTML(
          `We could not determine which Texas Congressional District this is.`
        );
      }
    });
};

// Map Interface Pieces

const map = new Map({
  accessToken,
  container: 'map',
  style: 'mapbox://styles/tsmith512/ckxjxx5aj0o0f14ld25ucj1ie',
  center: [-97.74, 30.27],
  zoom: 10,
});

const marker = new Marker({
  color: '#D96523',
});

const popup = new Popup({
  className: 'district-popup',
});

//
// Simple Click/Tap Action
//

map.on('click', (e) => {
  getTxDistrict(e.lngLat);
});

//
// Geocoder: Type an address to search
//

const geocoder = new MapboxGeocoder({
  accessToken,
  marker: false,
  placeholder: 'Search by Address',
}).setZoom(12);

map.addControl(geocoder);

geocoder.on('result', (results) => {
  const point = results.result?.center || false;
  if (point) {
    getTxDistrict({ lng: point[0], lat: point[1] });
  }
});

//
// Geolocator: Use my device's position to search.
//
// Note: Candidate's site is on Wix, which won't let me allow geolocation within
// the iframe, so check if the map page was loaded with a query arg before even
// displaying this.
//
// Lifted from mapbox-gl-js/geolocate_control.js:checkGeolocationSupport()
// because it isn't exported. Check for location support/allowed before showing
// the button. Why? I don't want to show a disabled button.
//

const ifGeoSupported = (callback: (x: boolean) => void): void => {
  let supportsGeolocation = false;

  if (window.navigator.permissions !== undefined) {
    // navigator.permissions has incomplete browser support
    // http://caniuse.com/#feat=permissions-api
    // Test for the case where a browser disables Geolocation because of an
    // insecure origin
    window.navigator.permissions.query({ name: 'geolocation' }).then((p) => {
      supportsGeolocation = p.state !== 'denied';
      callback(supportsGeolocation);
    });
  } else {
    supportsGeolocation = !!window.navigator.geolocation;
    callback(supportsGeolocation);
  }
};

const setupGeolocator = (supported: boolean): void => {
  if (!supported) {
    return;
  }

  const locator = new GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    fitBoundsOptions: {
      maxZoom: 12,
    },
    trackUserLocation: false,
    showUserLocation: false,
    showAccuracyCircle: false,
  });

  map.addControl(locator);

  /* eslint-disable  @typescript-eslint/no-explicit-any */
  locator.on('geolocate', (data: any) => {
    if (data && Object.prototype.hasOwnProperty.call(data, 'coords')) {
      const latLng = {
        lat: data.coords.latitude,
        lng: data.coords.longitude,
      };

      getTxDistrict(latLng);
    }
  });
};

ifGeoSupported(setupGeolocator);
