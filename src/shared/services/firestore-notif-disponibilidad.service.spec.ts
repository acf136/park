import { TestBed } from '@angular/core/testing';

import { FirestoreNotifDisponibilidadService } from './firestore-notif-disponibilidad.service';

describe('FirestoreNotifDisponibilidadService', () => {
  let service: FirestoreNotifDisponibilidadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirestoreNotifDisponibilidadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
