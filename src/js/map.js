import * as app from '../js/app';


export function init() {
	/* ALL VARIABLES */

	var mapcontainer = document.getElementById('mapid');
	var zoomInBtn = document.getElementById('in');
	var zoomOutBtn = document.getElementById('out');
	var arrivalTimeContainer = document.getElementById('arrivalTime');
	var durationContainer = document.getElementById('duration');
	var distanceContainer = document.getElementById('distance');
	var compass = document.getElementById('compass_static');
	var endNavBtn = document.getElementById('endNavBtn');

	var map;

	var offset;

	var deg = 60;

	var currentLocation = { 
		//Reutlingen
		lon: 9.20427,
		lat: 48.49144
	};
	var street = "Hauptstraße";

	var destination = { 
		//--> super short route
		//Konrad-Adenauer-Straße Esso Tankstelle, Reutlingen 
		lon: 9.202856828264528,
		lat: 48.492313456888866,

		//--> medium route
		//Stuttgart
		// lon: 9.192,
		// lat: 48.783,
		
		//--> long route
		//Berlin
		// lon: 13.404954,
		// lat: 52.520008,
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

	var maxZoomLvl = 24;
	var viewZoomLvl = 19;

	/* MAP & ROUTE SETUP */
	
	// setup map position and zoom (if html div loaded properly)
	if (mapcontainer) {
		map = L.map(mapcontainer, {zoomControl: false, rotate: true}).setView(currentLocation, viewZoomLvl);

		// add tiles
		L.tileLayer(tileUrl, {
			maxZoom: maxZoomLvl,
			attribution: attr,
		}).addTo(map);
	
		
	} else {
		console.log("Konnte div mapid nicht finden.");
	}
	
	// calculate the offset
	offset = map.getSize().x*0.14;
	// Then move the map
	//map.panBy(new L.Point(-offset, 0), {animate: true});
	
	
	// setup streetname tooltip
	var popup = L.popup({closeButton: false, className: "street-label"}).setContent(street);
	
	// setup scale
	var scale = L.control.scale().addTo(map);
	
	// draw route
	var routing = L.Routing.control({
		waypoints: [
			L.latLng(currentLocation.lat, currentLocation.lon),
			L.latLng(destination.lat, destination.lon)
		],

		//geocoder: L.Control.Geocoder.nominatim(),

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
	//startMarker.bindPopup(popup).openPopup();
	

	// get route info and rotate functions
	var deg;
	
	var allCoords;
	var instr;
	var nextStepCoords = null;

	routing.on('routeselected', function(e) {
		allCoords = e.route.coordinates;
			instr = e.route.instructions;
			console.log(allCoords);
			console.log(instr);

			nextStepCoords = getNextStepCoords(instr, allCoords);
			console.log(nextStepCoords);

			deg = getAngle(currentLocation, nextStepCoords);
			console.log(deg);

			//var testMarker = new L.marker(nextStepCoords, {icon: startIcon}).addTo(map);
			startMarker.setLatLng(currentLocation);

			var clicked = false;
			map.setBearing(360 - deg); // TODO
			compass.style.transform = 'rotate(' + (360 - deg) + 'deg)';

			compass.onclick = function() {
				if (!clicked) {
					map.setBearing(0); // TODO
					map.setView(currentLocation);
					//map.panBy(new L.Point(-offset, 0), {animate: true});
					compass.style.WebkitTransitionDuration="1s";
					compass.style.transform = 'rotate(' + 0 + 'deg)';
					//startMarker.setRotationOrigin('center');
					startMarker.setRotationAngle(deg);
					startMarker.setLatLng(currentLocation);
					clicked = true;
				} else {
					map.setBearing(360 - deg); // TODO
					map.setView(currentLocation);
					//map.panBy(new L.Point(-offset, 0), {animate: true});
					compass.style.WebkitTransitionDuration="1s";
					compass.style.transform = 'rotate(' + (360 - deg) + 'deg)';
					//startMarker.setRotationOrigin('center');
					startMarker.setRotationAngle(0);
					startMarker.setLatLng(currentLocation);
					clicked = false;
				}
			}
	});


	/* FILL CUSTOM INFO-BOXES*/

	// setup arrival time, duration & distance 
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

		// setup duration
		durationContainer.innerHTML = formatDuration(totalTime.hours, totalTime.minutes, totalTime.seconds);

		// setup time of arrival
		arrivalTimeContainer.innerHTML = formatArrivalTime(totalTime.hours, totalTime.minutes, totalTime.seconds);
	});


	// map the routing steps to custom div
	var routingControlContainer = routing.getContainer();
	var controlContainerParent = routingControlContainer.parentNode;
	controlContainerParent.removeChild(routingControlContainer);
	var itineraryDiv = document.getElementById('coming-up-direction');
	itineraryDiv.appendChild(routingControlContainer);
	

	/* ZOOM BTNS SETUP */
	// zoom in function
	$(zoomInBtn).click(function(){
		map.setZoom(map.getZoom() + 1);
		viewZoomLvl = map.getZoom();
	});

	// zoom out function
	$(zoomOutBtn).click(function(){
		map.setZoom(map.getZoom() - 1);
		viewZoomLvl = map.getZoom();
	});

	$(endNavBtn).click(function(){
		app.init('start');
	});

}

function getInstrGeoJson(instr,allCoords) {
	var formatter = new L.Routing.Formatter();
	var instrPts = {
		type: "FeatureCollection",
		features: []
	};
	for (var i = 0; i < instr.length; ++i) {
		var g = {
			"type": "Point",
			"coordinates": [allCoords[instr[i].index].lng, allCoords[instr[i].index].lat]
		  };
		var p = {
			"instruction": formatter.formatInstruction(instr[i])
		  };
		instrPts.features.push({
			"geometry": g,
			"type": "Feature",
			"properties": p
		  });
	}
	console.log(instrPts);

	return instrPts;
}

function getNextStepCoords(instr, allCoords) {
	for (var i = 1; i <= 1; ++i) {
		var res = {
			lon : allCoords[instr[i].index].lng,
			lat : allCoords[instr[i].index].lat
		};
	};

	return res;
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


function formatArrivalTime(hours, minutes, seconds) {
	var date = new Date();
	var h = date.getHours();
	var m = date.getMinutes();
	var s = date.getSeconds();
	var res = "";

	h = h + hours;
	m = m + minutes;
	
	s = s + seconds; 
	if (s > 59) {
		m++;
		s = s - 60;
		if (m > 59) {
			h++;
			m = m - 60;
		}
	}

	if (m > 59) {
		h++;
		m = m - 60;
	}

	if (h > 24) {
		h = h - 24;
	}

	if (m < 10) {
	 	res = h + ":0" + m + " Uhr";
	} else {
		res = h + ":" + m + " Uhr";
	}

	return res;
}



function getAngle(A, B){
	var angle = null;
	var latA = A.lat;
	var lonA = A.lon;
	var latB = B.lat;
	var lonB = B.lon;

	// 注意经度或者纬度相等 (when longitude or latitude is equal)
	if(lonA == lonB && latA>latB ){
		angle = Math.PI;
	}
	else if(lonA == lonB && latA < latB ){
		angle = 0	;
	}
	else if(lonA > lonB && latA == latB ){
		angle = -(Math.PI/2);
	}
	else if(lonA < lonB && latA == latB ){
		angle = Math.PI/2	;
	}

	// 注意经度或者纬度都不相等 (Longitude and latitude are not equal)
	else{
		var x1 = A.lat*Math.pow(10,12);
		var x2 = B.lat*Math.pow(10,12);
		var y1 = A.lon*Math.pow(10,12);
		var y2 = B.lon*Math.pow(10,12);
		angle = Math.atan2(y2-y1,x2-x1)
	}

	angle = angle / (2 * Math.PI) * 360;
	// angle = 360 - angle;

	return angle;
}