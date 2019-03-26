import { IParamsProvider, ClientError, ResponseHandlerFunction } from '../models';
import { isBrowser } from '../utils';

export class HttpClient {

	constructor(private paramsProvider: IParamsProvider) {

	}

	request<T>(url: string, request: RequestInit = {}): Promise<T> {
		let params = this.paramsProvider.getParams();

		const isRelativeRequestUrl = !params.rootUrl || params.rootUrl === '/';
		if (!isBrowser() && isRelativeRequestUrl) {
			throw new Error('You cannot specify a relative root url if not in a browser context.');
		}

		request.method = request.method || (!!request.body ? 'POST' : 'GET');
		if (!isRelativeRequestUrl) {
			request.mode = 'cors';
		}

		request.headers = request.headers || {};
		let headers = request.headers as any;
		if (!headers.accessToken) {
			headers.accessToken = params.accessToken;
		}

		const requestUrl = isRelativeRequestUrl ? `${url}` : `${params.rootUrl}${url}`;
		return fetch(requestUrl, request)
			.then((response) => {
				if (response.ok) {
					return response.json();
				}

				let responseHandlerFunction: ResponseHandlerFunction = null;
				if (!!params.responseHandler) {
					if (!!params.responseHandler['*']) {
						responseHandlerFunction = params.responseHandler['*'];
					}

					if (!!params.responseHandler[response.status]) {
						responseHandlerFunction = params.responseHandler[response.status];
					}
				}

				let clientError: ClientError = {
					status: response.status,
					statusText: response.statusText,
					url: response.url,
					data: null
				};

				return response.json().then(
					responseJson => {
						clientError.data = responseJson;

						return !!responseHandlerFunction ?
							responseHandlerFunction(response, clientError)
							: Promise.reject(clientError);
					},
					reason => {
						clientError.data = reason;

						return !!responseHandlerFunction ?
							responseHandlerFunction(response, clientError)
							: Promise.reject(clientError);
					}
				);
			})
			.then(result => result as any);
	}

}
