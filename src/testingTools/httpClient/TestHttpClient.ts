export interface PendingRequest<T> {
    request: Request;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: unknown) => void;
}

export class TestHttpClient {
    private static _instance: TestHttpClient | null = null;
    static get instance(): TestHttpClient {
        if (!this._instance) {
            throw new Error('TestHttpClient is not initialized yet');
        }
        return this._instance;
    }
    static make(): TestHttpClient {
        if (!TestHttpClient._instance) {
            TestHttpClient._instance = new TestHttpClient();
        }
        return TestHttpClient._instance;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- NOTE(harunou): the array actually holds PReq of any
    private pendingRequests: Array<PendingRequest<any>> = [];

    request<T>(request: Request): Promise<T> {
        return new Promise((resolve, reject) => {
            const pendingRequest: PendingRequest<T> = {
                request,
                resolve: (...args) => {
                    this.removePendingRequest(pendingRequest);
                    resolve(...args);
                },
                reject: (...args) => {
                    this.removePendingRequest(pendingRequest);
                    reject(...args);
                },
            };
            this.pendingRequests.push(pendingRequest);
        });
    }
    expectOne<T>(url: string, init?: RequestInit): PendingRequest<T> {
        const foundPendingRequest = this.findPendingRequest<T>(url, init);
        return foundPendingRequest;
    }
    removeOne(url: string, init?: RequestInit): void {
        const foundPendingRequest = this.findPendingRequest<unknown>(url, init);
        this.removePendingRequest(foundPendingRequest);
    }
    verify(): void {
        if (this.pendingRequests.length) {
            throw new Error(`HttpClient: still has pending requests`);
        }
    }
    clean(): void {
        this.pendingRequests = [];
    }

    private findPendingRequest<T>(url: string, init?: RequestInit): PendingRequest<T> {
        const foundPendingRequest = this.pendingRequests.find(pendingRequest => {
            const isUrlEqual = pendingRequest.request.url === url;
            const isInitEqual = init
                ? compareTwoRequestObjects(new Request(url, init), pendingRequest.request)
                : true;
            return isUrlEqual && isInitEqual;
        });
        if (!foundPendingRequest) {
            throw new Error(`HttpClient: no pending request found for the ${url}`);
        }
        return foundPendingRequest as PendingRequest<T>;
    }

    private removePendingRequest<T>(pendingRequest: PendingRequest<T>): void {
        this.pendingRequests = this.pendingRequests.filter(pr => pr !== pendingRequest);
    }
}

function compareTwoRequestObjects(request1: Request, request2: Request): boolean {
    return (
        request1.url === request2.url &&
        request1.method === request2.method &&
        request1.body === request2.body &&
        JSON.stringify(request1.headers) === JSON.stringify(request2.headers)
    );
}
