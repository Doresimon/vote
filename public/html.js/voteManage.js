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
            participant:[],
            executer:[],
        },
        user:{
            name:"",
        },
        busy: false,
        add: {
            participantStr:"",
            participant:[],
        },
        voteList:[],
    },
    methods: {
        callModal: function (ele) {
            $(ele).modal("show")
        },
        closeModal: function (ele) {
            $(ele).modal("hide")
        },
        parse: function () {
            let _this = this
            let str = _this.add.participantStr

            let all = str.split(",");
            for (let i = 0; i < all.length; i++) {
                all[i] = all[i].trim()
                if (all[i]!='') {
                    _this.add.participant.push(all[i])
                }
            }
            
            console.log(_this.add.participant)
        },
        addParticipant: function () {
            let _this = this
            _this.busy = true
            let ele = "#MODAL-ADD-PARTICIPANT"

            let D = {
                ID: _this.vote.ID,
                participant: _this.add.participant,
            }

            axios.post('/api/vote/addParticipant', D)
            .then(function (response) { // handle success
                console.log(response.data);
                _this.getVoteInfo()
                _this.closeModal(ele)
                _this.add.participantStr = ""
                _this.add.participant = []
            })
            .catch(function (error) {   // handle error
                console.log(error);
            })
            .then(function () {         // always executed
                _this.busy = false
            });

        },
        getVoteInfo: function () {
            let _this = this
            _this.busy = true

            let D = {
                ID:_this.vote.ID
            }
 
            axios.post('/api/vote/getVoteInfo', D)
            .then(function (response) { // handle success
                console.log(response.data);
                _this.vote = JSON.stringify(response.data.vote)=="{}" ? _this.vote:response.data.vote
            })
            .catch(function (error) {   // handle error
                console.log(error);
            })
            .then(function () {         // always executed
                _this.busy = false
            });
        },
        jump: function (ID) {
            func.jumpNew("voteExecute.html?voteID="+ID)
        },
    },
    created: function () {
        this.vote.ID = func.getParam("voteID")
        this.getVoteInfo()
    }
  })