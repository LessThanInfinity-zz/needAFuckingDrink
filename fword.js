/* Function: geocodeAddress 
 * Input: Google Maps Geocoder object. 
 * Takes a string address and converts it into geocode - including
 * Latitude and Longitude
 */
function geocodeAddress(geocoder){
	var address = document.getElementById('placeSearch').value;
	var codedAddress;
	console.log("Finding LatLng for", address);
	geocoder.geocode({
			address: address
		}, function(results, status){
			console.log(results);
			if (status == "OK"){
				console.log("Geocoder success");
				codedAddress = results[0].geometry.location;
				findPlaces(codedAddress);
				// debugger
			} else {
				console.log("Geocode failed; status: ", status)
			}
		}
	)
	return codedAddress;
}

/* Function: findPlaces
 * Input: geocoded Address. 
 * Finds bars around given geocode area. 
 */
function findPlaces(codedAddress){
	console.log("finding Places");
	userLocation = codedAddress;
	homeIcon = "img/youarehere.png";
	homeMarker = new google.maps.Marker({
        map: map,
        animation: google.maps.Animation.DROP,
        position: userLocation,
        icon: homeIcon
    });

    /* Request search for bars around userLocation. */
    barSearchParams = {
    	location: userLocation,
    	radius: 1e3,
    	keyword: 'bar'
    };

    service.search(barSearchParams, storeResults);
	// debugger

}

/* Function: storeResults
 * Input: . 
 * Saves the data for each place and creates a google marker for each
 * place. 
 * Also kicks off getRandomBar() to kickstart the site. 
 */
function storeResults(request){
	console.log('in store results');
	var drinkIcon='img/bar_coktail.png'

	request.forEach(function(bar){
		drinkMarker = new google.maps.Marker({
            map: map,
            animation: google.maps.Animation.DROP,
            position: bar.geometry.location,
            icon: drinkIcon
        });

        drinkMarker.setMap(null);

        var currentBar = {};
        currentBar['place'] = bar;
        currentBar['marker'] = drinkMarker;
        totalResults.push(currentBar);
	})

	getRandomBar();
}

/* Function: fillBarDetails
 * Input: none.
 * Finds details of a bar using google's places service. 
 */
function fillBarDetails(){

	totalResults.forEach(function(bar){
	    service.getDetails({
			reference: bar.place.reference
		}, function(place,status){
			bar['details'] = place;
			console.log("details firing?");
	    });
	})

	getRandomBar();
	
}

/* Function: getRoute
 * Input: an origin and a destination; both geocoded.  
 * Fetches walking route as well as plots it on given map. 
 */
function getRoute(from, to){
	var params = {
		origin: from,
		destination: to,
		travelMode: google.maps.TravelMode.WALKING
	};

	directionsService.route(params, function(result, status){
	if (status == google.maps.DirectionsStatus.OK) {
		directionsDisplay.setDirections(result);
	}
	});
}

/* Function: getRandomBar 
 * Randomly selects a bar from saved result list.  
 */
function getRandomBar(){
	console.log('getting Random bar.');
	var currBar= _.sample(totalResults, 1)[0];
	while (_.isEqual(displayedBar, currBar)){
		var currBar= _.sample(totalResults, 1)[0];
	}

	if (displayedBar){
		displayedBar.marker.setMap(null);		
	}
	currBar.marker.setMap(map);
	getRoute(userLocation, currBar.place.geometry.location);
	displayedBar = currBar;

	var replaceString = "<a href=" +"'#'"+ "class='location'><u>"+currBar.place.name+"</u></a>";
	$(".location").replaceWith(replaceString);
}

/* Function: initialize
 * Starts the entire site:
 *	- Sets params and creates actual map
 *  - Declares global variables for use by functions. 
 *  - Defines JQuery actions for DOM element input.
 */
function initialize() {

	/* Set visual styles for map. */
	var mapStyles = [{
	    // featureType: "all",
	    stylers: [{
	        saturation: -100
	    }]
	}];

	/* Set options for map. */
	var mapOptions = {
		center: new google.maps.LatLng(40.0378755,-76.30551439999999),
		zoom: 10,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		mapTypeControl: !1,
		panControl: !1,
		zoomControl: !1,
		mapTypeControl: !1,
		scaleControl: !1,
		streetViewControl: !1,
		overviewMapControl: !1
    };

    /* Global variables for use. */
    // ----------------------------------

    // Map. 
	map = new google.maps.Map(document.getElementById('mapCanvas'), mapOptions);
	map.setOptions({styles: mapStyles});

	service= new google.maps.places.PlacesService(map);

	directionsDisplay = new google.maps.DirectionsRenderer({
		suppressMarkers: !0 /* Because we want to add our own icon. */
	});
	directionsDisplay.setMap(map);

	directionsService = new google.maps.DirectionsService();

	geocoder = new google.maps.Geocoder();

	/* Variables for client side storage. */
	totalResults = [];
	displayedBar = null;
	homeMarker = null;

	// Get inputted address or zipcode.
	var input = /** @type {HTMLInputElement} */(
		document.getElementById('placeSearch')
	);

	var address = input.value;
	/* Search. */
	var autoOptions = {
	    types: ["geocode"]
	}
	var autoInput = document.getElementById("placeSearch");
	var autocomplete = new google.maps.places.Autocomplete(autoInput, autoOptions);

	/* JQUERY ACTIONS. */
	$("#findLocation").on("submit", function(e) {
		e.preventDefault();
		// $('.mainBody').toggleClass('hidden');
		if (homeMarker){
			homeMarker.setMap(null);
		}
		if (input){
			totalResults =[];			
		}
		
		geocodeAddress(geocoder);

		$('.searchBar').toggle("fast");

	    var delay=1000;//1 seconds
	    setTimeout(function(){
	    	$('.wait').toggle('fast');
		},delay);

	});

	$(".reject").on('click', function(e){
		e.preventDefault();
		console.log("fuck that place");
		getRandomBar();

	})

	$(".wrongLocation").on('click', function(e){
		$('.wait').toggle(true);
		console.log("Ye got my location wrong.");
		$('.searchBar').toggle("fast");		
	})
}

google.maps.event.addDomListener(window, 'load', initialize);
