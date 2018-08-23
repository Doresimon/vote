// Vue.use(VueTables.ClientTable);
// Vue.use(VueGoodTablePlugin);
// Vue.use(VueGoodTable);
// Vue.use(VueTables.ClientTable, [options = {}], [useVuex = false], [theme = 'bootstrap4'], [template = 'default']);

var app = new Vue({
    el: '#app',
    data: {
        table:{
            columns:['ID', 'percent', 'status', 'executer', 'participant'],
            options: {
                headings:{
                    percent:  '投票 / 参选',
                    status:   '状态',
                    executer: '计票人',
                    participant: '',
                },
                sortable: ['ID', 'percent', 'status', 'executer', 'participant'],
                filterable: ['ID', 'percent', 'status', 'executer', 'participant'],
                sortIcon:	{ base:'glyphicon', up:'glyphicon-chevron-up', down:'glyphicon-chevron-down', is:'glyphicon-sort' },
            },
            data:[],
            filter:{
                executer:[
                    {text: '2016-05-01', value: '2016-05-01'},
                    {text: '2016-05-01', value: '2016-05-01'},
                    {text: '2016-05-01', value: '2016-05-01'},
                ],
                status:[
                    {text: '有效', value: 0},
                    {text: '无效', value: 1},
                    {text: '弃权', value: 2},
                ],
            },
        },
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
        add: {
            ID:-1,
            executer:"",
            total:0,
            value:[],
        },
        ticketSum:[],
        ticketList:[],
        order:true,
        busy: false,
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
                
                let str = ''
                _this.vote.participant.forEach(element => {
                    str += element.substring(0,1)
                });
                _this.table.options.headings['participant'] = str
                
                _this.setFilter()
                
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
                // Vue.set(_this.ticketList, _this.ticketList.length + 1, tmp)
                _this.ticketList.push(tmp)
                _this.table.data.push(tmp)

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
                _this.table.data = []
                _this.ticketList.forEach(element => {
                    let tmp = {}
                    tmp.ID = element.ID
                    tmp.total = element.total
                    tmp.executer = element.executer
                    // tmp.participant = element.participant
                    tmp.value = element.value

                    _this.table.data.push(tmp)
                });

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
                // sum[i] = cnt
                sum[i] = {
                    ID: i,
                    participant: this.vote.participant[i],
                    cnt: cnt,
                }
            }
            this.ticketSum = sum
        },
        sortTicketSum() {
            let asc_ID = function (x, y) {
                if (x.ID < y.ID) { return -1;
                } else if (x.ID > y.ID) { return 1;
                } else { return 0;
                }
            }
            let desc_cnt = function (x, y) {
                if (x.cnt < y.cnt) { return 1;
                } else if (x.cnt > y.cnt) { return -1;
                } else { 
                    if (x.ID < y.ID) { return -1;
                    } else if (x.ID > y.ID) { return 1;
                    } else { return 0;
                    }
                }
            }
            this.ticketSum.sort(this.order ? desc_cnt:asc_ID)
            this.order = !this.order
        },
        setFilter () {
            var _this = this
            _this.table.filter.executer = []
            this.vote.executer.forEach(ee => {
                _this.table.filter.executer.push(
                    {
                        text:ee,
                        value:ee,
                    }
                )
            });
        },
        filterHandler(value, row, column) {
            const property = column['property'];
            return row[property] === value;
        },
        filterHandler_status(value, row) {
            let d = row.total - this.vote.num.target
            let v = 0
            if (row.total > 0 && row.total <= this.vote.num.target) 
            { v = 0 } //有效
            if (row.total > this.vote.num.target) { v = 1 } //无效
            if (row.total == 0) { v = 2 } // 弃权
            return v === value;
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