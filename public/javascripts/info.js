/*
     * author(s): Michael Koeppl
     * creation date: 17.06.2014
     * date of last edit: 26.12.2014
     
     
     
     Contains error- and success-specific functions used from many different files.
     METHODS:
        -printError(msg)
        -printSuccess(msg)
* */
 
function printError(msg, panel){
  if(!(panel == undefined)){
    if(panel == "loginpanel"){
      $('#loginpanel').effect('shake');
    }else if(panel == "registerpanel"){
      $('#registerpanel').effect('shake');
    }
  }
  alert(msg);
  console.log(msg);
}

function printSuccess(msg){
  //$('#panelcontainer').effect('size');
  document.querySelector('#errorDiv').innerHTML = msg;
}