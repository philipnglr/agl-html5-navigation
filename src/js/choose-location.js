import * as app from '../js/app';
import * as map from '../js/map';


export function init() {

    var destinations = app.getDestinations();

    document.querySelectorAll('#destination-list > *').forEach(v => {
        v.onclick = function(event) {
            $.ajax({
                url: app.init('main'),
                success: function() {
                    map.init(destinations[event.target.id].coordinates);
                }
            });
        }
    });

}
