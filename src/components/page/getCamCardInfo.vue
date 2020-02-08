<template>
  <div class="block">
    <h4>校园卡信息查询</h4>
    <el-form :model="form" ref="form" :inline="true">
      <el-row type="flex" justify="center">
        <el-col :span="8">
          <el-form-item prop="idType" label="证件类型">
            <el-select v-model="form.idType" placeholder="请选择证件类型">
              <el-option
                v-for="item in cardTypeList"
                :key="item.dictValue"
                :label="item.dictName"
                :value="item.dictValue"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item prop="idNum" label="证件号码">
            <el-input v-model="form.idNum" placeholder="请输入证件号"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item prop="customName" label="姓名">
            <el-input v-model="form.customName" placeholder="请输入姓名"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col>
          <el-form-item prop="icCardId" label="校园卡卡号">
            <el-input v-model="form.icCardId" placeholder="请输入校园卡卡号"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
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
          <el-table-column prop="customName" align="center" label="姓名"></el-table-column>
          <el-table-column
            prop="customType"
            align="center"
            :formatter="form_customType"
            label="客户类型"
          ></el-table-column>
          <el-table-column prop="credType" align="center" label="证件类型"></el-table-column>
          <el-table-column prop="credId" align="center" label="证件号码"></el-table-column>
          <el-table-column prop="icCardId" align="center" label="校园卡卡号"></el-table-column>
          <el-table-column prop="icCardStatus" align="center" label="校园卡状态"></el-table-column>
          <el-table-column
            prop="customStatus"
            align="center"
            :formatter="form_customStatus"
            label="客户状态"
          ></el-table-column>
          <el-table-column align="center" label="操作">
            <template slot-scope="scope">
              <el-button size="mini" @click="handleDetail(scope.$index, scope.row)">查询余额</el-button>
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
    <el-dialog title="账户余额" :visible.sync="dialogTableVisible">
      <el-table :data="detailtable">
        <el-table-column align="center" property="cashAccount" label="现金账户"></el-table-column>
        <el-table-column align="center" property="subsidyAccount" label="补贴账户"></el-table-column>
        <!-- <el-table-column align="center" property="bankCardAccount" label="银行卡账户"></el-table-column> -->
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import request from "@/utils/request.js";
export default {
  data() {
    return {
      loading: false,
      dialogTableVisible: false,
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
        icCardId: "",
        idType: "",
        idNum: "",
        customName: "",
      },
    };
  },
  created() {
    this.idTypeSelect(); // 获取身份证字典
    // this.transTypeSelect(); // 获取消费类型字典
    this.cache = this.cacheDate();
  },
  methods: {
    form_customType(row) {
      if (row.customType === "1") {
        row.customType = "军籍";
      } else if (row.transType === "2") {
        row.customType = "非军籍";
      }
      return row.customType;
    },
    form_customStatus(row) {
      if (row.customStatus === "0") {
        row.customStatus = "正常";
      } else if (row.customStatus === "9") {
        row.customStatus = "注销";
      }
      return row.customStatus;
    },

    handleDetail(index, row) {
      this.getCamCardInfoDetail(row.customId); //校园卡信息查询详情页
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
    async transTypeSelect(icCardStatus) {
      //  获取校园卡卡号
      let result = await request({
        url: "/smmu/sysReport/getSysDictInfo",
        method: "get",
        params: { dictCode: "ic_card_status", dictValue: icCardStatus },
      });
      try {
        if (result.data.code === "10000") {
          this.tableDataList.forEach(element => {
            element.icCardStatus = result.data.value[0].dictDesc;
          });
        }
      } catch (error) {
        console.error(error);
      }
    },
    async getPageList(curPage = 0) {
      this.loading = true;
      this.form.page = curPage || 0;
      this.form.size = this.size;
      let result = await request({
        url: "/smmu/camCardAdmin/getCamCardInfo",
        method: "post",
        data: this.form,
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
          this.getcredType(this.tableDataList[0].credType);
          this.transTypeSelect(this.tableDataList[0].icCardStatus);
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
    async getcredType(credType) {
      // 获取证件类型数据
      let result = await request({
        url: "/smmu/sysReport/getSysDictInfo",
        method: "get",
        params: { dictCode: "icbc_id_type", dictValue: credType },
      });
      try {
        if (result.data.code === "10000") {
          this.tableDataList.forEach(element => {
            element.credType = result.data.value[0].dictName;
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
    async getCamCardInfoDetail(customId) {
      this.dialogTableVisible = true;
      this.detailtable.length = 0;
      let result = await request({
        url: "/smmu/camCardAdmin/getCamCardInfoDetail",
        method: "get",
        params: { customId: customId },
      });
      try {
        if (result.data.code === "10000") {
          this.detailtable.push(result.data.value);
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
    onSubmit() {
      // 查询
      this.getPageList();
    },
  },
};
</script>
<style lang="less" scoped>
h4 {
  top: 10px;
  padding-bottom: 40px;
}
</style>