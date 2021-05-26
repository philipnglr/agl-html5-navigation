import { load as load_template } from './templates';
import Mustache from 'mustache';

import { lowcan } from 'agl-js-api';

import * as cl from '../js/choose-location';

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
            loadStartPage();
        }
    }, function(error) {
        console.error('ERRROR loading main template', error);
    });
}

export function loadStartPage(){
    cl.init();
} 