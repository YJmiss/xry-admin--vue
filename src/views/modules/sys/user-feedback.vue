<template>
<div class="container">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
        <el-form-item label="反馈用户">
            <el-input v-model="dataForm.nickname" placeholder="请输入反馈用户"></el-input>
        </el-form-item>
        <el-form-item label="回复状态">
            <el-select v-model="dataForm.check_status" clearable placeholder="请选择">
                <el-option v-for="item in replyStatusValue" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="反馈时间">
            <el-date-picker v-model="dataForm.create_time" align="right" type="date" placeholder="选择日期" :picker-options="pickerOptions" format="yyyy-MM-dd" value-format="yyyy-MM-dd">
            </el-date-picker>
        </el-form-item>
        <el-button @click="getDataList()">查询</el-button>
    </el-form>
    <el-table :data="dataList" border style="width: 100%">
        <el-table-column prop="userName" label="反馈用户" width="200" header-align="center" align="center">
            <template slot-scope="scope">
                <span v-if="scope.row.nickname" type="info">{{scope.row.nickname}}</span>&nbsp;/
                <span type="success">{{scope.row.phone}}</span>
            </template>
        </el-table-column>
        <el-table-column prop="create_time" label="反馈时间" header-align="center" align="center" width="200"></el-table-column>
        <el-table-column prop="replyDetail" label="反馈信息" header-align="center" align="left" width="600">
            <template slot-scope="scope">
                <el-popover ref="replyPopover" placement="top-start" trigger="hover">
                    <span>点击查看反馈信息</span>
                </el-popover>
                <el-button show-overflow-tooltip size="small" type="text" v-popover:replyPopover @click="showDetail(scope.row.feedback_info)">{{scope.row.feedback_info}}</el-button>
            </template>
        </el-table-column>
        <el-table-column label="回复状态" header-align="center" align="center" width="120">
            <template slot-scope="scope" prop="check_status">
                <el-tag type="danger" v-if="scope.row.check_status == 0">未回复</el-tag>
                <el-tag type="success" v-if="scope.row.check_status == 1">已回复</el-tag>
            </template>
        </el-table-column>
        <el-table-column prop="reply_time" label="回复时间" header-align="center" align="center" width="200"></el-table-column>
        <el-table-column fixed="right" label="操作" header-align="center" align="canter">
            <template slot-scope="scope" prop="check_status">
                <el-button v-if="isAuth('xry:feedback:detail')" type="primary" size="small" @click="viewFeedbackInfo(scope.row.id)">反馈详情</el-button>
                <el-button v-if="isAuth('xry:question:delete')" type="danger" size="small" icon="el-icon-delete" circle @click="deleteHandle(scope.row.id)"></el-button>
                <el-button v-if="isAuth('xry:feedback:replyHandle')" type="primary" size="small" icon="el-icon-edit" @click="replyHandle(scope.row.id)" v-show="scope.row.check_status ===0">回复反馈</el-button>
                <el-button v-if="isAuth('xry:feedback:replyHandle')" type="success" size="small" icon="el-icon-edit" @click="replyHandle(scope.row.id)" v-show="scope.row.check_status ===1">已回复</el-button>
            </template>
        </el-table-column>
    </el-table>
    <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle" :current-page="pageIndex" :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" :total="totalPage" layout="total, sizes, prev, pager, next, jumper"></el-pagination>
    <!-- 弹窗, 查看反馈详情 -->
    <feedback-detail v-show="feedbackDetailVisible" ref="feedbackDetail" @refreshDataList="getDataList"></feedback-detail>
    <!-- 弹窗, 填写回复内容 -->
    <reply-add-or-view v-show="replyAddOrViewVisible" ref="replyAddOrView" @refreshDataList="getDataList"></reply-add-or-view>
</div>
</template>

<script>
import feedbackDetail from './user-feedback-detail'
import replyAddOrView from './user-feedback-replyAddOrView'
export default {
    components: {
        feedbackDetail,
        replyAddOrView
    },
    data() {
        return {
            replyAddOrViewVisible: false,
            feedbackDetailVisible: false,
            dataList: [],
            pageIndex: 1,
            pageSize: 10,
            totalPage: 0,
            dataForm: {
                nickname: '',
                phone: '',
                feedback_info: '',
                check_status: '',
                userId: '',
                create_time: '',
                reply_status: '',
                reply_info: '',
                reply_time: ''
            },
            dataRule: {
                replyContent: [{
                    required: true,
                    message: "请填写回复内容",
                    trigger: "blur"
                }]
            },
            replyStatusValue: [{
                value: '0',
                label: '未回复'
            }, {
                value: '1',
                label: '已回复'
            }],
            pickerOptions: {
                disabledDate(time) {
                    return time.getTime() > Date.now();
                },
                shortcuts: [{
                    text: '今天',
                    onClick(picker) {
                        picker.$emit('pick', new Date());
                    }
                }, {
                    text: '昨天',
                    onClick(picker) {
                        const date = new Date();
                        date.setTime(date.getTime() - 3600 * 1000 * 24);
                        picker.$emit('pick', date);
                    }
                }, {
                    text: '一周前',
                    onClick(picker) {
                        const date = new Date();
                        date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
                        picker.$emit('pick', date);
                    }
                }]
            }
        }
    },
    activated() {
        this.getDataList()
    },
    methods: {
        //获取数据表
        getDataList() {
            this.$http({
                url: this.$http.adornUrl('/xry/feedback/list'),
                method: 'get',
                params: this.$http.adornParams({
                    'page': this.pageIndex,
                    'limit': this.pageSize,
                    'userInfo': this.dataForm.nickname,
                    'checkStatus': this.dataForm.check_status,
                    'createTime': this.dataForm.create_time
                })
            }).then(({
                data
            }) => {
                if (data && data.code === 0) {
                    this.dataList = data.page.list
                    this.totalPage = data.page.totalCount
                } else {
                    this.dataList = []
                    this.totalPage = 0
                }
            })
        },
        //查看反馈详情
        viewFeedbackInfo(id) {
            this.feedbackDetailVisible = true
            this.$nextTick(() => {
                this.$refs.feedbackDetail.init(id)
            })
        },
        // 点击->详情弹出框
        showDetail (detail) {
            this.$alert(detail, '反馈信息', {
            confirmButtonText: '确定',
            callback: action => {}
            });
        },
        // 删除
        deleteHandle(id) {
            var ids = id ? [id] : this.dataListSelections.map(item => {
                return item.id
            })
            this.$confirm(`确定对[id=${ids.join(',')}]进行[${id ? '删除' : '批量删除'}]操作?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$http({
                    url: this.$http.adornUrl('/xry/feedback/delete'),
                    method: 'post',
                    data: this.$http.adornData(ids, false)
                }).then(({
                    data
                }) => {
                    if (data && data.code === 0) {
                        this.$message({
                            message: '操作成功',
                            type: 'success',
                            duration: 1500,
                            onClose: () => {
                                this.getDataList()
                            }
                        })
                    } else {
                        this.$message.error(data.msg)
                    }
                })
            }).catch(() => {})
        },
        //回复反馈
        replyHandle(id) {
            this.replyAddOrViewVisible = true
            this.$nextTick(() => {
            this.$refs.replyAddOrView.init(id)
            })
        },
        // 每页数
        sizeChangeHandle(val) {
            this.pageSize = val
            this.pageIndex = 1
            this.getDataList()
        },
        // 当前页
        currentChangeHandle(val) {
            this.pageIndex = val
            this.getDataList()
        }
    }
}
</script>

<style scoped>
.el-form-item {
    margin-right: 30px;
}
</style>
