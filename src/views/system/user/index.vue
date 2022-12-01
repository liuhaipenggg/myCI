<template>
    <div id="app-container">
        <div class="crud-opts">
            <span class="left">
                <slot name="left"></slot>
                <el-button class="filter-item" 
                size="mini" 
                type="primary" 
                icon="el-icon-plus"  
                v-permission= "['user:add']"
                @click="updateOperation('post')">
                    新增
                </el-button>
                <el-button class="filter-item" size="mini" type="success" icon="el-icon-edit" :disabled="selectData.length !==1" v-permission= "['user:edit']" @click="updateOperation('put')">
                    修改
                </el-button>
                <el-button class="filter-item" size="mini" type="danger" icon="el-icon-delete" v-permission= "['user:delete']" @click="updateOperation('delete')">
                    删除
                </el-button>
                <el-button class="filter-item" size="mini" type="warning" v-permission= "['user:list']" icon="el-icon-download">
                    导出
                </el-button>
                <slot name="right">
                    <el-button></el-button>
                </slot>
            </span>
        </div>
        <!-- 新增表单 渲染 -->
        <el-dialog append-to-body title="用户信息" :visible.sync="dialogFormVisible" width="650px">
            <el-form ref="form" :inline="true" :model="form" :rules="rules" size="small" label-width="66px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="form.username" />
                </el-form-item>
                <el-form-item label="电话" prop="phone">
                    <el-input v-model.number="form.phone" />
                </el-form-item>
                <el-form-item label="昵称" prop="nickName">
                    <el-input v-model="form.nickName" />
                </el-form-item>
                 <el-form-item label="邮箱" prop="email">
                    <el-input v-model="form.email" />
                </el-form-item>
                 <el-form-item label="部门">
                    <el-select v-model="dept" placeholder="请输入部门" ref="deptSelect">
                        <el-option v-model="dept" style="height: max-content;width:100%">
                            <el-tree
                                :props = "props"
                                :load = "loadDept"
                                lazy
                                style = "width: 100%;"
                                @node-click = "setDept" >
                            </el-tree>
                        </el-option>
                    </el-select>
                </el-form-item>
               <el-form-item label="岗位">
                    <el-select
                        v-model="jobDatas"
                        style="width: 178px"
                        multiple
                        placeholder="请选择"
                        @change="changeJob"
                    >
                        <el-option
                        v-for="item in jobs"
                        :key="item.name"
                        :label="item.name"
                        :value="item.id"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="性别">
                    <el-radio-group v-model="form.gender" style="width: 178px">
                        <el-radio label="男">男</el-radio>
                        <el-radio label="女">女</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="状态">
                    <el-radio-group v-model="form.enabled">
                        <!-- 这里el-radio必须用bind写法才能绑定值，从而在修改时看到 -->
                        <el-radio :label="true" key="激活">激活</el-radio>
                        <el-radio :label="false" key="禁用">禁用</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item style="margin-bottom: 0;" label="角色">
                    <el-select
                        v-model="roleDatas"
                        style="width: 437px"
                        multiple
                        placeholder="请选择"
                        @change="changeRole"
                    >
                        <el-option
                        v-for="item in roles"
                        :key="item.name"
                        :label="item.name"
                        :value="item.id"
                        />
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="updateUser(form)">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 用户表格 -->
        <el-table ref="multipleTable" :data="tableData" tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange" v-loading="loading" >
            <!-- 多选框 -->
            <el-table-column type="selection" width="55" ></el-table-column>
            <el-table-column prop="username" label="用户名" width="120"></el-table-column>
            <el-table-column prop="nickName" label="昵称" width="120"></el-table-column>
            <el-table-column prop="gender" label="性别" width="80"></el-table-column>
            <el-table-column prop="phone" label="电话" width="120"></el-table-column>
            <el-table-column prop="email" label="邮箱" width="200"></el-table-column>
            <el-table-column prop="dept" label="部门" width="100">
                <template slot-scope="scope">
                    {{scope.row.dept.name}}
                </template>
            </el-table-column>
            <el-table-column prop="enabled" label="状态" width="80">
                <template slot-scope="scope">
                    <el-switch
                    v-model="scope.row.enabled"
                    active-color="#409EFF"
                    inactive-color="#F56C6C"
                />
                </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建日期" width="200"></el-table-column>
            <!-- <el-table-column prop="dept" label="操作" width="120"></el-table-column> -->
        </el-table>
        <el-pagination
        :page-size.sync="page.size"
        :total="page.total"
        :current-page.sync="page.page"
        style="margin-top: 8px"
        layout="total, prev, pager, next, sizes"
        @size-change="sizeChangeHandler"
        @current-change="pageChangeHandler"
        />
    </div>
</template>

<script>
import {getDepts} from '@/api/dept'
import Element from 'element-ui'
import crud from '@/components/Crud/crud'
 
export default{
    name: 'User',
    mixins: [crud],
    created(){
        this.$nextTick(() => {
            this.refresh()
        })
        this.dialogFormVisible = false
    },
    data(){
        const validPhone = (rule, value, callback) => {
            if (!value) {
                callback(new Error('请输入电话号码'))
            } else if (!isvalidPhone(value)) {
                callback(new Error('请输入正确的11位手机号码'))
            } else {
                callback()
            }
        }
        return{
            //选中的数据行
            selectData:[],

            jobs: [],
            roles: [],
            roleDatas: [],
            // 当前节点的部门名称
            dept: [],
            // 所有部门对象列表
            depts: [],
            // props 不知道**  树的结构
            props:{
                label: 'name',
                children: 'zones',
                isLeaf: 'leaf'
            },
            jobDatas:[],
            dialogFormVisible: false,
            rules: {
                username: [
                { required: true, message: '请输入用户名', trigger: 'blur' },
                { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
                ],
                nickName: [
                { required: true, message: '请输入用户昵称', trigger: 'blur' },
                { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
                ],
                email: [
                { required: true, message: '请输入邮箱地址', trigger: 'blur' },
                { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
                ],
                phone: [
                { required: true, trigger: 'blur', validator: validPhone }
                ]
            },
            form: {
                username: 'liu',
                nickName: 'jjj',
                phone: '12345678909',
                email: '2345678@qq.com',
                // 当前部门的id
                dept: [{id: 7}],
                jobs: [],
                gender: '',
                status: '',
                roles: [],
                enabled: false,
                id: null
            }
        }
    },
    methods: {
        beforeInit(){
            this.url = 'api/users'
            return true
        },
        // getUserInfo(){
        //     this.$request.get('api/users').then(res => {
        //         // console.log(res)
        //         this.tableData = res.content
        //     })
        // },
        //修改用户时，将数据渲染到表格里
        mapForm(user){
           this.dept = user.dept.name
           console.log(user)
            //    一位用户可能有多个角色或者岗位 所以他们的roleData和jobDate 都是数组
           this.roleDatas = user.roles.map(value => value.id)
           this.jobDatas = user.jobs.map(value => value.id)
            // 不这样渲染
            // this.form.username = user.username
            // this.form.nickName = user.nickName
            // this.form.phone = user.phone
            // this.form.email = user.email

            // 不能直接这样拷贝赋值，因为指针的关系，这样子这两个对象实际上是一样的
            // this.form = user
            // 应该新建新对象再拷贝赋值
            this.form = {...user}
            console.log(this.form.enabled)
        },
        updateOperation(op){
            if(op === "put")this.mapForm(this.selectData[0])
            this.dialogFormVisible = op !== 'delete' ? true : false 
            this.$store.commit("SET_OP",op)
            if(op !== 'delete'){
                this.$request.get('api/job').then(res => {
                    // console.log(res)
                    this.jobs = res.content
                })
                this.$request.get('api/roles').then(res => {
                    // console.log(res)
                    this.roles = res.content
                })
            }else this.updateUser(this.selectData.map(value => value.id))
            // map函数如何使用？？
        },
        loadDept(node,resolve){
            let pid = node.level === 0 ? null : node.data.id
            // 传pid，即父节点参数过去请求下级节点的值
            getDepts({ enabled: true ,pid: pid}).then(res=> {
                // console.log(res)
                this.depts = res.content

                // 调用一次加载后，depts里的值就只剩这次加载得到的结果
                console.log(this.depts)
                resolve(this.depts)
            })
        },
        setDept(node){
            //转换为对象
            this.form.dept = {id: node.id}
            this.dept = node.name
            // dept里面存放的是当前名称
            console.log(this.dept)
            this.$refs.deptSelect.visible = false
        },
        // 把数字转化为对象，在job选择栏变化时被调用，改变form中job的值
        changeJob(){
            this.form.jobs = this.jobDatas.map(value => {
                return {id:value}
            })
        },
        // 把数字转化为对象，在role选择栏变化时被调用，改变form中role的值
        changeRole(){
            this.form.roles = this.roleDatas.map(value => {
                return {id:value}
            })
        },
        updateUser(data){
            let op = this.$store.state.operation
            console.log(data)
            this.$request({url: 'api/users', method: op, data: data}).then(() =>{
                this.dialogFormVisible = false
                Element.Message.success("操作成功")
                this.refresh()
            })
        },

        // 处理修改，删除两个按钮
        handleSelectionChange(rows){
            this.selectData = rows
            console.log("这是选中的行数据",this.selectData)
        }
    }
}
</script>