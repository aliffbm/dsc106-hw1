/*
The purpose of this demo is to demonstrate how multiple charts on the same page
can be linked through DOM and Highcharts events and API methods. It takes a
standard Highcharts config with a small variation for each data set, and a
mouse/touch event handler to bind the charts together.
*/


/**
 * In order to synchronize tooltips and crosshairs, override the
 * built-in events with handlers defined on the parent element.
 */

  
//   /**
//    * Override the reset function, we don't need to hide the tooltips and
//    * crosshairs.
//    */
//   Highcharts.Pointer.prototype.reset = function () {
//     return undefined;
//   };
  
//   /**
//    * Highlight a point by showing tooltip, setting hover state and draw crosshair
//    */
//   Highcharts.Point.prototype.highlight = function (event) {
//     event = this.series.chart.pointer.normalize(event);
//     this.onMouseOver(); // Show the hover marker
//     this.series.chart.tooltip.refresh(this); // Show the tooltip
//     this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
//   };
  

  
//   // Get the data. The contents of the data file can be viewed at
//   Highcharts.ajax({
//     url: 'assets/springfield.json',//'https://cdn.jsdelivr.net/gh/highcharts/highcharts@v7.0.0/samples/data/activity.json',
//     dataType: 'text',
//     success: function (activity) {
  
//       activity = JSON.parse(activity);
//       console.log(activity)
//       debugger;
//       activity.datasets.forEach(function (dataset, i) {
  
//         // Add X values
//         dataset.data = Highcharts.map(dataset.data, function (val, j) {
//           console.log(val, j)
//           return [activity.xData[j], val];
//         }); 
  
//         var chartDiv = document.createElement('div');
//         chartDiv.className = 'chart';
//         document.getElementById('sharedGrid').appendChild(chartDiv);
  
//         Highcharts.chart(chartDiv, {
//           chart: {
//             marginLeft: 40, // Keep all charts left aligned
//             spacingTop: 20,
//             spacingBottom: 20
//           },
//           title: {
//             text: dataset.name,
//             align: 'left',
//             margin: 0,
//             x: 30
//           },
//           credits: {
//             enabled: false
//           },
//           legend: {
//             enabled: false
//           },
//           xAxis: {
//             crosshair: true,
//             events: {
//               setExtremes: syncExtremes
//             },
//             labels: {
//               format: '{value} km'
//             }
//           },
//           yAxis: {
//             title: {
//               text: null
//             }
//           },
//           tooltip: {
//             positioner: function () {
//               return {
//                 // right aligned
//                 x: this.chart.chartWidth - this.label.width,
//                 y: 10 // align to title
//               };
//             },
//             borderWidth: 0,
//             backgroundColor: 'none',
//             pointFormat: '{point.y}',
//             headerFormat: '',
//             shadow: false,
//             style: {
//               fontSize: '18px'
//             },
//             valueDecimals: dataset.valueDecimals
//           },
//           series: [{
//             data: dataset.data,
//             name: dataset.name,
//             type: dataset.type,
//             color: Highcharts.getOptions().colors[i],
//             fillOpacity: 0.3,
//             tooltip: {
//               valueSuffix: ' ' + dataset.unit
//             }
//           }]
//         });
//       });
//     }
//   });
  




['mousemove', 'touchmove', 'touchstart'].forEach(function (eventType) {
    document.getElementById('sharedGrid').addEventListener(
      eventType,
      function (e) {
        var chart,
          point,
          i,
          event;
  
        for (i = 0; i < Highcharts.charts.length; i = i + 1) {
          chart = Highcharts.charts[i];
          // Find coordinates within the chart
          event = chart.pointer.normalize(e);
     
          // Get the hovered point
          point = chart.series[0].searchPoint(event, true);
  
          if (point) {
            point.highlight(e);
          }
        }

  
      }
    );
  });

  Highcharts.Pointer.prototype.reset = function () {
    return undefined;
  };

  Highcharts.Point.prototype.highlight = function (event) {
    event = this.series.chart.pointer.normalize(event);
     
    if((this.series.name == "temperature") || this.series.name == "price"){
        this.onMouseOver();
        this.series.chart.tooltip.refresh(this);
    }
   
    this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
  };
  

  /**
   * Synchronize zooming through the setExtremes event handler.
   */
  function syncExtremes(e) {
    var thisChart = this.chart;
  
    if (e.trigger !== 'syncExtremes') { // Prevent feedback loop
      Highcharts.each(Highcharts.charts, function (chart) {
        if (chart !== thisChart) {
          if (chart.xAxis[0].setExtremes) { // It is null while updating
            chart.xAxis[0].setExtremes(
              e.min,
              e.max,
              undefined,
              false,
              { trigger: 'syncExtremes' }
            );
          }
        }
      });
    }
  }


const JSONFileName = 'assets/sample_data.json';

Highcharts.ajax({
        url: 'assets/springfield.json',//'https://cdn.jsdelivr.net/gh/highcharts/highcharts@v7.0.0/samples/data/activity.json',
        dataType: 'text',
        success: function (activity) {
      
          activity = JSON.parse(activity);
        //   activity.data.forEach(function (dataset, i) {})
          console.log(activity)
          let data1 = activity[0]
          let powerData = activity.filter(function(element) {
                return element.type=='power' && element.fuel_tech!='exports' && element.fuel_tech !='pumps'
          }).map(function(el) {
              let color = {
                  "rooftop_solar": "#ffff00",
                  "black_coal": "#000",
                  "gas_ccgt": '#e0b670',
                  "distillate": '#e35933',
                  "hydro": "#5481b2",
                  "wind": "#4f7321"
              }
              return {
                  data: el.history.data,
                  name: el.fuel_tech,
                  color: color[el.fuel_tech],
                  type: 'area',
                  start: el.history.start
              }
          })
          let theRest = activity.filter(function(element) {
              return element.type != "power" && element.type !='demand';
          }).map(function(el){
                return {
                    data: el.history.data,
                    name: el.type,
                    type: "line",
                    color: "#ff0000",
                    start: el.history.start
                }
          })

          powerData = powerData.reverse();
          let data = [powerData, [theRest[0]], [theRest[1]]]

          data.forEach(function(dataset, i) {
            var chartDiv = document.createElement('div');
    
            chartDiv.className = 'chart';
            document.getElementById('sharedGrid').appendChild(chartDiv);
            let xAx;
            if(i == 0){
                xAx = {
                    type: 'datetime',
                    crosshair: true,
                    dateTimeLabelFormats: {
                    second: '<br/>%H:%M:%S',
                    minute: '<br/>%H:%M:%S',
                    hour: '<br/>%H:%M:%S',
                    day: '%A<br/>%b-%d',
                    week: '%A<br/>%b-%d',
                    },
                    labels: {
                        padding: '10px'
                    },
                    events: {
                        setExtremes: syncExtremes
                    }
                }
            } else {
                xAx = {
                    type:'datetime',
                    labels: {
                        enabled: false
                    },
                    crosshair: true,
                    events: {
                        setExtremes: syncExtremes
                    }
                }
            }
            Highcharts.chart(chartDiv, {
                chart: {
                  type: 'area',
                  backgroundColor: "#eceae8"
                },
                title: {
                  text: (i==0)? 'Generetion MW' : (i==1) ? 'Price $/MWh' : 'Temperature °F',
                  align: 'left'
                },
                xAxis: xAx,
                yAxis: {
                  title: {
                    text: ''
                  },
                //   labels: {
                //     formatter: function () {
                //       return this.value / 1000;
                //     }
                //   }
                },
                tooltip: {
                  enabled: false
                  
                },
                legend: {
                    enabled: false
                },
                plotOptions: {
                  area: {
                    stacking: 'normal',
                    lineColor: '#666666',
                    lineWidth: 1,
                    marker: {
                      lineWidth: 1,
                      lineColor: '#666666'
                    }
                  },
                  series: {
                       pointStart: 1571579700*1000, // userd starting UNIX number
                       pointInterval: 5*60*1000,
                       point: {
                           events: {
                               mouseOver: function() {
                                   var chart = this.series.chart;
                                   if(!chart.lbl){
                                       chart.lbl = chart.renderer.label('').attr({
                                           padding: 1, 
                                           r: 1, 
                                           fill: Highcharts.getOptions().colors[1]
                                       })
                                       .css({
                                           color: '#fff',
                                       })
                                       .add();
                                   }
                                   let date = (new Date(this.x))
                                   let getHours = date.getHours()
                                   let hours =  getHours % 12;
                                   let meridiem = (getHours > 12) ? 'PM' : 'AM';
                                   hours = (hours == 0) ? 12 : hours;
                                   let minutes = String(date.getMinutes()).padStart(2, '0')
                                   let time = hours + ":"+minutes + " " + meridiem;
                                   
                                   date = date.toDateString();
                                   date = date.split(" ")
                                   date.pop()
                                   date.shift()
                                   date = date.reverse()
                                   date = date[0] + " " + date[1]
                                   let label;
                                   
                            
                                   
                                   if(this.series.name != 'temperature' && this.series.name!='price'){ 
                                        label = 'Total ' + this.total;
                                        // add total to table
                                        document.getElementById("total").innerText = this.total;
                                        document.getElementById("net").querySelector('.power').innerText = this.total;
                                        let tag = document.getElementById(this.series.name);
                                        tag.querySelector('.power').innerText = this.y;
                                        tag.querySelector('.contribution').innerText = ((this.y / this.total) * 100).toFixed(2) + "%";

                                        let wind = document.getElementById('wind').querySelector('.contribution');
                                        let hydro = document.getElementById('hydro').querySelector('.contribution');
                                        
                                        if(wind.innerText && hydro.innerText) {
                                        
                                           let added= new Number(wind.innerText.replace("%", "")) + new Number (hydro.innerText.replace("%", ""))
                                           document.getElementById("renewables").querySelector(".contribution").innerText = added.toFixed(2) + "%";
                                        }
                                           
                                   }else {
                                       if(this.series.name == 'temperature'){
                                           label = '°' + this.y
                                       } else {
                                        label = '$' + this.y
                                        document.getElementById('MWh').innerText = label;
                                       }
                                       
                                   }
                                  
                                   chart.lbl.show().attr({
                                       text: date + ', ' + time + ' | ' + label,
                                       x: chart.chartWidth - chart.lbl.width
                                   }).css({
                                       backgroundColor: "white"
                                   });
                               }
                           }
                       }
                  }
                },
                series: dataset
              });
              
          })
          
        }

})


