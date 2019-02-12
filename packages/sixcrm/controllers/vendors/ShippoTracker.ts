const BaseUrl = 'https://api.goshippo.com/tracks/';
import * as request from 'request-promise-native';

interface ITrackingLocation {
	city: string;
	state: string;
	zip: string;
	country: string;
}

interface ITrackingStatus {
	object_created: string;
	object_updated: string;
	object_id: string;
	status: 'UNKNOWN' | 'PRE_TRANSIT' | 'TRANSIT' | 'DELIVERED' | 'RETURNED' | 'FAILURE';
	status_details: string;
	status_date: string;
	substatus: string;
	location: ITrackingLocation;
}

interface ITrackingResponse {
	messages: string[];
	carrier: string;
	tracking_number: string;
	address_from: ITrackingLocation;
	address_to: ITrackingLocation;
	eta: string;
	original_eta: string;
	servicelevel: {
		token: string;
		name: string;
	};
	metadata: string;
	tracking_status: ITrackingStatus;
	tracking_history: ITrackingStatus[];
	transaction: null;
	test: boolean;
}

// https://goshippo.com/docs/tracking/
export default class ShippoTracker {

	_apiKey: string;

	constructor(apiKey: string) {

		this._apiKey = apiKey;

	}

	// https://goshippo.com/docs/reference#tracks-retrieve
	async track(carrier: string, trackingNumber: string): Promise<ITrackingResponse> {

		return request({
			url: BaseUrl + carrier + '/' + trackingNumber,
			headers: {
				Authorization: 'ShippoToken ' + this._apiKey
			},
			json: true
		});

	}

}
