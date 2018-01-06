
class Router {
	constructor( connector ){
		this.connector = connector;
	}

	// all get route should be called with ( params, query )
	getRoutes(){
		var ops = this.connector.model,
			rtn = [
				{ // read
					url: ops.get('path')+`/${ops.get('name')}/instance/:id`,
					method: 'get',
					fn: ( params ) => {
						return this.connector.read( params.id );
					}
				},
				{ // all, getMany: ops.get('path+`/${ops.get('name}?id[]={{${ops.get('id}}}`
					url: ops.get('path')+`/${ops.get('name')}/many`,
					method: 'get',
					fn: ( params, query ) => {
						return this.connector.readMany( query.id );
					}
				},
				{ // all, getMany: ops.get('path+`/${ops.get('name}?id[]={{${ops.get('id}}}`
					url: ops.get('path')+`/${ops.get('name')}`,
					method: 'get',
					fn: () => {
						return this.connector.all();
					}
				},
				{ // list
					url: ops.get('path')+`/${ops.get('name')}/list`,
					method: 'get',
					fn: () => {
						return this.connector.list();
					}
				},
				{ // search: /test/search?query={"foo":"bar"}
					url: ops.get('path')+`/${ops.get('name')}/search`,
					method: 'get',
					fn: ( params, query ) => {
						return this.connector.search( JSON.parse(query.query) );
					}
				},
				{ // create
					url: ops.get('path')+`/${ops.get('name')}`,
					method: 'post',
					fn: ( body ) => {
						return this.connector.create( body );
					}
				},
				{ // update
					url: ops.get('path')+`/${ops.get('name')}/:id`,
					method: 'patch',
					fn: ( params, body ) => {
						return this.connector.update( params.id, body );
					}
				},
				{ // delete
					url: ops.get('path')+`/${ops.get('name')}/:id`,
					method: 'delete',
					fn: ( params ) => {
						return this.connector.delete( params.id );
					}
				}
			];

		rtn.$index = {
			read: rtn[0],
			readMany: rtn[1],
			all: rtn[2],
			list: rtn[3],
			search: rtn[4],
			create: rtn[5],
			update: rtn[6],
			delete: rtn[7]
		};

		return rtn;
	}
}

module.exports = {
	Router: Router
};
