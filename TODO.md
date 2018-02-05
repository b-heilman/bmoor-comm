- Modify how Model generates data
 new Model(<CommModel>)

  - <ForeignKey>
{
  model: '',
  field: '' 
}

  - <Validation>
{
  type: [string|number|boolean|null|undefined]
  nullable: boolean, default true
  regex: '/matchSomething/'
  min: 
  max:
}

  - <AccessInfo> or boolean for all
{
  select: boolean,
  list: boolean,
  insert: boolean,
  update: boolean,
  alias: boolean, // ui representation
  foreign: [ <ForeignKey> ],
  validation: <Validation>,
  label: 'something'
}

  - <RoutingInfo>
{
}

  - <DbInfo>
{
  database:
  table:
  key: 
}
   
  - <Operations>
{
  inflate: DB -> UI
  deflate: UI -> DB
}

  - <CommModel>
{
  fields: { $fieldName: <AccessInfo> },
  routing: <RoutingInfo>,
  db: <DbInfo>
  ops: <Operations>
}

  - Generates API
    - getForServer
    - getForClient
    - pruneUpdate
    - pruneInsert
    - pruneSelect
    - selections
    - insertions
    - updates

- Way to more abstractly pass data from request method
  - args : method to decode arguments to hash object
  - url : method to build url
  - query : method to build query string
  - data : method to build data to pass in

  - http: the request object
  - preprocessor: anything you need to do to the data before success, not an option

  * example : 
{ 
  args: [‘siteId’,’meter’]
  url: function( args ){
    return ‘//someHost.com/'+args.siteId
  },
  data: function( args ){ // replaces massage
    return args.meter;
  },
  // results can be response code, result, headers
  success: function( response, args, data ){
  }
}

