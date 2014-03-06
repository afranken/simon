Monitor Page
============

[![Build Status](https://travis-ci.org/afranken/monitoring.png?branch=master)](https://travis-ci.org/afranken/monitoring)

An easy to use Single Page Application to monitor your build infrastructure.

Currently supported:

* Jenkins Jobs
* Sonar
* Nagios Hosts


#Jenkins returns 403 to JSONP Get requests by default.
Errormessage:

`Exception: jsonp forbidden; can use -Dhudson.model.Api.INSECURE=true if you run without security`

From Jenkins Release notes ~1.4:

JSONP support in Remote access API is removed. If you have other programs that depend on this behavior,
you can set the hudson.model.Api.INSECURE system property to true, to resurrect behaviour.
However, this is highly discouraged.

#Nagios JSON Responses
Nagios does not support JSON but responds with XML only.

Use [this simple JSON cgi controller](https://github.com/afranken/status-json) to get Nagios to work with this application.

#Used Third Party Libraries / Software:

Compiled software:

* [Require JS](http://requirejs.org/)
* [Knockout](http://knockoutjs.com/)
* [jQuery](http://jquery.com/)
* [Moment.js](http://momentjs.com/)
* [Twitter Bootstrap](http://getbootstrap.com/)

Testing only:

* [Jasmine](http://jasmine.github.io/)
* [Jasmine Istanbul](https://github.com/gotwarlost/istanbul)


//    "grunt-contrib-jasmine": "~0.6.1",

//    "grunt-template-jasmine-istanbul": "~0.3.1",
