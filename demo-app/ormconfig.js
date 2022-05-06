module.exports = {
  database: "postgres",
  host: "localhost",
  password: "psql",
  port: 5432,
  type: "postgres",
  username: "postgres",
  migrations: ["dist/migrations/*{.ts,.js}"],
  entities: ["dist/src/**/*.entity{.ts,.js}"],
  cli: {
    migrationsDir: "migrations",
  },
};
