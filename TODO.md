- Use fetch library for http communication in node and browser

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

* Flesh out the intercepter so I can direct a storage.Remote to storage.Local
* add massage functionality to Remote and Local
* externalize the functions of remote so options can be edited if needed