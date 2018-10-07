
var usermanage = require('../controller/usermanage');
var feedmanage = require('../controller/feedmanage');
module.exports = function(app){
  
  app.get('/index',usermanage.index);
  app.get('/login',usermanage.login);
  app.get('/admin',usermanage.admin);
  app.get('/forgot',usermanage.forgot);
  app.get('/logout',usermanage.logout);
  app.get('/register',usermanage.register);
  app.get('/forgot',usermanage.forgot);
  app.get('/aboutus',usermanage.aboutus);
  app.get('/faq', usermanage.faq); //jl
  app.get('/health',usermanage.health);
  
  app.get('/mobileforgot',usermanage.mobileforgot);
  app.get('/mobileindex',usermanage.mobileindex);
  app.get('/mobilelogin',usermanage.mobilelogin);
  app.get('/mobileregister',usermanage.mobileregister);


  app.get('/reset/:token',usermanage.reset);

 
  ///User managements
  app.post('/contactus',usermanage.contactus);
  app.post('/resetpass',usermanage.resetpass);
  app.post('/forgotpass',usermanage.forgotpass);
  
  app.post(`/api/checkuser`,usermanage.checkuser);
  app.post(`/api/checkadmin`,usermanage.checkadmin);
  app.post(`/api/createuser`,usermanage.createuser);  
  app.post(`/api/updateuser`,usermanage.updateuser);
  app.get(`/api/getallusers`,usermanage.getallusers);
  app.post(`/api/usersuspend`,usermanage.usersuspend);
  app.post(`/api/userapprove`,usermanage.userapprove);
  app.post(`/api/deleteuseritem`,usermanage.deleteuseritem);
  //////Radar create and update and remove 
  app.post(`/api/createradaritem`,usermanage.putRadarItems);
  app.get(`/api/getradaritems`,usermanage.getRadarItems);
  app.post(`/api/updateitems`,usermanage.updateItems);

  // app.get('/api/datafeed/config',feedmanage.getconfig);
  // app.get('/api/datafeed/time',feedmanage.getservertime);
  // app.get('/api/datafeed/marks',feedmanage.getmarks);
  // app.get('/api/datafeed/timescale_marks',feedmanage.gettimescalemarks);
  // app.get('/api/datafeed/search',feedmanage.getsearch);
  // app.get('/api/datafeed/symbols',feedmanage.getsymbols);
  // app.get('/api/datafeed/history',feedmanage.gethistory);
  // app.get('/api/datafeed/quotes',feedmanage.getquotes);
  // app.get('/api/datafeed/symbol_info',feedmanage.getsymbolinfo);

}
