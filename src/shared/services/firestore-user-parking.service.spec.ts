import { TestBed } from '@angular/core/testing';

import { FirestoreUserParkingService } from './firestore-user-parking.service';

describe('FirestoreUserParkingService', () => {
  let service: FirestoreUserParkingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirestoreUserParkingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
