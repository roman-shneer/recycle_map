import axios from 'axios';
const axiosPro = { 
    get: function (url,params, callback) { 
        axios
            .get(url + '?' + new URLSearchParams(params).toString())
            .then(callback)
    },
    post: function (url, params, callback) { 
        axios.post(url, params)
            .then(callback)
    },
    put: function (url, params, callback) { 
        axios.put(url, params)
            .then(callback)
    },
    delete: function (url, params, callback) { 
        axios
            .delete(url+ '?' + new URLSearchParams(params).toString())
            .then(callback)
    },    
}

export default axiosPro