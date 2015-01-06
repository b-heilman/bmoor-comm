(function(){

var bMoor,
	xHR;

if ( typeof window === 'undefined' ){
	bMoor = require('bmoor');
	xHR = require('XMLHttpRequest');
}else{
	bMoor = window.bMoor;
	if ( window.XMLHttpRequest ){
		xHR = function(){
			return new window.XMLHttpRequest( arguments );
		};
	}else{
		xHR = (function(){
			/* global ActiveXObject */
			try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); } catch (e1) {}
			try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); } catch (e2) {}
			try { return new ActiveXObject("Msxml2.XMLHTTP"); } catch (e3) {}
			throw 'error' /* TODO : error */;
		}());
	}
}

bMoor.define('bmoor.comm.Connect',
	['bmoor.defer.Basic',
	function( Defer ){
		function makeXHR( method, url, async, user, password ){
			var xhr = xHR();

			if ( "withCredentials" in xhr ){
				// doop
			}else if ( typeof XDomainRequest !== "undefined") {
				// Otherwise, check if XDomainRequest.
				// XDomainRequest only exists in IE, and is IE's way of making CORS requests.
				xhr = new XDomainRequest();
			} else {
				// Otherwise, CORS is not supported by the browser.
				xhr = null;
			}

			xhr.open( method, url, async, user, password );

			return xhr;
		}

		function processReponse( url, options, q, status, response, headers ){
			// TODO : processing JSON
			var r,
				action,
				valid = ( 200 <= status && status < 300 ),
				protocol = url.protocol;

			this.connection = null;

			// fix status code for file protocol (it's always 0)
			status = (protocol == 'file' && status === 0) ? (response ? 200 : 404) : status;

			// normalize IE bug (http://bugs.jquery.com/ticket/1450)
			status = status == 1223 ? 204 : status;
			action = valid ? 'resolve' : 'reject';
			
			q[action]({
				'status' : status,
				'headers' : headers,
				'config' : options,
				'data' : response
			});
		}

		return function commConnector( options ){
			var aborted = false,
				q = new Defer(),
				xhr = makeXHR( 
					options.method ? options.method.toUpperCase() : 'GET', 
					options.url, 
					(options.async === undefined ? true : options.async),
					options.user,
					options.password
				);

			xhr.onload = function() {
				if (xhr.readyState == 4) {
					processReponse(
						bMoor.url.resolve( options.url ),
						options,
						q,
						aborted ? -2 : xhr.status,
						xhr.responseType ? xhr.response : xhr.responseText,
						xhr.getAllResponseHeaders()
					);
				}
			};

			bMoor.forEach( options.headers, function( value, key ){
				xhr.setRequestHeader(key, value);
			});

			if ( options.mimeType ) {
				xhr.overrideMimeType( options.mimeType );
			}

			if ( options.responseType ) {
				xhr.responseType = options.responseType;
			}

			xhr.send(options.data || null);

			q.promise.abort = function(){
				aborted = true;
				xhr.abort();
			};

			return q.promise;
		};
	}]
);

}());
