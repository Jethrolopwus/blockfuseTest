import { IsNotEmpty, IsString } from 'class-validator';

export class resetUserPasswordDto {
	@IsString()
	@IsNotEmpty()
	password: string;
	resetpassword: string;
}
