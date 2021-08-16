import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';
import { AlertController } from '@ionic/angular';
import { IParking, IUserParking } from 'src/shared/interfaces/interfaces';
import { AuthenticationService } from 'src/shared/services/authentication.service';
import { FirestoreParkingService } from 'src/shared/services/firestore-parking.service';
import { FirestoreUserParkingService } from 'src/shared/services/firestore-user-parking.service';
import { LoadingService } from 'src/shared/services/Loading.service';

// import * as $ from 'jquery';

declare var google;

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {

  @ViewChild('map',  {static: false}) mapElement: ElementRef;
  map: any;
  address: string;
  autocomplete: { input: string };  autocompleteItems: any[];  googleAutocomplete: any;
  location: any;
  placeid: any;

  public parkings: IParking[] = [];
  public logedUserId: string;

  constructor(
      private geolocation: Geolocation,
      private nativeGeocoder: NativeGeocoder,
      public zone: NgZone,
      private firestoreParkingService: FirestoreParkingService,
      private loadingService: LoadingService,
      private alertController: AlertController,
      public authService: AuthenticationService,
      private firestoreUserParkingService: FirestoreUserParkingService,
      private router: Router
    ) {
      this.googleAutocomplete = new google.maps.places.AutocompleteService();
      this.autocomplete = { input: '' };
      this.autocompleteItems = [];
    }

  ngOnInit() {
    this.loadMap();
  }

  //CARGAR EL MAPA TIENE DOS PARTES
  loadMap() {
    this.loadingService.present();       //init spinner

    //OBTENEMOS LAS COORDENADAS DESDE EL TELEFONO.
    this.geolocation.getCurrentPosition().then( (resp) => {
      const latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      const mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      //CUANDO TENEMOS LAS COORDENADAS SIMPLEMENTE NECESITAMOS PASAR AL MAPA DE GOOGLE TODOS LOS PARAMETROS.
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

      this.printAllParkingsMarkers();

      this.map.addListener('tilesloaded', () => {
        console.log('accuracy',this.map, this.map.center.lat());
      });
      this.loadingService.dismiss();                //stop spinner
    }).catch((error) => {
      this.loadingService.dismiss();                //stop spinner
      console.log('Error getting location', error);
    });

  }  //end of loadMap()

  // /**
  //  * overrideMapsOverlayView : Changes behaviour of MarkerLabel
  //  */
  overrideMapsOverlayView() {
    // // change prototype Marker.setLabel()
    // google.maps.Marker.prototype.setLabel = function(label){
    //   this.label = new MarkerLabel({
    //     map: this.map,
    //     marker: this,
    //     text: label
    //   });
    //   this.label.bindTo('position', this, 'position');
    // };
    // // redefine MarkerLabel as a function
    // var MarkerLabel = function(options) {
    //     this.setValues(options);
    //     this.span = document.createElement('span');
    //     this.span.className = 'map-marker-label';
    // };
    // // change prototype MarkerLabel as an extension of  google.maps.OverlayView()
    // MarkerLabel.prototype = $.extend(new google.maps.OverlayView(), {
    //     onAdd: function() {
    //         this.getPanes().overlayImage.appendChild(this.span);
    //         var self = this;
    //         this.listeners = [ google.maps.event.addListener(this, 'position_changed', function() { self.draw();    })];
    //     },
    //     draw: function() {
    //         var text = String(this.get('text'));
    //         var position = this.getProjection().fromLatLngToDivPixel(this.get('position'));
    //         var markersizeLength = 32 ; var markersizeHigh = 32 ; //we use icon 32x32 for the marker
    //         this.span.innerHTML = text;
    //         this.span.style.left = (position.x - (markersizeLength / 2)) - (text.length * 3) + 10 + 'px';
    //         this.span.style.top = (position.y - markersizeHigh + 40) + 'px';
    //     }
    // });


  // // custom function to apply to the map
  //   function Label() { this.setMap(this.map); } ;
  //   // prototype your subclass and add HTML nodes:
  //   Label.prototype = new google.maps.OverlayView; //subclassing google's overlayView
  //   Label.prototype.onAdd = function() {
  //     this.MySpecialDiv               = document.createElement('div');
  //     this.MySpecialDiv.className     = 'MyLabel';
  //     this.getPanes().overlayImage.appendChild(this.MySpecialDiv); //attach it to overlay panes so it behaves like markers
  //   };
  //   //  implement remove function as stated in the API docs,
  //   Label.prototype.onRemove = function() {
  //    // remove your stuff and its events if any
  //   };
  //   //  implement draw function as stated in the API docs,
  //   Label.prototype.draw = function() {
  //     // translate map latLng coords into DOM px coords for css positioning
  //     var position = this.getProjection().fromLatLngToDivPixel(this.get('position'));
  //     var pos = this.get('position');
  //     $('.MyLabel').css( { 'top' : position.y + 'px',
  //                          'left'  : position.x + 'px'
  //                       });
  //   };

  }  // end of overrideMapsOverlayView

  /**
   * Print all parking marks in the map
   */
  printAllParkingsMarkers(){
    // this.overrideMapsOverlayView();
    // const iconBase = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/';
    const iconBase = '../assets/icon/';
    const icons: Record<string, { icon: string }> = {
      parking: {
        icon: iconBase + 'P@RKING-SEED-Transp-32x32.png',
      },
    };

    this.firestoreParkingService.getParkings().subscribe( (pparkings) =>  {
      this.parkings = pparkings.map( (t) => ({                           //1st subscribe param
        id: t.payload.doc.id,   ...t.payload.doc.data() as IParking
      }) );
      // console.log("printAllParkingsMarkers ", this.parkings);
      this.parkings.forEach( elemParking => {
        //Por cada párking colocamos un marcador en el mapa
        const latLngMarker = new google.maps.LatLng( elemParking.lat, elemParking.long );
        const marker = new google.maps.Marker(
          { position: latLngMarker,
            icon: icons["parking"].icon,
            // labelOrigin: new google.maps.Point( parseFloat(elemParking.lat), parseFloat(elemParking.long)) ;
            label: { text: elemParking.name , color: 'red', className : "MyLabelTranslate50px" } ,
            opacity: 0.75,
            draggable : true,
          }
        );
        marker.setMap(this.map);

        google.maps.event.addListener(marker, 'click',
          async () => {
            // Buscar parking por lat/long en this.parkings
            const parkingSelected = this.parkings.filter( p => p.lat === marker.position.lat().toString() &&
                                                              p.long === marker.position.lng().toString()  );
            const msgParkingSelected = parkingSelected[0].name;
            let respuesta = 'cancel';
            await this.presentAlert( msgParkingSelected ,'Confirm to Enter', '').then( resp => respuesta = resp as string );
            if ( respuesta === 'cancel' ) return;
            this.router.navigate(['/parking/' + elemParking.id]);
          }
        );

      });

    }, (err) => {
      this.loadingService.dismiss();    //stop spinner
      console.error(err);
    });
  }

  //FUNCION DEL BOTON INFERIOR PARA QUE NOS DIGA LAS COORDENADAS DEL LUGAR EN EL QUE POSICIONAMOS EL PIN.
  showCords(){
    // alert('lat' +this.lat+', long'+this.long );
    alert('latitude = ' +this.map.center.lat()+', longitude = '+this.map.center.lng() );
  }

  //autocomplete, update list in every view ion change event
  updateSearchResults(){
    if (this.autocomplete.input === '') {
      this.autocompleteItems = [];
      return;
    }
    this.googleAutocomplete.getPlacePredictions( { input: this.autocomplete.input } ,
      (predictions, status) => {
        this.autocompleteItems = [];
        this.zone.run( () => {
          predictions?.forEach( (prediction) => { this.autocompleteItems.push(prediction); } );
        });
      }
    );
  }

  //Función llamada desde ion-item en la ion-list
  selectSearchResult(item) {
    // alert(JSON.stringify(item));
    this.goTo(item);
    this.autocompleteItems = [];
    this.autocomplete.input = item.description ;
  }

  // Llamada desde el evento ionClear de la ion-searchbar
  clearAutocomplete(){
    this.autocompleteItems = [];
    this.autocomplete.input = '';
  }

  /**
   *  Llamar a geocoder para cambiar el centro de this.map a la localización de address
   * @param address : valid google maps address, i.e "Calle Corcega, 123, Barcelona, Spain"
   */
   geocodeAddress( address: any ) {
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode( {address}, (results, status) => { } )
      .then( ({ results }) => {
        this.map.setCenter(results[0].geometry.location);
        // new google.maps.Marker({
        //   map: this.map,
        //   position: results[0].geometry.location,
        // });
      }).catch((e) =>
        alert('Geocode was not successful for the following reason: ' + e)
      );
  }

  /**
   * Llamar a geocodeAddress para cambiar la situación del mapa
   * @param pitem : item de la ion-searchbar
   */
   goTo(pitem){
    const address = pitem.description; //In this case it gets the address from an item.description on the ion-list
    this.geocodeAddress(address);
    // return window.location.href = 'https://www.google.com/maps/search/?api=1&query=Google&query_place_id='+pitem.placeid;
  }

    /**
   * Presents the modal where the user is asked to confirm or cancel
   * when he scans a parking place
   *
   * @param data
   */
     async presentAlert(_header: string, _message: string, data?: string) {
      return new Promise( async (resolve) => {
        const alert = this.alertController.create( {
          header: _header,
          message: _message,
          backdropDismiss: false,
          buttons: [  { text: 'Cancel',  role: 'cancel',  handler: cancel => resolve('cancel')   },
                      { text: 'Confirm', role: 'confirm', handler: confirm => resolve('confirm') }
                   ]
        } );  //alertController.create
        ( await alert ).present();
      });
    }
}
