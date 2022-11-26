<template>
  <div style="height: 100%">
    <el-container style="height: 100%">
      
      <!-- 侧边栏 -->
      <el-aside width="205px" >
        <el-menu>
            <el-submenu :index="item.name" v-for="item in menuList" :key="item.id">
                 <template slot="title">
                  <svg-icon slot="prefix" :icon-class="item.meta.icon"/>
                  {{item.meta.title}}
                 </template>
                 <el-menu-item :index="child.name" v-for="child in item.children" :key="item.id"  @click="selectMenu(item.path, child.path)">
                  <template slot="title">
                  <svg-icon slot="prefix" :icon-class="child.meta.icon"/>
                  <!-- 两个花括号取值？ -->
                  {{child.meta.title}}
                  </template>
                 </el-menu-item>
            </el-submenu> 
        </el-menu>

        <!-- <el-menu text-color="#bfcbd9" class="sidebar-container" style="text-align: left">
          <el-submenu :index="item.name" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <svg-icon slot="prefix" :icon-class="item.meta.icon"/>
              {{item.meta.title}}
            </template>
            <el-menu-item :index="child.name" v-for="child in item.children" :key="item.id" style="padding-left: 40px" @click="selectMenu(item.path, child.path)">
              <template slot="title">
                <svg-icon slot="prefix" :icon-class="child.meta.icon"/>
                {{child.meta.title}}
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu> -->
      </el-aside>

      <el-container>
        <!-- 头部导航栏 -->
        <el-header style="text-align: right">
          <el-dropdown>
            <i class="el-icon-setting" style="margin-right: 15px"></i>
            <span>Jeff</span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>个人信息</el-dropdown-item>
              <el-dropdown-item @click.prevent.native="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-header>

        <!-- 主界面 -->
        <el-main>
          <router-view></router-view>
        </el-main>
      
      </el-container>
    </el-container>
  </div>

</template>

<script>
import {removeToken} from "@/utils/auth";
import * as Config from "@/settings";
import Cookies from "js-cookie";
import {getInfo, logout} from "@/api/login";
import store from "../store";

export default {
  name: "Dashboard",
  created() {
    this.getMenus()
    console.log(Cookies.get(Config.TokenKey))
    this.getUserInfo()
  },
  methods: {
    getMenus() {
      this.$request.get('api/menus/build').then(res => {
        console.log(res)
        this.menuList = res
      })
    },
    logout() {
      this.$store.dispatch('LogOut').then(() =>{
        this.$router.replace('/login')
      })
    },
    selectMenu(path1, path2) {
      this.$router.replace(path1 + '/' + path2).catch(err=>err)
    },
    // 只是获取当前用户信息，并将它存放到store中
    // 调用login中的getInfo方法
    getUserInfo(){
      // getInfo().then(res => [
      //   console.log(res)
      // ])
      this.$store.dispatch('GetInfo').then( ()=>{
         console.log(store.state.roles)
      })
    }
  },
  data() {
    return {
      tableData: [],
      multipleSelection: [],
      menuList: []
    }
  }
}
</script>

<style scoped>

</style>
