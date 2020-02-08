<template>
  <div>
    <h4>商户汇总月报</h4>
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
          <el-date-picker v-model="form.transDate" type="month" placeholder="请选择日期"></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">查询</el-button>
          <el-button @click="resetForm('form')">重置</el-button>
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
          style="width: 100%;"
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
import { baseUrl } from "@/config/env";
export default {
  data() {
    return {
      loading: false,
      tableDataList: [],
      totalElements: 0,
      currentPage: 0,
      size: 10,
      hideSinglePage: true,
      handelData: {},
      cache: {},
      form: {
        transDate: "",
      },
      rules: {
        transDate: [{ required: true, message: "请输入日期", trigger: "blur" }],
      },
    };
  },
  methods: {
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
    formatPayTime(row) {
      return row.payTime === "null" ? "" : row.payTime;
    },
    toJavaTime(time) {
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
      return `${year}${month}`;
    },
    form_personType(row) {
      if (row.accountType1Amount == 2) {
        row.accountType1Amount = "补贴账户金额";
      } else if (row.accountType1Amount == 3) {
        row.accountType1Amount = "现金账户金额";
      } else if (row.accountType1Amount == 4) {
        row.accountType1Amount = "银行卡消费金额";
      } else if (row.accountType1Amount == 5) {
        row.accountType1Amount = "指标账户金额";
      }
      return row.accountType1Amount;
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    fetchExcel() {
      window.location.href = `${baseUrl}/smmu/sysReport/importMerSummaryByMonth?transDate=${this.handelData.transDate}`;
    },
    getPageList() {
      this.handelData.transDate = this.toJavaTime(this.form.transDate);
      this.$refs.form.validate(async valid => {
        if (valid) {
          this.loading = true;
          let result = await request({
            url: "/smmu/sysReport/getMerSummaryByMonth",
            method: "post",
            data: this.handelData,
          });
          try {
            this.loading = false;
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
          } catch (error) {
            console.error(error);
          }
        }
      });
    },
    onSubmit() {
      let strDate = this.form.transDate;
      let sessData = JSON.parse(sessionStorage.getItem(strDate));
      if (sessData) {
        this.tableDataList = sessData;
      } else {
        this.getPageList();
      }
    },
  },
};
</script>
