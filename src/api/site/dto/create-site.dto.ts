import { IsNotEmpty, Matches } from 'class-validator';

export class CreateSiteDto {
  @Matches(/^[A-Z]{3}\d{2}$/, {
    message:
      'Site name must contains three letters and two numbers. Example: WAW01',
  })
  name: string;

  @IsNotEmpty({
    message: 'Address is required',
  })
  address: string;

  description: string;
}
