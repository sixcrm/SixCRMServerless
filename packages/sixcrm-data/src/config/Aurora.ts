export default interface IAuroraConfig {
	host: string;
	user: string;
	database: string;
	password: string;
	port?: number;
	max?: number;
	idle_timeout?: number;
}
