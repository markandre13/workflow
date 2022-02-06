# Server

*PLEASE NOTE*: To ease the development of the client side, the server is not working yet.

Workflow needs a HTTP Server and the Workflow server provided in

    js/server.js

The index.html page contains the URL under which the workflow WebSocket
server is available.

The workflow server doesn't yet support SSL.  If you need security
(recommended), you can use an Apache as SSL proxy.

### Direct Connection to workflow Server

By default the web app will contact the workflow server directly via

    <body onload="workflow.main('ws://'+window.location.hostname+':8000')"></body>

### Apache as WebSocket Proxy

It is also possible to route the traffic through Apache. For this you will
need to enabled some modules

    a2enmod proxy proxy_wstunnel

and configure the proxy, ie. in

    /etc/apache2/sites-available/000-default.conf

by adding

    ProxyPreserveHost On
    ProxyRequests off
    ProxyPass "/workflow/" "ws://192.168.1.105:8000/"

tweak index.html like this

    <body onload="workflow.main('ws://'+window.location.hostname+'/workflow/')"></body>

and restart Apache

    apachectl -k graceful

### Apache as Secure WebSocket Proxy

In case your web server is not already providing SSL, enable the Apache SSL module

    a2enconf ssl

generate SSL certificates

    cd /etc/apache2
    mkdir ssl
    cd ssl
    openssl req -x509 -newkey rsa:4096 -keyout private.pem -out certificate.pem -days 3650 -nodes

and in

    /etc/apache2/sites-available/000-default.conf

copy the `<VirtualHost *:80>` section and rename it into `<VirtualHost *:443>`
and enable SSL with the available certificates

    SSLEngine on
    SSLCertificateKeyFile /etc/apache2/ssl/private.pem
    SSLCertificateFile    /etc/apache2/ssl/certificate.pem
    # SSLCACertificatePath  /etc/apache2/ssl/cacert.org
    BrowserMatch "MSIE [2-6]" nokeepalive ssl-unclean-shutdown downgrade-1.0 force-response-1.0
    BrowserMatch "MSIE [17-9]" ssl-unclean-shutdown

tweak index.html like this

    <body onload="workflow.main('wss://'+window.location.hostname+'/workflow/')"></body>

and restart Apache

    apachectl -k graceful
