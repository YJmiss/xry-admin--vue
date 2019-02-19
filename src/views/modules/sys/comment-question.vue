<template>
<div class="container">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
        <el-form-item label="问题标题">
            <el-input v-model="dataForm.title" placeholder="请输入问题标题"></el-input>
        </el-form-item>
        <el-form-item label="状态">
            <el-select v-model="dataForm.question_status" clearable placeholder="请选择">
                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
            <el-date-picker v-model="dataForm.create_time" align="right" type="date" placeholder="选择日期" :picker-options="pickerOptions" format="yyyy-MM-dd" value-format="yyyy-MM-dd">
            </el-date-picker>
        </el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button type="primary" @click="addOrUpdateHandle()">新增</el-button>
    </el-form>
    <el-table :data="dataList" border style="width: 100%">
        <el-table-column prop="title" header-align="center" align="center"  label="问题标题" ></el-table-column>
        <el-table-column header-align="center" align="center" label="状态" width="200">
            <template slot-scope="scope" porp="question_status">
                <el-tag type="info" v-if="scope.row.question_status ===0">未发布</el-tag>
                <el-tag type="success" v-if="scope.row.question_status ===1">已发布</el-tag>
            </template>
        </el-table-column>
        <el-table-column prop="create_time" header-align="center" align="center" label="创建时间" ></el-table-column>
        <el-table-column fixed="right" header-align="center" align="center" label="操作">
            <template slot-scope="scope" porp="question_status">
                <el-button v-if="isAuth('xry:question:update')" type="primary" size="small" icon="el-icon-edit" round @click="addOrUpdateHandle(scope.row.id)">详情</el-button>
                <el-button v-if="isAuth('xry:question:delete')" type="danger" size="small" icon="el-icon-delete" round @click="deleteHandle(scope.row.id)" :disabled="scope.row.question_status === 1">删除</el-button>
                <el-button v-if="isAuth('xry:question:cancelPublish')" type="danger" size="small" @click="cancelPublish(scope.row.id)" v-show="scope.row.question_status ===1">撤回</el-button>
                <el-button v-if="isAuth('xry:question:publishQuestion')" type="success" size="small"  @click="publishQuestion(scope.row.id)" v-show="scope.row.question_status ===0">发布</el-button>
            </template>
        </el-table-column>
    </el-table>
    <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle" :current-page="pageIndex" :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" :total="totalPage" layout="total, sizes, prev, pager, next, jumper"></el-pagination>
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-show="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
</div>
</template>

<script>
import AddOrUpdate from './comment-question-addOrUpdate'
export default {
    components: {
        AddOrUpdate
    },
    data() {
        return {
            dataList: [],
            addOrUpdateVisible: false,
            pageIndex: 1,
            pageSize: 10,
            totalPage: 0,
            dataForm: {
                title: '',
                question_info: '',
                reply_info: '',
                question_status: '',
                question_img: '',
                reply_img: '',
                create_time: ''
            },
            options: [{
                    value: '0',
                    label: '未发布'
                },
                {
                    value: '1',
                    label: '已发布'
                }
            ],
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
                url: this.$http.adornUrl('/xry/question/list'),
                method: 'get',
                params: this.$http.adornParams({
                    'page': this.pageIndex,
                    'limit': this.pageSize,
                    'title': this.dataForm.title,
                    'questionStatus': this.dataForm.question_status,
                    'createTime': this.dataForm.create_time,
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
                    url: this.$http.adornUrl('/xry/question/delete'),
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
        // 发布问题
        publishQuestion(id) {
            var ids = id ? [id] : this.dataListSelections.map(item => {
                return item.id
            })
            this.$confirm(`确定对[id=${ids.join(',')}]进行[${id ? '发布' : '批量发布'}]操作?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$http({
                    url: this.$http.adornUrl('/xry/question/publishQuestion'),
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
        // 撤回问题
        cancelPublish(id) {
            var ids = id ? [id] : this.dataListSelections.map(item => {
                return item.id
            })
            this.$confirm(`确定对[id=${ids.join(',')}]进行[${id ? '撤回' : '批量撤回'}]操作?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$http({
                    url: this.$http.adornUrl('/xry/question/cancelPublish'),
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
        //新增或修改处理
        addOrUpdateHandle(id) {
            this.addOrUpdateVisible = true
            this.$nextTick(() => {
                this.$refs.addOrUpdate.init(id)
            })
        },
        //移除或恢复按钮
        deleteOrRestoreHandle(id, question_status) {

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
