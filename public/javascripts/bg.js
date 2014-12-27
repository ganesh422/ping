function randomizeBackground(){

  /*
   * TO DO
   * use images hosted on server instead (probably done)
   */


  /*background image randomizer*/
  switch(Math.floor((Math.random() * 3) + 1)){
    case 1:
      $('body').css('background', '#000 url("/images/austria_sg.jpg")');
      console.log('got background austria_sg.jpg from server on /images'); //debugging
      //$('#errorDiv').css('color', 'white');
      break;
    case 2:
      $('body').css('background', '#000 url("/images/greece_olivetree.jpg")');
      console.log('got background greece_olivetree.jpg from server on /images');
      //$('#errorDiv').css('color', 'white');
      break;
    case 3:
      $('body').css('background', '#000 url("/images/greece_olivetree_closeup.jpg")');
      console.log('got background greece_olivetree_closeup.jpg from server on /images');
      //$('#errorDiv').css('color', 'black');
      break;
    default:
      $('body').css('background', '#000 url("/images/austria_sg.jpg")');
      console.log('got background austria_sg.jpg from server on /images');
      //$('#errorDiv').css('color', 'black');
      break;
  }
}

function animateBackground(){
  $(function(){
    var x = 0;
    setInterval(function(){
      x-=1;
      $('body').css('background-position', x + 'px 0');
    }, 80 /*speed; higher is slower*/);
  })
}