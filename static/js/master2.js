// Global Variables
var map, marker_color, infoWindow, width, cityCircle;
var markers = [];
var res_markers = [];

// Set Center position for each line
var center = {
  'all': {
    location: {
      lat: 49.2459869,
      lng: -122.9921611
    }
  },
  'Millenium': {
    location: {
      lat: 49.2534047,
      lng: -122.9181552
    }
  },
  'Expo': {
    location: {
      lat: 49.2257737,
      lng: -123.0037583
    }
  },
  'Canada': {
    location: {
      lat: 49.2263277,
      lng: -123.1160772
    }
  },
};

function Station(data) {
  var self = this;

  self.line = data.line;
  self.title = data.title;
  self.location = data.location;
}

// Main View Model to be binded with HTML
function ViewModel() {
  var self = this;

  //Initialize an empty array to be hold all station information
  self.totalList = [];

  // Push station information into the array
  stations.forEach(function(item) {
    self.totalList.push(new Station(item));
  });

  this.query = ko.observable('');

  this.filteredLine = ko.observableArray([]);
  this.filteredBeforeQuery = ko.observableArray([]);

  this.lineType = ko.observable('all');

  // add all markers into the array
  addMarker(self.totalList);

  this.linesToShow = ko.computed(function() {

    // If Radio button is clicked,
    // set map options to the default setting
    var selectedLine = this.lineType();
    mapCenter(selectedLine);
    var filter = self.query().toLowerCase();

    // If a infoWindow is being displayed, close it
    if(infoWindow) {
        infoWindow.close();
    }

    // if 'all' is selected,
    if (selectedLine == "all") {
      // if searchbox is empty, return all stations,
      // otherwise, return matching stations
      this.filteredLine = ko.computed(function() {
        if (filter.length === 0) {
          return self.totalList;
        } else {
          return ko.utils.arrayFilter(self.totalList, function(items) {
            return items.title.toLowerCase().indexOf(filter) >= 0;
          });
        }
      });
    } else {
      // if a specific line is selected, return all stations of the selected line
      this.filteredBeforeQuery = ko.utils.arrayFilter(self.totalList, function(station) {
        return (station.line[0] == selectedLine || station.line[1] == selectedLine);
      });

      // if searchbox is empty, return all stations from above,
      // otherwise, return matching stations
      this.filteredLine = ko.computed(function() {
        if (filter.length === 0) {
          return self.filteredBeforeQuery;
        } else {
          return ko.utils.arrayFilter(self.filteredBeforeQuery, function(items) {
            return items.title.toLowerCase().indexOf(filter) >= 0;
          });
        }
      });
    }


    displayMarker(this.filteredLine());
//     console.log(markers);
    return this.filteredLine();
  }, this);

  // if the station is selected from the filtered list,
  // return the station and show its infoWindow.
  // Then hide station list.
  self.showInfo = function(data) {
    found = ko.utils.arrayFirst(markers, function(item) {
      return item.title == data.title;
    });
    showInfoWindow(found.content, found);
    self.isVisible(false);
  };

  // Clear search field when users click the button
  this.clear = function() {
    this.query('');
    if (self.isVisible) {
      self.isVisible(false);
    }
  };

  // Hide station list as default
  self.isVisible = ko.observable(false);

  // Show X button in the searchbox if a station list is visible and
  // search box contains some characters.
  // Hide the button otherwise.
  this.visibleCheck = function() {
    if (self.isVisible()) {
      if (self.query().length >= 0)
        return true;
    } else {
      return false;
    }
  };
}

// Add map markers
function addMarker(list) {
  for (var i = 0; i < list.length; i++) {
    // Set map marker color
    marker_color = setMarkerColor(list[i].line);

    // Create new marker instance
    mkr = new google.maps.Marker({
      position: list[i].location,
      icon: marker_color,
      title: list[i].title,
      visible:false,
      map:map
    });
    mkr.content = contentBuilder(list[i]);
    // Add 'click' eventlistener to each marker
    google.maps.event.addListener(mkr, 'click', info);

    // Add marker elements into the markers array
    markers.push(mkr);
  }
}

// show/hide map markers using filteredList array
function displayMarker(filteredList) {
    var k = 0;
    var j = 0;
    var size = filteredList.length;

    // Set all map markers hide
    hideMarkers();

    // Set only filtered station markers visible
    while (size > k) {
        if (markers[j].title == filteredList[k].title) {
            markers[j].setVisible(true);
            k++;
        }
        j++;
    }
}

// Hide all map markers
function hideMarkers() {
    for(var i = 0; i < markers.length; i++) {
        markers[i].setVisible(false);
    }
    clearMarker(res_markers);
}

function info() {
  showInfoWindow(this.content, this);
}

// Create Info Window content using the data passed in
function contentBuilder(data) {
  var content = '';
  var lines = '';
  var title = data.title;
  var location = data.location;
  var line = data.line;
  // var initial = (line[0]).charAt(0);
  var initial = (line[0]);

  if (line.length > 1) {
    // var initial1 = (line[1]).charAt(0);
    var initial1 = (line[1]);

    lines = '<div class="initial" id="' + line[0].toLowerCase() + '">' +
      '<span>' + initial + '</span>' +
      '</div>' +
      '<div class="initial" id="' + line[1].toLowerCase() + '">' +
      '<span>' + initial1 + '</span>' +
      '</div>';
  } else {
    lines = '<div class="initial" id="' + line[0].toLowerCase() + '">' +
      '<span>' + initial + '</span>' +
      '</div>';
  }

  var info_content = '<div class="content-wrapper">' +
    '<h3 class="lead">' +
    title + '</h3>' +
    '<div class="line-wrapper center">' +
    lines +
    '</div>' +
    '</div>';

  return info_content;
}


// Display markers on the map
function showMarker(map,list) {
  for (var i = 0; i < list.length; i++) {

    marker = list[i];
    marker.setMap(map);
  }
}

// Remove all markers on the map
function clearMarker(smarker) {

// if radius circle is being displayed on the the map, remove it
  if (cityCircle) {
    cityCircle.setMap(null);
  }

  // if smarker exists, remove markers on the map and remove all elements
  // in the array
  if (smarker.length > 0) {
    showMarker(null, smarker);
    res_markers = [];
  }
}

// When a specific marker is clicked, display the info window of the selected marker
// and create / add markers of nearest restaurants using the data received
// from the foursquare api.
// When another station is selected, remove all information from the previous station
// and display information for the current selected marker
function showInfoWindow(data, marker) {

  // If circle radius is being displayed on the map, remove it
  if (cityCircle) {
    cityCircle.setMap(null);
  }

  // If array contains marker elements, remove them from the map
  if (res_markers.length > 0) {
    for (var i = 0; i < res_markers.length; i++) {
      store_marker = res_markers[i];
      store_marker.setMap(null);
    }

    // Remove all map marker elements in the array
    res_markers = [];
  }



  // Set content of the infoWindow
  infoWindow.setContent(data);

  // Make the marker bounce when the infowindow opens
  marker.setAnimation(google.maps.Animation.BOUNCE);

  // Move between markers
  map.panTo(marker.position);

  // Zoom in when displaying info window
  if (width < 781) {
    map.setZoom(15);
  } else {
    map.setZoom(17);
  }

  // Set circle radius of 200m
  cityCircle = new google.maps.Circle({
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#FF0000',
    fillOpacity: 0.35,
    map: map,
    center: marker.position,
    radius: 200
  });
  infoWindow.open(map, marker);

  // Remove bouncing effect after three bounces
  setTimeout(function() {
    marker.setAnimation(null);
  }, 2100); // 700ms for one bounce. 2100 = three bounces

  // Get latitude / longitude of the selected station
  var thisLat = marker.getPosition().lat();
  var thisLng = marker.getPosition().lng();

  // Foursquare credential
  var client_id = 'your_id';
  var client_secret = 'your_secret';

  // Foursquare api url and search term.
  // Display upto 10 restaurants.
  var turl = 'https://api.foursquare.com/v2/venues/search?';
  var term = '&query=sushi+pizza&radius=200&limit=10';

  // Find pizza and sushi restaurants within 200m from the selected station
  var url = turl +
    'll=' + thisLat + ',' + thisLng + term +
    '&client_id=' + client_id + '&client_secret=' + client_secret +
    '&v=20170724';

  $.getJSON(url, function(data) {

    // if no restaurants are found,
    // display alert message to users
    if(data.response.venues.length === 0) {
      alert("No nearby restaurants found");
    }else {
      for (var i = 0; i < data.response.venues.length; i++) {

        // Store the restaurant data
        var store_name = data.response.venues[i].name;
        var store_lat = data.response.venues[i].location.lat;
        var store_lng = data.response.venues[i].location.lng;
        var store_addr = data.response.venues[i].location.formattedAddress[0] +
          data.response.venues[i].location.formattedAddress[1];

        // Create new marker object for the restaurant
        store_marker = new google.maps.Marker({
          position: {
            lat: store_lat,
            lng: store_lng
          },
          icon: 'https://maps.google.com/mapfiles/ms/icons/restaurant.png',
          title: store_name,
          map: map
        });
        store_marker.content = '<h4>' + store_name + '</h4>' + '<p>' + store_addr + '</p>';

        // Add 'click' event listener to each marker
        google.maps.event.addListener(store_marker, 'click', restaurantInfo);

        // Store restaurant markers in the array called 'res_markers'
        res_markers.push(store_marker);
      }
    }
  }).fail(function(jqxhr){
    // show error message to users if request fails
    errorMsg(jqxhr);
  });
}

// Function to display infowindow of the selected restaurant
function restaurantInfo() {
  infoWindow.setContent(this.content);
  infoWindow.open(map, this);
}

// Create Error Message and display to users
function errorMsg(data){
  var t;

  var errorDiv = document.createElement("DIV");
  var errorP = document.createElement("P");
  var errorDet = document.createElement("DIV");
  var closeBtn = document.createElement("SPAN");
  var detailBtn = document.createElement("A");

  var msg = document.createTextNode("Failed to fetch data from server");
  var btnClose = document.createTextNode("Open detail");
  var btnOpen = document.createTextNode("Close detail");


  errorDiv.className = 'errorHandler';
  errorDet.className = 'errorDetail collapse';
  detailBtn.className = 'errorBtn btn btn-danger';
  closeBtn.className = "close fa fa-times";

  errorDet.setAttribute('id', 'errors');
  detailBtn.setAttribute('data-toggle', 'collapse');
  detailBtn.setAttribute('href', '#errors');

  // if data does not have responseJSON field,
  if(!data.responseJSON){
     var a = document.createElement("P");
          a.className = "errorContent";
          t = document.createTextNode(data.statusText.toUpperCase() + ". Failed to fetch data. Check your URL or other settings");
          a.appendChild(t);
          errorDet.appendChild(a);
  }else{
  // if data does have responseJSON field,
     $.each(data.responseJSON.meta, function(i, item){
          var a = document.createElement("P");
          a.className = "errorContent";
          t = document.createTextNode(i +' : ' + item);
          a.appendChild(t);
          errorDet.appendChild(a);
      });
  }

  errorP.appendChild(msg);
  errorDiv.appendChild(errorP);
  detailBtn.appendChild(btnClose);
  errorDiv.appendChild(detailBtn);
  errorDiv.appendChild(errorDet);
  errorDiv.appendChild(closeBtn);

  // When button clicks, change its text
  detailBtn.addEventListener('click', function(){
    console.log(detailBtn.childNodes[0]);
    if(errorDiv.className == 'errorHandler') {

      errorDiv.className = 'errorHandler detail-open';
      detailBtn.replaceChild(btnOpen, detailBtn.childNodes[0]);

    }else {
      errorDiv.className = 'errorHandler';
      detailBtn.replaceChild(btnClose, detailBtn.childNodes[0]);
    }
  });

  // When the button clicks, remove errorDiv from the body
  closeBtn.addEventListener('click', function(){
    document.body.removeChild(errorDiv);
  });

  document.body.appendChild(errorDiv);
}


// When a different line is selected, change the center position of the map
function mapCenter(line) {
  // Set map zoom level based on the current window width
  if (width < 781) {
    map.setZoom(10);
  } else {
    map.setZoom(11);
  }
  map.panTo(center[line].location);
}

// Function to set map marker color
function setMarkerColor(data) {
  if (data.length > 1) {
    marker_color = "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
  } else {
    switch (data[0]) {
      case "Millenium":
        marker_color = "https://maps.google.com/mapfiles/ms/icons/red-dot.png";
        break;

      case "Expo":
        marker_color = "https://maps.google.com/mapfiles/ms/icons/blue-dot.png";
        break;

      case "Canada":
        marker_color = "https://maps.google.com/mapfiles/ms/icons/green-dot.png";
        break;
    }
  }
  return marker_color;
}

// Add zoom control div on the map
// Code is taken from google map api documents
function zoomControl(controlDiv, map) {

  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor = '#fff';
  controlUI.style.border = '2px solid #fff';
  controlUI.style.borderRadius = '3px';
  controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  controlUI.style.cursor = 'pointer';
  controlUI.style.marginBottom = '22px';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'Click to recenter the map';
  controlDiv.appendChild(controlUI);

  // Set CSS for the control interior.
  var controlText = document.createElement('div');
  controlText.style.color = 'rgb(25,25,25)';
  controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlText.style.fontSize = '16px';
  controlText.style.lineHeight = '38px';
  controlText.style.paddingLeft = '5px';
  controlText.style.paddingRight = '5px';
  controlText.innerHTML = 'Reset Zoom Level';
  controlUI.appendChild(controlText);

  controlUI.addEventListener('click', function() {
    map.setZoom(11);
  });
}

// When Google map fails to load, show users the alert message
function mapFail(){
  alert("Failed to load Google Map API. Check your API URL or other settings.");
}

// Initialize Google Map and start Knockout binding
function initMap() {
  // When the app starts, get current width of the window
  width = window.innerWidth;

  // Create new map object
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 11,
    center: center.all.location,
  });

  // Create new infoWindow object
  infoWindow = new google.maps.InfoWindow({
    maxHeight: 200
  });

  // Create new transit layer and apply it on the map
  var transitLayer = new google.maps.TransitLayer();
  transitLayer.setMap(map);

  // Set initial zoom level based on current window width
  if (width < 781) {
    map.setZoom(9);
  } else {
    map.setZoom(11);
  }

  // Add zoom control on the map
  var zoomControlDiv = document.createElement('div');
  var zoomControlInit = new zoomControl(zoomControlDiv, map);

  zoomControlDiv.index = 1;
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(zoomControlDiv);


  ko.applyBindings(new ViewModel());
}
