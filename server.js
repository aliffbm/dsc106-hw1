let fs = require("fs");
let csv = require("csv-parser");
let express = require("express");
let app = express();

let path = require("path");

app.use("/", express.static(path.join(__dirname, "public")));

let d3_applied = [];
let a_2 = {applied: [], admitted: []};
let highChart = {female: {applied: [], admitted: [], enrolled: []}, male: {applied: [], admitted: [], enrolled: []}, years: [] };
let data = [];

fs.createReadStream('ucsd_data.txt')
  .pipe(csv())
  .on('data', (row) => {
      data.push(row);
  })
  .on('end', () => {
    // formatting data
    data.reverse();
    for(let i = 0; i < data.length; i++) {
      let m_applied =  Number(data[i].fulltime_men_applied.replace(",", ""));
      let w_applied =  Number(data[i].fulltime_women_applied.replace(",", ""));
      let m_admitted =  Number(data[i].fulltime_men_admitted.replace(",", ""));
      let w_admitted =  Number(data[i].fulltime_women_admitted.replace(",", ""));
      let m_enrolled =  Number(data[i].fulltime_men_enrolled.replace(",", ""));
      let w_enrolled =  Number(data[i].fulltime_women_enrolled.replace(",", ""));
      d3_applied.push({
        date: data[i].year, value: m_applied
      })
      a_2.applied.push(m_applied);
      a_2.admitted.push(m_admitted);

      highChart.female.applied.push(w_applied)
      highChart.female.admitted.push(w_admitted)
      highChart.female.enrolled.push(w_enrolled)
      highChart.male.applied.push(m_applied);
      highChart.male.admitted.push(m_admitted);
      highChart.male.enrolled.push(m_enrolled);
      highChart.years.push(data[i].year)
    }  
  });

  app.get("/data", (req, res) => {
    res.status(200).send({
      applied: d3_applied,
      pie_data: a_2,
      highChart: highChart
    })
  })

  app.listen(3000, () => {
    console.log("Listening on: ", 3000);
  })



  

  