describe('bmoor-comm::Url', function(){
	var Url = bmoorComm.Url;

	it('should properly encode a url', function(){
		var url = new Url('/{{foo}}/{{bar}}?woot={{hello}}');

		expect( url.go({foo:1,bar:2,hello:3}) )
			.toBe('/1/2?woot=3');
	});

	it('should properly encode a url when given an array', function(){
		var url = new Url('/this/path?foo[]={{bar}}');

		expect( url.go([{bar:1},{bar:2},{bar:3}]) )
			.toBe('/this/path?foo[]=1&foo[]=2&foo[]=3');
	});
});