import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

// Env file configuration
function config(Env: any) {
	
	return {
		port: Env?.PORT,
		reactAppBaseUrl: Env?.REACT_APP_BASE_URL,
		databaseHost: Env?.DATABASE_HOST,
		databaseUser: Env?.DATABASE_USER,
		databasePassword: Env?.DATABASE_PASSWORD,
		databaseName: Env?.DATABASE_NAME,
		databasePort: Env?.DATABASE_PORT,
		databaseUrl: Env?.DATABASE_URL,
		accessTokenSecretKey: Env?.ACCESS_TOKEN_SECRET_KEY,
		refreshTokenSecretKey: Env?.REFRESH_TOKEN_SECRET_KEY,
		forgotPasswordTokenSecretKey: Env?.FORGOT_PASSWORD_TOKEN_SECRET_KEY,
		sessionSecretKey: Env?.SESSION_SECRET_KEY,
		smtpEmail: Env?.SMTP_EMAIL,
		smtpEmailLogin: Env?.SMTP_EMAIL_LOGIN,
		smtpPassword: Env?.SMTP_PASSWORD,
	
		
		smtpHost: Env?.SMTP_HOST,
		smtpPort: Env?.SMTP_PORT,
		forgotPasswordUrlExpireTime: 30 * 60 * 1000, // in milliseconds - 30 minutes
		registerUrlExpireTime: 7 * 24 * 60 * 60 * 1000, // in milliseconds - 7 days
		accessTokenExpireTime: 24 * 60 * 60, // in seconds
		refreshTokenExpireTime: 10 * 24 * 60 * 60, // in seconds
		resetPasswordReactUrl: `${Env?.REACT_APP_BASE_URL}/reset-password`,
		changePasswordReactUrl: `${Env?.REACT_APP_BASE_URL}/reset-password`,
		s3accessKeyId: Env?.S3_ACCESSKEYID,
		s3secretAccessKey: Env?.S3_SECRETACCESSKEY,
		s3BaseUrl: Env?.S3_BASE_URL,
	};
}

export default {
	...config(process.env),
};
