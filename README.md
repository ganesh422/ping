![alt tag](https://raw.github.com/mkocs/ping/master/public/ping_github.png)
====

ping is a social network prototype and school project


## Install Steps
  * [Install MongoDB](http://www.mongodb.org/display/DOCS/Building+for+Linux)
  * Another way to install MongoDB : `$ sudo apt-get install mongodb` or `$ sudo pacman -S mongodb`
  * Install [NodeJS](https://github.com/joyent/node/wiki/Installation) or [io.js](https://iojs.org)
  * Another way to install NodeJS/io.js: `$ sudo apt-get install nodejs` or `$ sudo pacman -S nodejs` or `$ sudo pacman -S iojs`
  * Clone the repository: `$ git clone git://github.com/mkocs/ping` for the main branch or `$ git clone -b testing git://github.com/mkocs/ping` for the testing branch
  * Since there are some parts ignored via .gitignore, you will have to add them yourself in the following steps
  * In the components directory you will find 3 empty directories. You have to insert a version of Bootstrap, jQuery, jQuery UI, and AngularJS because ping uses local copies for now.
  * Get Bootstrap/Bootswatch: download [Bootstrap](http://getbootstrap.com/) or [Bootswatch](https://bootswatch.com/paper/) and insert it in /public/components/bootstrap (call the .css file `bootstrap-paper.css` or change the name on the .jade pages itself
  * Get jQuery: `$ wget http://code.jquery.com/jquery-1.11.2.js` in the /public/components/jQuery directory
  * Get JQuery UI: create a directory called `jquery-ui` in the jQuery directory, get it [here](http://jqueryui.com/download/), and extract it in the jquery-ui directory
  * Get AngularJS: `$ wget https://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular.min.js` in /public/components/angular
  * Next you need to [generate an SSL certificate and key](https://www.openssl.org/docs/HOWTO/certificates.txt) (for personal use or in a testing environment).
  * CD into the directory `$ cd ping`
  * Install all modules: `$ npm install` (all the modules can be found in packages.json)
  * Run the server: `$ node app` or `$ iojs app`
  * You can override certain environment variables (you can find their names where they are used --> config.js) via `$ VARIABLE_NAME node app`
  * Visit the page in your browser: [Ping](https://localhost:1338)

## Dependencies
  * [Express](http://expressjs.com/)
  * [body-parser module](https://github.com/expressjs/body-parser)
  * [cookie-parser module](https://github.com/expressjs/cookie-parser)
  * [Morgan](https://github.com/expressjs/morgan)
  * [serve-favicon module](https://github.com/expressjs/serve-favicon)
  * [debug module](https://github.com/visionmedia/debug)
  * [Jade](https://github.com/jadejs/jade)
  * [ejs module](https://github.com/tj/ejs)
  * [mongoose](https://www.npmjs.com/package/mongoose) and [MongoDB](https://www.mongodb.org/)
  * [winston](https://github.com/winstonjs/winston)
  * [colors module](https://github.com/marak/colors.js/)
  * [connect-flash](https://github.com/jaredhanson/connect-flash)
  * [Mozilla client-sessions module](https://github.com/mozilla/node-client-sessions)
  * [dotenv](https://www.npmjs.com/package/dotenv)
  * [Bootstrap](http://getbootstrap.com/) or [Bootswatch Paper](https://bootswatch.com/paper/)
  * [jQuery](https://jquery.com/)
