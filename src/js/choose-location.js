import * as app from '../js/app';
import * as map from '../js/map';

export function init() {
    var startNavBtn = document.getElementById('startNavBtn');
    $(startNavBtn).click(function() {
        $.ajax({
            url: app.init('main'),
            success: function() {
                map.init();
            }
        });
    });
}