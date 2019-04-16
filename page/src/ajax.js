import axios from "axios";
import config from "./config.js";

const post = function(api, data, callback) {
  const url = config.host + api;
  return axios
    .post(url, data)
    .then(response => {
      const res = response.data;
      console.log("【url】", url);
      console.log("【req】", data);
      console.log("【res】", res);

      callback(res);
    })
    .catch(error => {
      console.log("【ERROR】");
      console.log("【url】", url);
      console.log("【req】", data);
      console.log("【err】", error);
    });
};

const prefix = "/api";

const api = {
  Auth: prefix + "/auth",
  AddVote: prefix + "/vote/addVote",
  GetVoteList: prefix + "/vote/getVoteList",
  getVoteInfo: prefix + "/vote/getVoteInfo",
  addTicket: prefix + "/vote/addTicket",
  removeTicket: prefix + "/vote/removeTicket",
  getTicketList: prefix + "/vote/getTicketList",
  addParticipant: prefix + "/vote/addParticipant",
  addExtraTicket: prefix + "/vote/addExtraTicket"
};

export { post };
export { api };

export default { post, api };
