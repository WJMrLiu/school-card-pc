<template>
  <div>
    <h4>校园卡异常消费退款</h4>

    <el-col style="padding-bottom: 20px">
      <el-button
        type="primary"
        @click="onSubmit"
        style="padding: 12px 50px;font-size: 16px;letter-spacing: 5px;"
      >刷新</el-button>
    </el-col>

    <div class="basetable">
      <div class="tableMain">
        <el-table
          :data="tableDataList"
          style="width: 100%;"
          border
          v-loading="loading"
          element-loading-text="拼命加载中"
        >
          <el-table-column align="center" prop="transDate" label="记账日期" :formatter="form_transDate"></el-table-column>
          <el-table-column align="center" prop="transTime" label="记账时间" :formatter="form_transTime"></el-table-column>
          <el-table-column align="center" prop="transType" label="交易类型" :formatter="form_transType"></el-table-column>
          <el-table-column align="center" prop="customId" label="客户姓名"></el-table-column>
          <el-table-column align="center" prop="transAmount" label="实际金额（元）"></el-table-column>
          <el-table-column align="center" prop="orderAmount" label="订单金额（元）"></el-table-column>
          <el-table-column align="center" prop="merid" label="商户名称"></el-table-column>
          <el-table-column
            align="center"
            prop="clientTransDate"
            label="实际发生日期"
            :formatter="form_clientTransDate"
          ></el-table-column>
          <el-table-column
            align="center"
            prop="clientTransTime"
            label="实际发生时间"
            :formatter="form_clientTransTime"
          ></el-table-column>
          <el-table-column align="center" label="操作">
            <template slot-scope="scope">
              <el-button size="mini" @click="handleDetail(scope.row)">退款</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import request from "@/utils/request.js";
export default {
  data() {
    return {
      currentIndex: "",
      loading: false,
      tableDataList: [
        // { transDate: "20200109", serialNo: "101" },
        // { transDate: "20200112", serialNo: "102" },
      ],
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
    };
  },
  created() {
    this.getCashOverTransDetail();
  },

  methods: {
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
    async getCashOverTransDetail() {
      // 获取商户
      try {
        let result = await request({
          url: "/smmu/camCardAdmin/getCashOverTransDetail",
          method: "post",
        });
        this.loading = false;
        if (result.data.code === "10000") {
          this.tableDataList = result.data.value;
          if (this.tableDataList.length === 0) {
            return false;
          }
          for (let index = 0; index < this.tableDataList.length; index++) {
            this.getCustomNameByCustomId(this.tableDataList[index].customId);
            this.getMerid(this.tableDataList[index].merid);
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    handleDetail(row) {
      this.$confirm("是否发起退款请求?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.transDetailRefund(row.serialNo);
        })
        .catch((error) => {
           console.error(error);
        });
    },
    async transDetailRefund(serialNo) {
      // 退款 参数传serialNo 点击之后置灰色
      // 获取商户
      this.loading = true;
      try {
        let result = await request({
          url: "/smmu/camCardAdmin/transDetailRefund",
          method: "get",
          params: { serialNo: serialNo },
        });
        this.loading = false;
        if (result.data.code === "10000") {
          this.getCashOverTransDetail(); // 如果退款成功刷新一下列表
        } else {
          this.checked = false;
          this.$message.error("退款失败");
        }
      } catch (error) {
        console.error(error);
      }
    },
    onSubmit() {
      this.loading = true;
      this.getCashOverTransDetail();
    },
  },
};
</script>

<style>
</style>
