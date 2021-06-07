import * as app from '../js/app';


/*GLOBAL VARIABLES*/
var arrivalTimeContainer;
var durationContainer;
var distanceContainer;

var comingUpDirectionDistanceContainer;
var comingUpDirectionSVGContainer;
var comingUpDirectionDescriptionContainer;
var nextDirectionSVGContainer;
var nextDirectionDescriptionContainer;

var endNavBtn;
var zoomInBtn;
var zoomOutBtn;

var mapcontainer;
var map;

var tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png';
	// alternatives: 
	//https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png 
	//https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png
	//https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png

var attr = 'Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>';
	// alternatives:
	//'Map data &copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'

var startIcon, destinationIcon;
var startMarker, destinationMarker;
var offset;
var maxZoomLvl = 24;
var viewZoomLvl = 19;
var compass;
var scale;
var popup;

var routing;
var streetname;
var deg;

var routes;
var summary;
var totalTime;

var instr;
var nextStepCoords = null;
var currentLocation;
var destinationLocation;
var allCoords;
var comingUpDescription; //instruction text
var comingUpDistance, comingUpDistanceFormatted; //distance
var comingUpIcon; //icon text
//var roadName; //name of road
var nextDescription;
var nextIcon;
var formatter;
var clicked = false;

var intervalId;



export function init(destinationCoords) {

	/* Initialize all containers */
	mapcontainer = document.getElementById('mapid');
	zoomInBtn = document.getElementById('in');
	zoomOutBtn = document.getElementById('out');
	endNavBtn = document.getElementById('endNavBtn');
	compass = document.getElementById('compass_static');

	arrivalTimeContainer = document.getElementById('arrivalTime');
	durationContainer = document.getElementById('duration');
	distanceContainer = document.getElementById('distance');

	comingUpDirectionDistanceContainer = document.getElementById('coming-up-direction-distance');
	comingUpDirectionSVGContainer = document.getElementById('coming-up-direction-svg');
	comingUpDirectionDescriptionContainer = document.getElementById('coming-up-direction-description');
	nextDirectionSVGContainer = document.getElementById('next-direction-svg');
	nextDirectionDescriptionContainer = document.getElementById('next-direction-description');

	
	/* Set start and destination location */
	currentLocation = { //TODO: get real location data from AGL
		//Reutlingen
		lon: 9.20427,
		lat: 48.49144
	};
	destinationLocation = destinationCoords;

	/* Set custom marker-icons */
	startIcon = new L.icon({
		iconUrl: '../images/marker.png',

		iconSize: [62, 62],
		iconAnchor: [31, 31],
		popupAnchor: [0, 140]
	});
	destinationIcon = new L.icon({
		iconUrl: '../images/destination.png',

		iconSize: [62, 62],
		iconAnchor: [14, 62],
	});


	/* Set exit button */
	$(endNavBtn).click = null;

	$(endNavBtn).click(function(){
		removeRouting(routing);
		endUpdate();
		app.init('start');
	});

	/* Set zoom buttons */
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
	
	/* Launch map */
	launchMap();

	/* Set up routing service */
	routingPerformer();

}


export function update() {

	// TODO: Future work: dont use time interval as update trigger, set CAN-BUS listener instead
	// TODO: Listen for updates in the simulators location
	// TODO: Trigger update() on simulators position changeing

	intervalId = setInterval(function() {

		currentLocation = { // TODO update simulator location here as described above
			lon: (5*currentLocation.lon + 5*destinationLocation.lon)/10, //simulate movement in map
			lat: (5*currentLocation.lat + 5*destinationLocation.lat)/10
		};

		clicked = false;
		
		//Routing service
		routingPerformer();

		//refresh map
		refreshMap();


		console.log("view zoom level: " + viewZoomLvl);
		console.log("Map update() ran once."); 
	  }, 6000);

}


function endUpdate() {
	clearInterval(intervalId);
	UpdateintervalId = null;
}


function launchMap() {
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

	// setup streetname tooltip
	//popup = L.popup({closeButton: false, className: "street-label"}).setContent(street);

	// setup scale
	scale = L.control.scale().addTo(map);
}


function refreshMap() {
	map.setView(startMarker.getLatLng(), viewZoomLvl);
}


function routingPerformer() {
	
	if (startMarker) {
		map.removeLayer(startMarker);
	}

	removeRouting(routing);

	routing = L.Routing.control({
		waypoints: [
			L.latLng(currentLocation.lat, currentLocation.lon),
			L.latLng(destinationLocation.lat, destinationLocation.lon)
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
		language: 'de',
		lineOptions: {
			styles: [
				{color: '#00A4E1', opacity: 1, weight: 11},
			]
		},

	}).addTo(map);

	routing.hide();

	routing.on('routesfound', function(e) {
		routes = e.routes;
		summary = routes[0].summary;
		totalTime = secondsToHm(summary.totalTime);
		
		// setup total route distance
		if (summary.totalDistance > 1000) {
			distanceContainer.innerHTML = Math.round((summary.totalDistance / 1000) * 10) / 10 + " km";
		} else {
			distanceContainer.innerHTML = Math.round(summary.totalDistance) + " m";
		}

		// setup total route duration
		durationContainer.innerHTML = formatDuration(totalTime.hours, totalTime.minutes, totalTime.seconds);

		// setup time of arrival
		arrivalTimeContainer.innerHTML = formatArrivalTime(totalTime.hours, totalTime.minutes, totalTime.seconds);
	});

	routing.on('routeselected', function(e) {
		allCoords = e.route.coordinates;
		instr = e.route.instructions;
		nextStepCoords = getNextStepCoords(instr, allCoords);
		formatter = new L.Routing.Formatter();

		deg = getAngle(currentLocation, nextStepCoords);

		startMarker.setLatLng(currentLocation);

		map.setBearing(360 - deg);
		compass.style.transform = 'rotate(' + (360 - deg) + 'deg)';


		//set compass on click function
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


		//fill coming up directions container with content
		//description
		function loadComingUpDirectionDescription() {
			comingUpDirectionDescriptionContainer = document.getElementById('coming-up-direction-description');
			
			if (comingUpDirectionDescriptionContainer) {
				comingUpDescription = formatter.formatInstruction(instr[1]); //choose 1st element, not 0th, because the first one is always "go to XXX street" without icon!
				comingUpDirectionDescriptionContainer.innerHTML = comingUpDescription;
			} else {
			setTimeout(loadComingUpDirectionDescription(), 1000);
			}
		}
		//loadComingUpDirectionDescription();

		//distance
		function loadComingUpDirectionDistance() {
			comingUpDirectionDistanceContainer = document.getElementById('coming-up-direction-distance');

			if (comingUpDirectionDistanceContainer) {
				comingUpDistance = instr[1].distance;
				comingUpDistanceFormatted = formatter.formatDistance(comingUpDistance); //format dis into a better string with unit
				comingUpDirectionDistanceContainer.innerHTML = comingUpDistanceFormatted; //TODO get_our_distance(); //
			} else {
				setTimeout(loadComingUpDirectionDistance(), 1000);
			}
		}
		//loadComingUpDirectionDistance();

		//icon
		function loadComingUpDirectionIcon() {
			comingUpDirectionSVGContainer = document.getElementById('coming-up-direction-svg');

			if (comingUpDirectionSVGContainer) {
				comingUpIcon = formatter.getIconName(instr[1]);
				displayDirectionsArrow(comingUpDirectionSVGContainer, comingUpIcon);
			} else {
				setTimeout(loadComingUpDirectionIcon(), 1000);
			}
		}
		//loadComingUpDirectionIcon();
		

		//fill next directions container with content
		//description
		function loadNextDirectionDescription() {
			nextDirectionDescriptionContainer = document.getElementById('next-direction-description');

			if (nextDirectionDescriptionContainer) {
				nextDescription = formatter.formatInstruction(instr[2]);
				nextDirectionDescriptionContainer.innerHTML = nextDescription;
			} else {
				setTimeout(loadNextDirectionDescription(), 1000);
			}
		}
		//loadNextDirectionDescription();

		//icon 
		function loadNextDirectionIcon() {
			nextDirectionSVGContainer = document.getElementById('next-direction-svg');

			if (nextDirectionSVGContainer) {
				nextIcon = formatter.getIconName(instr[2]);
				displayDirectionsArrow(nextDirectionSVGContainer, nextIcon);		
			} else {
				setTimeout(loadNextDirectionIcon(), 1000);
			}
		}
		//loadNextDirectionIcon();


		if (instr.length <= 2) { //ziel erreicht
			loadComingUpDirectionDistance();
			loadComingUpDirectionDescription();
			loadComingUpDirectionIcon();

			document.getElementById('coming-up-direction').style.borderRadius = "14px";
			document.getElementById('next-direction').style.display = "none";

			endUpdate();

		} else {
			loadComingUpDirectionDistance();
			loadComingUpDirectionDescription();
			loadComingUpDirectionIcon();

			loadNextDirectionDescription();
			loadNextDirectionIcon();
		}

	});

}


function removeRouting(routing) {
	if (routing != null) {
		map.removeControl(routing);
		routing = null;
	}
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


function displayDirectionsArrow(container, ic) {
	
	//first reset icons
	container.classList.remove("icon-class");
	container.classList.remove("icon-continue");
	container.classList.remove("icon-sharpright");
	container.classList.remove("icon-turnright");
	container.classList.remove("icon-bearright");
	container.classList.remove("icon-uturn");
	container.classList.remove("icon-sharpleft");
	container.classList.remove("icon-turnleft");
	container.classList.remove("icon-bearleft");
	container.classList.remove("icon-roundabout");

	//load suitable icon and send CAN signal for LED stuff
	switch (ic) {
		case 'continue':		 	
			container.classList.add("icon-class");
			container.classList.add("icon-continue");
			//TODO trigger 
			break;

		case 'enter-roundabout':
			container.classList.add("icon-class");
			container.classList.add("icon-roundabout");
			break;

		case 'bear-right':		 	
			container.classList.add("icon-class");
			container.classList.add("icon-bearright");
			break;

		case 'turn-right':
			container.classList.add("icon-class");
			container.classList.add("icon-turnright");
			break;

		case 'sharp-right':
			comingUpDirectionSVGContainer.classList.add("icon-class");
			comingUpDirectionSVGContainer.classList.add("icon-sharpright");
			break;

		case 'u-turn':
			comingUpDirectionSVGContainer.classList.add("icon-class");
			comingUpDirectionSVGContainer.classList.add("icon-uturn");
			break;

		case 'sharp-left':
			comingUpDirectionSVGContainer.classList.add("icon-class");
			comingUpDirectionSVGContainer.classList.add("icon-sharpleft");
			break;

		case 'turn-left':
			container.classList.add("icon-class");
			container.classList.add("icon-turnleft");
			break;
		case 'bear-left':		 	
			container.classList.add("icon-class");
			container.classList.add("icon-bearleft");
			break;
		case 'arrive':
			container.classList.add("icon-class");
			container.classList.add("icon-arrive");
	}
}