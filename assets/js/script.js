const apiKey = "3546a528cef6b98c7f1247abd132df88";

var searchText = $('#searchText');
var searchBtn = $('#searchBtn');
var cityList = $('#cityList');
var divTodayForcast = $('#todayForcast');
var currentCityinfo = $('#currentCityinfo');
var divFiveDay = $('#fiveDayForcast');

var lat = 33.3062;
var lon = -111.8413;
var currentCity = 'Chandler,Arizona,US';

var todayDate = moment().format('L');
const kevlinToFahrenheit = tempKel => tempKel - 255.372; // -255.372 kelvin = 0 deg Fahrenheit

// Display 5 days of data
function FiveDayWeather(currentCity, lat, lon) {
    var city = currentCity.split(',');
    currentCityinfo.text(city[0] + ',' + city[1] + ', ' + todayDate);

    var weatherUrl = 'https://api.openweathermap.org/data/2.5/forecast?lat=' + lat + '&lon=' + lon + '&exclude=hourly,daily' + '&appid=' + apiKey;

    fetch(weatherUrl)
        .then(function (resp) {
            return resp.json()
        })
        .then(function (data) {

            var dataList = data.list;

            var tDate = moment(new Date(todayDate)).format('DD');

                var id =1;
                
                for (var i = 0; i < dataList.length; i++) {
                    var nextDate = moment(new Date(dataList[i].dt_txt)).format('DD');                       
                    $('#' + id).empty();

                    if (nextDate !== tDate) {

                        var weatherData = dataList[i].main;
                        
                        var windSpeed = dataList[i].wind;
                        
                        var dataIcon = dataList[i].weather;
                        
                        var iconUrl = 'http://openweathermap.org/img/wn/' + dataIcon[0].icon + '@2x.png';
                                                
                        var temp = Math.round(kevlinToFahrenheit(weatherData.temp)).toFixed(2);
                        var dayDate = moment(new Date(dataList[i].dt_txt)).format('dddd');

                        $('#' + id).append($('<div>').text(dayDate));
                        $('#' + id).append($('<img>').attr('src',iconUrl));
                        $('#' + id).append($('<div>').text('Temp: ' + temp + '\u00B0 F'));
                        $('#' + id).append($('<div>').text('Wind: ' + windSpeed.speed + ' MPH'));
                        $('#' + id).append($('<div>').text('Humidity: ' + weatherData.humidity + ' %'));
                        
                        tDate = nextDate;
                        id++;
                    }


                }

        })
        .catch(function () {
            // catch any errors
        });

}


function getWeatherByGeo(lat, lon) {
    var weatherUrl = 'https://api.openweathermap.org/data/2.5/forecast?lat=' + lat + '&lon=' + lon + '&appid=' + apiKey + '&exclude=hourly';

    fetch(weatherUrl)
        .then(function (resp) {
            return resp.json()
        })
        .then(function (data) {

            for (var i = 0; i <= data.length; i++) {
                divTodayForcast.append($('<option>').val(i + 1).text(data[i].name + ',' + data[i].state + ',' + data[i].country));
            }

        })
        .catch(function () {
            // catch any errors
        });
}

function defaultWeather(currentCity, lat, lon) {

    var city = currentCity.split(',');
    currentCityinfo.text(city[0] + ',' + city[1] + ', ' + todayDate);

    var weatherUrl = 'https://api.openweathermap.org/data/2.5/forecast?lat=' + lat + '&lon=' + lon + '&appid=' + apiKey + '&exclude=hourly';

    fetch(weatherUrl)
        .then(function (resp) {
            return resp.json()
        })
        .then(function (data) {

            var dataList = data.list;
            var weatherData = dataList[0].main;
            var windSpeed = dataList[0].wind;
            var dataIcon = dataList[0].weather;
            var iconUrl = 'http://openweathermap.org/img/wn/' + dataIcon[0].icon + '@2x.png';
            $('#currentIcon').attr('src', iconUrl);
            //console.log(iconUrl);
            var temp = Math.round(kevlinToFahrenheit(weatherData.temp)).toFixed(2);
            $('#currentTemp').text('Temp: ' + temp + '\u00B0 F');
            $('#currentWind').text('Wind: ' + windSpeed.speed + ' MPH');
            $('#currentHumidity').text('Humidity: ' + weatherData.humidity + ' %');


            for (var i = 0; i <= data.length; i++) {

                divTodayForcast.append($('<option>').val(i + 1).text(data[i].name + ',' + data[i].state + ',' + data[i].country));
            }

        })
        .catch(function () {
            // catch any errors
        });

}
defaultWeather(currentCity, lat, lon);
FiveDayWeather(currentCity, lat, lon);

// Populate city name, state and country searching by city name
function searchGeoByCity(city) {
    var geoUrl = 'http://api.openweathermap.org/geo/1.0/direct?q=' + city + '&limit=5&appid=' + apiKey;
    fetch(geoUrl)
        .then(function (resp) {
            return resp.json()
        })
        .then(function (data) {
            console.log(data);
            cityList.children().remove().end();
            cityList.append($('<option disabled selected>').val(0).text('Select your city'));

            for (var i = 0; i <= data.length; i++) {
                cityList.append($('<option>').val(i + 1).text(data[i].name + ',' + data[i].state + ',' + data[i].country));
            }

        })
        .catch(function () {
            // catch any errors
        });
}

function getGeoByCity(selectedCity) {
    var geoUrl = 'http://api.openweathermap.org/geo/1.0/direct?q=' + selectedCity + '&limit=5&appid=' + apiKey;
    fetch(geoUrl)
        .then(function (resp) {
            return resp.json()
        })
        .then(function (data) {
            console.log(data);
            selectedCity = selectedCity.split(',');
            //console.log(selectedCity);
            for (var i = 0; i <= data.length; i++) {

                if (((selectedCity[0]) === data[i].name) && ((selectedCity[1]) === data[i].state) && ((selectedCity[2]) === data[i].country)) {

                    defaultWeather(selectedCity, data[i].lat, data[i].lon);

                }
            }

        })
        .catch(function () {
            // catch any errors
        });
}

// Search button click
searchBtn.on('click', function () {
    searchGeoByCity(searchText.val());
    FiveDayWeather(currentCity, lat, lon);
    
});

// Selecct change status
cityList.on('change', function (e) {
    var text = $(this).find('option:selected').text();

    getGeoByCity(text);
    defaultWeather(text, lat, lon);
    

    addToLocalStorage(text);

});


// Store search in localStorage
function addToLocalStorage(text) {
    var id = localStorage.length;
    localStorage.setItem(id+1, text);
    $('#prevSearch').append('<input type="button" class="w-100 mb-2" value="' + localStorage.getItem(id+1) + '">');
}
//localStorage.clear();
//Clear localStorage
$('#clearSearch').on('click', function () {
    console.log(localStorage.length);
    localStorage.clear();
    $('#prevSearch').empty();
})
// Get previously search results
function getLocalStorageData() {
    if (localStorage.length > 0) {
        $('#prevSearch').append('<input type="button" class="w-100 mb-2 btn-danger" id="clearSearch" value="Clear Search">');
        for (var x= 1; x <= localStorage.length; x++) {
            $('#prevSearch').append('<input type="button" class="w-100 mb-2" value="' + localStorage.getItem(x) + '">');
            
        }
    }
}
getLocalStorageData();