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
        add: {
            title:"",
            num:{
                executer: 1,
                participant: 1,
                target: 1,
            },
        },
        voteList:[],
    },
    methods: {
        addVote: function () {
            let _this = this
            _this.busy = true

            let D = _this.add
 
            axios.post('/api/vote/addVote', D)
            .then(function (response) { // handle success
                console.log(response.data);
            })
            .catch(function (error) {   // handle error
                console.log(error);
            })
            .then(function () {         // always executed
                _this.busy = false
            });
        },
        getVoteList: function () {
            let _this = this
            _this.busy = true

            let D = {}
 
            axios.post('/api/vote/getVoteList', D)
            .then(function (response) { // handle success
                console.log(response.data);
                _this.voteList = response.data.voteList
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
        this.getVoteList()
    }
  })