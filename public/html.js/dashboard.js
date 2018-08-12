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
            participant:[],
        },
        voteList:[],
    },
    methods: {
        addVote: function () {
            let _this = this
            _this.busy = true
            let ele = "#MODAL-ADD-VOTE"
            let D = _this.add
 
            axios.post('/api/vote/addVote', D)
            .then(function (response) { // handle success
                console.log(response.data);
                _this.closeModal(ele)
            })
            .catch(function (error) {   // handle error
                console.log(error);
            })
            .then(function () {         // always executed
                _this.busy = false
                _this.getVoteList()
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
        jump: function (ID) {
            // func.jump("voteManage.html?voteID="+ID)
            func.jumpNew("voteManage.html?voteID="+ID)
        },
        callModal: function (ele) {
            $(ele).modal("show")
        },
        closeModal: function (ele) {
            $(ele).modal("hide")
        },
    },
    created: function () {
        this.getVoteList()
    }
  })