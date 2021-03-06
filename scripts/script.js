
var data_url = './data/votes_concat.csv' //url of data file
var turnout_url = './data/turnout_by_county.csv'
//var data = {"counties":[]}
var result = {}
var turnout = {}
var headers = [
    {"label":"Precinct", "value":"Precinct"},
    {"label":"Results", "value":"votes"},
    {"label":"Total Votes", "value":"total"}
]
var lineWidth;

var window_width = $(window).width();
if( window_width <= 480 ){
  lineWidth = 1;
} else {
    lineWidth = 2.3;
}

var candidates = ["abrams", "kemp", "metz"]; //put names of candidates here
/*
data = {
    counties: [
        {
            county: 'Fulton',
            fips: #,
            precincts: [{}]
        }
    ]
]
}
*/




var updateSelect = function(data) {
    var select = document.getElementById('inputCounty')
    for (var county in data["counties"]) {
        var opt = document.createElement('option');
        opt.value = data.counties[county].name;
        opt.innerHTML = data.counties[county].name;
        select.appendChild(opt)
    }
}
//Calls functions to take data from csv to an object
var processData = function(data) {
    return csvToArray(data)
}

//Calls functions to take data from csv to an object
var processDataTurnout = function(data) {
    return csvToArrayTurnout(data)
}

//Processes from the csv to an array of headers and items
var csvToArray = function(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    var headers = allTextLines[0].split(',');
    var lines = [];

    for (var i=1; i<allTextLines.length; i++) {
        var data = allTextLines[i].split(',');
        if (data.length == headers.length) {

            var tarr = [];
            for (var j=0; j<headers.length; j++) {
                tarr.push(data[j]);
            }
            lines.push(tarr);
        }
    }    
    return arrayToObject(headers, lines)
}

//Processes from the csv to an array of headers and items for turnout
var csvToArrayTurnout = function(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    var headers = allTextLines[0].split(',');
    var lines = [];

    for (var i=1; i<allTextLines.length; i++) {
        var data = allTextLines[i].split(',');
        if (data.length == headers.length) {

            var tarr = [];
            for (var j=0; j<headers.length; j++) {
                tarr.push(data[j]);
            }
            lines.push(tarr);
        }
    }    
    return arrayToObjectTurnout(headers, lines)
}


//Processes from this array to an object for turnout
var arrayToObjectTurnout = function(headers, input) {
    var data = {"counties":[]} 
    for (var item in input) {
        var temp = {}
        var county = {}
        county['name'] = input[item][0];
        for (var m in headers) {
            var ignore = [0] //Change with headers to ignore
            if (!ignore.includes(parseInt(m))) {
                temp[headers[m]] = input[item][m]
            }
        }
        
        var index = countyExist(data.counties, county['name'])
        if (index != -1) {
          data.counties[index]['results'].push(temp);
        } else {
            county['results'] = [] 
            county['results'].push(temp);
            data.counties.push(county)
        }
        

    }
    return data
}

var getTotal = function(str, temp) {
    console.log(temp)
    var total = 0;
    for (var n in candidates) {
        total = total + parseInt(temp[candidates[n]+"_"+str])

    }
    return total

}


//Processes from this array to an object
var arrayToObject = function(headers, input) {
    var data = {"counties":[]} 
    for (var item in input) {
        var temp = {}
        var county = {}
        county['name'] = input[item][1];
        //county['fips'] = input[item][11]
        for (var m in headers) {
            var ignore = [5] //Change with headers to ignore
            if (!ignore.includes(parseInt(m))) {
                temp[headers[m]] = input[item][m]
            }
        }
        var total = 0;
        for (var n in candidates) {
            total = total + parseInt(temp[candidates[n]+'_votes'])

        }
        temp['total'] = total

        var index = countyExist(data.counties, county['name'])
        if (index != -1) {
          data.counties[index]['precincts'].push(temp);
        } else {
            county['precincts'] = [] 
            county['precincts'].push(temp);
            data.counties.push(county)
        }

    }
    return data

}

var countyExist = function(obj, county) {
    var result
    if (obj) {
        result = obj.findIndex(function(element) {
            return element.name == county
        })
        
    }
    return result
}

var getResult = function(num) {
    var index = countyExist(result.counties,num)
    var county;
    if (index >= 0) {
        county = result.counties[index]
        $(".county-title").html("<h1>" + toProperCase(county.name.replace("_"," ")) + " COUNTY</h1>")
        $(".county-title").append("<p><i>Please note these are only preliminary results.</i></p>")
        var index = countyExist(turnout.counties,num)
        var county_results = turnout.counties[index].results[0]
        console.log(county_results)
        if (county_results) {
            var c = '<div class="row county-results"><div class="col-xs-6 col-md-3"><h4>Turnout</h4><p>'+
                    wCommas(county_results.total)+' ('+(county_results.total/county_results.registered*100).toFixed(1)+'%)</p></div><div class="col-xs-6 col-md-3"><h4>Abrams</h4><p>'+
                    wCommas(county_results.abrams_votes)+'</p></div>';
            c = c + '<div class="col-xs-6 col-md-3"><h4>Kemp</h4><p>' + wCommas(county_results.kemp_votes)+'</p></div>' 
            c = c + '<div class="col-xs-6 col-md-3"><h4>Metz</h4><p>' + wCommas(county_results.metz_votes)+'</p></div>'       
            c = c + '<div class="col-xs-6 col-md-3"><h4>Mail Ballots</h4><p>' + wCommas(getTotal('absentee', county_results))+'</p></div>'
            c = c + '<div class="col-xs-6 col-md-3"><h4>Early Voting</h4><p>' + wCommas(getTotal('advance', county_results))+'</p></div>'
            c = c + '<div class="col-xs-6 col-md-3"><h4>Provisional</h4><p>' + wCommas(getTotal('provisional', county_results))+'</p></div>'
            c = c + '<div class="col-xs-6 col-md-3"><h4>Election Day</h4><p>' + wCommas(getTotal('election', county_results))+'</p></div>'
            c = c + '</div>'
            $(".county-title").append(c)
        }
        if (county.precincts.length > 0) {
            var body = "<table id='table-results' class='table table-striped table-hover'><thead>"
            for (var h in headers) {
               body = body +"<td>" + headers[h].label + "</td>"
            }
            body = body + "</thead>"
            body = body + "<tbody>"
            for (var l in county.precincts) {
                body = body + "<tr>"
                for (var h in headers) {
                    body = body + "<td>"
                    if(headers[h].value === 'Precinct') {
                        body = body + toProperCase(county.precincts[l][headers[h].value])

                    } else if (headers[h].value === 'total') {

                        body = body + wCommas(county.precincts[l].total)
                        
                    } else if (headers[h].value === 'votes') {
                        body = body + "<div class='dem'><div class='dem-text'><h4>"+toProperCase(candidates[0])+":</h4> <p>" + (county.precincts[l][candidates[0] +'_votes'] ? (wCommas(county.precincts[l][candidates[0] +'_votes'].split(".")[0]) + " (" + (((parseInt(county.precincts[l][candidates[0] +'_votes']))/(parseInt(county.precincts[l]['total']))*100).toFixed(1))+"%)")  : 'N/A') + "</p></div><div class='dem-rect' style='width:" + (((parseInt(county.precincts[l][candidates[0] +'_votes']))/(parseInt(county.precincts[l]['total']))*100).toFixed(1))*lineWidth+"px'></div></div>"
                        body = body + "<div class='rep'><div class='rep-text'><h4>"+toProperCase(candidates[1])+":</h4> <p>" + (county.precincts[l][candidates[1] +'_votes'] ? (wCommas(county.precincts[l][candidates[1] +'_votes'].split(".")[0]) + " (" + (((parseInt(county.precincts[l][candidates[1] +'_votes']))/(parseInt(county.precincts[l]['total']))*100).toFixed(1))+"%)") : 'N/A') + "</p></div><div class='rep-rect' style='width:" +(((parseInt(county.precincts[l][candidates[1] +'_votes']))/(parseInt(county.precincts[l]['total']))*100).toFixed(1))*lineWidth +"px'></div></div></div>"
                        body = body + "<div class='lib'><div class='lib-text'><h4>"+toProperCase(candidates[2])+":</h4> <p>" + (county.precincts[l][candidates[2] +'_votes'] ? (wCommas(county.precincts[l][candidates[2] +'_votes'].split(".")[0]) + " (" + (((parseInt(county.precincts[l][candidates[2] +'_votes']))/(parseInt(county.precincts[l]['total']))*100).toFixed(1))+"%)") : 'N/A') + "</p></div><div class='lib-rect' style='width:" +(((parseInt(county.precincts[l][candidates[2] +'_votes']))/(parseInt(county.precincts[l]['total']))*100).toFixed(1))*lineWidth +"px'></div></div></div>"

                    } else if (headers[h].value === 'f') {
                        
                    } else {
                        body = body + county.precincts[l][headers[h].value]
                    }
                    
                    body = body + "</td>"
                }
                body = body + "</tr>"
            }
            body = body + "</tbody></table>"
            $(".precincts").append(body)
            styleTable()
            $(".precincts").append("<p id='footer'>Data is from the Georgia Secretary of State</p>")
            
        } else {
            $(".county-title").html("Result for this " + county.name +" are not available yet")
        }
    } else {
        $(".county-title").html("Result for this county cannot be found")
    }
    //$("#county-title").innerHTML = ""
}

var getCounty = function(fips) {
    for (var m in result) {
        if (result.counties[m].fips = fips) {
            return result.counties[m]
        } 
    }
}

var styleTable = function() {
    var table = $('#table-results')
    var window_width = $(window).width();
    var w = ''
    if (window_width <= 480) {
        w = "20%"
    } else {
        w = "30%"
    }
    table.DataTable( {
        "columnDefs": [{
            "targets":[1],
            "orderable": false

        }],
        "autoWidth": false,
        "columns": [
            { "type": "string", "width": w},
            { "type": "num-fmt", "className":"dt-body-left"},
            { "type": "num-fmt" }
        ]
    });    
}

var wCommas = function(str) {
    return str.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

var toProperCase = function(str) {
  if(str){
    return str.toUpperCase();
    //return str.replace(/\w\S*/g, function(txt) {
      //return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    //});
  } else {
    return "";
  }
 }

//On load opens csv
$(document).ready(function() {
    $(".county-title").html("")
    $(".precincts").html("")
    $.ajax({
        beforeSend: function() {
            document.body.style.cursor='wait';
        },
        type: "GET",
        url: data_url,
        dataType: "text",
        success: function(stuff) { 
            data = processData(stuff); 
            updateSelect(data)
            result = data
            document.body.style.cursor='default';
        }
    });
    
    $.ajax({
        beforeSend: function() {
            document.body.style.cursor='wait';
        },
        type: "GET",
        url: turnout_url,
        dataType: "text",
        success: function(stuff) { 
            data = processDataTurnout(stuff); 
            turnout = data
            document.body.style.cursor='default';
        }
    });
    
    $("#county-select").submit(function(e) {
        e.preventDefault()
        $(".county-title").html("")
        $(".precincts").html("")
        $( "#county-select option:selected" ).val();
        var value = $("#county-select option:selected").val();
        getResult(value)
    })

    $("#inputCounty").change(function(e) {
        e.preventDefault();
        $("input[type=submit]").removeAttr("disabled");

    })

    $( window ).resize(function() {
        if( window_width <= 480 ){
            lineWidth = 1;
          } else {
              lineWidth = 2.3;
          }
          
    });
});
//Adds listener for county select button
