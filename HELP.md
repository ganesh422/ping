1. FÜR DEN HTTPS SERVER BRAUCHT MAN EINEN SSL KEY UND EIN SSL ZERTIFIKAT. 
GENERATION VON KEY UND ZERTIFIKAT MITTELS OPENSSL:
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days XXX
ODER
openssl req -x509 -sha256 -newkey rsa:2048 -keyout key.pem -out cert.pem -days XXX
FÜR SHA2 HASH ALGORITHMUS
