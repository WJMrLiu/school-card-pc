<template>
  <div>
    <h4>商户消费明细日报</h4>
    <el-row type="flex" justify="center">
      <el-form :model="form" ref="form" :rules="rules" :inline="true" class="demo-form-inline">
        <el-form-item prop="transDate" label="选择日期" style="padding-right:20px;">
          <el-date-picker v-model="form.transDate" type="date" placeholder="请选择日期"></el-date-picker>
        </el-form-item>
        <el-form-item label="商户" prop="getDetailsListValue" style="padding-right:40px;">
          <el-select v-model="form.getDetailsListValue" placeholder="请选择">
            <el-option
              v-for="item in getDetailsList"
              :key="item.merId"
              :label="item.merName"
              :value="item.merId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">查询</el-button>
          <el-button @click="resetForm('form')">重置</el-button>
        </el-form-item>
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
          <el-table-column align="center" prop="merId" label="商户编号"></el-table-column>
          <el-table-column align="center" prop="merName" label="商户名称"></el-table-column>
          <el-table-column align="center" prop="payType" label="消费类型"></el-table-column>
          <el-table-column align="center" prop="transAmount" label="消费总金额"></el-table-column>
          <el-table-column align="center" prop="accountType1Amount" label="补贴账户金额"></el-table-column>
          <el-table-column align="center" prop="accountType2Amount" label="现金账户金额"></el-table-column>
          <el-table-column align="center" prop="accountType3Amount" label="银行卡消费金额"></el-table-column>
          <el-table-column align="center" prop="accountType4Amount" label="指标账户金额"></el-table-column>
          <el-table-column align="center" prop="icCardId" label="校园卡卡号"></el-table-column>
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
      getDetailsList: [],
      totalElements: 0,
      currentPage: 0,
      size: 10,
      hideSinglePage: true,
      toJavaDataList: {},
      cache: {},
      form: {
        transDate: "",
        getDetailsListValue: "",
      },
      rules: {
        transDate: [{ required: true, message: "请输入日期", trigger: "blur" }],
      },
    };
  },
  created() {
    this.getMerchantDetails();
    this.cache = this.cacheDate();
  },
  methods: {
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
      window.location.href = `${baseUrl}/smmu/sysReport/importConsumeDetailDaily?transDate=${this.toJavaDataList.transDate}&merId=${this.toJavaDataList.merId}`;
    },
    handleCurrentChange(val) {
      this.cache.get(val - 1);
    },
    async getMerchantDetails() {
      // 获取商户
      let result = await request({
        url: "/smmu/sysReport/getMerchantDetails",
        method: "post",
      });
      try {
        if (result.data.code === "10000") {
          this.getDetailsList = result.data.value;
        }
      } catch (error) {
        console.error(error);
      }
    },
    getPageList(curPage = 0) {
      this.toJavaDataList.transDate = toJavaTime(this.form.transDate);
      this.toJavaDataList.page = curPage;
      this.toJavaDataList.size = this.size;
      this.toJavaDataList.merId = this.form.getDetailsListValue;

      this.$refs.form.validate(async valid => {
        if (valid) {
          this.loading = true;
          let result = await request({
            url: "/smmu/sysReport/getConsumeDetailDaily",
            method: "post",
            data: this.toJavaDataList,
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

<style lang="less">
.dashboard {
  .el-form-item__content {
    position: static !important;
  }
  .el-icon-arrow-up {
    transform: rotateZ(180deg);
  }
}
</style>
