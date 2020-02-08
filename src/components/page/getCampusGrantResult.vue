<template>
  <div>
    <h4>校园卡补贴发放结果查询</h4>
    <el-form
      :model="form"
      :rules="rules"
      ref="form"
      :inline="true"
      class="demo-form-inline"
      align="center"
    >
      <el-form-item prop="transDate" label="选择日期" style="padding-right:20px;">
        <el-date-picker
          v-model="form.transDate"
          unlink-panels
          type="daterange"
          range-separator="至"
          start-placeholder="请选择开始日期"
          end-placeholder="请选择结束日期"
        ></el-date-picker>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="onSubmit">查询</el-button>
        <el-button @click="resetForm('form')">重置</el-button>
      </el-form-item>
    </el-form>
    <!-- <el-divider></el-divider> -->
    <div class="basetable" style="padding-top:20px;">
      <div class="tableMain">
        <el-table
          :data="tableDataList"
          style="width: 100%;"
          border
          element-loading-text="拼命加载中"
          v-loading="loading"
        >
          <el-table-column align="center" prop="fileName" label="文件名"></el-table-column>
          <el-table-column
            align="center"
            prop="inputStatus"
            :formatter="form_inputStatus"
            label="导入状态"
          ></el-table-column>
          <el-table-column align="center" prop="inputTime" label="导入时间"></el-table-column>
          <el-table-column align="center" label="操作" header-align="center">
            <template slot-scope="scope">
              <el-button size="mini" @click="handleDetail(scope.$index, scope.row)">点击下载excel文件</el-button>
            </template>
          </el-table-column>
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
import debounce from "lodash/debounce"; // 函数节流
export default {
  data() {
    return {
      loading: false,
      cardTypeList: [],
      tableDataList: [],
      getDetailsList: [],
      detailtable: [],
      totalElements: 0,
      currentPage: 0,
      size: 10,
      hideSinglePage: true,
      toJavaDataList: {},
      cache: {},
      form: {
        transDate: "",
        startDate: "",
        endDate: "",
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
    form_inputStatus(row) {
      if (row.inputStatus === "1") {
        row.inputStatus = "成功";
      } else if (row.inputStatus === "2") {
        row.inputStatus = "失败";
      }
      return row.inputStatus;
    },
    handleDetail(index, row) {
      this.exportInputSubsidyByInputSeq(row.inputSeq); // 点击下载excel
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
      this.form.transDate = "";
    },
    handleCurrentChange(val) {
      this.cache.get(val - 1);
    },
    async idTypeSelect() {
      // 获取证件类型数据
      let result = await request({
        url: "/smmu/sysReport/getSysDictInfo",
        method: "get",
        params: { dictCode: "icbc_id_type", dictValue: "" },
      });
      try {
        if (result.data.code === "10000") {
          this.cardTypeList = result.data.value;
        }
      } catch (error) {
        console.error(error);
      }
    },
    async transTypeSelect() {
      // 获取交易类型数据
      let result = await request({
        url: "/smmu/sysReport/getSysDictInfo",
        method: "get",
        params: { dictCode: "trans_type", dictValue: "" },
      });
      try {
        if (result.data.code === "10000") {
          this.getDetailsList = result.data.value;
        }
      } catch (error) {
        console.error(error);
      }
    },
    async inputStatus(input_status) {
      // 获取交易类型数据
      let result = await request({
        url: "/smmu/sysReport/getSysDictInfo",
        method: "get",
        params: { dictCode: "input_status", dictValue: input_status },
      });
      try {
        if (result.data.code === "10000") {
          this.tableDataList.forEach((element, index) => {
            element.inputStatus = result.data.value[0].dictName;
          });
        }
      } catch (error) {
        console.error(error);
      }
    },
    getPageList(curPage = 0) {
      this.toJavaDataList.startDate = toJavaTime(this.form.transDate[0], "/") || "";
      this.toJavaDataList.endDate = toJavaTime(this.form.transDate[1], "/") || "";
      this.toJavaDataList.page = curPage;
      this.toJavaDataList.size = this.size;

      this.$refs.form.validate(async valid => {
        if (valid) {
          this.loading = true;
          let result = await request({
            url: "/smmu/camCardAdmin/getCampusGrantResult",
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
              // this.getCustomNameByCustomId(this.tableDataList[0].customId);
              // this.getMerid(this.tableDataList[0].merid);
              // this.inputStatus(this.tableDataList[0].inputStatus);
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
    async getCustomNameByCustomId(customId) {
      //获取客户姓名
      let result = await request({
        url: "/smmu/sysReport/getCustomNameByCustomId",
        method: "get",
        params: { customId: customId },
      });
      try {
        if (result.data.code === "10000") {
          this.tableDataList.forEach(element => {
            element.customId = result.data.value;
          });
        }
      } catch (error) {
        console.error(error);
      }
    },
    async getMerid(merid) {
      //根据mer_id获取mer_name
      let result = await request({
        url: "/smmu/sysReport/getMerNameByMerId",
        method: "get",
        params: { merId: merid },
      });
      try {
        if (result.data.code === "10000") {
          this.tableDataList.forEach(element => {
            element.merid = result.data.value;
          });
        }
      } catch (error) {
        console.error(error);
      }
    },
    async exportInputSubsidyByInputSeq(inputSeq) {
      window.location.href = `${baseUrl}/smmu/camCardAdmin/exportInputSubsidyByInputSeq?inputSeq=${inputSeq}`;
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
    onSubmit: debounce(function() {
      this.getPageList();
    }, 300),
  },
};
</script>
