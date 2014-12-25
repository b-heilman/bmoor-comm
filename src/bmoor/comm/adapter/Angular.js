(function(){
'use strict';

if ( typeof angular !== 'undefined' ){
	bMoor.define('bmoor.comm.adapter.Angular',
		['bmoor.defer.Basic',
		function( Defer ){
			var $http = angular.injector(['ng']).get('$http');

			return function commAngularAdapter( options ){
				var r = new Defer();

				$http( options ).then(
					function( res ){
						r.resolve( res );
					},
					function( res ){
						r.reject( res );
					}
				);

				return r.promise;
			};
		}]
	);
}

}());