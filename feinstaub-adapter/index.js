const axios = require("axios")
const express = require('express')
const app = express()
const port = 5001

const feinstaubAlarmUrl = "https://www.stuttgart.de/feinstaubalarm/widget/xtrasmall"


app.get('/isAlarm', async (req, res) => {
  try {
    const response = await axios(feinstaubAlarmUrl)
    const isAlarm = response.data.indexOf("alarm-on") > -1
    res.send({
      "isAlarm": isAlarm
    })
  } catch (error) {
    console.log(error)
    res.send({
      "error": error
    })
  }
})

app.listen(port, () => console.log(`Feinstaub adapter listening on port ${port}!`))
