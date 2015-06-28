function anim(){
  $("#bgcontainer img.bgfade").first().appendTo('#bgcontainer').fadeOut(1500);
  $("#bgcontainer img").first().fadeIn(1500);
  setTimeout(anim, 10000);
}