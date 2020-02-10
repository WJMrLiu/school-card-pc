<template>
  <div>
    <h4>商户消费汇总月报</h4>
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
          <el-table-column align="center" prop="compName" label="商户"></el-table-column>
          <el-table-column align="center" prop="merName" label="餐厅名称"></el-table-column>
          <el-table-column align="center" label="机关工作餐次数">
            <el-table-column align="center" prop="jggzcCount1" label="早餐"></el-table-column>
            <el-table-column align="center" prop="jggzcCount2" label="午餐"></el-table-column>
          </el-table-column>
          <el-table-column align="center" label="队干同餐次数">
            <el-table-column align="center" prop="dgtcCount1" label="早餐"></el-table-column>
            <el-table-column align="center" prop="dgtcCount2" label="中晚餐"></el-table-column>
          </el-table-column>

          <el-table-column
            align="center"
            prop="accountType1Amount"
            label="补贴消费金额（元）"
          ></el-table-column>
          <el-table-column
            align="center"
            prop="accountType2Amount"
            label="现金消费金额（元）"
          ></el-table-column>
          <el-table-column
            align="center"
            prop="accountType3Amount"
            label="银行卡消费金额（元）"
          ></el-table-column>
          <el-table-column
            align="center"
            prop="transAmount"
            label="消费总金额（元）"
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
      window.location.href = `${baseUrl}smmu/sysReport/exportInfoByMonthTransDate2?transDate=${this.form.transDate}`;
    },
    getPageList() {
      //     this.handelData.transDate = this.toJavaTime(this.form.transDate);
      this.$refs.form.validate(async valid => {
        if (valid) {
          this.loading = true;
          let result = await request({
            url: "/smmu/sysReport/getInfoByMonthTransDate2",
            method: "post",
            data: this.form,
          });
          try {
            this.loading = false;
            if (result.data.code === "10000") {
              const res = result.data.value;
              let byMonth = this.form.transDate;
              sessionStorage.setItem(byMonth, JSON.stringify(res));
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
      let byMonth = this.form.transDate;
      let sessData = JSON.parse(sessionStorage.getItem(byMonth));
      if (sessData) {
        this.tableDataList = sessData;
      } else {
        this.getPageList();
      }
    },
  },
};
</script>
