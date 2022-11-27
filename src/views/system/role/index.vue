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
        <el-row :gutter="15">
            <!-- 角色显示表格 -->
            <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="17" style="margin-bottom: 10px">
                <el-card class="box-card" shadow="never">
                    <div slot="header" class="clearfix">
                        <span class="role-span">角色列表</span>
                    </div>
                    <!-- 选中复选框和该行时都可以触发 -->
                    <el-table :data="tableData" style="width: 100%" @selection-change="handleSelectionChange" highlight-current-row @current-change="handlecurrentchange">
                        <!-- 表格的选择框 --> 
                        <el-table-column type="selection" width="55px"></el-table-column>
                        <el-table-column fixed prop="name" label="名称" width="150"></el-table-column>
                        <el-table-column prop="dataScope" label="数据权限" width="150"></el-table-column>
                        <el-table-column prop="level" label="角色级别" width="150"></el-table-column>
                        <el-table-column prop="description" label="描述" width="150"></el-table-column>
                        <el-table-column prop="createTime" label="创建日期" width="150"></el-table-column>
                    </el-table>
                </el-card>
            </el-col> 

            <!-- 菜单权限管理框 -->
            <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="7">
                <el-card class="box-card" shadow="never">
                    <div slot="header" class="clearfix">
                        <el-tooltip class="item" effect="dark" content="选择指定角色分配菜单" placement="top">
                            <span class="role-span">菜单分配</span>
                        </el-tooltip>
                        <el-button
                        :disabled="!showButton"
                        icon="el-icon-check"
                        size="mini"
                        style="float: right; padding: 6px 9px"
                        type="primary"
                        @click="saveMenu"
                        >保存</el-button>
                    </div>

                    <el-tree
                    ref="menu"
                    lazy
                    :defalut-checked-keys="menuIds"
                    :load="getMenuDatas"
                    :props="defaultProps"
                    show-checkbox
                    check-strictly
                    according
                    node-key="id"
                    @check="menuChange"
                    >
                    </el-tree>
                </el-card>
            </el-col>

            <!-- 角色新增的表单 -->
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
        </el-row>
    </div>
</template>

<script>
import {getDepts,getDeptSuperior} from '@/api/dept'
import store from '@/store'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import {LOAD_CHILDREN_OPTIONS} from '@riophae/vue-treeselect'
import Element from 'element-ui'
import {getChild} from '@/api/menu'

export default{
    name: 'Role',
    components: {Treeselect},
    created(){
        this.getRoleList()
    },
    data(){
        return{
            // 菜单权限相关值
            menuIds: [],
            // 菜单权限树的结构
            defaultProps: { children: 'children', label: 'label', isLeaf: 'leaf' },
            menus: [],
            // 保存按钮显示与否
            showButton: false,
            // 当前选中的角色id
            currentId: [],

            // 角色相关值
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
             if(action === LOAD_CHILDREN_OPTIONS){
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
             }
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

        // 遍历构造树,其实是给下拉箭头
        buildDepts(nodes){
            nodes.forEach(node => {
                // 树的深度遍历，如果有子树，则继续遍历
                if(node.children){
                    buildDepts(node.children)
                }
                if(node.hasChildren && !node.children) node.children = null 
            })
        },

        updateOperation(op){
            this.dialogFormVisible = op !== 'delete' ? true : false 
            this.$store.commit("SET_OP",op)
            if(op === 'post'){
                // 给form赋空值，不然form中保留原来角色的值（特别是id），无法给后端处理
                // 对象
                this.form = {}
                this.deptDatas = []
            }
            if(op === 'put'){
                this.form = {...this.selectData[0]}
                // 如果用户之前没有加载表单里的树结构，那么这里将无法显示
                 if(this.form.dataScope === '自定义'){
                    // 其实不加也不影响角色数据更新
                    
                    // 把目标角色的原全部部门id都拿出来
                    this.deptDatas = this.selectData[0].depts.map(val => {
                        return  val.id
                     })
                     console.log(this.deptDatas)
                    //  请求同级和上级
                     getDeptSuperior(this.deptDatas).then(res => {
                        let depts = res.content
                        console.log(depts)
                        // 这样不行，这样树会丧失结构
                        // this.depts = this.depts.map(function(obj){
                        //     if(obj.hasChildren){
                        //         obj.children = null
                        //     }
                        // })
                        this.buildDepts(depts)
                        this.depts = depts
                     })
                 }
            }
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
            data.depts = this.deptDatas.map(value => {
                return {id: value}
            })
            this.$request({url: 'api/roles', method: op, data: data}).then(() =>{
                this.dialogFormVisible = false
                Element.Message.success("操作成功")
                this.getRoleList()
            })
        },

        // 菜单相关方法
        getMenuDatas(node,resolve){
            let pid = node.level === 0 ? 0 :node.data.id
            this.$request.get('api/menus/lazy',{params:{pid: pid}}).then(res => {
                this.menus = res
                resolve(this.menus)
            })
        },

        // 改变对menu的选择时候
        menuChange(menu){
            // 要在点击该节点时也把子节点选中，所以我们要获取所有子节点
            getChild(menu.id).then(childIds => {
                // 后端响应数据时 id集合
                console.log(childIds)
                // menuIds 里保存 目前被选中的所有菜单项的id
                if(this.menuIds.indexOf(menu.id) !== -1){
                    // 之前已经被选中，删除
                    for(let i = 0; i < childIds.length; i++ ){
                        const index = this.menuIds.indexOf(childIds[i])
                        if(index !== -1){
                            // splice方法变更数组，包括增加，删除，修改
                            this.menuIds.splice(index,1)
                        }
                    }
                }else{
                    for(let i = 0; i < childIds.length; i++ ){
                        const index = this.menuIds.indexOf(childIds[i])
                        // 没有被包含在数组里的值被 增加进去
                        if(index === -1){
                            this.menuIds.push(childIds[i])
                        }
                    }
                }
                // 通过ref拿到tree的实例，并把menuIds里对应的值添加进去
                this.$refs.menu.setCheckedKeys(this.menuIds)
            })
        },
        handlecurrentchange(row){
            // console.log(row)
            if(row){
                // 首先清空
                this.menuIds = []
                this.$refs.menu.setCheckedKeys(this.menuIds)
                // 找到当前选中角色的角色id
                this.currentId = row.id
                
                this.showButton = true

                row.menus.forEach(data => {
                    this.menuIds.push(data.id)
                })
                this.$refs.menu.setCheckedKeys(this.menuIds)
                console.log(this.menuIds)
            }
        },
        saveMenu(){
            // ES6 构造对象
            let data = {id: this.currentId,menus: []}
            // 将menuId里的值添加到role对象里
            this.menuIds.forEach(id =>{
                const menu = {id: id}
                data.menus.push(menu)
            })
            console.log(data)
            this.$request.put('api/roles/menu',data).then(() => {
                Element.Message.success('保存当前角色新的菜单列表成功')
                this.getRoleList()
            }).catch(err => {
                console.log(err)
            })
        }
    }
}

</script>