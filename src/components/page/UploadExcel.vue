<template>
  <div style="text-align:center;">
    <h4>校园卡补贴发放</h4>
    <div style="padding-top:5px;">
      <el-upload
        class="upload-demo"
        drag
        :auto-upload="true"
        :action="baseUrl+'/smmu/camCardAdmin/getCampusSubsidyGrant'"
        :on-success="handleSuccess"
        :on-change="handleChange"
        :file-list="fileList"
        accept=".xls"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">
          将文件拖到此处，或者
          <em>点击上传补贴发放文件</em>
        </div>
        <div class="el-upload__tip" slot="tip">只能上传.xls文件</div>
      </el-upload>
    </div>
    <div style="padding-top:30px;">
      <el-button size="mini" @click="fetchExcel" plain>点击下载模板</el-button>
    </div>
  </div>
</template>

<script>
import { baseUrl } from "@/config/env";
export default {
  data() {
    return {
      baseUrl,
      fileList: [],
    };
  },
  methods: {
    fetchExcel() {
      window.location.href = `${baseUrl}/smmu/camCardAdmin/downCampusSubsidyGrantExcel`;
    },
    handleChange(file, fileList) {
      this.fileList = fileList.slice(-3);
    },
    handleSuccess(res, file, fileList) {
      if (res.code == "10000") {
        this.$message({
          type: "success",
          message: res.message,
        });
      } else {
        this.$message({
          type: "error",
          message: `上传失败, ${res.message}`,
        });
      }
    },
  },
};
</script>
<style lang="less" scoped>
h4 {
  top: 30px;
  padding-bottom: 40px;
}
</style>
