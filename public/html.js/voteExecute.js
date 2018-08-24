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
        tictok: null,
    },
    methods: {
        callModal (ele) {
            this.setAllTicket(1)
            $(ele).modal("show")
        },
        closeModal (ele) {
            $(ele).modal("hide")
        },
        getVoteInfo () {
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
        addTicket () {
            let _this = this
            let ele = "#MODAL-ADD-TICKET"
            let D = {
                ID: _this.vote.ID,
                add: _this.add,
            }
            console.log(D)
            _this.busy = true

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
        getTicketList () {
            let _this = this
            let D = {
                ID:_this.vote.ID
            }
            _this.busy = true

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
        toggleTicket (i) {
            // Vue.set
            let v = this.add.value[i]==1 ? 0:1
            Vue.set(this.add.value, i, v)
            this.add.total += (v-0.5)*2
            console.log(this.add.value[i])
        },
        setAllTicket (v) {
            for (let i = 0; i < this.vote.participant.length; i++) {
                Vue.set(this.add.value, i, v)
            }
            this.add.total = 0
            for (let i = 0; i < this.add.value.length; i++) {
                this.add.total += this.add.value[i]
            }
            console.log(this.add.value)
        },
        calTicketSum () {
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
                    order: -1,
                    status: -1,
                }
            }
            sum.sort(this.desc_cnt)
            for (const i in sum) {
                sum[i].order = i
            }
            let end = sum[this.vote.num.target-1]
            let endnext = sum[this.vote.num.target]
            let d = end.cnt == endnext.cnt ? 0 : 1
            let c = 0
            for (const i in sum) {
                if (sum[i].cnt > end.cnt) {     //当选
                    sum[i].status = 1
                }
                if (sum[i].cnt == end.cnt) {    //平票
                    sum[i].status = d
                    // c += (i >= this.vote.num.target-1) ? 1 : 0
                }
            }
            // if (c > 0) {
            //     end.status = 1
            // }

            sum.sort(this.asc_ID)
            this.ticketSum = sum
            this.sortTicketSum()
        },
        toggleSortTicketSum() {
            this.order = !this.order
            this.sortTicketSum()
        },
        sortTicketSum() {
            this.ticketSum.sort(this.order ? this.asc_ID:this.desc_cnt)
        },
        asc_ID (x, y) {
            if (x.ID < y.ID) { return -1;
            } else if (x.ID > y.ID) { return 1;
            } else { return 0;
            }
        },
        desc_cnt (x, y) {
            if (x.cnt < y.cnt) { return 1;
            } else if (x.cnt > y.cnt) { return -1;
            } else { 
                if (x.ID < y.ID) { return -1;
                } else if (x.ID > y.ID) { return 1;
                } else { return 0;
                }
            }
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
        async refreshInfo(){
            console.log("refreshInfo()")
            await this.getTicketList()
            this.calTicketSum()
        },
        toggleRefresh(){
            this.refreshInfo()

            if (this.tictok == null) {
                this.tictok = setInterval("app.refreshInfo()",10000)
                console.log("ON")
            } else {
                window.clearInterval(this.tictok)
                this.tictok = null
                console.log("OFF")
            }
        },
        // refreshOFF(){
        //     this.tictok = window.clearInterval(this.tictok)
        //     this.tictok = null
        // },
    },
    created: async function () {
        this.vote.ID = func.getParam("voteID")
        this.user.name = func.getCookie('name')

        await this.getVoteInfo()
        await this.getTicketList()
        this.setAllTicket(1)
        this.calTicketSum()
        if (this.user.name == "boss") {
            this.tictok = setInterval("app.refreshInfo()",10000) //auto refresh
        }
    }
  })