bMoor.make('bmoor.storage.Remote', [
	'bmoor.comm.Streamer',
	function( Streamer ){
		'use strict';

		return {
			construct : function StorageRemote( name, root ){
				this.root = root;
				this.name = name;
			},
			extend : [
				new Streamer({
					create : {
						url : function(){
							return this.root;
						},
						method : 'POST',
						success : function( res, key ){
							if ( !res[key] ){
								res[ key ] = Math.random() * 100000000;
							}

							return res;
						}
					},
					update : {
						url : function( id ){
							return this.root + '/' + id;
						},
						method : 'POST'
					},
					partial : {
						url : function( id ){
							return this.root + '/' + id;
						},
						method : 'POST'
					},
					get : {
						url : function( id ){
							if ( bMoor.isArray(id) ){
								return this.root + '/' + id.join(',');
							}else{
								return this.root + '/' + id;
							}
						},
						method : 'GET'
					},
					getAll : {
						url : function(){
							return this.root;
						},
						method : 'GET'
					},
					remove : {
						url : function( id ){
							return this.root + '/' + id;
						},
						method : 'DELETE'
					},
					destroy : {
						url : function(){
							alert('TODO : destroy');
						}
					}
				})
			]
		};
	}]
);