<template>
  <v-container grid-list-sm>
    <v-layout row wrap>
      <v-flex xs2 class="text-xs-left" align-start>
        <div class="font-big"><span>计票</span></div>
      </v-flex>
      <v-flex xs7 class="text-xs-left">
        <info-panel :vote="vote"></info-panel>
      </v-flex>
      <v-flex xs1 v-if="user.role === 'executer'">
        <v-btn color="black" class="btn-big" fab outline @click="openDialog()">
          <v-icon>add</v-icon>
        </v-btn>
        <p>添加一张选票</p>
      </v-flex>
      <v-flex xs1 v-if="user.role === 'admin'">
        <v-btn
          :color="sw.auto.refresh.tictok === null ? 'black' : 'green'"
          class="btn-big"
          fab
          outline
          @click="toggleRefresh()"
        >
          <v-icon>refresh</v-icon>
        </v-btn>
        <p>开启/关闭自动刷新</p>
      </v-flex>
      <v-flex xs1 v-if="user.role === 'admin'">
        <v-btn color="black" class="btn-big" fab outline @click="jump(vote.ID)">
          <v-icon>print</v-icon>
        </v-btn>
        <p>打印结果</p>
      </v-flex>
      <!-- name list -->
      <v-flex xs12>
        <v-layout row wrap>
          <v-flex xs12 class="text-xs-left">
            <span class="font-size-32px mouse">
              候选人: {{ vote.participant.length }} 人
            </span>

            <v-icon large color="green darken-2" @click="toggleSortTicketSum()">
              swap_vert
            </v-icon>
          </v-flex>
          <v-flex xs1 v-for="(v, i) in ticketSum" :key="'0001' + i">
            <v-chip :class="`${statusToColor[v.status]}`">
              <v-avatar class="black white--text">
                {{ ("" + (v.ID + 1)).padStart(2, "0") }}
              </v-avatar>
              <span class="span-inline width-40 text-xs-left">
                {{ v.participant }}
              </span>
              <span class="span-inline width-30 text-xs-left">
                {{ v.cnt }} 票
              </span>
            </v-chip>
          </v-flex>
        </v-layout>
      </v-flex>
      <v-flex xs12>
        <v-layout row wrap>
          <v-flex xs12 class="text-xs-left">
            <h3>
              选票: 总计{{ ticketList.length }}张.
              <span><v-icon color="black">star</v-icon>=赞成</span>,
              <span><v-icon color="red accent-4">star</v-icon>=不赞成</span>,
              <span><v-icon color="black">star_border</v-icon>=弃权</span>
            </h3>
          </v-flex>
          <v-flex xs12>
            <v-data-table
              :headers="table.headers"
              :items="table.data"
              :pagination.sync="table.pagination"
              :rows-per-page-items="table.page"
              light
            >
              <template slot="items" slot-scope="props">
                <td class="text-xs-left">{{ props.item.ID }}</td>
                <td class="text-xs-left">
                  {{ props.item.total }} / {{ vote.num.participant }}
                </td>
                <td class="text-xs-left">
                  <span
                    v-if="props.item.total > vote.num.target"
                    style="color:rgb(110, 0, 0)"
                  >
                    无效
                  </span>
                  <span v-else style="color:rgb(0, 110, 0)">
                    有效
                  </span>
                </td>
                <td class="text-xs-left">{{ props.item.executer }}</td>
                <td class="mouse text-xs-left">
                  <v-tooltip
                    top
                    v-for="(v, i) in props.item.value"
                    :key="`${props.item.ID}-${i}`"
                  >
                    <template #activator="{on}">
                      <span v-on="on" class="star">
                        <v-icon v-if="v === 1" color="black" small>
                          star
                        </v-icon>
                        <v-icon v-if="v === -1" color="red accent-4" small>
                          star
                        </v-icon>
                        <v-icon v-if="v === 0" color="black" small>
                          star_border
                        </v-icon>
                      </span>
                    </template>
                    <span>
                      {{
                        ("0" + (i + 1)).substr(-2) + " " + vote.participant[i]
                      }}
                    </span>
                  </v-tooltip>
                </td>
                <td class="mouse text-xs-left">
                  <v-tooltip
                    top
                    v-for="(v, i) in props.item.other"
                    :key="`${props.item.ID}-other-${i}`"
                  >
                    <v-icon color="black" slot="activator" class="star" small>
                      star
                    </v-icon>

                    <span> {{ v }} </span>
                  </v-tooltip>
                </td>
                <td class="text-xs-left">
                  <v-icon
                    small
                    @click="removeTicketConfirm(props.item)"
                    v-show="user.role === 'admin'"
                  >
                    close
                  </v-icon>
                </td>
              </template>
            </v-data-table>
          </v-flex>
        </v-layout>
      </v-flex>
      <v-flex xs12>
        <v-dialog
          v-model="dialog.show"
          persistent
          :hide-overlay="false"
          max-width="960px"
          transition="dialog-transition"
          width="100%"
        >
          <v-card>
            <v-card-title>
              <v-flex xs4>
                <v-progress-linear
                  :color="add.total > vote.num.target ? 'red' : 'green'"
                  height="16"
                  :value="((add.total / vote.num.participant) * 100).toFixed(0)"
                ></v-progress-linear>
              </v-flex>
              <v-flex xs1>
                <v-chip>{{ add.total }} / {{ vote.num.participant }}</v-chip>
              </v-flex>
              <v-flex xs1>
                <v-chip
                  :color="`${add.total <= vote.num.target ? 'green' : ''}`"
                >
                  <span v-if="add.total <= vote.num.target"> 有效 </span>
                  <span v-else> 无效 </span>
                </v-chip>
              </v-flex>
              <v-flex xs2 class="pr-1">
                <v-btn
                  color="green white--text"
                  block
                  small
                  @click="setAllTicket(1)"
                >
                  <span>全赞成</span>
                  <v-spacer></v-spacer>
                  <v-icon>done_all</v-icon>
                </v-btn>
              </v-flex>
              <v-flex xs2 class="pr-1">
                <v-btn
                  color="grey white--text"
                  block
                  small
                  @click="setAllTicket(0)"
                  ><span>全弃权</span>
                  <v-spacer></v-spacer>
                  <v-icon>block</v-icon>
                </v-btn>
              </v-flex>
              <v-flex xs2>
                <v-btn
                  color="red white--text"
                  block
                  small
                  @click="setAllTicket(-1)"
                  ><span>全反对</span>
                  <v-spacer></v-spacer>
                  <v-icon>close</v-icon>
                </v-btn>
              </v-flex>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <v-layout row wrap>
                <v-flex
                  xs4
                  v-for="(v, j) in 3"
                  :key="'COL' + j"
                  class="pl-1 pr-1"
                >
                  <v-layout row wrap>
                    <v-flex
                      xs12
                      v-for="(v, i) in vote.lenD3"
                      :key="'COLROW' + i + j"
                    >
                      <template v-if="vote.participant[j * vote.lenD3 + i]">
                        <v-btn
                          small
                          block
                          round
                          class="white--text ma-1"
                          :color="
                            ticketStatusToColor[add.value[j * vote.lenD3 + i]]
                          "
                          @click="toggleTicket(j * vote.lenD3 + i)"
                        >
                          <span class="span-inline width-50">
                            {{ `${j * vote.lenD3 + i + 1}`.padStart(2, "0") }}
                          </span>
                          <span class="span-inline width-100 text-xs-left">
                            {{ vote.participant[j * vote.lenD3 + i] }}
                          </span>
                          <v-spacer></v-spacer>
                          <v-icon
                            :class="[
                              {
                                'opacity-10':
                                  add.value[j * vote.lenD3 + i] !== 1
                              }
                            ]"
                            >done</v-icon
                          >
                          <v-icon
                            :class="[
                              {
                                'opacity-10':
                                  add.value[j * vote.lenD3 + i] !== 0
                              }
                            ]"
                            >block</v-icon
                          >
                          <v-icon
                            :class="[
                              {
                                'opacity-10':
                                  add.value[j * vote.lenD3 + i] !== -1
                              }
                            ]"
                            >close</v-icon
                          >
                        </v-btn>
                      </template>
                    </v-flex>
                  </v-layout>
                </v-flex>

                <v-flex xs12>
                  <v-layout row wrap>
                    <v-flex xs2 v-for="(v, i) in add.other" :key="'others' + i">
                      <v-btn
                        block
                        small
                        color="orange"
                        dark
                        round
                        class="white--text ma-1"
                      >
                        {{ v }}
                      </v-btn>
                    </v-flex>
                  </v-layout>
                </v-flex>
              </v-layout>
            </v-card-text>
            <v-card-actions>
              <v-flex xs4>
                <v-text-field
                  label="另选人姓名"
                  v-model="add.otherName"
                  type="text"
                  :disabled="busy || add.other.length >= 5"
                ></v-text-field>
              </v-flex>
              <v-flex xs2>
                <v-btn
                  color="orange"
                  @click="addOther()"
                  :disabled="busy || add.otherName == ''"
                >
                  另选他人
                </v-btn>
              </v-flex>

              <v-spacer></v-spacer>
              <v-btn color="red" @click.stop="closeDialog()">
                取消
              </v-btn>
              <v-btn
                color="green"
                @click.stop="addTicket()"
                :disabled="busy || add.otherName != ''"
                :loading="busy"
              >
                添加
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-flex>
      <v-flex xs12>
        <v-snackbar
          v-model="snackbar.show"
          :right="true"
          :timeout="5000"
          :color="snackbar.color"
        >
          <p>{{ snackbar.title }}</p>
          <p>{{ snackbar.message }}</p>
        </v-snackbar>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import ajax from "../ajax.js";
import func from "../func.js";
import Vue from "Vue";

import InfoPanel from "./_/infoPanel.vue";

export default {
  name: "execute",
  components: {
    [InfoPanel.name]: InfoPanel
  },
  data() {
    return {
      snackbar: { show: false, title: "", message: "", color: "" },
      statusToColor: { "1": "green", "0": "orange", "-1": "grey" },
      ticketStatusToColor: { "1": "green", "0": "grey", "-1": "red" },
      table: {
        search: "",
        pagination: {
          descending: true,
          sortBy: "ID",
          rowsPerPage: 10
        },
        page: [10, { text: "$vuetify.dataIterator.rowsPerPageAll", value: -1 }],
        headers: [
          { text: "ID", value: "ID" },
          { text: "投票 / 参选", value: "percent", sortable: false },
          { text: "状态", value: "status" },
          { text: "计票人", value: "executer" },
          { text: "详情", value: "", sortable: false },
          { text: "另选他人", value: "", sortable: false },
          { text: "操作", value: "", sortable: false }
        ],
        columns: ["ID", "percent", "status", "executer", "participant"],
        // options: {
        //   headings: {
        //     percent: "投票 / 参选",
        //     status: "状态",
        //     executer: "计票人",
        //     participant: ""
        //   },
        //   sortable: ["ID", "percent", "status", "executer", "participant"],
        //   filterable: ["ID", "percent", "status", "executer", "participant"],
        //   sortIcon: {
        //     base: "glyphicon",
        //     up: "glyphicon-chevron-up",
        //     down: "glyphicon-chevron-down",
        //     is: "glyphicon-sort"
        //   }
        // },
        data: [],
        filter: {
          executer: [
            { text: "2016-05-01", value: "2016-05-01" },
            { text: "2016-05-01", value: "2016-05-01" },
            { text: "2016-05-01", value: "2016-05-01" }
          ],
          status: [
            { text: "有效", value: 0 },
            { text: "无效", value: 1 },
            { text: "弃权", value: 2 }
          ]
        }
      },
      vote: {
        ID: 0,
        date: "",
        title: "", // 大会名称
        subtitle: "选举名称", // 选举名称
        num: {
          executer: 1,
          participant: 1,
          target: 1,
          voter: 1
        },
        participant: [],
        lenD3: 0,
        executer: [],
        ticket: [],
        extraTicket: {}
      },
      user: {
        name: "",
        role: ""
      },
      add: {
        ID: -1,
        executer: "",
        total: 0,
        value: [],
        other: [],
        otherName: ""
      },
      ticketSum: [],
      ticketList: [],
      order: true,
      busy: false,
      participantStr: "",
      sw: {
        show: {
          btn: {
            addTicket: true,
            refresh: true,
            print: true
          }
        },
        auto: {
          refresh: {
            tictok: null
          }
        }
      },
      colNum: 3,
      addExtraStr: "",
      dialog: { show: false }
    };
  },
  methods: {
    $notify({ title, message, color }) {
      this.snackbar.title = title;
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
    openDialog() {
      this.add.other = [];
      this.setAllTicket(1);
      this.dialog.show = true;
      this.newTicket = true;
    },
    closeDialog() {
      this.dialog.show = false;
    },
    getVoteInfo() {
      let _ = this;
      _.busy = true;
      let D = { ID: _.vote.ID };
      const api = ajax.api.getVoteInfo;

      return ajax.post(api, D, res => {
        _.vote = JSON.stringify(res.vote) == "{}" ? _.vote : res.vote;

        // let str = "";
        // _.vote.participant.forEach(e => {
        //   str += e.substring(0, 1);
        // });

        _.vote.lenD3 = Math.ceil(_.vote.participant.length / 3);
        // _.table.options.headings["participant"] = str;

        _.setFilter();

        _.$notify({
          title: "选票信息",
          message: "参选人 " + _.vote.participant.length + " 人",
          color: "blue"
        });

        _.busy = false;
      });
    },
    addOther() {
      if (this.participantStr.indexOf(this.add.otherName) != -1) {
        this.$notify({
          title: "无法添加",
          message: "该候选人已存在",
          color: "red"
        });
        this.add.otherName = "";
        return;
      }
      this.add.other.push(this.add.otherName);
      this.add.total++;
      this.add.otherName = "";
      return;
    },
    addTicket() {
      let _ = this;
      if (!_.newTicket) return;
      if (_.busy) return;
      _.busy = true;
      _.newTicket = false;
      let D = { ID: _.vote.ID, add: _.add };
      const api = ajax.api.addTicket;

      return ajax.post(api, D, res => {
        _.add.ID = res.code.ID;
        _.add.executer = res.code.executer;

        let v = [];
        for (let i = 0; i < _.add.value.length; i++) {
          v[i] = _.add.value[i];
        }
        let o = [];
        for (let i = 0; i < _.add.other.length; i++) {
          o[i] = _.add.other[i];
        }
        let tmp = {
          ID: _.add.ID,
          executer: _.add.executer,
          total: _.add.total,
          value: v,
          other: o
        };
        _.ticketList.push(tmp);
        _.table.data.push(tmp);

        _.calTicketSum();
        _.closeDialog();

        _.$notify({
          title: "新增选票成功",
          message: "赞成 " + _.add.total + "人",
          color: "green"
        });

        _.busy = false;
      });
    },
    removeTicketConfirm(row) {
      if (!confirm("此操作将删除" + row.ID + "号投票, 是否继续?")) return;
      this.removeTicket(row);
    },
    removeTicket(row) {
      let _ = this;
      if (_.busy) return;
      _.busy = true;
      let D = { VoteID: _.vote.ID, TicketID: row.ID };
      const api = ajax.api.removeTicket;
      return ajax.post(api, D, res => {
        _.$notify({
          title: "移除选票成功",
          message: "页面即将刷新, 请勿操作.",
          color: "orange"
        });
        _.refreshInfo();
        _.busy = false;
      });
    },
    getTicketList() {
      let _ = this;
      let D = { ID: _.vote.ID };
      _.busy = true;
      const api = ajax.api.getTicketList;

      return ajax.post(api, D, res => {
        if (res.ticketList.length == _.ticketList.length) {
          _.busy = false;
          return;
        }

        _.ticketList = res.ticketList;
        _.table.data = [];
        _.ticketList.forEach(element => {
          let tmp = {};
          tmp.ID = element.ID;
          tmp.executer = element.executer;
          tmp.total = element.total;
          tmp.value = element.value;
          tmp.other = element.other;

          _.table.data.push(tmp);
        });

        _.$notify({
          title: "选票统计",
          message: "当前共计 " + _.ticketList.length + " 张选票",
          color: "blue"
        });
        _.busy = false;
      });
    },
    toggleTicket(i) {
      let v, d;
      switch (this.add.value[i]) {
        case -1:
          v = 1;
          d = 1;
          break;
        case 0:
          v = -1;
          d = 0;
          break;
        case 1:
          v = 0;
          d = -1;
          break;

        default:
          break;
      }

      // Vue.set
      Vue.set(this.add.value, i, v);
      this.add.total += d;
    },
    setAllTicket(v) {
      for (let i = 0; i < this.vote.participant.length; i++) {
        Vue.set(this.add.value, i, v);
      }
      this.add.total = 0;
      for (let i = 0; i < this.add.value.length; i++) {
        this.add.total += Math.floor((this.add.value[i] + 1) / 2);
      }
      this.add.total += this.add.other.length;
      console.log(this.add.value);
    },
    calTicketSum() {
      let sum = [];
      for (let i = 0; i < this.vote.participant.length; i++) {
        let cnt = 0;
        for (let j = 0; j < this.ticketList.length; j++) {
          if (
            this.ticketList[j].total > 0 &&
            this.ticketList[j].total <= this.vote.num.target
          ) {
            cnt += Math.floor((this.ticketList[j].value[i] + 1) / 2);
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
          status: -1
        };
      }

      // add extra ticket result
      for (let i = 0; i < sum.length; i++) {
        sum[i].extraCnt = this.vote.extraTicket[sum[i].participant].approve;
        sum[i].cnt += sum[i].extraCnt;
      }

      sum.sort(this.desc_cnt);
      for (const i in sum) {
        sum[i].order = i;
      }
      let end = sum[this.vote.num.target - 1];
      let endnext = sum[this.vote.num.target];
      let d = end.cnt == endnext.cnt ? 0 : 1;

      for (const i in sum) {
        if (sum[i].cnt > end.cnt) sum[i].status = 1; // 当选
        if (sum[i].cnt == end.cnt) sum[i].status = d; // 平票
      }
      sum.sort(this.asc_ID);
      this.ticketSum = sum;
      this.sortTicketSum();
    },
    toggleSortTicketSum() {
      this.order = !this.order;
      this.sortTicketSum();
    },
    sortTicketSum() {
      this.ticketSum.sort(this.order ? this.asc_ID : this.desc_cnt);
    },
    asc_ID(x, y) {
      if (x.ID < y.ID) return -1;
      if (x.ID > y.ID) return 1;
      return 0;
    },
    desc_cnt(x, y) {
      if (x.cnt < y.cnt) return 1;
      if (x.cnt > y.cnt) return -1;

      if (x.ID < y.ID) return -1;
      if (x.ID > y.ID) return 1;

      return 0;
    },
    setFilter() {
      let _ = this;
      _.table.filter.executer = [];
      this.vote.executer.forEach(ee => {
        _.table.filter.executer.push({
          text: ee,
          value: ee
        });
      });
    },
    filterHandler(value, row, column) {
      const property = column["property"];
      return row[property] === value;
    },
    filterHandler_status(value, row) {
      // let d = row.total - this.vote.num.target
      let v = 0;
      if (row.total > 0 && row.total <= this.vote.num.target) v = 0; // 有效
      if (row.total > this.vote.num.target) v = 1; // 无效
      if (row.total == 0) v = 2; // 弃权
      return v === value;
    },
    async refreshInfo() {
      console.log("refreshInfo()");
      await this.getTicketList();
      this.calTicketSum();
    },
    toggleRefresh() {
      if (this.sw.auto.refresh.tictok == null) {
        this.refreshInfo();
        this.sw.auto.refresh.tictok = setInterval(() => {
          this.refreshInfo();
        }, 10000);
        console.log("ON");
      } else {
        window.clearInterval(this.sw.auto.refresh.tictok);
        this.sw.auto.refresh.tictok = null;
        console.log("OFF");
      }
    },
    jump(ID) {
      this.$router.push({ name: "print", params: { id: ID } });
    },
    nothing() {
      return;
    }
  },
  async created() {
    this.vote.ID = this.$route.params.id;
    this.user.name = func.getCookie("name");
    this.user.role = func.getCookie("role");

    await this.getVoteInfo();
    await this.getTicketList();
    this.setAllTicket(1);
    this.calTicketSum();
    this.colNum = this.vote.num.participant <= 20 ? 2 : 3;
    this.participantStr = this.vote.participant.join(".");
    if (this.user.role === "admin") {
      this.sw.show.btn.addTicket = true;
      this.sw.show.btn.refresh = true;
      this.sw.show.btn.print = true;
      // this.sw.auto.refresh.tictok = setInterval("app.refreshInfo()", 10000);
      this.sw.auto.refresh.tictok = setInterval(() => {
        this.refreshInfo();
      }, 10000);
    } else {
      this.sw.show.btn.addTicket = true;
      this.sw.show.btn.refresh = false;
      this.sw.show.btn.print = true;
      this.sw.auto.refresh.tictok = null;
    }
  }
};
</script>

<style scoped>
.font-big {
  /* color: #b50d0d; */
  font-weight: bold;
  font-size: 64px;
}
.btn-big {
  height: 64px;
  width: 64px;
}
.span-inline {
  display: inline-block;
}
.width-20 {
  width: 20px;
}
.width-24 {
  width: 24px;
}
.width-30 {
  width: 30px;
}
.width-40 {
  width: 40px;
}
.width-45 {
  width: 45px;
}
.width-50 {
  width: 50px;
}
.width-100 {
  width: 100px;
}
.width-200 {
  width: 200px;
}
.icon {
  display: inline-block;
}
.opacity-10 {
  opacity: 0.1;
}
.font-size-32px {
  font-size: 32px;
}
.star {
  width: 16px;
  width: 16px;
  display: inline-block;
}
.mouse * {
  cursor: pointer;
}
</style>
