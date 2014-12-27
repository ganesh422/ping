/**
 * Created by mko on 21/12/14.
 */

function register(){
    var email = $('#emailinput_reg').val();
    var name = $('#nameinput_reg').val();
    var pseudo = $('#pseudoinput_reg').val();
    var wp = $('#pwinput_reg').val();
    var wpr = $('#pwrinput_reg').val();

    if(email == '' || name == '' || pseudo == '' || wp == '' || wpr == ''){
        printError('please fill all fields.', 'registerpanel');
    }else if(!checkIfEmailInString(email)){
        printError('the email address you entered is not valid.');
    }else if(name.length < 4){
        printError('the name you entered was not long enough.');
    }else if(wp.length < 6){
        printError('the password you entered was not long enough.')
    }else if(wp != wpr){
        printError('the passwords you entered do not match.')
    }else{
        // registration post request is handled by /routes/people.js
        $.post('/people/new', {'email': email, 'name': name, 'pseudo': pseudo, 'wp': wp}, function(data){
            //alert('data sent');
            if(data.status == 'success'){
                alert('success');
            }else if(data.status == 'failure'){
                alert('NOU');
            }else{
                alert('NOU');
            }
        });
            /*.success(function(data){
                if(data.status == 'success'){
                    alert('YAS');
                }else if(data.status == 'failure'){
                    alert('NOU');
                }else{
                    alert('NOU');
                }
            });*/
    }
}