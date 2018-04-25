/* This file holds ajax request functions */

// bin the world data per year
function getWorldData() {

	document.getElementById("loader").style.display = "block";
	$.ajax({
		type: "POST",
		contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
		url: 'scripts/binned_data.php',
		dataType: 'json',
		async: true,
		data: jQuery.param({ data_path: data_path, year: cur_year}) , 
		success: function (response) {
			var response_data = JSON.parse(JSON.stringify(response));
			// put this data into nice array
			var data = processWorldData(response_data);
			drawWorldPoints(data);
			document.getElementById("loader").style.display = "none";
		},
		error: function (xhr, status, error) {
			document.getElementById("loader").style.display = "none";
			console.log(error);
			console.log(xhr.responseText);
		}
	})
}

// loading the total basic data for binning
// this may become too large w/ American data?
function getCountryTotalData(country) {
	document.getElementById("loader2").style.display = "block";
	$.ajax({
		type: "POST",
		contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
		url: 'scripts/country_total.php',
		dataType: 'json',
		async: true,
		data: jQuery.param({ data_path: data_path, country: country}) , 
		success: function (response) {
		   //var pos_data = data;
		   //div_name = "div.histogram";
			var response_data = JSON.parse(JSON.stringify(response));

			// bind the line data
			binned_line_data = binLineData(response_data);
			class_data = classificationData(response_data);
			build_lines_data(binned_line_data, "total");
			drawPieChart(binned_line_data, class_data);
			document.getElementById("loader2").style.display = "none";
			

		},
		error: function (xhr, status, error) {
			console.log(error);
			//console.log(result.responseText);
			document.getElementById("loader2").style.display = "none";
		}
	})
}

//// display the data
function showCountryGeoData(year, month, country) {
	document.getElementById("loader3").style.display = "block";
	$.ajax({
		type: "POST",
		contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
		url: 'scripts/country_geo.php',
		dataType: 'json',
		async: true,
		data: jQuery.param({ year: year, month : month, data_path: data_path, country: country}) , 
		success: function (response) {
			var response_data = JSON.stringify(response);
			display_data_json = JSON.parse(response_data);
			drawPoints(response);
			document.getElementById("loader3").style.display = "none";
		},
		error: function (xhr, status, error) {
			console.log(error);
			document.getElementById("loader3").style.display = "none";
		}
	})
}