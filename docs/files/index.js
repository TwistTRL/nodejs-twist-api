function getFileFromServer(url, doneCallback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = handleStateChange;
    xhr.open("GET", url, true);
    xhr.send();
    function handleStateChange() {
        if (xhr.readyState === 4) {
            doneCallback(xhr.status == 200 ? xhr.responseText : null);
        }
    }
}

/**
 * unused
 * @param {*} url 
 * @param {*} doneCallback 
 */
function getXlsxFromServer(url, doneCallback) {
    /* set up async GET request */
    var req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.responseType = "arraybuffer";    
    req.onload = function(e) {
        var data = new Uint8Array(req.response);
        var workbook = XLSX.read(data, {type:"array"});
        // workbook
    }    
    req.send();
}

getFileFromServer("./xlsx.log", function(text) {
    if (text === null) {
        console.log("error");
        text = "Unknown";
    }
    document.getElementById("file-time").innerHTML = text;
});

//datatable
$(document).ready(function() {
    $('#datatable').DataTable({
      "ajax": 'xlsx.json',
      paging: false,
      'stripeClasses':['stripe1','stripe2']
    });
} );