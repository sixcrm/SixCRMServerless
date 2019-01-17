declare module NodeJS {
	interface Global {
		SixCRM: any,
		user: any,
		customer: any,
		account: any,
		disableactionchecks: boolean,
		disableaccountfilter: boolean
	}
}
