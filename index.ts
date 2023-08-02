// require('dotenv').config();
import bodyParser from 'body-parser';
// import pgSession from 'connect-pg-simple';
// import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
// import session from 'express-session';
// import { Pool } from 'pg';
import routes from './app/routes';

// Database configuration
import './app/config/db';
import config from './config';

const app = express();
// app.use(cookieParser());

// Connection pool to store session in the database
// const pool = new Pool({
// 	user: config?.databaseUser,
// 	host: config?.databaseHost,
// 	database: config?.databaseName,
// 	password: config?.databasePassword,
// 	port: Number(config?.databasePort),
// });

// Create session client
// const PgSession = pgSession(session);

//  TO ACCESS COOKIE FROM THE FRONTEND  ADD "withCredentials: true" WITH EACH REQUEST
app.use(
	cors({
		origin: config?.reactAppBaseUrl,
		methods: ['POST', 'PUT', 'GET', 'DELETE', 'OPTIONS', 'HEAD'],
		credentials: true,
	})
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create a new session
// app.use(
// 	session({
// 		store: new PgSession({
// 			pool: pool as any, // provide the Prisma instance connection
// 			tableName: 'session', // specify the name of the session table in the database
// 		}),
// 		secret: config?.sessionSecretKey,
// 		resave: false,
// 		saveUninitialized: false,
// 		cookie: {
// 			secure: false,
// 			httpOnly: true,
// 			maxAge: 30 * 24 * 60 * 60 * 1000, // Session expiration time (1 day) - time in milliseconds
// 		},
// 	})
// );

// Import routes
app.use('/', routes);

const PORT = config.port || 8080;

// Server configuration
app.listen(PORT, () => {
	console.log('Server is listening on port ', PORT);
});
