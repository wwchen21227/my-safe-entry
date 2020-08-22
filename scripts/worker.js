importScripts('../lib/jsQR.js');
(function() {
    onmessage = function(e) {
        var decoded = jsQR(
            e.data.data,
            e.data.width,
            e.data.height
        );
        console.log(decoded);
        if (decoded) {
            postMessage(decoded);
        } else {
            postMessage(null);
        }
    };
}) ();
