module.exports = {
    'connection' :{
        'host': process.env.DB_AUTH_HOST,
        'user': process.env.DB_AUTH_USER,
        'password': process.env.DB_AUTH_PASSWORD
    },
    'database': process.env.DB_AUTH_NAME,
    'user_table': 'users' 
};