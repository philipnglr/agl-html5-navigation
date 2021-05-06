export function init() {
	
	/* ALL VARIABLES */

	var mapcontainer = document.getElementById('mapid');
	var zoomInBtn = document.getElementById('in');
	var zoomOutBtn = document.getElementById('out');
	var arrivalTimeContainer = document.getElementById('arrivalTime');
	var durationContainer = document.getElementById('duration');
	var distanceContainer = document.getElementById('distance');

	var map;
	
	
	var currentLocation = { 
		//Reutlingen
		lon: 9.20427,
		lat: 48.49144
	};
	var street = "Hauptstraße";

	var destination = { 
		//Konrad-Adenauer-Straße Esso Tankstelle, Reutlingen 
		// lon: 9.202856828264528,
		// lat: 48.492313456888866,

		//Stuttgart
		// lon: 9.192,
		// lat: 48.783,
		
		//Berlin
		lon: 13.404954,
		lat: 52.520008,
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
	




	/* FILL CUSTOM INFO-BOXES*/

	//setup arrival time, duration & distance 
	routing.on('routesfound', function(e) {
		var routes = e.routes;
		var summary = routes[0].summary;
		var totalTime = secondsToHm(summary.totalTime);
		
		// setup distance
		if (summary.totalDistance > 1000) {
			distanceContainer.innerHTML = Math.round((summary.totalDistance / 1000) * 10) / 10 + " km";
		} else {
			distanceContainer.innerHTML = Math.round(summary.totalDistance) + " m";
		}

		//setup duration
		durationContainer.innerHTML = formatDuration(totalTime.hours, totalTime.minutes, totalTime.seconds);

		//setup time of arrival
		arrivalTimeContainer.innerHTML = getDate(totalTime.hours, totalTime.minutes, totalTime.seconds);
	});


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


function secondsToHm(d) {
	d = Number(d);
	const h = Math.floor(d / 3600);
	const m = Math.floor(d % 3600 / 60);
	const s = Math.floor(d);
	var res = {
		hours: h,
		minutes: m, 
		seconds: s
	}
	return res;
}


function formatDuration(hours, minutes, seconds) {
	if (hours == 0 && minutes != 0) {
		return minutes + " min";
	} else if (hours == 0 && minutes < 10) {
		return minutes + ":" + seconds + " s";
	} else {
		return hours + ":" + minutes + " h";
	}
}


function getDate(hours, minutes, seconds) {
	var date = new Date();
	var h = date.getHours();
	var m = date.getMinutes();
	var s = date.getSeconds();

	h = h + hours;
	m = m + minutes;
	if (m > 59) {
		h++;
		m = m - 60;
	}
	s = s + seconds; 
	if (s > 59) {
		m++;
		s = s - 60;
		if (m > 59) {
			h++;
			m = m - 60;
		}
	}
	return(h + ":" + m + " Uhr");
}