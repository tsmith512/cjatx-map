mapboxgl.accessToken = 'pk.eyJ1IjoidHNtaXRoNTEyIiwiYSI6ImNreGp2NDQ2ODBvMHkybnBuYmk5bXJ5a3QifQ.5W22pLLWNQVOVj6pLgaE6Q';

const getTxDistrict = (position) => {
  const data = fetch(`https://api.mapbox.com/v4/tsmith512.ccvoi5im/tilequery/${position.lng},${position.lat}.json?access_token=${mapboxgl.accessToken}`)
    .then(res => res.json())
    .then(payload => {
      const district = payload?.features[0]?.id || false;
      marker.remove().setLngLat(position).addTo(map);
      popup.remove().setLngLat(position).addTo(map);
      if (district == 37) {
        popup.setHTML(`You're with us in <strong>District 37!</strong>`)
      } else if (district) {
        popup.setHTML(`You're in <strong>District ${district}.</strong>`)
      } else {
        popup.setHTML(`We could not determine which Texas Congressional District this is.`)
      }
    });
};

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/tsmith512/ckxjxx5aj0o0f14ld25ucj1ie',
  center: [-97.74,30.27],
  zoom: 10,
});

const marker = new mapboxgl.Marker({
  color: '#D96523',
});

const popup = new mapboxgl.Popup({
  className: 'district-popup',
});

const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  marker: false,
  placeholder: 'Search by Address',
}).setZoom(12);

map.addControl(geocoder);

const locator = new mapboxgl.GeolocateControl({
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

map.on('click', (e) => {
  getTxDistrict(e.lngLat);
});

geocoder.on('result', (results) => {
  const point = results.result?.center || false;
  if (point) {
    getTxDistrict({lng: point[0] , lat: point[1]});
  }
});

locator.on('geolocate', (data) => {
  const latLng = {
    lat: data.coords.latitude,
    lng: data.coords.longitude,
  };

  geocoder.clear();
  getTxDistrict(latLng);
});
