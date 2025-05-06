let map: google.maps.Map;
const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;


class MapEngine {   
    input!: HTMLInputElement;
    markerSet!: Function;
    markers:any = [];
    map!: google.maps.Map;
    clickListener!: any;
    InfoWindow!: google.maps.InfoWindow;
    last_position!: { lat: number, lng: number };
    recycle_image!: HTMLImageElement;
    my_location!: google.maps.LatLng;
    places!: any;
    directionsRenderer!: google.maps.DirectionsRenderer;
    
    setInputElement(input: HTMLInputElement) { 
        this.input = input;
    }


    getLastPosition() {
        return this.last_position;
    }

    getPlace(id: number) { 
        return this.places.filter((p: { id: number }) => p.id == id)[0];
    }

    setReportMode(editMode: boolean) { 
        if (editMode) {            
            this.clickListener = this.map.addListener('click', (evt: google.maps.MapMouseEvent) => {
                if (evt.latLng) {
                    this.cleanMarkers();
                    const marker = this.addMarker({
                        title: 'New Place', 
                        position: evt.latLng
                    });
                    this.last_position = { lat: evt.latLng.lat(), lng: evt.latLng.lng() };
                    this.markerSet(marker);
                }
            });
        } else if(this.clickListener!=null) { 
            google.maps.event.removeListener(this.clickListener);
            this.clickListener = null;
        }
    }


    setMapCenter(position: google.maps.LatLng) { 
        this.map.setCenter(position);
        this.addMarker({
            title: "You are here", 
            position: position,
            isCentralMarker: true,
        });
    }

    getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => { 
                this.my_location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                this.setMapCenter(this.my_location);             
            });
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    }

    addMarker(params: any) {
        
        const id = params.id || 0;
        const title = params.title;
        const position = params.position;
        const description = params.description || null;
        const image = params.image || null;
        const isCentralMarker = params.isCentralMarker || false;
        
    
        const map: google.maps.Map = this.map;
        let option:any = {
            map,
            title: title,
            position: position,          
            gmpClickable: true,
        };

        
        if (image != null) { 
            option.content = image;
        }

        const marker = new AdvancedMarkerElement(option);
        marker.dataset.id = id;
        marker.dataset.description = description;
        marker.addEventListener('gmp-click', (evt: any) => {  
            const target = evt.target as any;                                 
            this.InfoWindow.close();                      
            this.InfoWindow.setHeaderContent(target.title);                        
            this.InfoWindow.setContent(target.dataset.description != 'null' ? target.dataset.description : '');                          
            this.InfoWindow.open(target.map, target);
            
        });
        if (isCentralMarker == false){
            this.markers.push(marker);
        }        
        return marker;
    }

    cleanMarkers() { 
        this.markers.forEach((marker:any) => {
            marker.setMap(null);
        });
        //this.markers = [];
    }

    returnMarkers() {
        this.markers.forEach((marker: any) => {
            marker.setMap(this.map);
        });
    }

    changeMarker(place: any) { 
        this.returnMarkers();
        const theMarker = this.markers[this.markers.length - 1];
        theMarker.setMap(null);
        this.markers.pop();
        this.placeToMarker(place);
        
    }

    deleteMarker(id: number) {        
        this.markers.filter((m: any) => m.dataset.id == id).forEach((m: any) => {            
            m.setMap(null);
        });
    }

    searchBoxServe() { 
        const searchBox = new google.maps.places.SearchBox(this.input);
        const map = this.map;
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(this.input);
        // Bias the SearchBox results towards current map's viewport.
        map.addListener("bounds_changed", () => {
            const bounds = map.getBounds();
            if (bounds) {
                searchBox.setBounds(bounds);
            }
        });


        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        searchBox.addListener("places_changed", () => {
            const places = searchBox.getPlaces();

            if (typeof places=='undefined' || places.length == 0) {
                return;
            }
            
            // Clear out the old markers.
            this.cleanMarkers();
            const bounds = new google.maps.LatLngBounds();
            places.forEach((place: google.maps.places.PlaceResult) => {
                if (!place.geometry || !place.geometry.location) {
                    console.log("Returned place contains no geometry");
                    return;
                }
                // Create a marker for each place.                
                this.addMarker({
                    title: typeof place.name != 'undefined' ? place.name : '',  
                    position: place.geometry.location
                })                   
                
                if (place.geometry.viewport) {
                    // Only geocodes have viewport.
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }
            });
            map.fitBounds(bounds);
        });
        
    }

    routeToDestination(position: { lat: number, lng: number }) { 
        console.log("routeToDestination", this.directionsRenderer);
        if (typeof this.directionsRenderer !== 'undefined') {
            this.directionsRenderer.setMap(null);
        }
        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer();
        directionsRenderer.setMap(this.map);
        const request: google.maps.DirectionsRequest = {
            origin: this.my_location!,
            destination: new google.maps.LatLng(position.lat, position.lng),
            travelMode: google.maps.TravelMode.DRIVING
        };
        directionsService.route(request, function(response, status) {
            if (status == 'OK') {
                directionsRenderer.setDirections(response);
            } else {
                alert("directions request failed, status=" + status)
            }
        });           
        this.directionsRenderer = directionsRenderer;
    }

    setPlaces(places: any) { 
        this.places = places;
        this.recycle_image = document.createElement('img');
        this.recycle_image.src = "/images/recycle.png";     

    }

    placeToMarker(place: { id: number, title: string, lat: number, lng: number, from_time: any, to_time: any, updated_at: string, cash: number, status: number }) {
        let description = ``;
        if (place.from_time.length > 0 && place.to_time.length > 0) { 
            description += `<div>Opening hours ${place.from_time} - ${place.to_time}</div>`;
        }
        if (place.cash == 1) { 
            description += `<div>Cash compensation</div>`;
        }
        description += `<div><small>${(new Date(place.updated_at)).toLocaleDateString('en-GB')}</small></div>`
            + `<div>`
            + `<button onClick="window.dispatchEvent(new CustomEvent('route_me',{'detail':{ lat:${place.lat}, lng:${place.lng}} }));">Route</button>&nbsp;`
            + `<button onClick="window.dispatchEvent(new CustomEvent('report_me',{'detail':{ id:${place.id} }  }));">Report</button>`
            + `</div>`;
        
        const myImage = new Image();
        myImage.src = "/images/recycle.png";
        myImage.addEventListener('load', (evt) => {
            this.addMarker({
                title: place.title, 
                position: new google.maps.LatLng(place.lat, place.lng),               
                description: description,
                id: place.id,
                image: myImage
                
            }); 
        });
        
    }


    async tryAddPlaces() {        
        const placesInterval=setInterval(() => {
            if (this.places != null) { 
                this.places.forEach((place: {id:number, title:string,lat:number, lng:number,from_time:any,to_time:any,updated_at:string,cash:number,status:number}) => { 
                    this.placeToMarker(place);
                    
                });
                clearInterval(placesInterval);
            }
        }, 1000);
    }

    ReportAboutExistsPlace(data: { id: number }) { 
        this.InfoWindow.close();        
    }

    async initMap(position: { lat: number, lng: number }): Promise<void> {
        
    
        const { Map, InfoWindow } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
        const center: google.maps.LatLngLiteral = position;
        const mapDiv = document.getElementById("map") as HTMLElement;
        this.map = new Map(mapDiv, {
            zoom: 16,
            center: center,
            mapId: "DEMO_MAP_ID",
            mapTypeId: "roadmap",
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl:false,
        } as google.maps.MapOptions);
        this.InfoWindow = new InfoWindow();    
        this.searchBoxServe();
        window.addEventListener("route_me", (e: CustomEvent) => this.routeToDestination(e.detail));
        window.addEventListener("report_me", (e: CustomEvent) => this.ReportAboutExistsPlace(e.detail));

        this.tryAddPlaces();        
    }

}

export default MapEngine;