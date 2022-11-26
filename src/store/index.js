import Vue from 'vue'
import Vuex from 'vuex'
import {getToken, removeToken, setToken} from "@/utils/auth";
import {getInfo, logout,login} from "@/api/login";
// import { reject } from 'core-js/fn/promise';

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        operation: '',
        token: getToken(),
        user: {},
        roles: []
    },
    mutations: {
        SET_OP: (state, payload) => {
            state.operation = payload
        },
        SET_TOKEN: (state, token) => {
            state.token = token
        },
        SET_USER: (state, user) => {
            state.user = user
        },
        SET_ROLES: (state, roles) => {
            state.roles = roles
        }
    },
    actions: {
        //登录
        // promise 处理异步请求成功resolve 失败 reject，
        // 网络请求不能立即返回结果，我们将其传到另外一个函数里。在数据请求成功时，将数据通过传入的函数回调回去。
        Login({commit},userInfo){
            const rememberMe = userInfo.rememberMe
            return new Promise((resolve,reject) => {
                login(userInfo.username,userInfo.password).then(res => {
                    setToken(res.token,rememberMe)
                    commit("SET_TOKEN",res.token)
                    //setUserInfo(res.user, commit)
                    resolve()
                }).catch(
                    err =>{
                        reject(err)
                    }
                )
            })
            
        },

        // 获取用户信息，用作动态路由
        GetInfo({ commit }) {
            return new Promise((resolve, reject) => {
                getInfo().then(res => {
                    setUserInfo(res, commit)
                    resolve(res)
                }).catch(error => {
                    reject(error)
                })
            })
        },
        // 登出
        LogOut({ commit }) {
            return new Promise((resolve, reject) => {
                logout().then(res => {
                    logOut(commit)
                    resolve()
                }).catch(error => {
                    logOut(commit)
                    reject(error)
                })
            })
        }
    },
    getters: {
    }

})


const logOut = (commit) => {
    commit('SET_TOKEN', '')
    commit('SET_ROLES', [])
    removeToken()
}

const setUserInfo = (user, commit) => {
    // 如果没有任何权限，则赋予一个默认的权限，避免请求死循环
    if (user.roles.length === 0) {
        commit('SET_ROLES', ['ROLE_SYSTEM_DEFAULT'])
    } else {
        commit('SET_ROLES', user.roles)
    }
    commit('SET_USER', user.user)
}
