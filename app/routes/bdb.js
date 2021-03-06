module.exports = function (app, passport) {
    var db = require('../config/b-db');
    var request = require('request');
    var cheerio = require('cheerio');

    //********************************************** */
    //LogBook App Functions
    //********************************************** */
    app.get('/api/trip/getLastTrip', function (req, res) {
        if (req.isAuthenticated()) {
            var sql = "SELECT * FROM td_car_logbook WHERE env = ? ORDER BY km_end DESC LIMIT 1 ";
            db.query(sql, [process.env.NODE_ENV], function (err, result) {
                console.log(result);
                res.json(result);
            });
        }
    });
    app.post('/api/trip/deleteTrip', function (req, res) {
        if (req.isAuthenticated()) {
            var sql = "DELETE FROM td_car_logbook WHERE env = ? AND id = ?";
            db.query(sql, [process.env.NODE_ENV, req.body.id], function (err, result) {
                console.log(result);
                res.json(result);
            });
        }
    });
    app.post('/api/trip/updateTrip', function (req, res) {
        var start_date = new Date(req.body.start_date);
        var end_date = new Date(req.body.end_date);

        var sql = "UPDATE `td_car_logbook` SET ? WHERE id = ? ";
        var post = {
            // start_date: req.body.start_date,
            start_date: start_date.getFullYear() + '-' + (start_date.getMonth() + 1) + '-' + start_date.getDate(),
            // end_date: req.body.end_date,
            end_date: end_date.getFullYear() + '-' + (end_date.getMonth() + 1) + '-' + end_date.getDate(),
            km_traveled: req.body.km_traveled,
            km_end: req.body.km_end,
            reason: req.body.reason,
            bpid: req.body.bpid,
            text: req.body.text
        };
        if (req.isAuthenticated()) {
            db.query(sql, [post, req.body.id], function (err, result) {
                if (err) throw err;
                console.log("Number of records updated: " + result.affectedRows);
                res.json(result);
            });
        }

    });
    app.get('/api/trip/getReasons', function (req, res) {
        if (req.isAuthenticated()) {
            db.query('SELECT * FROM c_tr_reason ORDER BY reason', function (err, result) {
                res.json(result);
            });
        }
    });
    app.get('/api/trip/getBP', function (req, res) {
        if (req.isAuthenticated()) {
            var sql = 'SELECT * FROM md_bupa WHERE env = ? ORDER BY bpid';
            db.query(sql, [process.env.NODE_ENV], function (err, result) {
                res.json(result);
            });
        }
    });

    app.post('/api/trip/postTrip', function (req, res) {
        var sql = "INSERT INTO `td_car_logbook` SET ?";
        var post = {
            env: process.env.NODE_ENV,
            start_date: new Date(req.body.start_date),
            end_date: new Date(req.body.end_date),
            km_traveled: req.body.km_traveled,
            km_end: req.body.km_end,
            reason: req.body.reason,
            bpid: req.body.bpid,
            start_time: req.body.start_time,
            end_time: req.body.end_time,
            text: req.body.text
        };
        if (req.isAuthenticated()) {
            db.query(sql, post, function (err, result) {
                if (err) throw err;
                console.log("Number of records inserted: " + result.affectedRows);
                res.json(result);
            });
        }
    });
    app.get('/api/trip/getLogs', function (req, res) {

        var dateFrom;
        var dateTo;

        var datab = new Date(req.query.datab);
        var datbi = new Date(req.query.datbi);

        dateFrom = datab.getFullYear() + '-' + (datab.getMonth() + 1) + '-' + datab.getDate();
        dateTo = datbi.getFullYear() + '-' + (datbi.getMonth() + 1) + '-' + datbi.getDate();

        console.log(dateFrom);
        console.log(dateTo);
        var sql = "SELECT `td_car_logbook`.*, `c_tr_reason`.`name` AS `reasonName`, `md_bupa`.`name` AS `buPaName` " +
            ",`md_bupa`.`city` AS 'city' ,`md_bupa`.`street` AS 'street'   " +

            "FROM `td_car_logbook` INNER JOIN `c_tr_reason` ON `td_car_logbook`.`reason` = `c_tr_reason`.`reason`" +
            "INNER JOIN `md_bupa` ON `td_car_logbook`.`bpid` = `md_bupa`.`bpid`" +

            "WHERE `td_car_logbook`.`start_date` BETWEEN CAST('" + dateFrom + "' AS DATE) AND CAST('" + dateTo + "' AS DATE) AND `td_car_logbook`.`env` = ?" +
            "ORDER BY `td_car_logbook`.`start_date`, `td_car_logbook`.`km_end` ";

        if (req.isAuthenticated()) {
            //db.query(sql, post, function (err, result) {
            // db.query(sql, [dateFrom, dateTo], function (err, result) {
            db.query(sql, [process.env.NODE_ENV], function (err, result) {
                if (err) throw err;
                console.log(err);
                console.log("Number of selected records: " + result.affectedRows);
                var data = analyseTripData(result);
                res.json(data);
            });
        }
    });

    function analyseTripData(data) {
        for (var i = 0; i < data.length; i++) {
            //Calc Trip KM at Start
            data[i].km_start = data[i].km_end - data[i].km_traveled;

            if (i === 0) {
                data[i].status = 0;
            } else {
                if (lastElement.km_end != data[i].km_start) {
                    data[i].status = 1;
                } else {
                    data[i].status = 0;
                }
            }
            var lastElement = data[i];
        }
        return data;
    }

    //********************************************** */
    // Create Customer App Functions
    //********************************************** */
    app.get('/api/bpc/getNext', function (req, res) {
        if (req.isAuthenticated()) {
            var sql = 'SELECT bpid FROM `md_bupa` WHERE env = ? AND bpid < 99999 ORDER BY bpid DESC LIMIT 1 ';

            db.query(sql, [process.env.NODE_ENV], function (err, result) {
                var number = 0;
                if (result.length > 0) {
                    number = parseInt(result[0].bpid, 10);
                    number++;
                } else {
                    switch (process.env.NODE_ENV) {
                        case "DEV":
                            number = 80000;
                            break;
                        case "PRD":
                            number = 10000;
                            break;
                        default:
                            break;
                    }
                }
                res.json(number);
            });
        }
    });
    app.get('/api/bpc/getCategory', function (req, res) {
        if (req.isAuthenticated()) {
            var sql = "SELECT * FROM `c_bp_cat` WHERE `category` <> '0000' ";
            db.query(sql, function (err, result) {
                res.json(result);
            });
        }
    });
    app.get('/api/bpc/getServices', function (req, res) {
        if (req.isAuthenticated()) {
            var sql = "SELECT * FROM `md_services`";
            db.query(sql, function (err, result) {
                res.json(result);
            });
        }
    });
    app.get('/api/bpc/getConditions', function (req, res) {
        if (req.isAuthenticated()) {
            var sql = "SELECT `md_conditions`.*, `md_services`.`description` AS `serviceName` FROM `md_conditions`" +
                "INNER JOIN `md_services` ON `md_conditions`.`service` = `md_services`.`serv`" +
                " WHERE `env` = ? AND `bpid` = ?";
            db.query(sql, [process.env.NODE_ENV, req.query.bpid], function (err, result) {
                res.json(result);
            });
        }
    });
    app.get('/api/bpc/getCountry', function (req, res) {
        if (req.isAuthenticated()) {
            db.query("SELECT `country`,`country_name` FROM `c_country`", function (err, result) {
                res.json(result);
            });
        }
    });
    app.post('/api/bpc/createBP', function (req, res) {
        var sql = "INSERT INTO `md_bupa` SET ?";
        var post = {
            env: process.env.NODE_ENV,
            bpid: req.body.bpid,
            category: req.body.category,
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            ustid: req.body.ustid,
            street: req.body.street,
            city: req.body.city,
            postcode: req.body.postcode,
            country: req.body.country,
            distance: req.body.distance
        };
        if (req.isAuthenticated()) {
            db.query(sql, post, function (err, result) {
                if (err) throw err;
                console.log("Number of records inserted: " + result.affectedRows);
                res.json(result);
            });
        }
    });
    app.post('/api/bpc/postConditions', function (req, res) {
        var bpid = "";

        var postDocs = [];
        var post = [];

        for (var i = 0; i < req.body.length; i++) {
            if (!bpid) {
                bpid = req.body[i].bpid;
            }
            post = [];
            post.push(process.env.NODE_ENV);
            post.push(req.body[i].bpid);
            post.push(req.body[i].service);
            post.push(req.body[i].price);
            post.push(req.body[i].curr);
            post.push(req.body[i].per);
            post.push(req.body[i].unit);
            postDocs.push(post);
        }

        var sqlDelete = "DELETE FROM `md_conditions` WHERE bpid = ?";
        db.query(sqlDelete, [bpid], function (err, result) {
            if (err) throw err;
        });


        var sqlInsert = "INSERT INTO `md_conditions` (env, bpid, service, price, curr, per, unit) VALUES ?";

        if (req.isAuthenticated()) {
            db.query(sqlInsert, [postDocs], function (err, result) {
                if (err) throw err;
                console.log("Number of records inserted: " + result.affectedRows);
                res.json(result);
            });
        }
    });
    app.post('/api/bpc/updateBP', function (req, res) {
        var sql = "UPDATE `md_bupa` SET ? WHERE bpid = ? ";
        var post = {
            env: process.env.NODE_ENV,
            bpid: req.body.bpid,
            category: req.body.category,
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            ustid: req.body.ustid,
            street: req.body.street,
            city: req.body.city,
            postcode: req.body.postcode,
            country: req.body.country,
            distance: req.body.distance
        };
        if (req.isAuthenticated()) {
            db.query(sql, [post, req.body.bpid], function (err, result) {
                if (err) throw err;
                console.log("Number of records updated: " + result.affectedRows);
                res.json(result);
            });
        }
    });
    //************************
    //  Product App
    //************************ 
    app.get('/api/products/getProduct', function (req, res) {
        var ean = "";
        if(req.query.eannr){
            ean = req.query.eannr;
        }
        var sql = "SELECT * FROM `md_products` WHERE eannr = ? AND env = ?" ;
        if (req.isAuthenticated()) {
            db.query(sql, [ean, process.env.NODE_ENV], function (err, result) {
                if (err) throw err;
                res.json(result);
            });
        }
    });

    app.get('/api/products/getProducts', function (req, res) {
        var sql = "SELECT * FROM `md_products` WHERE env = ?" ;
        if (req.isAuthenticated()) {
            db.query(sql, [process.env.NODE_ENV], function (err, result) {
                if (err) throw err;
                res.json(result);
            });
        }

    });
    app.post('/api/products/deleteProduct', function (req, res) {
        if (req.isAuthenticated()) {
            var sql = "DELETE FROM `md_products` WHERE env = ? AND id = ?";
            db.query(sql, [process.env.NODE_ENV, req.body.id], function (err, result) {
                console.log(result);
                res.json(result);
            });
        }
    });
    app.post('/api/products/createProduct', function (req, res) {
        var sql = "INSERT INTO `md_products` SET ?";
        var post = {
            env: process.env.NODE_ENV,
            eannr: req.body.eannr,
            name: req.body.name,
            amazonName: req.body.amazonName,
            amazonPrice: req.body.amazonPrice,
            stock: req.body.stock,
            ekprice: req.body.ekprice,
            text: req.body.text
        };
        if (req.isAuthenticated()) {
            db.query(sql, post, function (err, result) {
                if (err) throw err;
                console.log("Number of records inserted: " + result.affectedRows);
                res.json(result);
            });
        }
    });

    app.post('/api/products/updateProduct', function (req, res) {
        var sql = "UPDATE `md_products` SET ? WHERE id = ? ";
        var post = {
            env: process.env.NODE_ENV,
            eannr: req.body.eannr,
            name: req.body.name,
            amazonName: req.body.amazonName,
            amazonPrice: req.body.amazonPrice,
            stock: req.body.stock,
            ekprice: req.body.ekprice,
            text: req.body.text
        };
        if (req.isAuthenticated()) {
            db.query(sql, [post, req.body.id], function (err, result) {
                if (err) throw err;
                console.log("Number of records updated: " + result.affectedRows);
                res.json(result);
            });
        }
    });



    //************************
    //  Web Scraper
    //************************
    app.get('/api/webscrap/amazon', function (req, res) {
        var ean = "";
        if(req.query.eannr){
            ean = req.query.eannr;
        }
        
        var requetLink = "https://www.amazon.de/s/ref=nb_sb_noss?__mk_de_DE=%C3%85M%C3%85%C5%BD%C3%95%C3%91&url=search-alias%3Daps&field-keywords=" + ean;

        request(requetLink,
            function (err, resp, html) {
                if(err)throw(err);
                if (resp.statusCode == 200) {
                    var $ = cheerio.load(html);
                    var itemTitle = $('.s-access-title');
                    var itemPrice = $('.s-price').first();

                    var amazonProduct = {
                        statusCode : resp.statusCode,
                        name: itemTitle.text(),
                        price : itemPrice.text()
                    };

                    res.send(amazonProduct);
                }else{
                    res.send({ statusCode : resp.statusCode });
                }
            });

    });
};