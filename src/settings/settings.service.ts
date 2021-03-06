import { ConfigService } from '@nestjs/config';
import { DbOptions } from './settings.constants';
import { Injectable } from '@nestjs/common';
import { ServiceResultType } from '../bl/result-wrappers/service-result-type';
import { UserFriendlyException } from '../bl/exceptions/user-friendly.exception';

@Injectable()
export class SettingsService {
    private readonly _appPort: number;
    private readonly _dbHost: string;
    private readonly _dbPort: number;
    private readonly _dbName: string;
    private readonly _dbUser: string;
    private readonly _dbPassword: string;
    private readonly _dbType: string;
    private readonly _jwtKey: string;
    private readonly _jwtUseExpiresIn: string;
    private readonly _jwtExpirationTime: string;
    private readonly _jwtAudience: string;
    private readonly _jwtIssuer: string;
    private readonly _refreshTokensEnabled: string;
    private readonly _seedInitialData: string;

    constructor(private conf: ConfigService) {
        this._appPort = conf.get<number>('APPLICATION_PORT', 3000);
        this._dbHost = conf.get<string>('DB_HOST');
        this._dbPort = conf.get<number>('DB_PORT');
        this._dbName = conf.get<string>('DB_NAME');
        this._dbUser = conf.get<string>('DB_USER');
        this._dbPassword = conf.get<string>('DB_PASSWORD');
        this._dbType = conf.get<string>('DB_TYPE');
        this._jwtKey = conf.get<string>('JWT_KEY');
        this._jwtAudience = conf.get<string>('JWT_AUDIENCE');
        this._jwtIssuer = conf.get<string>('JWT_ISSUER');
        this._jwtUseExpiresIn = conf.get<string>('JWT_USE_EXPIRES_IN');
        this._jwtExpirationTime = conf.get<string>('JWT_EXPIRATION_TIME');
        this._refreshTokensEnabled = conf.get<string>('REFRESH_TOKENS_ENABLED');
        this._seedInitialData = conf.get<string>('SEED_INITIAL_DATA');
    }

    get appPort(): number {
        return Number(this._appPort);
    }

    get dbHost(): string {
        return this._dbHost;
    }

    get dbPort(): number {
        return Number(this._dbPort);
    }

    get dbName(): string {
        return this._dbName;
    }

    get dbUser(): string {
        return this._dbUser;
    }

    get dbPassword(): string {
        return this._dbPassword;
    }

    get dbType(): DbOptions {
        return this._dbType as DbOptions;
    }

    get jwtSecret(): string {
        return this._jwtKey;
    }

    get jwtAudience(): string {
        return this._jwtAudience;
    }

    get jwtIssuer(): string {
        return this._jwtIssuer;
    }

    get jwtUseExpiresIn(): boolean {
        return this._jwtUseExpiresIn === 'true';
    }

    get jwtExpirationTime(): string {
        return this._jwtExpirationTime;
    }

    get refreshTokensEnabled(): boolean {
        return this._refreshTokensEnabled === 'true';
    }

    get seedInitialData(): boolean {
        return this._seedInitialData === 'true';
    }

    getMongooseConnectionString(): string {
        if (!this._dbUser || !this._dbPassword || !this._dbHost || !this._dbPort || !this._dbName) {
            throw new UserFriendlyException(ServiceResultType.InternalError, 'One of mongo-db parameters is invalid');
        }

        return `mongodb://${this._dbUser}:${this._dbPassword}@${this._dbHost}:${this._dbPort}/${this._dbName}?authSource=admin`;
    }
}
