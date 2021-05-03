export function init() {
	
	var mapcontainer = document.getElementById('mapid');
	var zoomInBtn = document.getElementById('in');
	var zoomOutBtn = document.getElementById('out');
	var map;
	
	var currentLocation = { //Reutlingen
		lon: 9.20427,
		lat: 48.49144
	}
	var street = "Hauptstraße";

	// custom marker-icon
	var marker = new L.icon({
		iconUrl: '../images/marker.png',

		iconSize: [74, 74],
		iconAnchor: [37, 37],
		popupAnchor: [0, 140]
	});
	
	// setup map position and zoom (if html div loaded properly)
	if (mapcontainer) {
		map = L.map(mapcontainer, {zoomControl: false}).setView(currentLocation, 13);

		// add the CartoDB tiles
		L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
		}).addTo(map);

		// add the OpenStreetMap tiles
		/*L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
		  }).addTo(map);*/

		// show the scale bar on the lower left corner
		//L.control.scale().addTo(map);

	} else {
		console.log("Konnte div nicht finden");
	}
	
	//setup streetname tooltip
	var popup = L.popup({closeButton: false, className: "street-label"}).setContent(street);
	
	//setup scale
	var scale = L.control.scale().addTo(map);
	
	var route = L.Routing.control({

		createMarker: function(i, wp, nWps) {
			if (i === 0 || i === nWps - 1) {
				var startMarker = L.marker(wp.latLng, {
					icon: marker
				}).bindPopup(popup).openPopup();
				return startMarker;
			} else {
			return L.marker(wp.latLng, {
				icon: marker
			});
			}
		},

		waypoints: [
			L.latLng(currentLocation.lat, currentLocation.lon), //Reutlingen
			L.latLng(48.783, 9.192) //Stuttgart
		],

		lineOptions: {
			styles: [
			  {
				color: "blue",
				//opacity: 0.6,
				weight: 4
			  }
			]
		  },

		addWaypoints: false,
		draggableWaypoints: false,
		fitSelectedRoutes: false,
		showAlternatives: false,
		
	}).addTo(map);
	
	route.show();

	popup.openPopup();

	var onLocationFound = function(e){
		marker.setLatLng(e.latlng);
		map.setView(marker.getLatLng(),map.getZoom());
	};
	
	//setup marker
	//marker = L.marker(map.getCenter(), {icon: marker}).addTo(map);
	


	// zoom in function
	$(zoomInBtn).click(function(){
		map.setZoom(map.getZoom() + 1)
	});


	// zoom out function
	$(zoomOutBtn).click(function(){
		map.setZoom(map.getZoom() - 1)
	});
}


/*export function simulate() {
    console.log('SIMULATE');
    var counter = 0;
    var interval = setInterval(function() {
        counter ++;
        if( page.speed < 60 ) {
            page.speed += Math.floor(Math.random()*10);
            if( page.rpm.percent < 80 ) {
                page.rpm.percent += Math.floor(Math.random()*25);
            } else {
                page.rpm.percent = 40;
            }
        } else if (Math.random() > 0.5 ) {
            page.speed += Math.floor(Math.random()*10);
            page.rpm.percent = Math.min(80, Math.floor(Math.random()*90));
        } else {
            page.speed -= Math.floor(Math.random()*10);
            page.rpm.percent = Math.min(80, Math.floor(Math.random()*90));
        }

        show();

        if( counter > 600 ) {
            clearInterval(interval);
        }
    }, 1000);
}*/