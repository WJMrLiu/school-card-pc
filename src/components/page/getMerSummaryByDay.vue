<template>
  <div>
    <h4>商户汇总日报</h4>
    <el-row type="flex" justify="center">
      <el-form
        :model="form"
        :rules="rules"
        ref="form"
        class="demo-ruleForm"
        label-width="120px"
        :inline="true"
      >
        <el-form-item prop="transDate" label="选择日期" style="padding-right:20px;">
          <el-date-picker
            v-model="form.transDate"
            type="date"
            placeholder="请选择日期"
          ></el-date-picker>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="onSubmit">查询</el-button>
          <el-button type="primary" @click="resetForm('form')">重置</el-button>
        </el-form-item>
      </el-form>
    </el-row>
    <div class="basetable">
      <div class="selectMenu">
        <el-button type="primary" @click="fetchExcel">导出excel</el-button>
      </div>
      <div class="tableMain">
        <el-table
          :data="tableDataList"
          height="450"
          align="center"
          border
          v-loading="loading"
          element-loading-text="拼命加载中"
        >
          <el-table-column align="center" prop="merId" label="商户编号"></el-table-column>
          <el-table-column align="center" prop="merName" label="商户名称"></el-table-column>
          <el-table-column align="center" prop="macId" label="终端编号"></el-table-column>
          <el-table-column align="center" prop="payCount" label="消费次数"></el-table-column>
          <el-table-column align="center" prop="transType" label="交易类型"></el-table-column>
          <el-table-column
            align="center"
            prop="transAmount"
            label="消费总金额（元）"
          ></el-table-column>
          <el-table-column
            align="center"
            prop="accountType1Amount"
            label="补贴账户金额（元）"
          ></el-table-column>
          <el-table-column
            align="center"
            prop="accountType2Amount"
            label="现金账户金额（元）"
          ></el-table-column>
          <el-table-column
            align="center"
            prop="accountType3Amount"
            label="银行卡消费金额（元）"
          ></el-table-column>
          <el-table-column
            align="center"
            prop="accountType4Amount"
            label="指标账户金额（元）"
          ></el-table-column>
          <el-table-column align="center" prop="payTime" label="餐时"></el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import request from "@/utils/request.js";
import { toJavaTime } from "@/utils/util.js";
import { baseUrl } from "@/config/env";
import debounce from "lodash/debounce"; // 函数节流
export default {
  inject: ["app"],
  data() {
    return {
      loading: false, // 默认不显示加载时候的 loading
      tableDataList: [],
      totalElements: 0,
      currentPage: 0,
      size: 10,
      hideSinglePage: true,
      handelData: {}, // 要传到后台的参数
      cache: {},
      form: {
        transDate: new Date(),
      },
      rules: {
        transDate: [{ required: true, message: "请输入日期", trigger: "blur" }],
      },
    };
  },
  mounted() {
    this.getPageList();
  },
  methods: {
    formatPayTime(row) {
      return row.payTime === "null" ? "" : row.payTime;
    },
    tableRowClassName({ row, rowIndex }) {
      if (rowIndex % 2 === 1) {
        return "warning-row";
      } else {
        return "success-row";
      }
      return "";
    },
    formatTransAmount(row) {
      let num, cents;
      num = row.transAmount;
      if (num === null) {
        num = "0";
      }
      if (num.indexOf(".") > 0) {
        cents =
          "." +
          Number(num)
            .toFixed(2)
            .split(".")[1];
      } else {
        cents = ".00";
      }
      num = Math.floor(num);
      num = ("" + num).replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, "$1,");
      return num + cents;
    },
    formatAccountType1Amount(row) {
      let num, cents;
      num = row.accountType1Amount;
      if (num === null) {
        num = "0";
      }
      if (num.indexOf(".") > 0) {
        cents =
          "." +
          Number(num)
            .toFixed(2)
            .split(".")[1];
      } else {
        cents = ".00";
      }
      num = Math.floor(num);
      num = ("" + num).replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, "$1,");
      return num + cents;
    },
    formatAccountType2Amount(row) {
      let num, cents;
      num = row.accountType2Amount;
      if (num === null) {
        num = "0";
      }
      if (num.indexOf(".") > 0) {
        cents =
          "." +
          Number(num)
            .toFixed(2)
            .split(".")[1];
      } else {
        cents = ".00";
      }
      num = Math.floor(num);
      num = ("" + num).replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, "$1,");
      return num + cents;
    },
    formatAccountType3Amount(row) {
      let num, cents;
      if (num === null) {
        num = "0";
      }
      num = row.accountType3Amount;
      if (num.indexOf(".") > 0) {
        cents =
          "." +
          Number(num)
            .toFixed(2)
            .split(".")[1];
      } else {
        cents = ".00";
      }
      num = Math.floor(num);
      num = ("" + num).replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, "$1,");
      return num + cents;
    },
    formatAccountType4Amount(row) {
      let num, cents;
      if (num === null) {
        num = "0";
      }
      num = row.accountType4Amount;
      if (num.indexOf(".") > 0) {
        cents =
          "." +
          Number(num)
            .toFixed(2)
            .split(".")[1];
      } else {
        cents = ".00";
      }
      num = Math.floor(num);
      num = ("" + num).replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, "$1,");
      return num + cents;
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
      this.form.transDate = "";
    },
    fetchExcel() {
      window.location.href = `${baseUrl}/smmu/sysReport/importMerSummaryByDay?transDate=${this.handelData.transDate}`;
    },
    getPageList() {
      this.handelData.transDate = toJavaTime(this.form.transDate); //  打开页面的 默认调取一次接口 参入的是 new Date（当前时间）
      this.$refs.form.validate(valid => {
        if (valid) {
          this.loading = true;
          this.getMerSummaryByDay();
        }
      });
    },

    async getMerSummaryByDay() {
      let result = await request({
        url: `/smmu/sysReport/getMerSummaryByDay`,
        method: "get",
        params: this.handelData,
      });
      this.loading = false; // 关闭 loading 加载提示
      if (result.data.code === "10000") {
        const res = result.data.value;
        let strDate = this.form.transDate;
        sessionStorage.setItem(strDate, JSON.stringify(res));
        this.tableDataList = res;
      } else {
        this.$message({
          type: "error",
          message: result.data.message,
        });
      }
    },
    onSubmit: debounce(function() {
      let strDate = this.form.transDate;
      let sessData = JSON.parse(sessionStorage.getItem(strDate));
      if (sessData) {
        this.tableDataList = sessData;
      } else {
        this.getPageList();
      }
    }, 300),
  },
};
</script>

<style>
.el-table .warning-row {
  background: #f7faff;
}
.el-table .success-row {
  background: #abf1fb;
}
body .el-table th.gutter {
  display: table-cell !important;
}
</style>
