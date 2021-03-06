
const {Sitemap} = require('./Sitemap.js');
const RequestorMock = require('./Requestor.mock.js');

describe('bmoor-comm::Sitemap', function(){
	const httpMock = new RequestorMock();

	beforeEach(function(){
		httpMock.enable();
	});

	afterEach(function(){
		httpMock.verifyWasFulfilled();
	});

	it('should instantiate correctly', function(){
		var sitemap = new Sitemap('www.junk.com');

		sitemap.ingest({
			'foo-bar': {
				routes:{
					read: 'foo-bar/read/{{id}}'
				}
			}
		});

		expect(sitemap.getFeed('foo-bar')).toBeDefined();
	});


	describe('::read', function(){
		let sitemap = null;

		beforeEach(function(){
			sitemap = new Sitemap('www.junk.com');

			sitemap.ingest({
				'foo-bar': {
					routes:{
						read: '/foo-bar/read/{{id}}'
					}
				}
			});
		});

		it('should properly call through', function(done){
			httpMock.expect('www.junk.com/foo-bar/read/123')
			.respond({hello: 'world'});

			sitemap.getFeed('foo-bar').read({id: 123})
			.then(res => {
				expect(res.hello).toBe('world');
				done();
			})
			.catch(ex => {
				console.log(ex.message);
				console.log(ex.trace);

				expect(1).toBe(0);
				done();
			});
		});
	});

	describe('::search', function(){
		let sitemap = null;

		beforeEach(function(){
			sitemap = new Sitemap('www.junk.com');

			sitemap.ingest({
				'table-1': {
					routes:{
						read: '/table-1/{{id}}'
					}
				},
				'table-2': {
					joins: {
						'table1Id': '/table-1/{{table1Id}}/table-2'
					}
				},
				'table-3': {
					joins: {
						table1Id: '/table-1/{{table1Id}}/table-2'
					}
				},
				'table-4': {
					joins: {
						rootId: '/table-2/{{rootId}}/table-4/rootId',
						otherId: '/table-2/{{otherId}}/table-4/otherId'
					}
				}
			});
		});

		it('should define all the feeds', function(){
			expect(sitemap.getFeed('table-1').search).toBeUndefined();
			expect(sitemap.getFeed('table-2').search).toBeDefined();
			expect(sitemap.getFeed('table-3').search).toBeDefined();
			expect(sitemap.getFeed('table-4').search).toBeDefined();
		});

		it('should allow joining table-1 to table-2', function(done){
			httpMock.expect('www.junk.com/table-1/123/table-2')
			.respond({hello: 'world'});

			sitemap.getFeed('table-2').search({
				table1Id: 123
			}).then(res => {
				expect(res.hello).toBe('world');
				done();
			}).catch(ex => {
				console.log(ex.message);
				console.log(ex.trace);

				expect(1).toBe(0);
				done();
			});
		});

		it('should allow joining table-2 to table-4 via rootId', function(done){
			httpMock.expect('www.junk.com/table-2/123/table-4/rootId')
			.respond({hello: 'world'});

			sitemap.getFeed('table-4').search({
				rootId: 123
			}).then(res => {
				expect(res.hello).toBe('world');
				done();
			}).catch(ex => {
				console.log(ex.message);
				console.log(ex.trace);

				expect(1).toBe(0);
				done();
			});
		});
	});
});
