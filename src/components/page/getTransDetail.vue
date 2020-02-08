<template>
  <div>
    <h4>校园卡消费交易明细查询</h4>
    <el-form :model="form" :rules="rules" ref="form" label-width="120px">
      <el-row type="flex" justify="justify">
        <el-col :span="12">
          <el-form-item label="交易类型" prop="transType">
            <el-select v-model="form.transType" placeholder="请选择交易类型" style="display:block;">
              <el-option
                v-for="item in getDetailsList"
                :key="item.dictValue"
                :label="item.dictDesc"
                :value="item.dictValue"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item prop="customName" label="姓名">
            <el-input v-model="form.customName" :disabled="true"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label-width="20px">
            <el-button type="primary" @click="dialogSearch = true">选择</el-button>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6">
          <el-form-item align="center" prop="transDate" label="选择日期">
            <el-date-picker
              v-model="form.transDate"
              unlink-panels
              type="daterange"
              range-separator="至"
              start-placeholder="记账开始日期"
              end-placeholder="记账结束日期"
            ></el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row style="top: 20px">
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
          <el-table-column align="center" prop="transDate" :formatter="form_transDate" label="记账日期"></el-table-column>
          <el-table-column align="center" prop="transTime" :formatter="form_transTime" label="记账时间"></el-table-column>
          <el-table-column align="center" prop="transType" :formatter="form_transType" label="交易类型"></el-table-column>
          <el-table-column align="center" prop="customId" label="客户姓名"></el-table-column>
          <el-table-column align="center" prop="transAmount" label="实际金额（元）"></el-table-column>
          <el-table-column align="center" prop="orderAmount" label="订单金额（元）"></el-table-column>
          <el-table-column align="center" prop="merid" label="商户名称"></el-table-column>
          <el-table-column
            align="center"
            prop="clientTransDate"
            :formatter="form_clientTransDate"
            label="实际发生日期"
          ></el-table-column>
          <el-table-column
            align="center"
            prop="clientTransTime"
            :formatter="form_clientTransTime"
            label="实际发生时间"
          ></el-table-column>
          <el-table-column align="center" label="操作">
            <template slot-scope="scope">
              <el-button size="mini" @click="handleDetail(scope.$index, scope.row)">查询分账户金额</el-button>
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
    <el-dialog title="账户金额（元）" :visible.sync="dialogTableVisible">
      <el-table :data="detailtable">
        <el-table-column align="center" prop="transAmount" label="总额"></el-table-column>
        <el-table-column align="center" prop="cashAccount" label="现金账户"></el-table-column>
        <el-table-column align="center" prop="subsidyAccount" label="补贴账户"></el-table-column>
        <el-table-column align="center" prop="bankCardAccount" label="银行卡账户"></el-table-column>
      </el-table>
    </el-dialog>
    <div class="dialogSearchCustomer">
      <el-dialog :visible.sync="dialogSearch">
        <getTransDetailChildren @showCustomName="showCustomName"></getTransDetailChildren>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import request from "@/utils/request.js";
import { toJavaTime } from "@/utils/util.js";
import debounce from "lodash/debounce"; // 函数节流
import getTransDetailChildren from "@/components/page/getTransDetailChildren.vue";
export default {
  components: {
    getTransDetailChildren,
  },
  data() {
    return {
      loading: false,
      dialogTableVisible: false,
      dialogSearch: false,
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
        transType: "",
        idType: "",
        idNum: "",
        customName: "",
        startDate: "",
        endDate: "",
        customId: "",
      },
      rules: {
        transDate: [{ required: true, message: "请输入记账日期", trigger: "blur" }],
      },
    };
  },
  created() {
    this.transTypeSelect(); // 获取消费类型字典
    this.cache = this.cacheDate();
  },
  methods: {
    showCustomName(rowCustomName) {
      if (rowCustomName) {
        this.dialogSearch = false;
        this.form.customName = rowCustomName.customName;
        this.form.customId = rowCustomName.customId;
      }
    },
    form_transType(row) {
      if (row.transType === "01") {
        row.transType = "充值";
      } else if (row.transType === "02") {
        row.transType = "消费";
      } else if (row.transType === "03") {
        row.transType = "补贴发放";
      } else if (row.transType === "04") {
        row.transType = "销户";
      } else if (row.transType === "05") {
        row.transType = "退货";
      } else if (row.transType === "06") {
        row.transType = "批量扣款";
      }
      return row.transType;
    },
    handleDetail(index, row) {
      this.getAccountAmountDetail(row);
    },
    form_transDate(row) {
      if (!row.transDate) {
        return;
      }
      let arr = [];
      let str1 = row.transDate.substr(0, 4);
      let str2 = row.transDate.substr(4, 2);
      let str3 = row.transDate.substr(6);
      arr.push(str1, str2, str3);
      return arr.join("-");
    },
    form_clientTransDate(row) {
      if (!row.clientTransDate) {
        return;
      }
      let arr = [];
      let str1 = row.clientTransDate.substr(0, 4);
      let str2 = row.clientTransDate.substr(4, 2);
      let str3 = row.clientTransDate.substr(6);
      arr.push(str1, str2, str3);
      return arr.join("-");
    },
    form_transTime(row) {
      if (!row.transTime) {
        return;
      }
      let arr = [];
      let str1 = row.transTime.substr(0, 2);
      let str2 = row.transTime.substr(2, 2);
      let str3 = row.transTime.substr(4);
      arr.push(str1, str2, str3);
      return arr.join(":");
    },
    form_clientTransTime(row) {
      if (!row.clientTransTime) {
        return;
      }
      let arr = [];
      let str1 = row.clientTransTime.substr(0, 2);
      let str2 = row.clientTransTime.substr(2, 2);
      let str3 = row.clientTransTime.substr(4);
      arr.push(str1, str2, str3);
      return arr.join(":");
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
      this.form.transDate = "";
    },
    handleCurrentChange(val) {
      this.cache.get(val - 1);
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
    getPageList(curPage = 0) {
      this.toJavaDataList.startDate = toJavaTime(this.form.transDate[0]) || "";
      this.toJavaDataList.endDate = toJavaTime(this.form.transDate[1]) || "";
      this.toJavaDataList.page = curPage;
      this.toJavaDataList.size = this.size;
      this.toJavaDataList.transType = this.form.transType;
      this.toJavaDataList.customId = this.form.customId;

      this.$refs.form.validate(async valid => {
        if (valid) {
          this.loading = true;
          let result = await request({
            url: "/smmu/camCardAdmin/getTransDetail",
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
              if (this.tableDataList.length === 0) {
                return false;
              }
              for (let index = 0; index < this.tableDataList.length; index++) {
                this.getCustomNameByCustomId(this.tableDataList[index].customId);
                this.getMerid(this.tableDataList[index].merid);
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
            if (element.customId === customId) {
              element.customId = result.data.value;
            }
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
            if (element.merid === merid) {
              element.merid = result.data.value;
            }
          });
        }
      } catch (error) {
        console.error(error);
      }
    },
    async getAccountAmountDetail(row) {
      this.dialogTableVisible = true;
      this.detailtable.length = 0;
      let result = await request({
        url: "/smmu/camCardAdmin/getAccountAmount",
        method: "get",
        params: { serialNo: row.serialNo },
      });
      try {
        if (result.data.code === "10000") {
          let resList = result.data.value;
          resList.transAmount = row.transAmount;
          this.detailtable.push(resList);
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
<style lang="less">
h4 {
  top: 10px;
  // left: 50px;
  padding-bottom: 40px;
}
.dialogSearchCustomer .el-dialog {
  width: 80% !important;
}
.tableMain {
  padding-top: 50px;
}
</style>