// true if email is valid
function checkIfEmailInString(text) {
    var re = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
    return re.test(text);
}

function https_redirect(){
    // only works with http and https standard ports
    // redirects to https page
    /*if(window.location.protocol == "http:"){
     restOfUrl = window.location.href.substr(5);
     window.location.replace("https:" + restOfUrl);
     }*/

    // because it only works with standard ports, we use this for now
    if(window.location.protocol == "http:"){
        $("#http_warning").show();
    }else{
        $("#http_warning").hide();
    }
}