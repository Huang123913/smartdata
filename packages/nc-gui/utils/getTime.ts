/**
 * 格式化日期对象(日期时间)
 */
const getNowDate = () => {
  let date = new Date()
  let sign2 = ':'
  // let year: any = date.getFullYear(); // 年
  // let month: any = date.getMonth() + 1; // 月
  // let day: any = date.getDate(); // 日
  let hour: any = date.getHours() // 时
  let minutes: any = date.getMinutes() // 分
  let seconds: any = date.getSeconds() //秒
  // var weekArr = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期天'];
  // var week = weekArr[date.getDay()];
  // 给一位数的数据前面加 “0”
  // if (month >= 1 && month <= 9) {
  //   month = "0" + month;
  // }
  // if (day >= 0 && day <= 9) {
  //   day = "0" + day;
  // }
  if (hour >= 0 && hour <= 9) {
    hour = '0' + hour
  }
  if (minutes >= 0 && minutes <= 9) {
    minutes = '0' + minutes
  }
  if (seconds >= 0 && seconds <= 9) {
    seconds = '0' + seconds
  }
  // return year + "-" + month + "-" + day + " " + hour + sign2 + minutes + sign2 + seconds;
  return hour + sign2 + minutes + sign2 + seconds
}

export { getNowDate }
