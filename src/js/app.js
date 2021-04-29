import { load as load_template } from './templates';
import Mustache from 'mustache';

import { lowcan } from 'agl-js-api';

var template;
var page = {
    speed: 0,
    tires: {
        front: {
            left: 21,
            right: 22
        },
        rear: {
            left: 23,
            right: 24
        }
    },
    rpm: {
        value: 0,
        percent: 0
    },
    isWarning: true,
    fuel: {
        percent: 75,
        level: 14,
        range: 650,
        avg: 25.5
    }
};

export function show() {
    document.body.innerHTML = Mustache.render(template, page);
}

export function init() {

    lowcan.list().then( function( result ) {
        console.log(result.length);
        for( var i=0;i<result.length; i++) {
            if( result[i].startsWith('messages') ) {
                (function(event) {
                    lowcan.get(event).then( function( result ) {
                        console.log(result[0].event, result[0].value);
                    }, function(error){
                        console.error(event, error);
                    });
                })(result[i]);
            }
        }
    }, function(error){
        console.error(error);
    });

    load_template('main.template.html').then(function(result) {
        template = result;
        Mustache.parse(template);
        show();
    }, function(error) {
        console.error('ERRROR loading main template', error);
    });
}

export function initMap() {
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