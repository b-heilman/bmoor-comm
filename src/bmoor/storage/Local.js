bMoor.make('bmoor.storage.Local', [
	function(){
		'use strict';

		return {
			construct : function StorageLocal( name ){
				this.name = name;
			},
			properties : {
				// create an instance of this class in the storage
				create : function( key, obj ){
					var id,
						collection;

					if ( !obj[key] ){
						id = Math.random() * 100000000;
						obj[ key ] = id;
					}else{
						id = obj[ key ];
					}

					if ( localStorage[this.name] ){
						collection = JSON.parse( localStorage[this.name] );
					}else{
						collection = [];
					}

					collection.push( id );
					localStorage[this.name] = JSON.stringify( collection );
					localStorage[this.name+'-'+id] = JSON.stringify( obj );

					return bMoor.dwrap( obj );
				},
				// update the whole object in the storage
				update : function( id, obj ){
					localStorage[this.name+'-'+id] = JSON.stringify( obj );

					return bMoor.dwrap( obj );
				},
				// partial update of the object in storage
				partial : function( id, partial ){
					var obj;

					if ( localStorage[this.name+'-'+id] ){
						obj = JSON.parse( localStorage[this.name+'-'+id] );
						localStorage[ this.name+'-'+id ] = JSON.stringify( bMoor.merge(obj,partial) );
					}

					return bMoor.dwrap( obj );
				},
				// allows for the user to get one or many elements
				get : function( id ){
					var i, c,
						res;

					if ( bMoor.isArrayLike(id) ){
						res = [];

						for( i = 0, c = id.length; i < c; i++ ){
							res[ i ] = JSON.parse( localStorage[this.name+'-'+id[i]] );
						}

						return bMoor.dwrap( res );
					}else{
						return bMoor.dwrap( JSON.parse(localStorage[this.name+'-'+id]) );
					}
				},
				// get all instances
				getAll : function(){
					var i, c,
						all,
						res;

					if ( localStorage[this.name] ){
						res = [];
						all = JSON.parse( localStorage[this.name] );

						for( i = 0, c = all.length; i < c; i++ ){
							res.push( JSON.parse(localStorage[this.name+'-'+all[i]]) );
						}

						return bMoor.dwrap( res );
					}else{
						return bMoor.drwap( [] );
					}
				},
				// delete one or many elements
				remove : function( id ){
					var i, c, 
						res,
						collection;

					if ( localStorage[this.name] ){
						collection = JSON.parse( localStorage[this.name] );

						if ( bMoor.isArrayLike(id) ){
							res = [];
							for( i = 0, c = id.length; i < c; i++ ){
								localStorage.removeItem( this.name+'-'+id[i] );
								res.push( bMoor.array.remove(collection,id[i]) );
							}
						}else{
							localStorage.removeItem( this.name+'-'+id );
							res = bMoor.array.remove( collection, id );
						}

						localStorage[this.name] = JSON.stringify( collection );

						return bMoor.dwrap( res );
					}
				},
				// completely blow away all data
				destroy : function(){
					var i, c, 
						collection;

					if ( localStorage[this.name] ){
						collection = JSON.parse( localStorage[this.name] );

						for( i = 0, c = collection.length; i < c; i++ ){
							localStorage.removeItem( this.name+'-'+collection[i] );
						}

						localStorage.removeItem( this.name );
					}

					return bMoor.dwrap( true );
				}
			}
		};
	}]
);