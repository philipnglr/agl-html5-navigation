export function init() {
	var mapcontainer = document.getElementById('mapid');
	if (mapcontainer) {
		var map = L.map(mapcontainer).setView({lon: 0, lat: 0}, 2);

		// add the OpenStreetMap tiles
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
		}).addTo(map);

		// show the scale bar on the lower left corner
		L.control.scale().addTo(map);

		// show a marker on the map
		L.marker({lon: 0, lat: 0}).bindPopup('The center of the world').addTo(map);
	} else {
		console.log("Konnte div nicht finden");
	}
}