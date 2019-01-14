module.exports = function(app, passport){
    var db = require('../config/b-db');

    app.get('/api/test',function(req, res){
        // res.render('index.ejs');
        console.log(req.isAuthenticated());
        res.send("TEST");
    });

    app.get('/api/trip/getLastTrip',function(req,res){
        if(req.isAuthenticated()){
            db.query('SELECT * FROM td_car_logbook ORDER BY km_end DESC LIMIT 1', function(err,result){
                console.log(result);
                res.json(result);
            });
        }
    });
    app.get('/api/trip/getReasons',function(req,res){
        if(req.isAuthenticated()){
            db.query('SELECT * FROM c_tr_reason ORDER BY reason', function(err,result){
                res.json(result);
            });
        }
    });
    app.get('/api/trip/getBP',function(req,res){
        if(req.isAuthenticated()){
            db.query('SELECT * FROM md_bupa ORDER BY bpid', function(err,result){
                res.json(result);
            });
        }
    });
    app.post('/api/trip/postTrip',function(req,res){

    var sql = "INSERT INTO `td_car_logbook` SET ?";
        
        var post = {
             start_date: req.body.start_date,
             end_date: req.body.end_date, 
             km_traveled: req.body.km_traveled,
             km_end: req.body.km_end,
             reason: req.body.reason, 
             bpid: req.body.bpid, 
             start_time: req.body.start_time,
             end_time: req.body.end_time,
             text: req.body.text
        };

        if(req.isAuthenticated()){
             db.query(sql, post, function(err,result){
                if (err) throw err;
                console.log("Number of records inserted: " + result.affectedRows);
                res.json(result);
            }); 

        }
    });
}