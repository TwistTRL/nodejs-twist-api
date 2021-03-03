/*
 * @Author: Peng Zeng
 * @Date: 2021-03-01 18:02:04
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2021-03-02 09:15:17
 */

const socketIo = require("socket.io");
const {
  subscribeVitals,
  unsubscribeVitals,
} = require("../../db_apis/realtime-vitals/subscribe-realtime-vitals");

const initializeSocketCqn = (httpServer) => {
  let personIdObj = {};
  let clientIdObj = {};

  const io = socketIo(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (client) => {
    client.on("newClient", (personId) => {
      console.log("New client connected");
      console.log("client.id :>> ", client.id);
      console.log("personId :>> ", personId);
      clientIdObj[client.id] = personId;

      if (!(personId in personIdObj)) {
        personIdObj[personId] = new Set();
        subscribeVitals(personId, io);
      }

      personIdObj[personId].add(client.id);
      client.join(personId);
    });

    client.on("disconnect", () => {
      console.log("client.id :>> ", client.id);
      console.log("Client disconnected");

      const curPersonId = clientIdObj[client.id];
      delete clientIdObj[client.id];
      personIdObj[curPersonId].delete(client.id);
      if (!personIdObj[curPersonId].size) {
        delete personIdObj[curPersonId];
        unsubscribeVitals(curPersonId);
      }

      console.log("clientIdObj :>> ", clientIdObj);
      console.log("personIdObj :>> ", personIdObj);
    });
  });
};

module.exports = {
  initializeSocketCqn,
};
