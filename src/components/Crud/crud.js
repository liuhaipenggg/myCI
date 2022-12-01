import {initData} from '@/api/data'
import Vue from 'vue'

function CRUD(options){
    const data = {
        ...options,
        tableData: [],
        tag: "default",
            // 分页相关属性
         page: {
            total: 3,
            size: 10,
            page: 1
         },
         loading: true,
         
         params: {},
    }

    const methods = {
        refresh(){
            this.loading = true
           
            console.log(this.url)
            console.log(this)
            initData(this.url,{page: this.page.page - 1, size: this.page.size}).then(res => {
                this.tableData = res.content
                this.page.total = res.totalElements
                console.log("长度",this.tableData.length)
                this.loading = false
                callVmHook(crud,CRUD.HOOK.afterRefresh)
            }).catch(err => {
                console.log(err)
                this.loading = false
            })
        },
        
        // 这两个使用crud的函数 是因为this指向调用它的环境组件 ，但这两个函数在dom里直接调用。
        sizeChangeHandler(size){
            console.log(this)
            crud.page.page = 1
            crud.page.size = size
            crud.refresh()
        },
        pageChangeHandler(page){
            crud.page.page = page
            crud.refresh()
        },
        delChangeHandler(){
            if(this.tableData.length == 1 && this.page.page !== 1){
                this.page.page = this.page.page - 1
            }
        },
        // 扩展crud的数据
        updateProp(name, value) {
            Vue.set(crud.props, name, value)
        }
    }

    const crud = Object.assign({},data)

    // 把data变为响应式数据
    Vue.observable(crud)

    Object.assign(crud,methods)

    Object.assign(crud,{
        vms: Array(4),

        // 多个vue组件用一个crud实例
        registerVM(type, vm, index = -1){
            const vmObj ={
                type: type,
                vm: vm
            }

            // index 有什么意义和作用？？
            if(index < 0){
                this.vms.push(vmObj)
                return
            }

            if(index < 4){
                this.vms[index] = vmObj
                return 
            }

            this.vms.length = Math.max(this.vms.length, index)
            this.vms.splice(index,1,vmObj)
        },

        unregister(vm){
            for(let i =this.vms.length - 1; i>=0; i--){
                if(this.vms[i] === undefined)
                    continue
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

    Object.freeze(crud)
    return crud
} 

function callVmHook(crud, hook){
    let ret = true

    const vmSet = new Set()
    // 所有vm都拿出来吗？
    console.log(this)
    console.log('vms',crud.vms)
    crud.vms.forEach(vm => vm && vmSet.add(vm,vm));

    vmSet.forEach(vm => {
        if(vm[hook]){
            console.log(vm[hook])
           ret = vm[hook].apply() !== false && ret 
        }
    })

    return ret
}

CRUD.HOOK = {
    /** 刷新 - 之后 */
    afterRefresh: 'afterCrudRefresh',
    /** "新建/编辑" 验证 - 之后 */
    afterValidateCU: 'afterCrudValidateCU',
}


// presenter()函数里this 是调用它的Vue组件      相对的   CRUD函数里的this是crud这个组件
export function presenter(crud){
    return {
        data(){
            return {
                crud: this.crud
            }
        },
        beforeCreate(){
            if(crud){
                this.crud = crud
                this.crud.registerVM('presenter',this,0)
                return
            }
            this.$cruds = this.$cruds || {}

            let cruds = this.$options.cruds instanceof Function ? this.$options.cruds() : crud
            if(!(cruds instanceof Array)){
                cruds = [cruds]
            }
            // ele === crudInstance
            cruds.forEach( ele => {
                if(this.$cruds[ele.tag]){
                    console.log("this.$cruds["+ele.tag+"] is already exist");
                }
                this.$cruds[ele.tag] = ele
                ele.registerVM('presenter', this, 0)
            })
            this.crud = this.$cruds['defalut'] || cruds[0]
        },
        destroyed(){
            this.crud.unregister(this)
        }
    }
}

export default CRUD


/*
export default{
    data(){
        return {
            tableData: [],

            // 分页相关属性
            page: {
                total: 3,
                size: 10,
                page: 1
            },
            loading: true,

            // url 和所需参数
            url: '',
            params: {},

        }
    },
    methods: {
        refresh(){
            this.loading = true
            // 执行beforeInit()，获取url和参数 ，并返回null
            if(!this.beforeInit()){
                return
            }
            console.log(this.url)
            console.log("this")
            initData(this.url,{page: this.page.page - 1, size: this.page.size}).then(res => {
                this.tableData = res.content
                this.page.total = res.totalElements
                console.log("长度",this.tableData.length)
                this.loading = false
            }).catch(err => {
                console.log(err)
                this.loading = false
            })
        },
        // 该函数不会执行，因为会和混合的组件中的同名方法合并
        beforeInit(){
            return false
        },
        sizeChangeHandler(size){
            this.page.size = size
            this.page.page = 1
            this.loading =true
            this.refresh()
        },
        pageChangeHandler(page){
            this.page.page = page
            this.loading =true
            this.refresh()
        },
        delChangeHandler(){
            if(this.tableData.length == 1 && this.page.page !== 1){
                this.page.page = this.page.page - 1
            }
        }
    }
}
*/