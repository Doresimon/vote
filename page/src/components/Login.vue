<template>
  <v-container grid-list-xs>
    <v-layout row wrap>
      <v-flex xs12 class="text-xs-center ">
        <div class="fontRed pt-1">
          <v-img
            style="display:inline-block"
            src="static/dh.icon.png"
            :aspect-ratio="1"
            width="64px"
          ></v-img>
          <span style="display:inline-block">计票系统</span>
        </div>
        <div style="color:grey">党建服务中心 <cite>复旦大学</cite></div>
      </v-flex>
      <v-flex xs12>
        <v-text-field
          outline
          label="账号"
          type="text"
          browser-autocomplete="off"
          v-model="user.name"
        ></v-text-field
      ></v-flex>
      <v-flex xs12>
        <v-text-field
          outline
          label="密码"
          type="password"
          browser-autocomplete="off"
          v-model="user.pass"
        ></v-text-field
      ></v-flex>
      <v-flex xs12>
        <v-btn
          color="#e1330f"
          class="white--text"
          large
          block
          @click="login()"
          :disabled="user.name === '' || user.pass === '' || busy == true"
          ><span>登录</span></v-btn
        >
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import ajax from "../ajax.js";
import func from "../func.js";

export default {
  name: "login",
  data() {
    return {
      user: {
        name: "",
        pass: ""
      },
      busy: false
    };
  },
  methods: {
    login() {
      const _ = this;
      _.busy = true;

      let D = {
        name: _.user.name,
        pass: _.user.pass
      };

      const api = ajax.api.Auth;

      ajax.post(api, D, res => {
        if (res.ok) {
          // func.jump(response.data.url);
          _.$router.push("dashboard");
        } else {
          alert("wrong password!");
        }

        _.busy = false;
      });

      // axios
      //   .post("/api/auth", D)
      //   .then(response => {
      //     // handle success
      //     console.log(response);
      //     if (response.data.ok) {
      //       // func.jump(response.data.url);
      //       _.$router.push("dashboard");
      //     } else {
      //       alert("wrong password!");
      //     }
      //   })
      //   .catch(error => {
      //     // handle error
      //     console.log(error);
      //   })
      //   .finally(() => {
      //     // always executed
      //     _.busy = false;
      //   });
    }
  },
  created() {}
};
</script>

<style scoped>
.fontRed {
  color: #b50d0d;
  font-weight: bold;
  font-size: 64px;
}
</style>
