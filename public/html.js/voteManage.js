Vue.use(VueTables.ClientTable);

var app = new Vue({
    el: '#app',
    data: {
        vote:{
            ID: 0,
            date:"",
            title:"",
            num:{
                executer: 1,
                participant: 1,
                target: 1,
            },
        },
        user:{
            name:"",
        },
        busy: false,
        add: {
            participantStr:"",
            participants:[],
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
        this.vote.ID = func.getParam(voteID)
    }
  })