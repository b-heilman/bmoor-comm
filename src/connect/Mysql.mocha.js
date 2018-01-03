// 'use strict';

var mysql = require('../../test/mysql.js'),
	expect = require('chai').expect;

describe('bmoor-comm::connect/Mysql', function(){
	var t,
		Mysql = require('./Mysql.js').Mysql,
		service = new Mysql({
			table: 'mysql_connect',
			select: ['id','name','text','empty'],
			short: ['id','name'],
			insert: ['name','text','empty'],
			update: ['name','text'],
			execute: mysql.connect
		});

	it('should correctly insert', function( done ){
		service.create({name:'name'+Date.now(),text:'just some junk'})
		.then(function( res ){
			t = res;

			expect( t ).to.not.be.undefined; // jshint ignore:line

			done();
		});
	});

	it('should allow reading', function( done ){
		service.read( t.id )
		.then(function( res ){
			
			expect( res ).to.deep.equal( t );

			done();
		});
	});

	it('should allow reading many', function( done ){
		service.readMany( [t.id] )
		.then(function( res ){
			
			expect( res[0] ).to.deep.equal( t );

			done();
		});
	});

	it('should allow reading all', function( done ){
		service.all()
		.then(function( res ){
			
			expect( res.length ).to.not.equal( 0 );
			expect( res[res.length-1].text ).to.not.be.undefined; // jshint ignore:line

			done();
		});
	});

	it('should allow reading list', function( done ){
		service.list()
		.then(function( res ){
			
			expect( res.length ).to.not.equal( 0 );
			expect( res[res.length-1].text ).to.be.undefined; // jshint ignore:line

			done();
		});
	});

	it('should allow searching', function( done ){
		service.search({name:t.name})
		.then(function( res ){
			
			expect( res.length ).to.equal( 1 );
			expect( res[0] ).to.deep.equal( t );

			done();
		});
	});

	it('should allow updating', function( done ){
		service.update(t.id,{name:'-'+t.name+'-'})
		.then(function( res ){
			
			expect( res.name ).to.equal( '-'+t.name+'-' );

			done();
		});
	});

	it('should allow reading changes after update', function( done ){
		service.read( t.id )
		.then(function( res ){
			
			expect( res.name ).to.equal( '-'+t.name+'-' );

			done();
		});
	});

	it('should allow deleting', function( done ){
		service.delete(t.id)
		.then(function( res ){
			
			expect( res ).to.equal( 'OK' );

			done();
		});
	});

	it('should release', function(){
		mysql.close();
	});
});
