# FSND P6 - Neighbor Map
Build an Item Catalog application

![](https://github.com/Dongs7/img/blob/master/p6.png)

## Requirements
* Knockout JS
* jQuery
* Google Map API
* Foursquare API
* Twitter Bootstrap

## Folder
[static]    
|--------[css]      - contains css files  
|--------[fonts]    - contains bootstrap font files  
|--------[js]       - contains javascript files  
index.html          - Start the application  

## How to run this program
<a href="https://neighbormap.herokuapp.com/">See live demo</a>

This is a Single Page Application using Google MAP API and Foursquare API
to display skytrain stations in Vancouver area and nearby sushi and pizza
restaurants (within 200m from the station).

The demo site is running under express.js in order to protect API credentials.

## How to use:

This app needs your Foursquare API credentials.

Get Foursquare API credentials from <a href="https://developer.foursquare.com/">here</a>.

Then, replace below two lines in master2.js file with your client credentials.

```
var client_id = 'YOUR_FOURSQUARE_CLIENT_ID';
var client_secret = 'YOUR_FOURSQUARE_CLIENT_SECRET';
```

Storing a user credentials in the client side is not a good idea,
so do not use this code in production.

When the application opens, all station markers will be displayed on the map.

Users can click the marker to see the name of the station and restaurants
within 200m from the selected station. Circle of 200m radius will be displayed
as well.

When users click the specific line name, markers of the selected line will
only be displayed.

Users can search stations using search box.

Yellow marker indicates that there are more than one line stopping
at the station.

 ![](https://github.com/Dongs7/img/blob/master/p6-1.png)
