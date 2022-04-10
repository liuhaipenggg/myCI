import {initData} from "@/api/data";
import Vue from 'vue'

//这里的this指的是crud实例
function CRUD(options) {
    const data = {
        ...options,
        loading: true,
        //表格数据
        tableData: [],
        page: {
            // 页码
            page: 1,
            // 每页数据条数
            size: 10,
            // 总数据条数
            total: 0
        },
        //查询参数，由混入组件提供
        params: {}
    }

    const methods = {
        refresh() {
            this.loading = true
            // 请求数据
            let queryParams = {page: this.page.page - 1, size: this.page.size}
            initData(this.url, queryParams).then(data => {
                this.page.total = data.totalElements
                this.tableData = data.content
                this.loading = false
                callVmHook(crud, CRUD.HOOK.afterRefresh)
            }).catch(err => {
                this.loading = false
            })
        },
        // 预防删除当前页最后一条数据时，或者多选删除第二页的数据时，页码错误导致请求无数据
        dleChangePage() {
            if (this.tableData.length === 1 && this.page.page !== 1) {
                this.page.page -= 1
            }
        },
        // 每页条数改变
        sizeChangeHandler(size) {
            crud.page.size = size
            crud.page.page = 1
            crud.refresh()
        },
        // 当前页改变
        pageChangeHandler(page) {
            crud.page.page = page
            crud.refresh()
        },
        // 扩展crud的数据
        updateProp(name, value) {
            Vue.set(crud.props, name, value)
        }
    }

    const crud = Object.assign({}, data)

    // 可观测化，意思是让crud变为响应式的对象，响应式的意思就是vue组件会根据对象里面值的变化而重新渲染组件
    Vue.observable(crud)
    // 附加方法
    Object.assign(crud, methods)
    // 附加vm相关方法
    Object.assign(crud, {
        // 预留4位存储：组件 主页、头部、分页、表单，调试查看也方便找
        vms: Array(4),
        /**
         * 注册组件实例
         * @param {String} type 类型
         * @param {*} vm 组件实例
         * @param {Number} index 该参数内部使用
         */
        registerVM(type, vm, index = -1) {
            const vmObj = {
                type,
                vm: vm
            }
            if (index < 0) {
                this.vms.push(vmObj)
                return
            }
            if (index < 4) { // 内置预留vm数
                this.vms[index] = vmObj
                return
            }
            this.vms.length = Math.max(this.vms.length, index)
            this.vms.splice(index, 1, vmObj)
        },
        /**
         * 取消注册组件实例
         * @param {*} vm 组件实例
         */
        unregisterVM(vm) {
            for (let i = this.vms.length - 1; i >= 0; i--) {
                if (this.vms[i] === undefined) {
                    continue
                }
                if (this.vms[i].vm === vm) {
                    if (i < 4) { // 内置预留vm数
                        this.vms[i] = undefined
                    } else {
                        this.vms.splice(i, 1)
                    }
                    break
                }
            }
        }
    })
    // 冻结处理，需要扩展数据的话，使用crud.updateProp(name, value)，以crud.props.name形式访问，这个是响应式的，可以做数据绑定
    Object.freeze(crud)
    return crud
}

// hook VM
function callVmHook(crud, hook) {
    let ret = true
    // 有些组件扮演了多个角色，调用钩子时，需要去重，指的是当一个组件混入presenter(), header(), form(), crud()其中的两个以上时，就会出现重复注册
    const vmSet = new Set()
    crud.vms.forEach(vm => vm && vmSet.add(vm.vm))
    vmSet.forEach(vm => {
        if (vm[hook]) {
            ret = vm[hook].apply() !== false && ret
        }
    })
    return ret
}

/**
 * CRUD钩子
 */
CRUD.HOOK = {
    /** 刷新 - 之后 */
    afterRefresh: 'afterCrudRefresh',
    /** "新建/编辑" 验证 - 之后 */
    afterValidateCU: 'afterCrudValidateCU',
}

/**
 * crud主页
 * 要把presenter理解成可被混入的组件
 */
function presenter(crud) {
    return {
        data() {
            // 在data中返回crud，是为了将crud与当前实例关联，组件观测crud相关属性变化
            return {
                crud: this.crud
            }
        },
        beforeCreate() {//为了方便理解，这里增加一个vue组件的钩子函数，用来做crud的传入
            this.crud = crud
            console.log('请问presenter的this到底是谁?', this)
            this.crud.registerVM('presenter', this, 0)
        },
        destroyed() {
            this.crud.unregisterVM(this)
        }
    }
}

export default CRUD

export {presenter}
