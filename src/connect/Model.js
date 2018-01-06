class Model {
	constructor( model, extend ){
		this.mask = Object.create(model);

		if ( !this.mask.table ){
			throw new Error('table must be defined');
		}

		this.mask.name = model.table.replace(/[_\s]+/g,'/'); // I'm gonna make this web safe in the future

		if ( !this.mask.id ){
			this.mask.id = 'id';
		}

		if ( !this.mask.path ){
			this.mask.path = '';
		}

		if ( extend ){
			Object.keys( extend ).forEach( (key) => {
				this.set( key, extend[key] );
			});
		}
	}

	set( key, value ){
		this.mask[key] = value;
	}

	get( key ){
		return this.mask[key];
	}
}

module.exports = {
	Model: Model
};
