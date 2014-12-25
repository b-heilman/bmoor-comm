bMoor.make('bmoor.comm.Streamer',
	['bmoor.extender.Mixin', 'bmoor.comm.Stream',
	function( Mixin, Stream ){
		'use strict';

		return {
			parent : Mixin,
			construct : function CommStreamer( settings ){
				var dis = this;

				bMoor.iterate( settings, function( setting, key ){
					dis[ key ] = new Stream( setting );
				});
			}
		};
	}]
);
