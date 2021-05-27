import { load as load_template } from './templates';
import Mustache from 'mustache';

import { lowcan } from 'agl-js-api';

import * as cl from '../js/choose-location';

var template;
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

export function show() {
    document.body.innerHTML = Mustache.render(template, destinations);
}

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

export function getDestinations() {
    return destinations;
}