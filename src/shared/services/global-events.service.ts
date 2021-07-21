import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class GlobalEventsService {

    private fooSubject = new Subject<any>();

    publishSomeData() {
        this.fooSubject.next();
    }

    getObservable(): Subject<any> {
        return this.fooSubject;
    }
}
