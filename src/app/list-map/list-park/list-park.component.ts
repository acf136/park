import { Component, Input, OnInit } from '@angular/core';
import { IParking } from 'src/shared/interfaces/interfaces';
import { ParkingService } from 'src/shared/services/parking.service';
import { FirestoreParkingService } from 'src/shared/services/firestore-parking.service';

@Component({
  selector: 'app-list-park',
  templateUrl: './list-park.component.html',
  styleUrls: ['./list-park.component.scss'],
})

export class ListParkComponent implements OnInit {
  @Input() parking: IParking;

  public parkings: IParking[] = [];

  constructor(private parkingService: ParkingService,
              private firestoreParkingService: FirestoreParkingService ) { }

  ngOnInit() {
    this.loadData();
  }

  /**
   * Use firestoreParkingService.getParkings() that returns an observable$
   */
  loadData() {
    // using httpclient
    //
    // this.parkingService.getParkings()
    //   .subscribe(
    //     pparkings =>  this.parkings = pparkings ,
    //     err => { alert('Error caught at Subscriber on url "' + err.url + '" in ' + this.parkingService.getParkings.name ); },
    //     () => console.log('Processing '+ this.parkingService.getParkings.name +' Complete.')
    //   );
    //
    // using firestore
    //
    this.firestoreParkingService.getParkings().subscribe(
        (pparkings) =>  { this.parkings = pparkings.map( (t) => ({                           //1st subscribe param
                        id: t.payload.doc.id,  ...t.payload.doc.data() as IParking ,
                      }) ) },
        err => { alert('Error caught at subscribe on Firebase url "' + err.url + '" '); } ,  //2nd subscribe param
        () => console.log('Parkings = ', this.parkings)                                      //3rd subscribe param
    );

  }

  parkingList() {
    this.firestoreParkingService.getParkings().subscribe((data) => {
      console.log(data);
    });
  }

  remove(pidParking,pid) {
    console.log('pid= '+ pid + ' parkingId =' + pidParking);
    if (window.confirm('Are you sure to delete element with id = '+pid+' (idParking='+pidParking+ ') ?')) {
      this.firestoreParkingService.delete(pid);
    }
  }

  isIos() {
    const win = window as any;
    return win && win.Ionic && win.Ionic.mode === 'ios';
  }
}
