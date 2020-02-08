<template>
  <div>
    <h4>校园卡余额表</h4>
    <el-row type="flex" justify="center">
      <el-form :model="form" :rules="rules" ref="form" class="demo-ruleForm" label-width="120px">
        <el-col :span="10">
          <el-form-item prop="transDate" label="选择日期">
            <el-date-picker v-model="form.transDate" type="date" placeholder="请选择日期"></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="14">
          <el-form-item>
            <el-button type="primary" @click="onSubmit">查询</el-button>
            <el-button @click="resetForm('form')">重置</el-button>
          </el-form-item>
        </el-col>
      </el-form>
    </el-row>
    <!-- <el-divider></el-divider> -->
    <div class="basetable">
      <div class="selectMenu">
        <el-button type="primary" @click="fetchExcel">导出excel</el-button>
      </div>
      <div class="tableMain">
        <el-table
          :data="tableDataList"
          style="width: 100%;"
          border
          v-loading="loading"
          element-loading-text="拼命加载中"
        >
          <el-table-column align="center" prop="customName" label="客户姓名"></el-table-column>
          <el-table-column align="center" prop="credId" label="证件号"></el-table-column>
          <el-table-column align="center" prop="credType" :formatter="cred_type" label="证件类型"></el-table-column>
          <el-table-column align="center" prop="icCardId" label="校园卡卡号"></el-table-column>
          <el-table-column align="center" prop="accountType1Balance" label="补贴账户余额"></el-table-column>
          <el-table-column align="center" prop="accountType2Balance" label="现金账户余额"></el-table-column>
        </el-table>
      </div>
      <div class="page">
        <el-pagination
          background
          :hide-on-single-page="hideSinglePage"
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage"
          layout="total, prev, pager, next, jumper"
          :page-size="size"
          :total="totalElements"
        ></el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import request from "@/utils/request.js";
import { toJavaTime } from "@/utils/util.js";
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
  created() {
    this.cache = this.cacheDate();
  },
  methods: {
    cred_type(row) {
      if (row.credType === "0") {
        row.credType = "身份证";
      }
      return row.credType;
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    fetchExcel() {
      window.location.href = `${baseUrl}/smmu/sysReport/importCampusBalance?transDate=${this.handelData.transDate}`;
    },
    handleCurrentChange(val) {
      this.cache.get(val - 1);
    },
    getPageList(curPage = 0) {
      this.handelData.transDate = toJavaTime(this.form.transDate);
      this.handelData.page = curPage;
      this.handelData.size = this.size;
      this.$refs.form.validate(async valid => {
        if (valid) {
          this.loading = true;
          let result = await request({
            url: "/smmu/sysReport/getCampusBalance",
            method: "post",
            data: this.handelData,
          });
          try {
            this.loading = false;
            if (result.data.code === "10000") {
              const res = result.data.value;
              const totalPages = res.totalPages;
              if (totalPages == 1 || totalPages == 0) {
                // 当只有一页的时候隐藏分页
                this.hideSinglePage = true;
              } else {
                this.hideSinglePage = false;
              }
              this.totalElements = res.totalElements;
              this.cache.set(curPage, res.content);
              this.tableDataList = res.content;
            } else {
              this.$message({
                type: "error",
                message: result.data.message,
              });
            }
          } catch (error) {
            console.error(error);
          }
        } else {
          return false;
        }
      });
    },
    cacheDate() {
      // 开启一个缓存池子
      let cache = {};
      let that = this;
      return {
        set: function(page, doc) {
          cache[page] = doc;
        },
        get: function(page) {
          if (page in cache) {
            that.tableDataList = cache[page];
          } else {
            that.getPageList(page);
          }
        },
      };
    },
    onSubmit() {
      this.getPageList();
    },
  },
};
</script>