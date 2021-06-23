import { load as load_template } from './templates';
import Mustache from 'mustache';

import { lowcan } from 'agl-js-api';

import * as cl from '../js/choose-location';

var template;

// all displayed destinations. 
// To add more make sure to add lines in start.template.html. Or simply change adresses and correlating coordinates in here.
// TODO: For very future work: implement a solution to for a user input for adresses. Best case: Geocoded solutions with autocomplete feature for users.
var destinations = {
    1 : {
        address: "Alteburgstraße 150, 72762 Reutlingen",
        coordinates: {
            lon: 9.187079162622133,
            lat: 48.482017871145885,
        }
    },
    2 : {
        address: "Arnulf-Klett-Platz 2, 70173 Stuttgart",
        coordinates: {
            lon: 9.182450727654725,
            lat: 48.7835171891779,
        }
    },
    3 : {
        address: "Sonnenallee 187-181, 12059 Berlin",
        coordinates: {
            lon: 13.451202,
            lat: 52.476274,
        }
    },
    4 : {
        address: "Zeil 26, 60313 Frankfurt am Main", 
        coordinates: { 
            lon: 8.691384152826528,
            lat: 50.115027852320814,
        }
    },
    5 : {
        address: "Müllerstraße 23, 80469 München",
        coordinates: {
            lon: 11.57113295977992,
            lat: 48.1310746676724,
        }
    }
}


/**
 * Inserts moustache template into <body> element of index.html
 */
export function show() {
    document.body.innerHTML = Mustache.render(template, destinations);
}


/**
 * Takes name of template and after a few error checks renders that template.
 * Note: predefined from AGL html5 dashboard - only adjusted to call cl.init() of loaded template is start.template.html
 * @param {String} template_name 
 */
export function init(template_name) {
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

    var fullName = template_name + '.template.html';

    load_template(fullName).then(function(result) {
        template = result;
        Mustache.parse(template);
        show();
        if (template_name == 'start') {
            cl.init();
        }
    }, function(error) {
        console.error('ERRROR loading main template', error);
    });
}


/**
 * Returns destination coordinates as LatLng.
 * @returns destination coordinates as LatLng
 */
export function getDestinations() {
    return destinations;
}