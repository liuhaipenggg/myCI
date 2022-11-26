<!-- 角色管理界面 -->
<template>
    <div>
        <div class="crud-opts">
            <span class="left">
                <slot name="left"></slot>
                <el-button class="filter-item" 
                size="mini" 
                type="primary" 
                icon="el-icon-plus"  
                v-permission= "['role:add']"
                @click="updateOperation('post')">
                    新增
                </el-button>
                <el-button class="filter-item" size="mini" type="success" icon="el-icon-edit" :disabled="selectData.length !==1" v-permission= "['role:edit']" @click="updateOperation('put')">
                    修改
                </el-button>
                <el-button class="filter-item" size="mini" type="danger" icon="el-icon-delete" v-permission= "['role:delete']" @click="updateOperation('delete')">
                    删除
                </el-button>
                <el-button class="filter-item" size="mini" type="warning" v-permission= "['role:list']" icon="el-icon-download">
                    导出
                </el-button>
                <slot name="right">
                    <el-button></el-button>
                </slot>
            </span>
        </div>
        <!-- 角色显示表格 -->
        <el-dialog title="角色信息" :visible.sync="dialogFormVisible" width="650px">
            <el-form ref="form" :model="form" :rules="rules" size="small" label-width="66px">
                <el-form-item label="角色名称" prop="name">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="角色级别" prop="roleLevel">
                    <el-input-number v-model.number="form.level" :min="1" :max="10" label="角色级别"></el-input-number>
                </el-form-item>
                <el-form-item label="数据范围" prop="dataScope">
                    <!-- select 绑定form -->
                    <el-select v-model="form.dataScope" @change="changeScope()">
                        <!-- option 绑定显示所有数据的一项 -->
                        <el-option
                        v-for="item in dataScope"
                        :key="item"
                        :value="item"
                        :label="item"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="数据权限" prop="dataRight" v-if="form.dataScope==='自定义'" >
                    <!-- 先绑定data中的部门 -->
                    <treeselect
                        v-model="deptDatas"
                        :load-options="loadDepts"
                        :options="depts"
                        multiple
                        style="width: 380px"
                        placeholder="请选择"
                    />
                </el-form-item>
                <el-form-item label="描述信息" prop="description">
                    <el-input v-model="form.description"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="updateRole(form)">确 定</el-button>
            </span>
        </el-dialog>
        <el-table :data="tableData" style="width: 100%" @selection-change="handleSelectionChange">
            <!-- 表格的选择框 --> 
            <el-table-column type="selection" width="55px"></el-table-column>
            <el-table-column fixed prop="name" label="名称" width="150"></el-table-column>
            <el-table-column prop="dataScope" label="数据权限" width="150"></el-table-column>
            <el-table-column prop="level" label="角色级别" width="150"></el-table-column>
            <el-table-column prop="description" label="描述" width="150"></el-table-column>
            <el-table-column prop="createTime" label="创建日期" width="150"></el-table-column>
        </el-table>
    </div>
</template>

<script>
import {getDepts} from '@/api/dept'
import store from '@/store'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import {LOAD_CHILDREN_OPTIONS} from '@riophae/vue-treeselect'
import Element from 'element-ui'

export default{
    name: 'Role',
    components: {Treeselect},
    created(){
        this.getRoleList()
    },
    data(){
        return{
            selectData: [],
            deptDatas: [],
            depts: [],
            props:{
                label: 'name',
                children: 'zones',
                isLeaf: 'leaf'
            },
            dataScope: ["全部","本级","自定义"],
            // 表单数据
            form: {
                name: "asdf",
                level: 1,
                dataScope: ['本级'],
                // 这里要表明是字符串，不是数组，与el-input相对应
                description: '',
                depts: []

            },
            // 表单规则
            rules: {
                // username: [
                // { required: true, message: '请输入用户名', trigger: 'blur' },
                // { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
                // ],
                roleName: [
                    {required :true,trigger: 'blur'},
                    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
                ]
            },
            tableData: [],
            dialogFormVisible: false
        }
    },
    methods: {
        getRoleList(){
            this.$request.get('api/roles/all').then(res => {
                console.log(res)
                this.tableData = res
            })
        },
        // 部门懒加载
        loadDepts({action,parentNode,callback}){
            console.log('调用中1')
            // if(action === LOAD_CHILDREN_OPTIONS){
                console.log('调用中2')
                getDepts({enabled: true, pid: parentNode.id}).then(res =>{
                    console.log('调用中',res)
                    parentNode.children = res.content.map(function (obj){
                        // 检测子节点是否也有children，有的话先赋值为null，其实就是给个占位符，这样才会显示扩展箭头
                        if(obj.hasChildren){
                            obj.children =null
                        }
                        return obj
                    })
                    setTimeout(() => {
                        callback()
                    }, 200)
                })
            // }
        },
        // loadDepts({action, parentNode, callback}) {
        //     if (action === LOAD_CHILDREN_OPTIONS) {
        //         getDepts({enabled: true, pid: parentNode.id}).then(res => {
        //         parentNode.children = res.content.map(function (obj) {
        //             if (obj.hasChildren) {
        //             obj.children = null
        //             }
        //             return obj
        //         })
        //         setTimeout(() => {
        //             callback()
        //         }, 200)
        //         })
        //     }
        // },
        // 加载顶级部门
        getInitDepts(){
            getDepts({enabled: true}).then(res =>{
                this.depts = res.content.map(function (obj){
                // 检测子节点是否也有children，有的话先赋值为null，其实就是给个占位符，这样才会显示扩展箭头
                    if(obj.hasChildren){
                        obj.children =null
                    }
                    return obj
                })
            })
        },
        // el-tree原生组件不能双向绑定，所以要自己设置值
        // setDept(node){
        //     //转换为对象数组
        //     this.form.dept = [{id: node.id}]
        //     this.dept = node.name
        //     // dept里面存放的是部门名称
        //     console.log(this.dept)
        //     this.$refs.deptSelect.visible = false
        // },
        changeScope(){
            if(this.form.dataScope === '自定义'){
                console.log('自定义')
                this.getInitDepts()
            }
        },
        updateOperation(op){
            this.dialogFormVisible = op !== 'delete' ? true : false 
            this.$store.commit("SET_OP",op)
            if(op === 'delete')this.updateRole(this.selectData[0])
        },
        // 处理选中
        handleSelectionChange(rows){
            this.selectData = rows
        },
        updateRole(data){
            console.log(data)
            let op = this.$store.state.operation
            // 后端要求dept这一项是 传数组回去
            data.dept = this.deptDatas.map(value => {
                return {id: value}
            })
            this.$request({url: 'api/roles', method: op, data: data}).then(() =>{
                this.dialogFormVisible = false
                Element.Message.success("操作成功")
                this.getRoleList()
            })
        }
    }
}

</script>