import request from '@/utils/request'
import qs from 'qs'

// 拿初始数据
export function initData(url,params){
    return request({
        url: url + '?' + qs.stringify(params,{ indices: false }),
        method: 'get'
    })    
}
  