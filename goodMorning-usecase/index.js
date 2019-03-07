const axios = require("axios")
const express = require('express')
const app = express()
const router = express.Router();

const port = 5010


const dbConnectionViaTriggerRouter = "";
const calenderAdapter = "";


app.get('/userGreeting', async (req, res) => {
  try {
    const dbResponse = await axios(dbConnectionViaTriggerRouter);
    const calederResponse = await axios(calenderAdapter);

    //var userName = dbResponse.data.indexOf("userName");

    var greeting = "Hello " + userName + ". I hope you are having a good day. ";
    greeting += "You have the following meetings scheduled for today ";

    res.send({
      "greeting": greeting
    })
  } catch (error) {
    console.log(error)
    res.send({
      "error": error
    })
  }
})

app.listen(port, () => console.log(`GoodMorning Use Case listening on port ${port}!`))
