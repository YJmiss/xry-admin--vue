<template>
<el-dialog :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false" :visible.sync="visible" @close='closeDialog'>
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" label-width="80px">
        <el-form-item label="问题标题" prop="title">
        <el-input v-model="dataForm.title" type="textarea" rows="3" placeholder="问题标题"></el-input>
        </el-form-item>
        <el-form-item label="解答内容">
        <editor :uploadUrl="uploadUrl" v-model="dataForm.replyContent"></editor>
        </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
</el-dialog>
</template>

<script>
import { treeDataTranslate} from "@/utils";
import $ from 'jquery'
import Editor from '@/components/quill-editor.vue'
export default {
components: {Editor},
    data() {
        return {
            dataForm: {
                id: '',
                title: "",
                replyContent:''
            },
            url: "",
            num: 0,
            successNum: 0,
            successNum2: 0,
            fileList: [],
            fileList2: [],
            visible: false,
            uploadUrl: this.$http.adornUrl(`/sys/oss/uploadImg?token=${this.$cookie.get('token')}`),
            dataRule: {
                title: [{ required: true, message: "请填写问题标题", trigger: "blur"
                }],
                replyContent: [{ required: true, message: '解答内容不能为空', trigger: 'blur'
                }]
            }
        };
    },
    methods: {
        init(id) {
            this.url = this.$http.adornUrl(`/sys/oss/upload?token=${this.$cookie.get("token")}`);
            this.dataForm.id = id || 0;
            this.visible = true
            this.$nextTick(() => {
                this.$refs['dataForm'].resetFields()
                if (this.dataForm.id) {
                    this.$http({
                        url: this.$http.adornUrl(`/xry/question/info/${this.dataForm.id}`),
                        method: 'get',
                        params: this.$http.adornParams()
                    }).then(({
                        data
                    }) => {
                        if (data && data.code === 0) {
                            this.dataForm.id = data.commentQuestion.id
                            this.dataForm.title = data.commentQuestion.title
                            this.dataForm.replyContent = data.commentQuestion.replyInfo
                        }
                    })
                }
            })
        },
        // 表单提交
        dataFormSubmit() {
            this.$refs["dataForm"].validate(valid => {
                if (valid) {
                    this.$http({
                        url: this.$http.adornUrl(`/xry/question/${!this.dataForm.id ? "save" : "update"}`),
                        method: "post",
                        data: this.$http.adornData({
                            id: this.dataForm.id || undefined,
                            title: this.dataForm.title,
                            replyInfo: this.dataForm.replyContent,
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
        },
        // 上传之前
        beforeUploadHandle(file) {
            if ( file.type !== "image/jpg" && file.type !== "image/jpeg" &&
                file.type !== "image/png" && file.type !== "image/gif" && file.type !== "video/mp4" ) {
                this.$message.error("只支持jpg、png、gif格式的图片！");
                return false;
            }
            this.num++;
        },
        // 问题封面图上传成功
        successHandle(response, file, fileList) {
            this.fileList = fileList;
            this.successNum++;
            this.dataForm.questionImg = response.url;
            this.showUploadImg(this.dataForm.questionImg);
        },
        // 问题封面图上传成功
        successHandle2(response, file, fileList2) {
            this.fileList2 = fileList2;
            this.successNum2++;
            this.dataForm.replyImg = response.url;
            this.showUploadImg(this.dataForm.replyImg);
        },
        // 上传后预览图片
        showUploadImg(img) {
            this.$nextTick(() => {
                let upload_list_li = document.getElementsByClassName("el-upload-list")[0].children;
                for (let i = 0; i < upload_list_li.length; i++) {
                    let li_a = upload_list_li[i].children[0];
                    let imgElement = document.createElement("img");
                    imgElement.setAttribute("src", img);
                    imgElement.setAttribute("style", "max-width:50%;padding-left:25%");
                    if (li_a.lastElementChild.nodeName !== "IMG") {
                        li_a.appendChild(imgElement);
                    }
                }
            });
        },
        // 修改阅览图片el-upload-list
        showUploadImg2(img) {
            let ul_tag = document.createElement("ul");
            ul_tag.setAttribute("class", "el-upload-img");
            ul_tag.setAttribute("class", "el-upload-list__item is-success");
            let imgElement = document.createElement("img");
            imgElement.setAttribute("src", img);
            imgElement.setAttribute("style", "max-width:50%;");
            ul_tag.appendChild(imgElement);
            let del_icon = document.createElement("i");
            del_icon.setAttribute("class", "el-icon-close");
            del_icon.setAttribute("style", "position:absolute;top:4px;right:4px;");
            ul_tag.appendChild(del_icon);
            let imageControl = document.getElementsByClassName("imageList");
            imageControl[0].appendChild(ul_tag);
            del_icon.addEventListener("click", function () {
                ul_tag.setAttribute('style', "display:none")
            })
        },
        uploadOverrun() {
            this.$message({
                type: "error",
                message: "上传文件个数超出限制!只能上传1张图片!"
            });
        },
        closeDialog() {
            let upload_list = document.getElementsByClassName("el-upload-list__item");
            $('upload_list[0]').remove();
        }
    }
};
</script>

<style scoped>
.load {
    text-align: center;
    margin-top: 20px;
    padding: 10px;
    font-size: 16px;
    border: none;
}

.course-price {
    width: 700px;
}

.price-tip {
    display: inline;
    color: red;
    padding-left: 20px;
}

.el-upload-img {
    position: relative;
    left: 0;
    top: 15px;
    border: solid 1px #ff0000;
    padding-left: 200px;
}
.quill-editor{height:1000px;}
.el-dialog__footer{padding-top:50px;}
</style>
