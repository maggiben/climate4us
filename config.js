var conf = {
    "sessionSecret": "secret",
    "listenPort": process.env.PORT || 8080,
    "ip": process.env.IP,
    "allowCrossDomain": false,
    "mongo" : {
        "hostname": "localhost",
        "port": 27017,
        "username": "admin",
        "password": "12345",
        "name": "",
        "db": "climate4us"
    }
};

module.exports = conf;