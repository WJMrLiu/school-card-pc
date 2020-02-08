let baseUrl = "";

if (process.env.NODE_ENV === "development") {
  baseUrl = "/api";
}
// else if (process.env.VUE_APP_FLAG === "buildtest") {
//   baseUrl = "http://107.6.141.242:29818";
// } else if (process.env.VUE_APP_FLAG === "prod") {
//   // baseUrl = "http://107.2.2.82:29818";
//   baseUrl = "http://200.202.243.12:29818";
// }

export { baseUrl };
