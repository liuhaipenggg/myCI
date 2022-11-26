<template>
  <div class="login" :style="'background-image:url('+ Background+');'">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" label-position="left" label-width="0px" class="login-form">
      <h3 class="title">我的el-admin</h3>
    <el-form-item prop="username">
      <el-input v-model="loginForm.username" type="text" auto-complete="off" placeholder="请输入账号"></el-input>
    </el-form-item>
    <el-form-item prop="password">
        <el-input v-model="loginForm.password" type="password" auto-complete="off" placeholder="密码"></el-input>
    </el-form-item>
    <el-checkbox v-model="loginForm.rememberMe" style="margin:0 0 25px 0;">
        记住我
    </el-checkbox>
    <el-form-item style="width:100%;">
        <el-button :loading="loading" size="medium" type="primary" style="width:100%;" @click.native.prevent="handleLogin">
          <span v-if="!loading">登 录</span>
          <span v-else>登 录 中...</span>
        </el-button>
    </el-form-item>
    </el-form>
  </div>
</template>

<script>
import Background from '@/assets/images/background.jpeg'
import {encrypt} from "@/utils/rsaEncrypt"
import request from '@/utils/request'
import Cookies from 'js-cookie'
import Config from '@/settings'

export default{
  name: 'Login',
  data(){
    return{
      Background: Background,
      loginForm: {
        username: '',
        password: '',
        rememberMe: false,
      },
      loginRules: {
        username: [{required: true, trigger: 'blur', message: '用户名不能为空'}],
        password: [{required: true, trigger: 'blur', message: '密码不能为空'}],
      },
      loading: false
    }
  },
  created(){
    this.getCookie()
    console.log(Cookies.get(Config.TokenKey))
  },
  methods: {
    getCookie(){
      console.log(Cookies)
      const username = Cookies.get('username')
      let password = Cookies.get('password')
      const rememberMe = Cookies.get('rememberMe')
      this.cookiePass = password === undefined ? '' : password
      password = password === undefined ? this.loginForm.password : password
      this.loginForm ={
        username: username === undefined ? this.loginForm.username : username,
        password: password,
        rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
      }
    },
    handleLogin(){
      this.$refs.loginForm.validate(valid =>{
        const user = {
          username: this.loginForm.username,
          password: this.loginForm.password,
          rememberMe: this.loginForm.rememberMe
        }
        if (user.password !== this.cookiePass) {
          user.password = encrypt(user.password)
        }
        console.log(user.rememberMe)
        if(valid){
          this.loading = true
          if(user.rememberMe){
            Cookies.set('username', user.username, { expires: Config.passCookieExpires })
            Cookies.set('password',user.password,{ expires: Config.passCookieExpires })
            Cookies.set('rememberMe',user.rememberMe,{ expires: Config.passCookieExpires })
          }else{
            Cookies.remove('username')
            Cookies.remove('password')
            Cookies.remove('rememberMe')
          }
          // request.post('auth/login',user).then(res => {
          // // console.log(res)
          // this.$router.push('/')
          // })
          this.$store.dispatch('Login',user).then(res => {
            this.loading = false
            this.$router.push('/')
          }).catch(err => {
            this.loading = false
          })
          
        }else alert("请完善")
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
  .login {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    background-size: cover;
  }
  .title {
    margin: 0 auto 30px auto;
    text-align: center;
    color: #707070;
  }

  .login-form {
    border-radius: 6px;
    background: #ffffff;
    width: 385px;
    padding: 25px 25px 5px 25px;
    .el-input {
      height: 38px;
      input {
        height: 38px;
      }
    }
    .input-icon{
      height: 39px;width: 14px;margin-left: 2px;
    }
  }
  .login-tip {
    font-size: 13px;
    text-align: center;
    color: #bfbfbf;
  }
  .login-code {
    width: 33%;
    display: inline-block;
    height: 38px;
    float: right;
    img{
      cursor: pointer;
      vertical-align:middle
    }
  }
</style>
