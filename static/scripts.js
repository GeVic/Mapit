// marker array
let markers = [];
// Info window
let info;
// Google maps
let map;

// Execute the DOM  is fully loaded
$(document).ready(function() {
    // get map from DOM
    let show = $("#map").get(0);

    // Info window
    info = new google.maps.InfoWindow();

    // styling google maps
    let styles = {
              center: {lat: 20.5937, lng : 78.9629},
              zoom: 13,
              disableDefaultUI: true,
              mapTypeId: google.maps.MapTypeId.ROADMAP,
              maxZoom: 14,
              panControl: true,
              styles: [
                {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
                {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
                {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
                {
                  featureType: 'administrative.locality',
                  elementType: 'labels.text.fill',
                  stylers: [{color: '#d59563'}]
                },
                {
                  featureType: 'poi',
                  elementType: 'labels.text.fill',
                  stylers: [{color: '#d59563'}]
                },
                {
                  featureType: 'poi.park',
                  elementType: 'geometry',
                  stylers: [{color: '#263c3f'}]
                },
                {
                  featureType: 'poi.park',
                  elementType: 'labels.text.fill',
                  stylers: [{color: '#6b9a76'}]
                },
                {
                  featureType: 'road',
                  elementType: 'geometry',
                  stylers: [{color: '#38414e'}]
                },
                {
                  featureType: 'road',
                  elementType: 'geometry.stroke',
                  stylers: [{color: '#212a37'}]
                },
                {
                  featureType: 'road',
                  elementType: 'labels.text.fill',
                  stylers: [{color: '#9ca5b3'}]
                },
                {
                  featureType: 'road.highway',
                  elementType: 'geometry',
                  stylers: [{color: '#746855'}]
                },
                {
                  featureType: 'road.highway',
                  elementType: 'geometry.stroke',
                  stylers: [{color: '#1f2835'}]
                },
                {
                  featureType: 'road.highway',
                  elementType: 'labels.text.fill',
                  stylers: [{color: '#f3d19c'}]
                },
                {
                  featureType: 'transit',
                  elementType: 'geometry',
                  stylers: [{color: '#2f3948'}]
                },
                {
                  featureType: 'transit.station',
                  elementType: 'labels.text.fill',
                  stylers: [{color: '#d59563'}]
                },
                {
                  featureType: 'water',
                  elementType: 'geometry',
                  stylers: [{color: '#17263c'}]
                },
                {
                  featureType: 'water',
                  elementType: 'labels.text.fill',
                  stylers: [{color: '#515c6d'}]
                },
                {
                  featureType: 'water',
                  elementType: 'labels.text.stroke',
                  stylers: [{color: '#17263c'}]
                }
              ]
            }

    // instantiating google maps div
    map = new google.maps.Map(show, styles);

    // To update || configure ui
    google.maps.event.addListenerOnce(map, "idle", configure);
});

// Add marker for place to map
function addMarker(place)
{
    // lat and lng of the place
    let LatLng = {lat: parseFloat(place.latitude), lng: parseFloat(place.longitude)};
    // marker to add to the map
    let marker = new google.maps.Marker({
          position: LatLng,
          map: map,
          title: place["place_name"] +", "+ place["admin_name1"]
    });
    $.getJSON("/articles", {geo: place.postal_code}, function(articles) {
        let content = "";
        // to check if the articles are empty
        if (!$.isEmptyObject(articles)) {
            // start Unordered List
            content += "<ul>"
            for (let i = 0; i < articles.length; i++)
            {
				      //Each list item is stored into articlesString
            	content += "<li>" + articles[i].title + "</li>";
            }
        }
        // close the unordered list of articles
        content += "</ul>"
    // marker click listener
    google.maps.event.addListener(marker,'click', function() {
      showInfo(marker, content)
  });

  markers.push(marker);
});
}

// to configure the application
function configure(){
    // updating ui if map dragged
    google.maps.event.addListener(map, "dragend", function(){
        // if info is opened
        if (!info.getMap || !info.getMap()){
            update();
        }
    });

    // update if zoom changed
    google.maps.event.addListener(map, "zoom_changed", function(){
        update();
    });

    $("#q").typeahead({
        highlight: false,
        minLength: 1
    },
    {
        display: function(suggestion) {return null;},
        limit: 10,
        source: search,
        templates: {
            suggestion: Handlebars.compile(
                "<div>" +
                "{{ place_name }}, {{ admin_name1 }}, {{ postal_code }}" +
                "</div>"
            )
        }
    });

    // re-center the map after the place is selected
    $("#q").on("typeahead:selected", function(eventObject, suggestion, name) {
        // setting the map center as selected name
        map.setCenter({lat: parseFloat(suggestion.latitude), lng: parseFloat(suggestion.longitude)});

        // then update the ui again
        update();
    });

    // hide when block has the focus
    $("#q").focus(function(eventData){
        // close
        info.close();
    });

    // to enable right click so that we can inspect element
    document.addEventListener("contextmenu", function(event) {
        event.returValue = true;
        event.stopPropagation && event.stopPropagation();
        event.cancelBubble && event.cancelBubble();
    }, true);

    update();

    // again focus
    $("#q").focus();

}

// set map on all
function setMapOnAll(map) {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

// to remove markers
function removeMarkers()
{
  setMapOnAll(null);
  markers = [];
}


// search database for typehead's suggestion
function search(query, syncResults, asyncResults)
{
  // get places matching query (asynchronously)

    let parameters = {
        q: query
    };

    $.getJSON("/search", parameters)
    .done(function(data, textStatus, jqXHR) {
        // call typeahead's callback with search results (i.e., places)
        asyncResults(data);
    })

    .fail(function(jqXHR, textStatus, errorThrown) {
        // log error to browser's console
        console.log(errorThrown.toString());
        // call typeahead's callback with no results
        asyncResults([]);

    });
}

// Show info window at marker with content
function showInfo(marker, content)
{
    // Start div
    let div = "<div id='info'>";
    console.log(typeof(content))
    if (typeof(content) == "undefined")
    {
        // loading agax gif
        div += "<img alt='loading' src='/static/ajax-loader.gif'/>";
    }
    else
    {
        div += content;
    }

    // End div
    div += "</div>";

    // Set info window's content
    info.setContent(div);

    // Open info window (if not already open)
    info.open(map, marker);
}

// Update UI's markers
function update()
{
    // Get map's bounds
    let bounds = map.getBounds();
    let ne = bounds.getNorthEast();
    let sw = bounds.getSouthWest();

    // Get places within bounds (asynchronously)
    let parameters = {
        ne: `${ne.lat()},${ne.lng()}`,
        q: $("#q").val(),
        sw: `${sw.lat()},${sw.lng()}`
    };
    $.getJSON("/update", parameters, function(data, textStatus, jqXHR) {

       // Remove old markers from map
       removeMarkers();

       // Add new markers to map
       for (let i = 0; i < data.length; i++)
       {
           addMarker(data[i]);
       }
    });
}