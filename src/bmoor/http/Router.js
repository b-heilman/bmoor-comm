bMoor.make('bmoor.http.Router',
	[
	function(){
		// TODO : method
		function addRoutes( router, path, options, func ){
			if ( bMoor.isObject(path) ){
				bMoor.each(path, function( f, p ){
					addRoute( router, p, options, f );
				});
			}else{
				addRoute( router, path, options, func );
			}
		}

		function addRoute( router, path, options, func ){
			var t,
				method = (options&&options.method) ? options.method.toUpperCase() : 'GET',
				o = router.routes[ method ],
				s = path.split('/');

			if ( !o ){
				o = router.routes[ method ] = {};
			}

			while( s.length ){
				t = s.shift();
				if ( !o[t] ){
					o[t] = {};
				}

				o = o[t];
			}

			o.$func = func;
		}

		return {
			construct : function HttpRouter( route, options, func ){
				this.setRoutes( route, options, func );
			},
			properties : {
				setRoutes : function( path, options, func ){
					this.routes = {};

					if ( arguments.length === 2 && bMoor.isFunction(options) ){
						func = options;
						options = null;
					}

					addRoutes( this, path, options, func );
				},
				addRoute : function( path, options, func ){
					if ( arguments.length === 2 && bMoor.isFunction(options) ){
						func = options;
						options = null;
					}

					addRoute( this, path, options, func );
				},
				match : function( method, url ){
					var t,
						func,
						remainder,
						o,
						s;

					if ( arguments.length == 1 ){
						url = method;
						method = 'GET';
					}

					o = this.routes[ method.toUpperCase() ];
					s = url.split('/');

					while( s.length && o ){
						t = s.shift();
						o = o[t];

						if ( o ){
							if ( o.$func ){
								func = o.$func;
								remainder = s.slice(0);
							}
						}
					}

					if ( func ){
						return func.apply( func, remainder );
					}
				}
			}
		};
	}]
);