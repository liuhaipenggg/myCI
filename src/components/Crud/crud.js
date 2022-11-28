import {initData} from '@/api/data'

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