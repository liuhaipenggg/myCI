import axios from "axios";
import Element from 'element-ui'
import {getToken} from "@/utils/auth";
import * as Config from "@/settings";
import router from '../router'
import store from '../store'

let request = axios.create({
    baseURL: '/',
    timeout: Config.timeout // 请求超时时间
})

//添加响应拦截器
request.interceptors.response.use(response => {
        //处理返回数据，返回res.data 就不用之后再去处理了 
        return response.data

    },
    error => {
        let code = error.response.data.status
        Element.Message.error(code + ' ' + error.response.data.message)
        if (code === 401) {//如果认证失败，则实行注销操作
            //解决不能自动退出bug，这里是js文件，不能使用this（Vue组件）
            store.dispatch('LogOut').then(() =>{
                router.replace('/login')
            })
        }
        return Promise.reject(error)
    })

//请求拦截
request.interceptors.request.use(config => {
        // 如果有token 请求头就加上token项，从而使请求被允许
        if (getToken()) {
            config.headers['Authorization'] = getToken()
        }
        return config
    },
    error => {
        return Promise.reject(error)
    })

export default request
