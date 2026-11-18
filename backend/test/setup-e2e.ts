// Variables de entorno para las pruebas e2e. Se cargan ANTES de importar
// AppModule (ConfigModule valida el entorno al importarse).
Object.assign(process.env, {
  NODE_ENV: 'test',
  LOG_LEVEL: 'fatal',
  SUPABASE_URL: 'https://prueba.supabase.co',
  SUPABASE_KEY: 'sb_publishable_prueba_1234567890',
  SUPABASE_JWT_SECRET: 'secreto-de-prueba-de-al-menos-32-caracteres!!',
  SWAGGER_ENABLED: 'true',
  CORS_ORIGINS: 'http://localhost:4200',
});
