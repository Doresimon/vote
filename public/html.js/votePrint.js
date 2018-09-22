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
                left:[],
                right:[],
            },
        },
        other: [],
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
            extraTicket:{},
        },
        user:{
            name:"",
            role:"",
        },
        ticketStat:{
            here: "",
            total: 0,
            valid: 0,
            invalid: 0,
        },
        print:{
            type: 1,
            selectValue: '',
            showSelect: false,
        },
        ticketSum:[],
        staticTicketList:[],
        ticketList:[],
        today:"",
        order:true,
        busy: false,
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
                _this.staticTicketList = response.data.ticketList

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
        calTicketStat () {
            this.ticketStat.total = this.ticketList.length
            this.ticketStat.valid = 0
            this.ticketStat.invalid = 0

            for (let i = 0; i < this.ticketList.length; i++) {
                if (this.ticketList[i].total>0 && 
                    this.ticketList[i].total<=this.vote.num.target) {
                    this.ticketStat.valid++
                }else{
                    this.ticketStat.invalid++
                }
            }

            let tmp = this.vote.extraTicket[this.vote.participant[0]]

            // add extra
            this.ticketStat.total += tmp.approve + tmp.reject + tmp.giveup
            this.ticketStat.valid += tmp.approve + tmp.reject + tmp.giveup
        },
        calTicketSum () {
            let sum = []
            for (let i = 0; i < this.vote.participant.length; i++) {
                let cnt = 0
                let cntGiveUp = 0
                let cntReject = 0
                for (let j = 0; j < this.ticketList.length; j++) {
                    if (this.ticketList[j].total>0 && this.ticketList[j].total<=this.vote.num.target) {
                        // cnt +=  Math.floor( (this.ticketList[j].value[i]+1)/2 )
                        switch (this.ticketList[j].value[i]) {
                            case 1:
                                cnt++
                                break;
                            case 0:
                                cntGiveUp++
                                break;
                            case -1:
                                cntReject++
                                break;
                        
                            default:
                                break;
                        }
                    }
                }
                // sum[i] = cnt
                sum[i] = {
                    ID: i,
                    participant: this.vote.participant[i],
                    cnt: cnt,
                    cntGiveUp: cntGiveUp,
                    cntReject: cntReject,
                    order: -1,
                    status: -1,
                }



            }
            // add extra ticket result
            for (let i = 0; i < sum.length; i++) {
                // sum[i].extraCnt = this.vote.extraTicket[sum[i].participant].approve
                sum[i].cnt += this.vote.extraTicket[sum[i].participant].approve
                sum[i].cntGiveUp += this.vote.extraTicket[sum[i].participant].giveup
                sum[i].cntReject += this.vote.extraTicket[sum[i].participant].reject
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
                }
            }

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
        setExecuter(executer) {
            let _this = this
            _this.ticketList = []
            
            // let exec = executer=="admin" ? "boss":executer

            console.log(executer)
            if (executer!=undefined && executer!="admin") {
                _this.staticTicketList.forEach(element => {
                    console.log(element.executer)

                    if (element.executer==executer) {
                        _this.ticketList.push(element)
                    }
                });
            }else{
                _this.ticketList = _this.staticTicketList
            }
            this.calTicketStat()
            this.calTicketSum()
            this.setPrintData()
            this.setOtherData()
        },
        setPrintData() {
            console.log("setPrintData()")

            if (this.print.type=="result") {
                this.ticketSum.sort(this.asc_ID)
            }else{
                this.ticketSum.sort(this.desc_cnt)
            }

            this.table.printData.left = []
            this.table.printData.right = []
            let border = this.ticketSum.length/2
            for (let i = 0; i < this.ticketSum.length; i++) {
                const e = this.ticketSum[i];
                let tmp = {
                    ID: i+1,
                    participant: this.vote.participant[e.ID],
                    cnt: e.cnt,
                    cntGiveUp: e.cntGiveUp,
                    cntReject: e.cntReject,
                }
                if (i < border ) {
                    this.table.printData.left.push(tmp)
                }else{
                    this.table.printData.right.push(tmp)
                }

            }
        },
        setOtherData() {
            console.log("setOtherData()")

            let other = {}
            for (let i = 0; i < this.ticketList.length; i++) {
                if (this.ticketList[i].total>0 && 
                    this.ticketList[i].total<=this.vote.num.target && 
                    this.ticketList[i].other!=undefined) {
                    for (let j = 0; j < this.ticketList[i].other.length; j++) {
                        if (other[this.ticketList[i].other[j]]==undefined) {
                            other[this.ticketList[i].other[j]] = 0
                        }
                        other[this.ticketList[i].other[j]]++
                    }
                }
            }

            let sortOther = []
            for (const key in other) {
                let tmp = {
                    name:   key,
                    cnt:    other[key],
                }
                sortOther.push(tmp)
            }
            sortOther.sort(this.desc_cnt)
            this.table.printOtherData.left = []
            this.table.printOtherData.right = []
            for (let i = 0; i < sortOther.length; i++) {
                if (i>=6) {
                    break
                }
                if(i<3){
                    this.table.printOtherData.left.push(sortOther[i])
                }else{
                    this.table.printOtherData.right.push(sortOther[i])
                }
            }
        },
        changeType () {
            if (this.print.type=='report') {
                this.print.selectValue = "admin"
                this.setExecuter(this.print.selectValue)
            }
        },
        callPrint () {
            window.print()
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
        // this.print.type =   func.getParam("type")
        
        this.print.type =   "result"
        this.vote.ID    =   func.getParam("voteID")
        this.user.name  =   func.getCookie('name')
        this.user.role  =   func.getCookie('role')

        console.log("name", this.user.name)

        if (this.user.role == "admin") {
            this.print.selectValue = "admin"
        }else{
            this.print.selectValue = this.user.name
        }

        await this.getVoteInfo()
        await this.getTicketList()
        this.calTicketStat()
        this.calTicketSum()
        this.setPrintData()
        this.setOtherData()


        let d = new Date()
        this.today = d.getFullYear() + '年' + (d.getMonth()+1) + '月' + d.getDate() + '日'
        
    }
  })