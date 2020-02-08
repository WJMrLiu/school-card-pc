<template>
  <exception :model="model"></exception>
</template>

<script>
import Exception from "./Exception";
export default {
  components: {
    Exception,
  },
  data() {
    return {
      model: {
        src: require("@/assets/img/404.svg"),
        title: "404",
        desc: "抱歉，你访问的页面不存在",
      },
    };
  },
};
</script>
