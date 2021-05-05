export function init() {
	
	/* ALL VARIABLES */

	var mapcontainer = document.getElementById('mapid');
	var zoomInBtn = document.getElementById('in');
	var zoomOutBtn = document.getElementById('out');
	var map;
	
	var currentLocation = { //Reutlingen
		lon: 9.20427,
		lat: 48.49144
	};
	var street = "Hauptstraße";

	var destination = { //Stuttgart
		lon: 9.192,
		lat: 48.783
	};

	// custom marker-icon
	var startIcon = new L.icon({
		iconUrl: '../images/marker.png',

		iconSize: [62, 62],
		iconAnchor: [31, 31],
		popupAnchor: [0, 140]
	});
	var destinationIcon = new L.icon({
		iconUrl: '../images/destination.png',

		iconSize: [62, 62],
		iconAnchor: [14, 62],
	});

	var startMarker, destinationMarker;

	var tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png';
	//alternatives: 
	//https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png 
	//https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png
	//https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
  
    var attr = 'Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>';
	//alternatives:
	//'Map data &copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'

	var maxZoomLvl = 20;
	var viewZoomLvl = 17;

	




	/* MAP & ROUTE SETUP */
	
	// setup map position and zoom (if html div loaded properly)
	if (mapcontainer) {
		map = L.map(mapcontainer, {zoomControl: false}).setView(currentLocation, viewZoomLvl);

		// add tiles
		L.tileLayer(tileUrl, {
			maxZoom: maxZoomLvl,
			attribution: attr,
		}).addTo(map);

	} else {
		console.log("Konnte div mapid nicht finden.");
	}
	
	//setup streetname tooltip
	var popup = L.popup({closeButton: false, className: "street-label"}).setContent(street);
	
	//setup scale
	var scale = L.control.scale().addTo(map);
	
	//Route zeichnen
	var routing = L.Routing.control({
		waypoints: [
			L.latLng(currentLocation.lat, currentLocation.lon),
			L.latLng(destination.lat, destination.lon)
		],
		createMarker: function(i, wp, nWps) {
			if (i === 0) {
				startMarker = L.marker(wp.latLng, {
					draggable: false,
					bounceOnAdd: true,
					bounceOnAddOptions: {
						duration: 1000,
						height: 800,
						function() {	
							(bindPopup(popup).openOn(map))
						}
					},
					icon: startIcon,
				});
				return startMarker;
			}
			else if (i === 0 || i === nWps - 1) {
				destinationMarker = L.marker(wp.latLng, {
					icon: destinationIcon,
				});
				return destinationMarker;
			} else {
				return null;
			}
		},

		routeWhileDragging: false,
		reverseWaypoints: false,
		showAlternatives: false,
		lineOptions: {
			styles: [
				{color: '#00A4E1', opacity: 1, weight: 11},
			]
		},
	}).addTo(map);
	L.Routing.errorControl(routing).addTo(map);
	startMarker.bindPopup(popup).openPopup();
	

	//map the routing steps to custom div
	// var routingControlContainer = routing.getContainer();
	// var controlContainerParent = routingControlContainer.parentNode;
	// controlContainerParent.removeChild(routingControlContainer);
	// var itineraryDiv = document.getElementById('coming-up-direction');
	// itineraryDiv.appendChild(routingControlContainer);
	
	



	/* ZOOM BTNS SETUP */

	// zoom in function
	$(zoomInBtn).click(function(){
		map.setZoom(map.getZoom() + 1)
	});


	// zoom out function
	$(zoomOutBtn).click(function(){
		map.setZoom(map.getZoom() - 1)
	});
}
