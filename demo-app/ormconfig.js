module.exports = {
  database: "demo.db",
  type: "sqlite",
  // migrations: ["dist/migrations/*{.ts,.js}"],
  entities: ["dist/**/*.entity{.ts,.js}"],
  // cli: {
  //   migrationsDir: "migrations",
  // },
};
