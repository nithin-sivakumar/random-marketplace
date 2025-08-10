import "dotenv/config";

const variables = {
  PORT: process.env.PORT,
  DB_URL: process.env.DB_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY,
  ENVIRONMENT: process.env.ENVIRONMENT,
  MAX_LOGIN_ATTEMPTS: process.env.MAX_LOGIN_ATTEMPTS,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  AUTO_POST_FREQUENCY: process.env.AUTO_POST_FREQUENCY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  AUTO_POST: process.env.AUTO_POST,
  SERVER_URL: process.env.SERVER_URL,
};

for (let v in variables) {
  if (!variables[v]) {
    console.log(
      `Missing key: ${v} in .env file. Kindly restart the server after adding it.`
    );
    process.exit(1);
  }
}

export default variables;
