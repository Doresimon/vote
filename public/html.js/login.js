Vue.use(VueTables.ClientTable);

// jQuery.noConflict();      //自定义一个比较短快捷方式

var app = new Vue({
    el: '#app',
    data: {
        user:{
            name:"",
            pass:"",
        },
        busy: false,
    },
    methods: {
        login: function () {
            var _this = this
            _this.busy = true

            let D = {
                name: _this.user.name,
                pass: _this.user.pass,
            }
 
            axios.post('/api/auth', D)
            .then(function (response) { // handle success
                console.log(response);
                if (response.data.ok) {
                    func.jump(response.data.url)
                }else{
                    alert("wrong password!")
                }
            })
            .catch(function (error) {   // handle error
                console.log(error);
            })
            .then(function () {         // always executed
                _this.busy = false
            });
        },
    },
    created: function () {
    }
  })