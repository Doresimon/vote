<template>
  <v-container grid-list-xs>
    <v-layout row wrap>
      <v-flex xs6 class="text-xs-left mb-5">
        <div class="font-big">
          <v-img
            class="icon"
            src="static/dh.icon.png"
            :aspect-ratio="1"
            height="64px"
          ></v-img>
          <span>控制面板</span>
        </div>
      </v-flex>
      <v-flex xs6 class="text-xs-right  mb-5">
        <v-tooltip top color="black">
          <v-btn outline large fab slot="activator" @click="openDialog()">
            <v-icon>add</v-icon>
          </v-btn>
          <span>新增选举</span>
        </v-tooltip>
      </v-flex>
      <v-flex xs12 v-for="(v, i) in voteList" :key="i" class="mb-5">
        <v-card>
          <v-card-text>
            <v-layout>
              <v-flex xs2 class="text-xs-left">
                <v-btn outline fab color="success" xlarge @click="jump(v.ID)">
                  <v-icon>play_arrow</v-icon>
                </v-btn>
              </v-flex>
              <v-flex xs10 class="text-xs-left">
                <info-panel :vote="v"></info-panel>
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-card>
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
              <h1>添加选举</h1>
              <v-spacer></v-spacer>
              <v-btn icon small @click="closeDialog()">
                <v-icon>close</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text>
              <v-layout row wrap>
                <v-flex xs12>
                  <v-text-field
                    label="大会名称"
                    v-model.trim="add.title"
                    type="text"
                  ></v-text-field>
                </v-flex>

                <v-flex xs12>
                  <v-text-field
                    label="选举名称"
                    v-model.trim="add.subtitle"
                    type="text"
                  ></v-text-field>
                </v-flex>

                <v-flex xs12>
                  <v-text-field
                    label="计票人数"
                    v-model.trim="add.num.executer"
                    type="text"
                  ></v-text-field>
                </v-flex>

                <v-flex xs12>
                  <v-text-field
                    label="应到人数"
                    v-model.trim="add.num.voter"
                    type="text"
                  ></v-text-field>
                </v-flex>

                <v-flex xs12>
                  <v-text-field
                    label="候选人数"
                    v-model.trim="add.num.participant"
                    type="text"
                  ></v-text-field>
                </v-flex>

                <v-flex xs12>
                  <v-text-field
                    label="当选人数"
                    v-model.trim="add.num.target"
                    type="text"
                  ></v-text-field>
                </v-flex>
              </v-layout>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="success"
                @click="addVote()"
                :disabled="add.title === '' || busy"
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
  name: "dashboard",
  components: {
    [InfoPanel.name]: InfoPanel
  },
  data() {
    return {
      user: {
        name: "",
        pass: ""
      },
      busy: false,
      add: {
        title: "",
        subtitle: "",
        num: {
          executer: 1,
          participant: 1,
          target: 1,
          voter: 1
        },
        participant: []
      },
      dialog: { show: false },
      voteList: []
    };
  },
  methods: {
    addVote() {
      let _ = this;
      let D = _.add;
      _.busy = true;

      const api = ajax.api.AddVote;

      ajax.post(api, D, res => {
        _.closeDialog();
        _.getVoteList();
        _.busy = false;
      });
    },
    getVoteList() {
      let _ = this;
      let D = {};
      _.busy = true;

      const api = ajax.api.GetVoteList;

      ajax.post(api, D, res => {
        _.voteList = res.voteList;
        _.busy = false;
      });
    },
    jump(ID) {
      // func.jumpNew(`#/voteManage/${ID}`);

      // this.$router.push(`manage/${ID}`);
      this.$router.push({ name: "manage", params: { id: ID } });
    },
    openDialog() {
      this.dialog.show = true;
    },
    closeDialog() {
      this.dialog.show = false;
    }
  },
  created() {
    this.getVoteList();
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
