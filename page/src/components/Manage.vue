<template>
  <v-container grid-list-xs>
    <v-layout row wrap>
      <v-flex xs2 class="text-xs-left">
        <div class="font-big">
          <span>详情</span>
        </div>
      </v-flex>
      <v-flex xs7 class="text-xs-left">
        <info-panel :vote="vote"></info-panel>
      </v-flex>
      <v-flex xs1 class="">
        <v-btn
          color="black"
          xlarge
          fab
          outline
          @click="openDialog()"
          :disabled="vote.participant.length > 0"
        >
          候选人
        </v-btn>
      </v-flex>
      <v-flex xs1 class="">
        <v-btn color="black" xlarge fab outline @click="jump(vote.ID)">
          进度
        </v-btn>
      </v-flex>

      <v-flex xs12 class="text-xs-left">
        <h3>候选人 {{ vote.participant.length }} 人</h3>
      </v-flex>
      <v-flex
        xs2
        class="text-xs-left"
        v-for="(v, i) in vote.participant"
        :key="'p' + i"
      >
        <span>{{ ("0" + (i + 1)).substr(-2) }}</span>
        <span>{{ v }}</span>
      </v-flex>
      <v-flex xs12 class="text-xs-left">
        <v-layout row wrap>
          <v-flex xs2>
            <h3 class="mt-3">
              计票人 {{ vote.executer.length }} 人 `账号` `密码`
            </h3>
          </v-flex>
          <v-flex xs10 class="text-xs-left">
            <v-switch label="显示密码" v-model="showPass"></v-switch>
          </v-flex>
        </v-layout>
      </v-flex>
      <v-flex
        xs2
        class="text-xs-left"
        v-for="(v, i) in vote.executer"
        :key="'e' + i"
      >
        <v-chip color="success">{{ v }}</v-chip>
        <v-chip color="info" v-show="showPass">{{ vote.pass[v] }}</v-chip>
      </v-flex>

      <v-flex xs12>
        <v-dialog
          v-model="dialog.show"
          persistent
          :hide-overlay="false"
          max-width="512px"
          transition="dialog-transition"
          width="100%"
        >
          <v-card>
            <v-card-title primary-title>
              <h1>添加候选人</h1>
              <v-spacer></v-spacer>
              <v-btn icon small @click="closeDialog()">
                <v-icon>close</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text>
              <v-layout row wrap>
                <v-flex xs12>
                  <v-textarea
                    @change="parse()"
                    v-model="add.participantStr"
                    rows="10"
                    label="将候选人名称黏贴至此, 如` 张三, 李四, 王五 `"
                  ></v-textarea>
                </v-flex>

                <v-flex xs2 v-for="(v, i) in add.participant" :key="'0000' + i">
                  <span>{{ v }}</span>
                </v-flex>
              </v-layout>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="success"
                @click="addParticipant()"
                :disabled="
                  add.participantStr == '' ||
                    busy ||
                    add.participant.length == 0 ||
                    add.participant.length != vote.num.participant
                "
                :loading="busy"
              >
                确定
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import ajax from "../ajax.js";
import func from "../func.js";
import InfoPanel from "./_/infoPanel.vue";

export default {
  name: "manage",
  components: {
    [InfoPanel.name]: InfoPanel
  },
  data() {
    return {
      vote: {
        ID: 0,
        date: "",
        title: "",
        num: {
          executer: 1,
          participant: 1,
          target: 1
        },
        participant: [],
        executer: [],
        pass: {}
      },
      user: {
        name: ""
      },
      busy: false,
      add: {
        participantStr: "",
        participant: []
      },
      voteList: [],
      showPass: false,
      dialog: { show: false }
    };
  },
  methods: {
    parse() {
      let _ = this;
      let str = _.add.participantStr;

      let all = str.split(",");
      for (let i = 0; i < all.length; i++) {
        all[i] = all[i].trim();
        if (all[i] != "") {
          _.add.participant.push(all[i]);
        }
      }

      console.log(_.add.participant);
    },
    addParticipant() {
      let _ = this;
      _.busy = true;

      let D = {
        ID: _.vote.ID,
        participant: _.add.participant
      };

      const api = ajax.api.addParticipant;

      ajax.post(api, D, res => {
        _.getVoteInfo();
        _.closeDialog();
        _.add.participantStr = "";
        _.add.participant = [];

        _.busy = false;
      });
    },
    getVoteInfo() {
      let _ = this;
      _.busy = true;

      let D = {
        ID: _.vote.ID
      };

      const api = ajax.api.getVoteInfo;

      ajax.post(api, D, res => {
        _.vote = JSON.stringify(res.vote) === "{}" ? _.vote : res.vote;

        _.busy = false;
      });
    },
    jump(ID) {
      this.$router.push({ name: "execute", params: { id: ID } });
    },
    openDialog() {
      this.dialog.show = true;
    },
    closeDialog() {
      this.dialog.show = false;
    }
  },
  created() {
    this.vote.ID = this.$route.params.id;
    this.getVoteInfo();
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
  height: 128px;
  width: 128px;
}
.span-inline {
  display: inline-block;
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
</style>
