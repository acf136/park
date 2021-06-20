import { Component } from '@angular/core';
import { OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';

declare var google;

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {

  @ViewChild('map',  {static: false}) mapElement: ElementRef;
  map: any;
  address:string;
  lat: string;
  long: string;  
  autocomplete: { input: string; };
  autocompleteItems: any[];
  location: any;
  placeid: any;
  GoogleAutocomplete: any;

  constructor(private geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder,    
    public zone: NgZone) 
    {
      this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
      this.autocomplete = { input: '' };
      this.autocompleteItems = [];
    }

  ngOnInit() {
    this.loadMap();
  }

  //CARGAR EL MAPA TIENE DOS PARTES 
  loadMap() {
    
    //OBTENEMOS LAS COORDENADAS DESDE EL TELEFONO.
    this.geolocation.getCurrentPosition().then((resp) => {
      let latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      let mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      } 
      
      //CUANDO TENEMOS LAS COORDENADAS SIMPLEMENTE NECESITAMOS PASAR AL MAPA DE GOOGLE TODOS LOS PARAMETROS.
      this.getAddressFromCoords(resp.coords.latitude, resp.coords.longitude); 
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions); 
      this.map.addListener('tilesloaded', () => {
        console.log('accuracy',this.map, this.map.center.lat());
        this.getAddressFromCoords(this.map.center.lat(), this.map.center.lng())
        this.lat = this.map.center.lat()
        this.long = this.map.center.lng()
      }); 
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

  
  getAddressFromCoords(lattitude, longitude) {
    console.log("getAddressFromCoords "+lattitude+" "+longitude);
    let options: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 5    
    }; 
    this.nativeGeocoder.reverseGeocode(lattitude, longitude, options)
      .then((result: NativeGeocoderResult[]) => {
        this.address = "";
        let responseAddress = [];
        for (let [key, value] of Object.entries(result[0])) {
          if(value.length>0)
          responseAddress.push(value); 
        }
        responseAddress.reverse();
        for (let value of responseAddress) {
          this.address += value+", ";
        }
        this.address = this.address.slice(0, -2);
      })
      .catch((error: any) =>{ 
        this.address = "Address Not Available!";
      }); 
  }

  //FUNCION DEL BOTON INFERIOR PARA QUE NOS DIGA LAS COORDENADAS DEL LUGAR EN EL QUE POSICIONAMOS EL PIN.
  ShowCords(){
    alert('lat' +this.lat+', long'+this.long )
  }
  
  //AUTOCOMPLETE, SIMPLEMENTE ACTUALIZAMOS LA LISTA CON CADA EVENTO DE ION CHANGE EN LA VISTA.
  UpdateSearchResults(){
    if (this.autocomplete.input == '') {
      this.autocompleteItems = [];
      return;
    }
    this.GoogleAutocomplete.getPlacePredictions({ input: this.autocomplete.input },
    (predictions, status) => {
      this.autocompleteItems = [];
      this.zone.run(() => {
        predictions.forEach((prediction) => {
          this.autocompleteItems.push(prediction);
        });
      });
    });
  }
  
  //FUNCION QUE LLAMAMOS DESDE EL ITEM DE LA LISTA.
  SelectSearchResult(item) {
    //AQUI PONDREMOS LO QUE QUERAMOS QUE PASE CON EL PLACE ESCOGIDO, GUARDARLO, SUBIRLO A FIRESTORE.
    //HE AÑADIDO UN ALERT PARA VER EL CONTENIDO QUE NOS OFRECE GOOGLE Y GUARDAMOS EL PLACEID PARA UTILIZARLO POSTERIORMENTE SI QUEREMOS.
    alert(JSON.stringify(item))      
    this.placeid = item.place_id
  }
  
  
  //LLAMAMOS A ESTA FUNCION PARA LIMPIAR LA LISTA CUANDO PULSAMOS IONCLEAR.
  ClearAutocomplete(){
    this.autocompleteItems = []
    this.autocomplete.input = ''
  }
 
  //EJEMPLO PARA IR A UN LUGAR DESDE UN LINK EXTERNO, ABRIR GOOGLE MAPS PARA DIRECCIONES. 
  GoTo(){
    return window.location.href = 'https://www.google.com/maps/search/?api=1&query=Google&query_place_id='+this.placeid;
  }

}
