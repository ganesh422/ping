function start(){
  randomizeBackground();
  animateBackground();
  set_welcome_click_listeners();
  set_welcome_keypress_listeners();
  $("#registerpanel").hide();
  $("#emailpseudoinput_login").focus();
}