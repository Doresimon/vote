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
            ticket:[],
        },
        user:{
            name:"",
        },
        busy: false,
        add: {
            ID:-1,
            executer:"",
            total:0,
            value:[],
        },
        ticketSum:[],
        ticketList:[],
    },
    methods: {
        callModal: function (ele) {
            $(ele).modal("show")
        },
        closeModal: function (ele) {
            $(ele).modal("hide")
        },
        getVoteInfo: function () {
            let _this = this
            _this.busy = true

            let D = {
                ID:_this.vote.ID
            }
 
            let p = new Promise(function (resolve, reject){

            axios.post('/api/vote/getVoteInfo', D)
            .then(function (response) { // handle success
                console.log(response.data);
                _this.vote = JSON.stringify(response.data.vote)=="{}" ? _this.vote:response.data.vote
                resolve(true)
            })
            .catch(function (error) {   // handle error
                console.log(error);
            })
            .then(function () {         // always executed
                _this.busy = false
            });

            })
            return p
        },
        addTicket: function () {
            let _this = this
            _this.busy = true
            let ele = "#MODAL-ADD-TICKET"

            let D = {
                ID: _this.vote.ID,
                add: _this.add,
            }
            console.log(D)

            axios.post('/api/vote/addTicket', D)
            .then(function (response) { // handle success
                console.log(response.data);
                _this.add.ID = response.data.code.ID
                _this.add.executer = response.data.code.executer

                let v = []
                for (let i = 0; i < _this.add.value.length; i++) {
                    v[i] = _this.add.value[i];
                }
                let tmp = {
                    ID: _this.add.ID,
                    executer: _this.add.executer,
                    total: _this.add.total,
                    value: v,
                }

                _this.ticketList.push(tmp)
                _this.calTicketSum()
                _this.closeModal(ele)
            })
            .catch(function (error) {   // handle error
                console.log(error);
            })
            .then(function () {         // always executed
                _this.busy = false
            });

        },
        getTicketList: function () {
            let _this = this
            _this.busy = true

            let D = {
                ID:_this.vote.ID
            }
 
            let p = new Promise(function (resolve, reject){

            axios.post('/api/vote/getTicketList', D)
            .then(function (response) { // handle success
                console.log(response.data);
                _this.ticketList = response.data.ticketList
                resolve(true)
            })
            .catch(function (error) {   // handle error
                console.log(error);
            })
            .then(function () {         // always executed
                _this.busy = false
            });

            })
            return p
        },
        toggleTicket: function (i) {
            // Vue.set
            let v = this.add.value[i]==1 ? 0:1
            Vue.set(this.add.value, i, v)
            this.add.total += (v-0.5)*2
            console.log(this.add.value[i])
        },
        setAllTicket: function (v) {
            for (let i = 0; i < this.vote.participant.length; i++) {
                Vue.set(this.add.value, i, v)
            }
            this.add.total = 0
            for (let i = 0; i < this.add.value.length; i++) {
                this.add.total += this.add.value[i]
            }
            console.log(this.add.value)
        },
        calTicketSum: function (v) {
            let sum = []
            for (let i = 0; i < this.vote.participant.length; i++) {
                let cnt = 0
                for (let j = 0; j < this.ticketList.length; j++) {
                    if (this.ticketList[j].total>0 && this.ticketList[j].total<=this.vote.num.target) {
                        cnt += this.ticketList[j].value[i]
                    }
                }
                sum[i] = cnt
            }
            this.ticketSum = sum
        },
    },
    created: async function () {
        this.vote.ID = func.getParam("voteID")
        await this.getVoteInfo()
        await this.getTicketList()
        this.setAllTicket(1)
        this.calTicketSum()
    }
  })