function anim(){

  /*
   * TO DO
   * use images hosted on server instead (probably done)
   */
  $("#bgcontainer img.bgfade").first().appendTo('#bgcontainer').fadeOut(1500);
  $("#bgcontainer img").first().fadeIn(1500);
  setTimeout(anim, 5000);
}

function animateBackground(){
  /*$(function(){
    var x = 0;
    setInterval(function(){
      x-=1;
      $('#bgcontainer img').css('position', x + 'px 0');
    }, 70 /*speed; higher is slower);
  })

  $( "#bgcontainer img" ).animate({
    opacity: 0.25,
    left: "+=70",
  }, 5000, function() {
  });*/
}