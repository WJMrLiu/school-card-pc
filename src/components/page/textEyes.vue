<template>
  <div>
    <el-form ref="form" label-width="120px">
      <el-form-item>
        <el-button type="primary" @click="onSubmit">查询</el-button>
        <el-button type="primary" @click="sonPageClick">重置</el-button>
        <el-button type="primary" @click="getData">获取data的值</el-button>
        <el-input v-model="input"></el-input>
      </el-form-item>
      <!-- <iframe
        ref="iframe"
        id="iframe"
        class="abow_dialog"
        frameborder="0"
        src="`http://localhost:8080/#/home"
      ></iframe> -->
      <el-dialog
        :visible.sync="dialogRegisterVisible"
        custom-class="customClass"
        :close-on-click-modal="true"
        @close="kcDialog=false"
      >
        <iframe
          ref="iframe"
          id="iframe"
          class="abow_dialog"
          frameborder="0"
          src="`http://localhost:8080/#/home?userId=10001&channel=SH001&time=${new Date().getTime()}`"
          height="700"
          width="1000"
        ></iframe>
        <!-- <iframe
          ref="iframe"
          id="iframe"
          class="abow_dialog"
          frameborder="0"
          src="http://107.22.205.77:28003/#/home?userId=10001&channel=SH004&time=`${new Date().getTime()}`"
          height="700"
          width="1000"
        ></iframe>-->
        <!-- <iframe
          ref="iframe"
          id="iframe"
          class="abow_dialog"
          frameborder="0"
          src="http://107.6.141.229:28003/iris/index.html#/index?userId=10001&channel=SH004&time=`${new Date().getTime()}`"
          height="700"
          width="1000"
        ></iframe>-->
      </el-dialog>
      <p ref="pMessage" id="pMessage">我是父页页面的信息</p>
    </el-form>
  </div>
</template>
<script>
</script>
<script>
export default {
  data() {
    return {
      dialogRegisterVisible: false, // 弹窗默认关闭
      input: "",
      eyeData: ""
      // iframe: "",
      // iframeWindow: ""
    };
  },
  watch: {
    message: {
      handler(newVal, oldVal) {
        console.log(newVal, oldVal);
      },
      deep: true
    }
  },
  created() {
    window.addEventListener("message", this.iframeEvent, false);
    // window.addEventListener(
    //   "message",
    //   function(e) {
    //     if (e.data.type === "webpackWarnings" || e.data.type === "webpackOk") {
    //       return false;
    //     }
    //     // console.log(e.data);
    //     this.eyeData = e.data;
    //     console.log(e, "e.data");
    //     // // if (e.origin.includes("http://localhost:8080")) {
    //     // //   e.source.postMessage("收到了子页面的信息");
    //     // //   console.log(e.source.postMessage);
    //     // // }
    //     // document.getElementById("pMessage").innerHTML = e.data;
    //     // alert(JSON.stringify(e));
    //     // fsdfsdjfhskjfklhvjkldfjgklsdfsdf
    //     // console.log("dsfsdf" + e); // [objetc, Object]
    //   },
    //   false
    // );
  },
  mounted() {
    // this.iframe = this.$refs.iframe;
    // this.iframeWindow = this.iframe.contentWindow;
    // console.log(window.location.href, " window.location.href父页面");
    // console.log(this.eyeData, " this.eyeData");
  },

  methods: {
    getData() {
      console.log(this.eyeData, "this.eyeData");
    },
    iframeEvent(e) {
      console.log(e.data, "e");
      if (e.data.type === "webpackWarnings" || e.data.type === "webpackOk") {
        return false;
      }
      this.eyeData = e.data;
    },
    openUrl() {
      window.open(
        "http://107.6.141.229:28003/iris/index.html#/index?userId=10001&channel=SH004",
        "",
        "location=no,width=1200,height=800,resizable=yes,toolbar=no,scrollbars=yes"
      );
    },
    sonPageClick: function(params) {
      console.log(params, "params");
    },
    async onSubmit() {
      this.dialogRegisterVisible = true;
      // this.openUrl();
    }
  }
};
</script>
<style lang="less">
.abow_dialog {
  position: absolute;
  top: -250px;
  display: flex;
  justify-content: center;
  align-items: Center;
  overflow: hidden;
  .el-dialog {
    width: 60% !important;
    margin: 0 auto !important;
    // height: 80%;
    // width: 80% !important;
    overflow: hidden;
    .el-dialog__body {
      position: absolute;
      left: 0;
      // top: 54px;
      bottom: 0;
      right: 0;
      padding: 0;
      z-index: 1;
      overflow: hidden;
      overflow-y: auto;
    }
  }
}
.customClass {
  position: relative;
  width: 80%;
  height: 60%;
}
</style>
