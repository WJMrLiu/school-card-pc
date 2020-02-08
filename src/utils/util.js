export function toJavaTime(time, separator) {
  // separator 不同时间显示的格式
  if (!time) {
    return;
  }
  let year = time.getFullYear();
  let month = time.getMonth() + 1;
  let day = time.getDate();
  if (month < 10) {
    month = "0" + month;
  }
  if (day < 10) {
    day = "0" + day;
  }
  if (!separator) {
    return `${year}${month}${day}`;
  } else {
    return `${year}${separator}${month}${separator}${day}`;
  }
}
