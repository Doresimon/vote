// Vue.use(VueTables.ClientTable);
// Vue.use(VueGoodTablePlugin);
// Vue.use(VueGoodTable);
// Vue.use(VueTables.ClientTable, [options = {}], [useVuex = false], [theme = 'bootstrap4'], [template = 'default']);

var app = new Vue({
    el: '#app',
    data: {
        table:{
            data:[],
            printData:{
                left:[],
                right:[],
            },
            printOtherData:{
                left:[{name:"___", cnt: "___"}],
                right:[{name:"___", cnt: "___"}],
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
            role:"",
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
        sw:{
            show:{
                btn:{
                    addTicket: true,
                    refresh: true,
                    print: true,
                }
            },
            auto:{
                refresh:{
                    tictok: null,
                }
            }
        },
    },
    methods: {
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
                if (response.data.ticketList.length == _this.ticketList.length) {
                    resolve(true)
                    return
                }

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
        calTicketSum () {
            let sum = []
            for (let i = 0; i < this.vote.participant.length; i++) {
                let cnt = 0
                for (let j = 0; j < this.ticketList.length; j++) {
                    if (this.ticketList[j].total>0 && this.ticketList[j].total<=this.vote.num.target) {
                        cnt +=  Math.floor( (this.ticketList[j].value[i]+1)/2 )
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
            // let c = 0
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
        setPrintData() {
            this.ticketSum.sort(this.desc_cnt)
            this.table.printData.left = []
            this.table.printData.right = []
            let border = this.ticketSum.length/2
            for (let i = 0; i < this.ticketSum.length; i++) {
                const e = this.ticketSum[i];
                let tmp = {
                    ID: i+1,
                    participant: this.vote.participant[e.ID],
                    cnt: e.cnt,
                }
                if (i < border ) {
                    this.table.printData.left.push(tmp)
                }else{
                    this.table.printData.right.push(tmp)
                }

            }
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
    },
    created: async function () {
        this.vote.ID    =   func.getParam("voteID")
        this.user.name  =   func.getCookie('name')
        this.user.role  =   func.getCookie('role')

        await this.getVoteInfo()
        await this.getTicketList()
        this.calTicketSum()
        this.setPrintData()
        // if (this.user.role == "admin") {
        //     this.sw.show.btn.addTicket  =   true
        //     this.sw.show.btn.refresh    =   true
        //     this.sw.show.btn.print      =   true
        //     this.sw.auto.refresh.tictok =   setInterval("app.refreshInfo()",10000)
        // }else{
        //     this.sw.show.btn.addTicket  =   true
        //     this.sw.show.btn.refresh    =   false
        //     this.sw.show.btn.print      =   false
        //     this.sw.auto.refresh.tictok =   null
        // }
    }
  })