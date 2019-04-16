<template>
  <v-layout row wrap class="mmm">
    <v-flex xs8>
      <p>
        <strong>大会名称: {{ vote.title }}</strong>
      </p>
      <p>
        <strong>选举名称: {{ vote.subtitle }}</strong>
      </p>
    </v-flex>
    <v-flex xs4>
      <p>
        <span class="span-inline width-100">
          计票人数: {{ vote.num.executer }}
        </span>
        <span class="span-inline width-100">
          应到人数: {{ vote.num.voter }}
        </span>
      </p>
      <p>
        <span class="span-inline width-100">
          当选人数: {{ vote.num.target }}
        </span>
        <span class="span-inline width-100">
          候选人数: {{ vote.num.participant }}
        </span>
      </p>
    </v-flex>
  </v-layout>
</template>
<script>
export default {
  name: "info-panel",
  props: {
    vote: {}
  }
};
</script>
<style lang="css" scoped>
.mmm {
  font-size: 16px;
}
</style>
