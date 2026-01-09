import pkg from "pg";
export const db = new pkg.Pool({
  host: "postgis",
  user: "dispatch",
  password: "dispatch",
  database: "dispatch"
});
