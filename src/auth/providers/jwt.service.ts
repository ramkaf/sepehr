import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IPayload, IUser } from 'libs/interfaces';
import { DataSource } from 'typeorm';

@Injectable()
export class JwtToolService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('DATA_SOURCE')
    private readonly dataSource: DataSource,
  ) {}
  public async getJwtToken(payload: any): Promise<string> {
    return this.jwtService.sign(payload);
  }
  public async getUserJwtToken(user: IUser): Promise<string> {
    const permissions = await this.dataSource.query(
      'SELECT p.per_title FROM main.users_permissions up inner join main.permissions p on p.per_id = up.per_id INNER JOIN main.users u ON up.user_id = u.id WHERE u.uuid = $1',
      [user.uuid],
    );
    const payload: IPayload = {
      id: user.uuid,
      firstName: user.firstName,
      lastName: user.lastName,
      permissions: permissions.map((item) => item.per_title),
    };
    return await this.getJwtToken(payload);
  }
}
