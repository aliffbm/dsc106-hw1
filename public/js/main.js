// borrowed some ideas from online and gitrepo ucsd_dsc106

// set rest stuff
let xhr = new XMLHttpRequest(); 
xhr.open("get", "http://localhost:3000/data")
xhr.responseType = "json";
xhr.send(); 

var applied_data = [];
var pie_data = [];
var highChart_data = [];
var chartState = "";
// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 920 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;
// declare svg variable
var svg;

xhr.onload = function() {
  if(xhr.status != 200) {
    console.log("eerrr");
  } else{
    applied_data = xhr.response.applied;
    pie_data = xhr.response.pie_data;
    highChart_data = xhr.response.highChart;
    let data = xhr.response;
    console.log("mean", d3.mean(data.pie_data.applied))
    console.log(data)
    formatData(applied_data);
    // default d3js line on page display
    displayLineChart(applied_data);
  }
}


// listening for the clicks
document.getElementById("line-chart").addEventListener("click", function(e) {
  console.log("datadf:", applied_data )
  if(chartState == "high-chart") {
    h_lineChart();
  } else {
    displayLineChart(applied_data)
  }
  
})

document.getElementById("bar-chart").addEventListener("click", function(e) {
  console.log("bar data", applied_data);
  if(chartState == "high-chart") {
    h_barChart();
  } else {
    displayBarChart(applied_data);
  }
  
})

document.getElementById("pie-chart").addEventListener("click", function(e) {
  if(chartState == "high-chart") {
    h_pieChart()
  } else {
    displayPieChart()
  }
  
})

function makeTitle(svg,title) {
  svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", 25)
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("text-decoration", "underline")  
        .text(title);
}

function resetSVG() {
  svg = d3.select("#chart").html("")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
}

function formatData (data) {
  for(let i = 0; i < data.length; i++) {
    let datum = data[i];
    data[i] = {date: d3.timeParse("%Y")(datum.date), value : datum.value}
  }
}
// line chart stuff
function displayLineChart(data){

  resetSVG();
  if(!(data[0].date instanceof Date)){
    // inplace
    formatData(data);
  } 

  // Add X axis --> it is a date format
  let x = d3.scaleTime()
    .domain(d3.extent(data, function(d) { return d.date; }))
    .range([ 0, width ]);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add Y axis
  let y = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return +d.value; })])
    .range([ height, 0 ]);
  svg.append("g")
    .call(d3.axisLeft(y));

  makeTitle(svg, "Line Graph Male Applicants from 2006 - 2018")
    createPath(data, x, y);
}

function createPath(data, x, y) {
  svg.append("path")
  .datum(data)
  .attr("fill", "none")
  .attr("stroke", "steelblue")
  .attr("stroke-width", 1.5)
  .attr("d", d3.line()
    .x(function(d) { return x(d.date) })
    .y(function(d) { return y(d.value) })
    )
}


// bar chart stuff

function displayBarChart(data) {

  resetSVG();
  if(!(data[0].date instanceof Date)){
    // inplace
    formatData(data);
  } 
  let dt = new Array(...data);
  for(let i = 0; i < dt.length; i++) {
    dt[i].date = dt[i].date.getFullYear();
  }
  // set the ranges
  let x = d3.scaleBand()
  .range([0, width])
  .padding(0.1);
  let y = d3.scaleLinear()
  .range([height, 0]);
 

  // Scale the range of the data in the domains
  x.domain(dt.map(function(d) { return d.date; }));
  y.domain([0, d3.max(dt, function(d) { return d.value; })]);

  // append the rectangles for the bar chart
  svg.selectAll(".bar")
  .data(dt)
  .enter().append("rect")
  .attr("class", "bar")
  .attr("x", function(d) { return x(d.date); })
  .attr("width", x.bandwidth())
  .attr("y", function(d) { return y(d.value); })
  .attr("height", function(d) { return height - y(d.value); });

  makeTitle(svg, "Bar Graph Male Applicants from 2006 - 2018");

  // add the x Axis
  svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x));

  // add the y Axis
  svg.append("g")
  .call(d3.axisLeft(y));
}


// pie stuff goes here
function displayPieChart() {
  // resetSVG();
  let radius = Math.min(width, height) / 2 - margin.bottom;
  console.log(radius)

  svg = d3.select("#chart").html("")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + (margin.left + width / 2) + "," + (margin.top + height / 2) + ")");

      svg.append("text")
      .attr("x", 0)             
      .attr("y", -height/2 + margin.top)
      .attr("text-anchor", "middle")  
      .style("font-size", "16px") 
      .style("text-decoration", "underline")  
      .text("Pie Chart of Students Admitted versus Not Admitted");

  let dat = {admitted: d3.mean(pie_data.admitted), notAdmitted: d3.mean(pie_data.applied) - d3.mean(pie_data.admitted)}
  console.log(dat)
  // set the color scale
  var color = d3.scaleOrdinal()
    .domain(dat)
    .range(["#98ff56", "#8a89a6"])

  var pie = d3.pie()
    .value(function(d) {return d.value; })
  var data_ready = pie(d3.entries(dat))
  console.log(data_ready)
  // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
  svg
    .selectAll('piece')
    .data(data_ready)
    .enter()
    .append('path')
    .attr('d', d3.arc()
      .innerRadius(0)
      .outerRadius(radius)
    )
    .attr('fill', function(d){ return(color(d.data.key)) })
    .attr("stroke", "black")
    .style("stroke-width", "2px")
    .style("opacity", 0.7)


}



// HIGH CHARTS
document.getElementById("high-chart").addEventListener('click', function () {
  chartState = "high-chart";
  //h_barChart();
  //h_lineChart();
  h_pieChart();
  
});

// HIGH CHARTS
document.getElementById("d3js").addEventListener('click', function () {
  chartState = "d3js";
  // default line chart
  displayLineChart(applied_data);
  
});

function h_barChart() {
  let female = {};
  let male = {}; 

  let keys = Object.keys(highChart_data.female);


  for(let i = 0; i < keys.length; i++) {
    female[keys[i]] = d3.mean(highChart_data.female[keys[i]])
    male[keys[i]] = d3.mean(highChart_data.male[keys[i]])
  }
  
  Highcharts.chart('chart', {
    chart: {
        type: 'bar'
    },
    title: {
        text: 'Averages of Student Applicant, Admissions, and Enrollement (2005 - 2018)'
    },
    xAxis: {
        categories: ['Student Applicants', 'Student Admissions', 'Students Enrollment' ]
    },
    yAxis: {
        title: {
            text: 'Number of Students'
        }
    },
    series: [{
        name: 'Female',
        data: [female.applied, female.admitted, female.enrolled] // [applicants, admissions, enrolled]
    }, {
        name: 'Male',
        data: [male.applied, male.admitted, male.enrolled] // [applicants, admissions, enrolled]
    }]
});
}

function h_lineChart() {
  let series = [
    {
       name: 'Male Applicants',
       data: [...highChart_data.male.applied]
    }, 
    {
       name: 'Female Applicants',
       data: [...highChart_data.female.applied]
    }, 
    {
       name: 'Males Admitted',
       data: [...highChart_data.male.admitted]
    }, 
    {
       name: 'Females Admitted',
       data: [...highChart_data.female.admitted]
    },
    {
      name: 'Males Enrolled',
      data: [...highChart_data.male.enrolled]
   }, 
   {
      name: 'Females Enrolled',
      data: [...highChart_data.female.enrolled]
   }
 ];

    // Configuration about the plot
    var title = {
      text: 'Line Chart of Student data'   
  };
  var subtitle = {
      text: ''
  };
  var xAxis = {
      categories: [...highChart_data.years]
  };
  var yAxis = {
      title: {
        text: '# of Students'
      },
      plotLines: [{
        value: 0,
        width: 1,
        color: '#808080'
      }]
  };  
  var tooltip = {
      valueSuffix: '\xB0C'    // /xB0C is basically degrees
  }
  var legend = {
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'middle',
      borderWidth: 0
  };

  var json = {};

  // Tying all the configurations
  json.title = title;
  json.subtitle = subtitle;
  json.xAxis = xAxis;
  json.yAxis = yAxis;
  json.tooltip = tooltip;
  json.legend = legend;
  json.series = series;
  let chartArea = document.getElementById("chart");
  Highcharts.chart(chartArea, json);
}

function h_pieChart() {
  let dat = {admitted: d3.mean(pie_data.admitted), notAdmitted: d3.mean(pie_data.applied) - d3.mean(pie_data.admitted)}
  Highcharts.chart('chart', {
    chart: {
      type: 'pie'
    },
    title: {
      text: 'Average Admitted vs not Admitted (2005 - 2018)'
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f} %'
        }
      }
    },
    series: [{
      name: 'Males',
      colorByPoint: true,
      data: [{
        name: 'Males Admitted',
        y: dat.admitted,
        sliced: true,
        selected: true
      }, {
        name: 'Males not Admitted',
        y: dat.notAdmitted
      }]
    }]
  });
}