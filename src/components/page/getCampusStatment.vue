<template>
  <div>
    <h4>校园卡所有帐户月结算表</h4>
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
            type="month"
            placeholder="请选择日期"
            value-format="yyyyMM"
          ></el-date-picker>
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
          <el-table-column align="center" prop="accountName" label="帐户名称"></el-table-column>
          <el-table-column
            align="center"
            prop="lastBalance"
            label="上月余额（元）"
          ></el-table-column>
          <el-table-column
            align="center"
            prop="thisRecharge"
            label="本月充值金额（元）"
          ></el-table-column>
          <el-table-column
            align="center"
            prop="thisReject"
            label="本月退款金额（元）"
          ></el-table-column>
          <el-table-column
            align="center"
            prop="thisPay"
            label="本月消费金额（元）"
          ></el-table-column>
          <el-table-column
            align="center"
            prop="thisYearRecharge"
            label="本年累计充值（元）"
          ></el-table-column>
          <el-table-column
            align="center"
            prop="thisYearReject"
            label="本年累计退款（元）"
          ></el-table-column>
          <el-table-column
            align="center"
            prop="thisYearPay"
            label="本年累计消费（元）"
          ></el-table-column>
          <el-table-column
            align="center"
            prop="thisBalance"
            label="上月余额（元）"
          ></el-table-column>
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

    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    fetchExcel() {
      window.location.href = `${baseUrl}/smmu/sysReport/exportCampusStatment?transDate=${this.form.transDate}`;
    },
    getPageList() {
      //     this.handelData.transDate = this.toJavaTime(this.form.transDate);
      this.$refs.form.validate(async valid => {
        if (valid) {
          this.loading = true;
          let result = await request({
            url: "/smmu/sysReport/getCampusStatment",
            method: "post",
            data: this.form,
          });
          try {
            this.loading = false;
            if (result.data.code === "10000") {
              const res = result.data.value;
              let stateMent = this.form.transDate;
              sessionStorage.setItem(stateMent, JSON.stringify(res));
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
      let stateMent = this.form.transDate;
      let sessData = JSON.parse(sessionStorage.getItem(stateMent));
      if (sessData) {
        this.tableDataList = sessData;
      } else {
        this.getPageList();
      }
    },
  },
};
</script>
