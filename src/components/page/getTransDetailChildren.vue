<template>
  <div>
    <el-form :model="form" ref="form" :label-width="formLableWidth">
      <el-row>
        <el-col :span="12">
          <el-form-item prop="customName" label="姓名">
            <el-input v-model="form.customName" placeholder="请输入姓名"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="idType" label="证件类型">
            <el-select v-model="form.idType" placeholder="请选择证件类型" style="display:block;">
              <el-option
                v-for="item in cardTypeList"
                :key="item.dictValue"
                :label="item.dictName"
                :value="item.dictValue"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item prop="idNum" label="证件号码">
            <el-input v-model="form.idNum" placeholder="请输入证件号"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row style="top: 10px">
        <el-col align="center">
          <el-form-item>
            <el-button type="primary" @click="onSubmit">查询</el-button>
            <el-button @click="resetForm('form')">重置</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div class="basetable">
      <div class="tableMain">
        <el-table
          :data="tableDataList"
          style="width: 100%;"
          border
          v-loading="loading"
          element-loading-text="拼命加载中"
        >
          <el-table-column align="center" prop="customName" label="客户姓名"></el-table-column>
          <el-table-column align="center" prop="credType" :formatter="form_credType" label="证件类型"></el-table-column>
          <el-table-column align="center" prop="credId" label="证件号码"></el-table-column>

          <el-table-column align="center" label="操作">
            <template slot-scope="scope">
              <el-button size="mini" @click="handleDetail(scope.$index, scope.row)">选择</el-button>
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
import debounce from "lodash/debounce"; // 函数节流
export default {
  data() {
    return {
      loading: false,
      cardTypeList: [],
      tableDataList: [],
      totalElements: 0,
      currentPage: 0,
      size: 10,
      hideSinglePage: true,
      toJavaDataList: {},
      cache: {},
      form: {
        idType: "",
        idNum: "",
        customName: "",
      },
      formLableWidth: "120px",
    };
  },
  created() {
    this.idTypeSelect(); // 获取身份证字典
    this.cache = this.cacheDate();
  },
  methods: {
    form_credType(row) {
      if (row.credType === "0") {
        row.credType = "身份证";
      } else if (row.credType === "1") {
        row.credType = "护照";
      }
      return row.credType;
    },
    handleDetail(index, row) {
      this.$emit("showCustomName", row);
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
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
    async getPageList(curPage = 0) {
      this.toJavaDataList.page = curPage;
      this.toJavaDataList.size = this.size;
      this.loading = true;
      let result = await request({
        url: "/smmu/camCardAdmin/getCampusCustomInfo",
        method: "post",
        data: { ...this.toJavaDataList, ...this.form },
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
          if (this.tableDataList.length === 0) {
            return false;
          }
        } else {
          this.$message({
            type: "error",
            message: result.data.message,
          });
        }
      } catch (error) {
        console.error(error);
      }
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