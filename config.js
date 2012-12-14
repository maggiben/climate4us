var conf = {
    "sessionSecret" : "secret",
    "listenPort" : process.env.PORT,
    "ip" : process.env.IP,
    "allowCrossDomain" : false,
    "mongo" : {
        "hostname":"alex.mongohq.com",
        "port":10062,
        "username":"admin",
        "password":"12345",
        "name":"",
        "db":"cloud-db"
    }
};

module.exports = conf;