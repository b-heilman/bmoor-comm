bMoor.make('bmoor.storage.Mongo', [
	'bmoor.extender.Mixin',
	function( Mixin ){
		'use strict';

		return {
			parent : Mixin,
			construct : function StorageLocal(){},
			properties : {
				// create an instance of this class in the storage
				create : function( obj ){

				},
				// update the whole object in the storage
				update : function( id, obj ){

				},
				// partial update of the object in storage
				partial : function( id, partial ){

				},
				// allows for the user to get one or many elements
				get : function( id ){

				},
				// get all instances
				getAll : function(){

				},
				// delete one or many elements
				remove : function( id ){
					
				}
			}
		};
	}]
);