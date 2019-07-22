var bmoor = require('bmoor'),
	uhaul = require('../Feed.js').index,
	Promise = require('es6-promise').Promise;

/*
function mimic( dis, feed, field ){
	if ( feed && feed[field] ){
		dis[field].$settings = feed[field].$settings;
	}else{
		dis[field].$settings = {};
	}
}
*/

class Storage {
	constructor( name, ops ){
		var store,
			collection,
			settings = ops || {},
			id = settings.id || 'id',
			feed = settings.feed;

		store = settings.session ? sessionStorage : localStorage;

		this.id = id;
		this.feed = feed;

		this.$index = {};
		this.$collection = settings.prepop || [];

		uhaul.register( name, ops );

		this.save = function(){
			store.setItem( name, JSON.stringify(this.$collection) );
		};

		collection = settings.clear ? null : store.getItem( name );

		try {
			if ( collection ){
				collection = JSON.parse( collection );
				
				collection.forEach( ( obj ) => {
					this.$index[ obj[id] ] = obj;
					this.$collection.push( obj );
				});
			}
		}catch( ex ){
			store.removeItem( name );
		}

		// let's try to mimic a Crud object a bit
		/*
		mimic( this, feed, 'read' );
		mimic( this, feed, 'all' );
		mimic( this, feed, 'list' );
		mimic( this, feed, 'create' );
		mimic( this, feed, 'update' );
		mimic( this, feed, 'delete' );
		mimic( this, feed, 'search' );
		*/
	}

	_insert( obj ){
		var id = Date.now() + '-' + this.$collection.length;

		obj[ this.id ] = id;

		this.$index[ obj[this.id] ] = obj;
		this.$collection.push( obj );

		this.save();

		return obj;
	}

	// return only one
	read( qry ){
		var key,
			rtn;

		if ( bmoor.isObject(qry) ){
			key = qry[ this.id ];
		}else{
			key = qry;
		}

		rtn = this.$index[key];

		if ( rtn ){
			return Promise.resolve( rtn );
		}else if ( this.feed.all ){
			return this.all().then( () => {
				var t = this.$index[key];
				
				if ( t ){
					return t;
				}else{
					return this.feed.read( qry ).then( ( res ) => {
						return this._insert( res );
					});
				}
			});
		}else{
			return this.feed.read( qry ).then( ( res ) => {
				return this._insert( res );
			});
		}
	}

	// return an unedited list of all
	all( qry ){
		if ( !this.$collection.length && this.feed && this.feed.all ){
			return this.feed.all( qry ).then( ( res ) => {
				res.forEach( ( obj ) => {
					this.$index[ obj[this.id] ] = obj;
					this.$collection.push( obj );
				});

				return this.$collection;
			});
		}else{
			return Promise.resolve( this.$collection );
		}
	}

	// return possibly truncated list of all
	list( qry ){
		return this.all( qry );
	}

	create( obj ){
		if ( this.feed ){
			return this.feed.create( obj ).then( () => {
				return this._insert(obj);
			});
		}else{
			return Promise.resolve( this._insert(obj) );
		}
	}

	update( qry, obj ){
		var t;

		if ( this.feed ){
			t = this.feed.update( qry, obj );
		}else{
			t = Promise.resolve('OK');
		}

		return t.then( () => {
			if ( obj ){
				return this.read(qry).then( ( res ) => {
					   if ( res ){
						bmoor.object.extend( res, obj );
					}

					this.save();
					
					return 'OK';
				});
			}else{
				this.save();

				return 'OK';
			}
		});
	} 

	delete( qry ){
		var t,
			trg = this.read( qry );

		if ( this.feed ){
			t = this.feed.delete( qry ).then(function(){
				return trg;
			});
		}else{
			t = trg;
		}

		return t.then( () => {
			bmoor.array.remove( this.$collection, trg );
			this.$index[ trg[this.id] ] = undefined;

			this.save();

			return 'OK';
		});
	}

	// expect array returned
	search( qry ){
		var rtn = [],
			keys = Object.keys( qry );
		
		return this.all().then(function( res ){
			res.forEach(function( obj ){
				var miss = false;

				keys.forEach(function( k ){
					if ( obj[k] !== qry[k] ){
						miss = true;
					}
				});

				if ( !miss ){
					rtn.push( obj );
				}
			});

			return rtn;
		});
	}
}

module.exports = Storage;
