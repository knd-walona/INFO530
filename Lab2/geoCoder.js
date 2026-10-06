// my api key for google maps
var myApiKey = "AIzaSyCUrXltBNrIPML-9uX-OeHpo6ZPVHs8Zf4";

// urls for the census api
var benchmarkUrl = "https://geocoding.geo.census.gov/geocoder/benchmarks";
var geocodeUrl = "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress";

// this variable will hold the default benchmark id
var defaultBenchmark = "";

// when the page loads, go get the benchmarks
window.onload = function() {
  getBenchmarks();
};

function getBenchmarks() {
  document.getElementById("statusMsg").innerHTML = "loading benchmarks...";

  fetch(benchmarkUrl + "?format=json")
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      var mySelect = document.getElementById("benchmarkSelect");
      mySelect.innerHTML = ""; // clear out the loading option

      for (var i = 0; i < data.benchmarks.length; i++) {
        var b = data.benchmarks[i];
        var newOption = document.createElement("option");
        newOption.value = b.id;
        newOption.innerHTML = b.benchmarkName;
        if (b.isDefault == true) {
          newOption.selected = true;
          defaultBenchmark = b.id;
        }
        mySelect.appendChild(newOption);
      }

      document.getElementById("statusMsg").innerHTML = "";
    })
    .catch(function(error) {
      // this usually happens because of CORS, need to disable it in the browser
      document.getElementById("statusMsg").innerHTML = "oops, could not load benchmarks. probably a CORS error, check the console.";
    });
}

function getLocation() {
  var myAddress = document.getElementById("addressInput").value;
  var myBenchmark = document.getElementById("benchmarkSelect").value;

  if (myAddress == "") {
    alert("please type an address!");
    return;
  }

  document.getElementById("statusMsg").innerHTML = "loading...";

  // build the url with the address and benchmark
  var fullUrl = geocodeUrl + "?address=" + encodeURIComponent(myAddress) + "&benchmark=" + myBenchmark + "&format=json";

  fetch(fullUrl)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      if (data.result.addressMatches.length == 0) {
        document.getElementById("statusMsg").innerHTML = "no match found, try again";
        return;
      }

      var firstMatch = data.result.addressMatches[0];
      var theAddress = firstMatch.matchedAddress;
      var theLat = firstMatch.coordinates.y;
      var theLng = firstMatch.coordinates.x;

      document.getElementById("matchedAddress").innerHTML = theAddress;
      document.getElementById("latVal").innerHTML = theLat;
      document.getElementById("lngVal").innerHTML = theLng;

      document.getElementById("statusMsg").innerHTML = "";

      // now make the map show up
      showMap(theAddress, theLat, theLng);
    })
    .catch(function(error) {
      document.getElementById("statusMsg").innerHTML = "oops, something went wrong. probably CORS, check console.";
    });
}

function showMap(theAddress, theLat, theLng) {
  // q = the address (drops the pin)
  // center = the lat/lng (centers the map)
  var mapUrl = "https://www.google.com/maps/embed/v1/place?key=" + myApiKey + "&q=" + encodeURIComponent(theAddress) + "&center=" + theLat + "," + theLng + "&zoom=16";

  document.getElementById("mapFrame").src = mapUrl;
}

function clearStuff() {
  document.getElementById("addressInput").value = "";
  document.getElementById("matchedAddress").innerHTML = "";
  document.getElementById("latVal").innerHTML = "";
  document.getElementById("lngVal").innerHTML = "";
  document.getElementById("statusMsg").innerHTML = "";
  document.getElementById("mapFrame").src = "";
  if (defaultBenchmark != "") {
    document.getElementById("benchmarkSelect").value = defaultBenchmark;
  }
}