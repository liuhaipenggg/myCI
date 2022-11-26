import request from "../utils/request";

export function getChild(id){
    return request({
        url: 'api/menus/child?id='+id,
        method: 'get'
    })

}