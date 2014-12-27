/**
 * Created by mko on 26/12/14.
 */

function login(){
	var emailpseudo = $("#emailpseudoinput_login").val();
	var wp /*master of confusion*/ = $("#pwinput_login").val();

	if(emailpseudo == "" || wp == ""){
		printError("please fill all fields");
	}else if(wp.length < 6){
		printError("password is invalid.");
	}else{
		// login post request is handled by /routes/people.js
        $.post('/people/login', {'emailpseudo': emailpseudo, 'wp': wp}, function(data){
            //alert('data sent');
            if(data.status == 'success'){
                alert('success');
            }else if(data.status == 'failure'){
                alert('NOU');
            }else{
                alert('NOU');
            }
        });
	}
}