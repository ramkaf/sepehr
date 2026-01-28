import { Injectable } from '@nestjs/common';

@Injectable()
export class FleetManagerService {
  constructor(private readonly fleetManagerService: FleetManagerService) {}
}
