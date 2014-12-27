/*
 * fills the div via an ajax request
 */
function ajax(dir, file){
  console.log(dir);
  console.log(file);

  $.ajax({
    type:'GET',
    url:('/ajax/' + dir + file + '.html'),
    success: function(data){
      $('#panelcontainer').html(data);
    }
  });


  /*
   * changing URL according to the used panel
   *
   * documentation:
   * https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Manipulating_the_browser_history#The_pushState()_method
   */
  history.pushState(history.state, document.title, '?p=' + file);
  //history.pushState(history.state, 'Qi', '?p=' + file);
  document.title = 'Qi';
}

/*
 * animates the container div
 */
function adjustDiv(divHeight /*defines the new height of the div*/, div){
  if(div == undefined){
    $('#panelcontainer')
      .animate({
        height: divHeight,
        width: 450
      });
    $('#errorDiv').html = "";
  }else {
    $(div)
      .animate({
        height: divHeight,
        width: 450
      });
    $('#errorDiv').html = "";
  }
}