/////// app.js
require('dotenv').config();
const path = require("node:path");
const { Pool } = require("pg");
const express = require("express");
const session = require("express-session");

const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("bcryptjs");

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const expressSession = require('express-session');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');

// routers
const folderRouter = require("./routers/folderRouter");
const fileRouter = require("./routers/fileRouter");






const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// static assets
const assetsPath = path.join(__dirname, "public");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(assetsPath));

app.use(session({ secret: "cats", resave: false, saveUninitialized: false }));
app.use(passport.session());

app.use("/folders", folderRouter);
app.use("/files", fileRouter);

app.get("/", async (req, res) => {
  if (!req.user) {
    return res.render("index",);
  }
  const folders = await prisma.folder.findMany({
    where: {
      userId: req.user.id,
      folderId: null
    },
    include: {
      owner: true
    }
  })

  const files = await prisma.file.findMany({
    where: {
      userId: req.user.id,
      folderId: null
    },
    include: {
      owner: true
    }
  })
  
  res.render("index", { user: req.user, folders, active_folder: null, files });
});

app.get("/sign-up", (req, res) => res.render("sign-up-form"));

app.post("/sign-up", async (req, res, next) => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { username: req.body.username }
    });

    if (existingUser) {
      return res.status(400).send("Username already exists");
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await prisma.user.create({
      data: {
        username: req.body.username,
        password: hashedPassword
      }
    });
    res.redirect("/");
  } catch (error) {
    console.error(error);
    next(error);
  }
});
 

app.post("/log-in", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/"
}))

app.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});



app.listen(3000, () => console.log("app listening on port 3000!"));


app.use(
  expressSession({
    cookie: {
     maxAge: 7 * 24 * 60 * 60 * 1000 // ms
    },
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(
      new PrismaClient(),
      {
        checkPeriod: 2 * 60 * 1000,  //ms
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined,
      }
    )
  })
);

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { username }
      })

      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        // passwords do not match!
        return done(null, false, { message: "Incorrect password" })
      }

      return done(null, user);
    } catch(err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id }
    });

    done(null, user);
  } catch(err) {
    done(err);
  }
});

