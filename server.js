const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");
const userModel = require("./app/models/userModel");

const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT || 3000;

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(server);
  const users = {};

  io.on("connection", (socket) => {
    console.log("a user connected:", socket.id);

    socket.on("userInfo", async (userInfo) => {
      try {
        const schema = Joi.object({
          name: Joi.string().Joi.required(),
          username: Joi.string().Joi.required(),
          password: Joi.string().Joi.required(),
          message: Joi.string().optional(),
        });

        const { value, error } = schema.validate(userInfo);

        if (error) {
          return res.status(400).json({
            message: error.message,
            status: "0",
            error: true,
            success: false,
          });
        }

        const user = await userModel.findOne({
          where: { username: value.username },
        });
      } catch (error) {
        console.log(error);
      }

      users[socket.id] = { id: socket.id, ...userInfo };

      socket.emit("activeUser", { id: socket.id, ...userInfo });

      io.emit("user_list", Object.values(users));
    });

    // console.log("a user connected", socket.id);

    socket.on("chat_message", ({ msg, receiver }) => {
      const from = socket.id;
      const timestamp = new Date().toISOString();
      // const msg = data.msg;
      // const recevier = data.recevier;

      console.log(from, msg, receiver, "these are the details");

      io.to(from).emit("chat_message", { msg, from, receiver, timestamp });
      io.to(receiver).emit("chat_message", { msg, from, receiver, timestamp });
    });

    socket.on("disconnect", () => {
      console.log("a user disconnected", socket.id);
      delete users[socket.id];

      io.emit("user_list", Object.values(users));
    });
  });

  server.listen(port, () => {
    console.log("> Ready on http://localhost:" + port);
  });
});
