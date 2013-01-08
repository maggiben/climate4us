var conf = {
    "sessionSecret": "secret",
    "listenPort": process.env.PORT || 8080,
    "ip": process.env.IP || localhost,
    "allowCrossDomain": false,
    "mongo": {
        "hostname": "localhost",
        "port": 27017,
        "username": "admin",
        "password": "12345",
        "name": "",
        "db": "climate4us"
    },
    "mongohq"": {
        hostname: "alex.mongohq.com",
        port: 10062,
        username: "admin",
        password: "12345",
        name: "",
        db: "cloud-db"
    }
};

module.exports = conf;