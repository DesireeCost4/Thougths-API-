const express = require("express");
const handlebars = require("express-handlebars");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const flash = require("express-flash");
const app = express();
const conn = require("./db/conn");

//models
const Tought = require("./models/Tought");
const User = require("./models/User");
const toughtsRoutes = require("./routes/toughtsRoutes");
const authRoutes = require("./routes/authRoutes");
const ToughtController = require("./controllers/ToughtsController");

app.engine(
  "handlebars",
  handlebars.engine({
    defaultLayout: "main",
    extname: ".handlebars",
  })
);

app.set("view engine", "handlebars");

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());

app.use(
  session({
    name: "session",
    secret: "nosso_secret",
    resave: false,
    saveUninitialized: false,
    store: new FileStore({
      logFn: function () {},
      path: require("path").join(require("os").tmpdir(), "sessions"),
    }),

    cookie: {
      secure: false,
      maxAge: 3600000,
      expires: new Date(Date.now() + 3600000),
      httpOnly: true,
    },
  })
);

//msg flash
app.use(flash());
//public
app.use(express.static("public"));
//session res.
app.use((req, res, next) => {
  if (req.session.userid) {
    res.locals.session = req.session;
  }
  next();
});

app.use("/toughts", toughtsRoutes);
app.use("/", authRoutes);

app.get("/", ToughtController.showToughts);

conn
  .sync()
  .then(() => {
    app.listen(3000, () => console.log("servidor rodando na porta 3000"));
  })
  .catch((err) => console.log("erro ao conectar" + err));