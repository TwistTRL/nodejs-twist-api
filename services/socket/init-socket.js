/*
 * @Author: Peng Zeng
 * @Date: 2021-02-28 20:36:11
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2021-03-03 23:31:15
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

  // temp auth, .env file
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (token === process.env.SOCKET_IO_TOKEN) {
      next();
    } else {
      next(new Error("token incorrect"));
    }
    // ...
  });

  io.on("connection", (client) => {
    client.on("newClient", (personId) => {
      console.log(`client.id ${client.id} connected`);
      console.log("personId :>> ", personId);
      clientIdObj[client.id] = personId;
      if (!(personId in personIdObj)) {
        personIdObj[personId] = new Set();
      }
      personIdObj[personId].add(client.id);
      client.join(personId);

      if (!interval) {
        interval = setInterval(intervalQuery, 2500);
      }
    });

    client.on("disconnect", () => {
      console.log(`client.id ${client.id} disconnected`);
      const curPersonId = clientIdObj[client.id];
      delete clientIdObj[client.id];
      personIdObj[curPersonId].delete(client.id);
      if (!personIdObj[curPersonId].size) {
        delete personIdObj[curPersonId];
      }

      // console.log("clientIdObj :>> ", clientIdObj);
      // console.log("personIdObj :>> ", personIdObj);

      if (Object.entries(personIdObj).length === 0) {
        console.log("clear interval");
        clearInterval(interval);
        interval = false;
      }
    });
  });
};

module.exports = {
  initializeSocket,
};
