import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { CreateUserDto } from '@/dtos/users/CreateUser.dto';
import User from '@/interfaces/user.model.interface';
import userModel from '@/models/users.model';
import { isEmpty } from 'class-validator';
import { HttpException } from '@/exceptions/HttpException';
import { LoginUserDto } from '@/dtos/auth/login.dto';

class authService {
	public users = userModel;

	public async signup(userData: CreateUserDto): Promise<User> {
		if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');

		const findUser: User = await this.users.findOne({ email: userData.email });
		if (findUser) throw new HttpException(409, `This email ${userData.email} already exists`);

		const hashedPassword = await hash(userData.password, 10);
		const createUserData: User = await this.users.create({ ...userData, hashedPassword });
		const data: User = createUserData.toObject();
		delete data.hashedPassword;
		return data;
	}

	public async login(userData: LoginUserDto): Promise<{ token: any }> {
		if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');

		const findUser: User = await this.users.findOne({ email: userData.email });
		if (!findUser) throw new HttpException(404, 'This user not found');

		const isPasswordMatching = await compare(userData.password, findUser.hashedPassword);
		if (!isPasswordMatching) throw new HttpException(400, 'invalid credentials');

		const token = this.createToken(findUser);
		findUser.refreshToken = token.refreshToken;
		await findUser.save();
		// const cookie = `Authorization=${token}; HttpOnly; Max-Age=3600`;

		return { token };
	}

	public async logout(userData: User): Promise<User> {
		// Implement the logout logic here (e.g., invalidate the token)
		return userData; // Placeholder return to avoid unused parameter error
	}

	private createToken(user: User): any {
		const secretKey = process.env.JWT_SECRET || 'your_secret_key';
		const expiresIn = 86400; // 1 day in seconds
		const accessToken = sign({ _id: user._id }, secretKey, { expiresIn });
		const refreshToken = sign({ _id: user._id }, secretKey);

		return { accessToken, refreshToken };
	}
}

export default authService;
