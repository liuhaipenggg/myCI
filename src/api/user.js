import request from '@/utils/request'

export function del(ids){
    return request({
        url: 'api/users',
        method: 'del',
        data: ids
    })
}
