/*
 * @Author: Peng Zeng
 * @Date: 2021-02-28 20:36:11
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2021-02-28 22:08:09
 */

const socketIo = require("socket.io");
const { getCurrentVitalsData } = require("./current-vitals");

const initializeSocket = (httpServer) => {
  let interval;
  let personIdObj = {};
  let clientIdObj = {};

  const io = socketIo(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const intervalQuery = async () => {
    const vitalsData = await getCurrentVitalsData(Object.keys(personIdObj));
    if (vitalsData && vitalsData.length) {
      vitalsData.forEach((element) => {
        io.to(element.PERSON_ID).emit("currentVitals", element);
      });
    }
  };

  io.on("connection", (client) => {
    client.on("newClient", (personId) => {
      console.log("New client connected");
      console.log("client.id :>> ", client.id);
      console.log("personId :>> ", personId);
      clientIdObj[client.id] = personId;

      if (!(personId in personIdObj)) {
        personIdObj[personId] = new Set();
      }

      personIdObj[personId].add(client.id);

      //   if (!client.rooms.has(personId)) {
      //     // getRealtimeVitals(personId);
      //   }

      client.join(personId);

      if (!interval) {
        interval = setInterval(intervalQuery, 5000);
      }
    });

    client.on("disconnect", () => {
      console.log("client.id :>> ", client.id);
      console.log("Client disconnected");

      const curPersonId = clientIdObj[client.id];
      delete clientIdObj[client.id];
      personIdObj[curPersonId].delete(client.id);
      if (!personIdObj[curPersonId].size) {
        delete personIdObj[curPersonId];
      }

    //   console.log("clientIdObj :>> ", clientIdObj);
    //   console.log("personIdObj :>> ", personIdObj);

      if (!personIdObj.size) {
        clearInterval(interval);
        interval = false;
      }
    });
  });
};

module.exports = {
  initializeSocket,
};
