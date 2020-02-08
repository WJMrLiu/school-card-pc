<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>
<script>
export default {
  provide() {
    return {
      app: this,
    };
  },
  data() {
    return {
      userInfo: "zs",
    };
  },
};
</script>
<style lang="less">
body {
  padding: 50px;
  padding-top: 10px;
  background-color: #dddddd;
  font-family: "Microsoft Yahei", Verdana, Simsun, "Segoe UI Web Light", "Segoe UI Light",
    "Segoe UI Web Regular", "Segoe UI", "Segoe UI Symbol", "Helvetica Neue", Arial;
  .el-table th.gutter {
    display: table-cell !important;
  }
}
.el-table {
  th.gutter,
  colgroup.gutter {
    display: block !important;
    width: 17px !important;
  }
}
.tableMain {
  padding-top: 30px;
  padding-bottom: 20px;
}
.selectMenu {
  text-align: right;
  padding-bottom: 10px;
}
h4 {
  font-size: 20px;
  display: inline-block;
  position: relative;    
  color: #c7000a;
}
</style>
