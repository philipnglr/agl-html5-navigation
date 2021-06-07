import * as app from '../js/app';
import * as map from '../js/map';


export function init() {

    var destinations = app.getDestinations();

    document.querySelectorAll('#destination-list > *').forEach(v => {
        v.onclick = function(event) {
            $.ajax({
                url: app.init('main'),
                success: function() {
                    initMap(updateRouteAndMap, destinations[event.target.id].coordinates);
                    //TODO: send coorinates to instrument cluster
                }
            });
        }
    });
}

function initMap(callback, destinationCoords) {
    var coord = destinationCoords;
    console.log("Start-emplate loaded succesfully.");
    $.ajax({
        url: map.init(coord),
        success: function() {
            console.log("Map init done.");
            callback();
        }
    });
}

function updateRouteAndMap() {
    $.ajax({
        url: map.update(),
        success: function() {
            console.log("Map update done."); 
        }
    });
}