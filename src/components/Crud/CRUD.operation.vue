<template>
    <div class="crud-opts">
            <span class="left">
                <slot name="left"></slot>
                <el-button class="filter-item" 
                size="mini" 
                type="primary" 
                icon="el-icon-plus"  
                @click="crud.updateOperation('post')">
                    新增
                </el-button>
                <el-button class="filter-item" size="mini" type="success" icon="el-icon-edit" :disabled="crud.selectData.length !==1"  @click="crud.updateOperation('put')">
                    修改
                </el-button>
                <el-button class="filter-item" size="mini" type="danger" icon="el-icon-delete"  @click="crud.updateOperation('delete')">
                    删除
                </el-button>
                <el-button class="filter-item" size="mini" type="warning"  icon="el-icon-download">
                    导出
                </el-button>
                <slot name="right">
                    <el-button></el-button>
                </slot>
            </span>
        </div>
</template>

<script>
import {crud} from "@/components/Crud/crud" 

export default{
    mixins: [crud()]
}
</script>