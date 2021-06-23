import * as app from '../js/app';
import * as map from '../js/map';


/**
 * Takes all predefined destination coordinates from app.js and sets onclick listeners for each list item in the destination selection of start.template.html. Also initializes map and starts update function when destination is selected.
 */
export function init() {
    var destinations = app.getDestinations();

    document.querySelectorAll('#destination-list > *').forEach(v => {
        v.onclick = function(event) {
            $.ajax({
                url: app.init('main'),
                success: function() {
                    initMap(updateRouteAndMap, destinations[event.target.id].coordinates);
                    //TODO: send destination coorinates to instrument cluster
                    //TODO: send trigger to inititialize map to instrument cluster
                }
            });
        }
    });
}


/**
 * Initializes map by loading main.template.html and passing the selected destination coordinates.
 * @param {callback function} callback 
 * @param {LatLng} destinationCoords 
 */
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


/**
 * Initially calls map update function.
 */
function updateRouteAndMap() {
    $.ajax({
        url: map.update(),
        success: function() {
            console.log("Map update done."); 
        }
    });
}