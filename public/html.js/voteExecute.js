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
            title:"",       // 大会名称
            subtitle:"选举名称",    // 选举名称
            num:{
                executer: 1,
                participant: 1,
                target: 1,
                voter: 1,
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
        add: {
            ID:-1,
            executer:"",
            total:0,
            value:[],
            other:[],
            otherName:"",
        },
        ticketSum:[],
        ticketList:[],
        order:  true,
        busy:   false,
        participantStr: "",
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
        colNum:4,
        addExtraStr: '',
    },
    methods: {
        callModal (ele) {
            this.add.other = []
            this.setAllTicket(1)
            $(ele).modal("show")
        },
        closeModal (ele) {
            $(ele).modal("hide")
        },
        getVoteInfo () {
            let _ = this
            _.busy = true

            let D = {
                ID:_.vote.ID
            }
 
            let p = new Promise(function (resolve, reject){

            axios.post('/api/vote/getVoteInfo', D)
            .then(function (response) { // handle success
                console.log(response.data);
                _.vote = JSON.stringify(response.data.vote)=="{}" ? _.vote:response.data.vote
                _.vote.num.executer = parseInt(_.vote.num.executer);
                _.vote.num.participant = parseInt(_.vote.num.participant);
                _.vote.num.target = parseInt(_.vote.num.target);
                _.vote.num.voter = parseInt(_.vote.num.voter);
                
                let str = ''
                _.vote.participant.forEach(element => {
                    str += element.substring(0,1)
                });
                _.table.options.headings['participant'] = str
                
                _.setFilter()

                _.$notify({
                    title: '选票信息',
                    message: '参选人 ' + _.vote.participant.length + ' 人',
                    type: 'info'
                  });
                
                resolve(true)
            })
            .catch(function (error) {   // handle error
                console.log(error);
            })
            .then(function () {         // always executed
                _.busy = false
            });

            })
            return p
        },
        addOther () {
            this.add.otherName = this.add.otherName.trim()
            if (this.participantStr.includes(this.add.otherName) || this.add.other.includes(this.add.otherName)) {
                this.$notify({title: '无法添加', message: '该候选人已存在', type: 'danger'});
                this.add.otherName = ""
                return
            }
            this.add.other.push(this.add.otherName)
            this.add.total++
            this.add.otherName = ""
            return 
        },
        addTicket () {
            let _this = this
            if (_this.busy) {return}
            _this.busy = true
            
            let ele = "#MODAL-ADD-TICKET"
            let D = {
                ID: _this.vote.ID,
                add: _this.add,
            }

            axios.post('/api/vote/addTicket', D)
            .then(function (response) { // handle success
                if (response.data.code==='blocked') return;

                console.log(response.data);
                _this.add.ID = response.data.code.ID
                _this.add.executer = response.data.code.executer

                let v = []
                for (let i = 0; i < _this.add.value.length; i++) {
                    v[i] = _this.add.value[i];
                }
                let o = []
                for (let i = 0; i < _this.add.other.length; i++) {
                    o[i] = _this.add.other[i];
                }
                let tmp = {
                    ID: _this.add.ID,
                    executer: _this.add.executer,
                    total: _this.add.total,
                    value: v,
                    other: o,
                }
                _this.ticketList.push(tmp)
                _this.table.data.push(tmp)

                _this.calTicketSum()
                _this.closeModal(ele)

                _this.$notify({
                    title: '新增选票成功',
                    message: '赞成 ' + _this.add.total + '人',
                    type: 'success'
                  });
            })
            .catch(function (error) {   // handle error
                console.log(error);
            })
            .then(function () {         // always executed
                // console.log("Finally")
                _this.busy = false
            });

        },
        removeTicketConfirm (row) {
            let _this= this
            _this.$confirm('此操作将删除'+row.ID+'号投票, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              }).then(() => {
                _this.removeTicket(row)
              }).catch(() => {
                _this.$notify({
                    title: '已取消删除',
                    message: '~',
                    type: 'info'
                  });  
              });
        },
        removeTicket (row) {
            let _this = this
            if (_this.busy) {return}
            _this.busy = true
            
            let D = {
                VoteID: _this.vote.ID,
                TicketID:row.ID,
            }

            axios.post('/api/vote/removeTicket', D)
            .then(function (response) { // handle success
                console.log(response.data);

                _this.$notify({
                    title: '移除选票成功',
                    message: '页面即将刷新, 请勿操作.',
                    type: 'warning'
                  });

                app.refreshInfo()
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
                if (response.data.ticketList.length == _this.ticketList.length) {
                    resolve(true)
                    return
                }

                _this.ticketList = response.data.ticketList
                _this.table.data = []
                _this.ticketList.forEach(element => {
                    let tmp = {}
                    tmp.ID = element.ID
                    tmp.executer = element.executer
                    tmp.total = element.total
                    tmp.value = element.value
                    tmp.other = element.other

                    _this.table.data.push(tmp)
                });

                _this.$notify({
                    title: '选票统计',
                    message: '当前共计 ' + _this.ticketList.length + ' 张选票',
                    type: 'info'
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
            switch (this.add.value[i]) {
                case -1:
                    v = 1
                    d = 1
                    break;
                case 0:
                    v = -1
                    d = 0
                    break;
                case 1:
                    v = 0
                    d = -1
                    break;
            
                default:
                    break;
            }
            // switch (this.add.value[i]) {
            //     case -1:
            //         v = 0
            //         d = 0
            //         break;
            //     case 0:
            //         v = 1
            //         d = 1
            //         break;
            //     case 1:
            //         v = -1
            //         d = -1
            //         break;
            
            //     default:
            //         break;
            // }
            
            // Vue.set
            Vue.set(this.add.value, i, v)
            this.add.total += d
            console.log(this.add.value[i])
        },
        setAllTicket (v) {
            for (let i = 0; i < this.vote.participant.length; i++) {
                Vue.set(this.add.value, i, v)
            }
            this.add.total = 0
            for (let i = 0; i < this.add.value.length; i++) {
                this.add.total += Math.floor( (this.add.value[i]+1)/2 )
            }
            this.add.total += this.add.other.length
            console.log(this.add.value)
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
                    pureCnt: cnt,
                    extraCnt: cnt,
                    order: -1,
                    status: -1,
                }
            }

            // add extra ticket result
            for (let i = 0; i < sum.length; i++) {
                sum[i].extraCnt = this.vote.extraTicket[sum[i].participant].approve
                sum[i].cnt += sum[i].extraCnt
            }

            sum.sort(this.desc_cnt)
            for (const i in sum) {
                sum[i].order = i
            }
            let end = sum[this.vote.num.target-1]
            let endnext = sum[this.vote.num.target]
            let d = end.cnt == endnext.cnt ? 0 : 1
            
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
            // let d = row.total - this.vote.num.target
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
            if (this.sw.auto.refresh.tictok == null) {
                this.refreshInfo()
                this.sw.auto.refresh.tictok = setInterval("app.refreshInfo()",10000)
                console.log("ON")
            } else {
                window.clearInterval(this.sw.auto.refresh.tictok)
                this.sw.auto.refresh.tictok = null
                console.log("OFF")
            }
        },
        jump (ID) {
            func.jumpNew("votePrint.html?voteID="+ID)
        },
        parseExtraStr () {
            let _this = this
            let str = _this.addExtraStr

            let tab = String.fromCharCode(9)
            let enter = String.fromCharCode(10)

            let all = str.split(enter);
            let extraTicket = {}

            for (let i = 1; i < all.length; i++) {
                all[i] = all[i].trim()

                let line = all[i].split(tab)

                if (line[0]=="姓名"||line.length<4) {
                    continue
                }

                for (let c = 0; c < line.length/4; c++) {
                    
                    let tmp = {}
                    tmp.name = line[4*c+0].replace(/\s+/g,'')
                    tmp.approve = parseInt(line[4*c+1])
                    tmp.reject = parseInt(line[4*c+2])
                    tmp.giveup = parseInt(line[4*c+3])

                    extraTicket[tmp.name] = tmp
                }       

            }

            _this.vote.extraTicket = extraTicket
        },
        addExtraTicket () {
            let _this = this
            if (_this.busy) {return}
            _this.busy = true
            
            let ele = "#MODAL-ADD-EXTRA-TICKET"
            let D = {
                ID: _this.vote.ID,
                extraTicket: _this.vote.extraTicket,
            }

            axios.post('/api/vote/addExtraTicket', D)
            .then(function (response) { // handle success
                console.log(response.data);
                _this.$notify({
                    title: '导入选票成功',
                    message: '页面即将刷新, 请勿操作.',
                    type: 'warning'
                  });

                // app.refreshInfo()
                location.reload()
            })
            .catch(function (error) {   // handle error
                console.log(error);
            })
            .then(function () {         // always executed
                _this.closeModal(ele)
                _this.busy = false
            });
        },
    },
    created: async function () {
        this.vote.ID    =   func.getParam("voteID")
        this.user.name  =   func.getCookie('name')
        this.user.role  =   func.getCookie('role')

        await this.getVoteInfo()
        await this.getTicketList()
        this.setAllTicket(1)
        this.calTicketSum()
        // this.colNum = this.vote.num.participant <= 20 ? 2:3
        this.participantStr = this.vote.participant.join(".")
        if (this.user.role == "admin") {
            this.sw.show.btn.addTicket  =   true
            this.sw.show.btn.refresh    =   true
            this.sw.show.btn.print      =   true
            this.sw.auto.refresh.tictok =   setInterval("app.refreshInfo()",10000)
        }else{
            this.sw.show.btn.addTicket  =   true
            this.sw.show.btn.refresh    =   false
            this.sw.show.btn.print      =   true
            this.sw.auto.refresh.tictok =   null
        }
    }
  })