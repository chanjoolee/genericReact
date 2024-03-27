import {message as antMsg} from 'antd';
import axios from 'axios';

const BASE_URL =  process.env.REACT_APP_BASE_URL;

export default function callApi(
    {
        url,
        method = 'get',
        params,
        data,
        responseType = 'json',
        isLoding = true,
        goErrorPageWhenFaild = false,
    },
    config
){
    let api_url = BASE_URL + '' + url;
    return axios({
        method: method,
        url: api_url,
        params,
        data,
        isLoding,
        goErrorPageWhenFaild,
        responseType,
        header : {
            'Content-Type': 'application/json;charset=UTF-8',
            'Access-Control-Allow-Origin': '*'
        },
        withCredentials: true ,
        ...config
    })
    .then((response) => {
        console.log('response : ' , response);
        const {payload , resultCode , message } = response.data;
        

        return {
            isSuccess: true,
            data: response.data , 
            resultCode : response.status,
            message : response.statusText ,
            response,
        };
    })
    // .catch((error) => {
    //     if (error.response === undefined) {
            
    //     }
    // })
}

export const ResultCode = {
    Success: 0
}