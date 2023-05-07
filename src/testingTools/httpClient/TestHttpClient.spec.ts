import { TestHttpClient } from './TestHttpClient';

describe(`${TestHttpClient.name}`, () => {
    let httpClient: TestHttpClient;
    let endpoint: string;
    beforeEach(() => {
        endpoint = 'test/endpoint';
        httpClient = new TestHttpClient();
    });
    it('finds pending request by url', () => {
        void httpClient.request(new Request(endpoint));
        const pendingRequest = httpClient.expectOne(endpoint);
        expect(pendingRequest.request.url).toEqual(endpoint);
    });
    it('finds pending request by url and init', () => {
        void httpClient.request(new Request(endpoint, { method: 'POST' }));
        const pendingRequest = httpClient.expectOne(endpoint, { method: 'POST' });
        expect(pendingRequest.request.url).toEqual(endpoint);
    });
    it('does not remove pending request from the client with expectOne', () => {
        void httpClient.request(new Request(endpoint, { method: 'POST' }));
        const pendingRequest0 = httpClient.expectOne(endpoint, { method: 'POST' });
        const pendingRequest1 = httpClient.expectOne(endpoint, { method: 'POST' });
        expect(pendingRequest0).toEqual(pendingRequest1);
    });
    it('finds pending request and allows to resolve it', async () => {
        const resolveValue = 3;
        const promise = httpClient.request<number>(new Request(endpoint));
        httpClient.expectOne<number>(endpoint).resolve(resolveValue);
        await expect(promise).resolves.toEqual(resolveValue);
    });
    it('removes pending request from http client once resolved', () => {
        const resolveValue = 3;
        void httpClient.request<number>(new Request(endpoint));
        httpClient.expectOne<number>(endpoint).resolve(resolveValue);
        expect(() => httpClient.expectOne<number>(endpoint)).toThrow();
    });
    it('finds pending request and allows to reject it', async () => {
        const error = new Error('error');
        const promise = httpClient.request(new Request(endpoint));
        httpClient.expectOne(endpoint).reject(error);
        await expect(promise).rejects.toEqual(error);
    });
    it('removes pending request from http client once rejected', () => {
        const error = new Error('error');
        void httpClient.request<number>(new Request(endpoint)).catch(() => {
            /* noop */
        });
        httpClient.expectOne<number>(endpoint).reject(error);
        expect(() => httpClient.expectOne<number>(endpoint)).toThrow();
        expect(true).toEqual(true);
    });
    it('verifies unresolved requests', () => {
        void httpClient.request(new Request(endpoint));
        expect(() => httpClient.verify()).toThrow();
    });
    it('cleans all pending requests', () => {
        void httpClient.request(new Request(endpoint));
        httpClient.clean();
        expect(() => httpClient.verify()).not.toThrow();
    });
});
