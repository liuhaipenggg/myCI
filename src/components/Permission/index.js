import Vue from 'vue'
import store  from '@/store'

// 自定义指令  VUE的功能
const vPermission = Vue.directive('permission',{
    // 指令钩子
    inserted(el,binding){
        // el：指令绑定的Dom元素
        //binding 就是dom中标签传入的属性
        const {value}  = binding
        // console.log(value)
        
        // 当前用户所拥有的权限，保存在store中
        const roles = store.state.roles
        // console.log(roles)
        if(value && value instanceof Array){
            // 为所有标签加上admin，因为admin role中只有admin
            value.push('admin')
            
            // 前两个if判断的是什么？？
            if(value.length > 0){
                const permissionRoles = value
                const hasPermission = roles.some(role =>{
                    return permissionRoles.includes(role)
                })
                if(!hasPermission){
                    el.parentNode && el.parentNode.removeChild(el) 
                    // console.log("el " + el)
                    // console.log("parentNode " + el.parentNode)
                }
            }
        }
    }
})

export default vPermission