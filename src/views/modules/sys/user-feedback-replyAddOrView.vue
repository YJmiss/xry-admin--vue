<template>
  <el-dialog :visible.sync="visible" :close-on-click-modal="false">
    <p style="font-size:15px;font-weight:550;">反馈信息:</p>
    <div class="feedbackDetail">
      <p class="feedbackDetail-text">{{feedback_info}}</p>
      <div class="feedbackImg" v-show="feedbackImg" v-for="(items,index) in feedbackImg">
        <img :src="items" :key="index">
      </div>
    </div>
    <el-form :inline="true" :model="dataForm" ref="dataForm" :rules="dataRule">
      <el-form-item label="在这里填写回复内容:" style="padding-top:20px;font:16px bold;">
        <editor :uploadUrl="uploadUrl" v-model="dataForm.reply_info" class="editorStyle"></editor>
      </el-form-item>
    </el-form>
    <el-input v-model="dataForm.id" v-show="false"></el-input>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="replySubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { treeDataTranslate } from "@/utils";
import Editor from "@/components/quill-editor.vue";
export default {
  components: {
    Editor
  },
  data() {
    return {
      visible: false,
      feedback_info: "",
      feedbackImg: [],
      dataForm: {
        id: "",
        reply_info: ""
      },
      dataRule: {
        reply_info: [
          {
            required: true,
            message: "请填写回复具体信息",
            trigger: "blur"
          }
        ]
      },
      uploadUrl: this.$http.adornUrl(
        `/sys/oss/uploadImg?token=${this.$cookie.get("token")}`
      )
    };
  },
  methods: {
    //根据id获取数据
    init(id) {
      this.dataForm.id = id || 0;
      this.visible = true;
      if (this.dataForm.id) {
        this.$nextTick(() => {
          this.$refs["dataForm"].resetFields();
          this.$http({
            url: this.$http.adornUrl(`/xry/feedback/detail`),
            method: "get",
            params: this.$http.adornParams({
              id: id
            })
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.dataForm.id = data.userFeedback.id;
              this.feedback_info = data.userFeedback.feedback_info;
              this.dataForm.reply_info = data.userFeedback.reply_info;
              this.feedbackImg = data.userFeedback.feedbackImgArray;
            }
          });
        });
      } else {
        this.dataForm.reply_info = "";
      }
    },
    replySubmit() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          this.$http({
            url: this.$http.adornUrl(`/xry/feedback/replySave`),
            method: "post",
            data: this.$http.adornData({
              id: this.dataForm.id || undefined,
              replyInfo: this.dataForm.reply_info
            })
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.$message({
                message: "操作成功",
                type: "success",
                duration: 1500,
                onClose: () => {
                  this.visible = false;
                  this.$emit("refreshDataList");
                }
              });
            } else {
              this.$message.error(data.msg);
            }
          });
        }
      });
    }
  }
};
</script>

<style scoped>
.el-form-item {
  margin-right: 30px;
}

.editorStyle {
  min-height: 450px;
}

p {
  font: 16px 微软雅黑;
  color: #333;
}

p span {
  color: beige;
}

.editorStyle {
  min-height: 450px;
}
.feedbackDetail {
  /* border: solid 1px #ff0000; */
  height: auto;
  display: inline-flex;
  justify-content: flex-start;
  flex-direction: column;
  width: 99%;
  margin-bottom: 20px;
  padding: 6px 10px;
}
.feedbackDetail .feedbackDetail-text {
  font-size: 14px;
  color: #666;
  margin: 0px;
  line-height: 1.8;
  letter-spacing: 1.2px;
}
.feedbackDetail .feedbackImg {
  display: inline-flex;
  justify-content: flex-start;
  flex-direction: row;
  width: 100%;
  margin-top: 20px;
}
.feedbackDetail .feedbackImg img {
  display: inline-block;
  max-width: 50%;
  height: auto;
}
</style>
