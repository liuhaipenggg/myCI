import request from "../utils/request";

export function getChild(id){
    return request({
        url: 'api/menus/child?id='+id,
        method: 'get'
    })

}

export function del(ids){
    return request({
        url: 'api/roles',
        method: 'delete',
        data: ids
    })
}

// export function getDeptSuperior(ids){
//     // 将值变成数组
//     //             是数组吗             数组长度为0也直接返回 
//     const data = Array.isArray(ids) || ids.length === 0 ? ids : Array.of(ids)
//     return request({
//         url: 'api/menus/superior',
//         method: 'post',
//         data
//     })
// }