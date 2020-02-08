import axios from "axios";
import { Message } from "element-ui";
// axios.defaults.withCredentials = true; // 跨域访问需要发送cookie时一定要加
axios.defaults.timeout = 15000;
import { baseUrl } from "@/config/env";
 axios.defaults.baseURL = `${baseUrl}`;
axios.defaults.headers.post["Content-Type"] = "application/json";

axios.interceptors.request.use(
  // 给每个请求添加一个时间戳
  config => {
    if (config.method === "post") {
      config.data = {
        ...config.data,
        _t: Date.parse(new Date()) / 1000,
      };
    } else if (config.method === "get") {
      config.params = {
        ...config.params,
        _t: Date.parse(new Date()) / 1000,
      };
    }
    return config;
  },
  function(error) {
    return Promise.reject(error);
  },
);

function request(options) {
  return axios(options)
    .then(res => {
      return res;
    })
    .catch(error => {
      Message.error("请求失败");
      return Promise.reject(error);
    });
}

export default request;
