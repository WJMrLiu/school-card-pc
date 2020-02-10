import Vue from "vue";
import Router from "vue-router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

Vue.use(Router);

const router = new Router({
  // mode: "history",
  // base: process.env.BASE_URL,
  routes: [
    {
      path: "",
      redirect: "/getMerSummaryByDay",
    },
    {
      path: "/textEyes",
      component: () => import(/* webpackChunkName: "user" */ "./components/page/textEyes.vue"),
    },
    {
      path: "/getMerSummaryByDay",
      component: () =>
        import(/* webpackChunkName: "user" */ "./components/page/getMerSummaryByDay.vue"),
      meta: { title: "商户汇总日报" },
    },
    {
      path: "/getMerSummaryByMonth",
      component: () =>
        import(/* webpackChunkName: "user" */ "./components/page/getMerSummaryByMonth.vue"),
      meta: { title: "商户汇总月报" },
    },
    {
      path: "/getConsumeDetailDaily",
      component: () =>
        import(/* webpackChunkName: "money" */ "./components/page/getConsumeDetailDaily.vue"),
      meta: { title: "校园卡消费明细日报" },
    },
    {
      path: "/getRechargeDetailDaily",
      component: () =>
        import(/* webpackChunkName: "money" */ "./components/page/getRechargeDetailDaily.vue"),
      meta: { title: "充值明细日报" },
    },
    {
      path: "/getBalWithdrawDaily",
      component: () =>
        import(/* webpackChunkName: "money" */ "./components/page/getBalWithdrawDaily.vue"),
      meta: { title: "余额取出明细日报" },
    },
    {
      path: "/getCashByoperid",
      component: () =>
        import(/* webpackChunkName: "school" */ "./components/page/getCashByoperid.vue"),
      meta: { title: "校园卡中心现金轧账交易" },
    },
    {
      path: "/getCampusBalance",
      component: () =>
        import(/* webpackChunkName: "school" */ "./components/page/getCampusBalance.vue"),
      meta: { title: "校园卡余额表" },
    },
    {
      path: "/getTransDetail",
      component: () =>
        import(/* webpackChunkName: "school" */ "./components/page/getTransDetail.vue"),
      meta: { title: "校园卡消费交易明细查询" },
    },
    {
      path: "/getTransDetailChildren",
      component: () =>
        import(/* webpackChunkName: "school" */ "./components/page/getTransDetailChildren.vue"),
      meta: { title: "校园卡" },
    },
    {
      path: "/getCamCardInfo",
      component: () =>
        import(/* webpackChunkName: "schoolInfo" */ "./components/page/getCamCardInfo.vue"),
      meta: { title: "校园卡信息查询" },
    },
    {
      path: "/getCampusGrantResult",
      component: () =>
        import(/* webpackChunkName: "schoolInfo" */ "./components/page/getCampusGrantResult.vue"),
      meta: { title: "校园卡发放结果查询" },
    },
    {
      path: "/uploadExcel",
      component: () => import(/* webpackChunkName: "upload" */ "./components/page/UploadExcel.vue"),
      meta: { title: "上传文件" },
    },
    {
      path: "/getCashOverTransDetail",
      component: () => import(/* webpackChunkName: "upload" */ "./components/page/addPage.vue"),
      meta: { title: "退款" },
    },
    {
      path: "/getCampusStatment",
      component: () => import(/* webpackChunkName: "getCampusStatment" */ "./components/page/getCampusStatment.vue"),
      meta: { title: "校园卡所有帐户月结算表"},
    },
    {
      path: "/getInfoByMonthTransDate2",
      component: () => import(/* webpackChunkName: "getCampusStatment" */ "./components/page/getInfoByMonthTransDate2.vue"),
      meta: { title: "商户消费汇总月报"},
    },
    {
      path: "*",
      name: "404",
      component: () => import(/* webpackChunkName: "exception" */ "@/views/Exception/404"),
    },
  ],
});
router.beforeEach((to, form, next) => {
  if (to.path !== form.path) {
    NProgress.start();
  }
  NProgress.done();
  next();
});
router.afterEach(() => {
  NProgress.done();
});

export default router;
