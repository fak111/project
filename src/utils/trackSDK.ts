export enum EventName {
    XXX_EVENT = 'xxx_event',
    PAGE_LOAD = 'page_load',
    ERROR_EVENT = 'error_event',
    BUTTON_CLICK = 'button_click',
    STAY_TIME = 'stay_time',
    PERFORMANCE_METRICS = 'performance_metrics',
    // 添加项目特定的事件
    LOGIN_SUCCESS = 'login_success',
    LOGIN_FAILED = 'login_failed',
    REGISTER_SUCCESS = 'register_success',
    REGISTER_FAILED = 'register_failed',
    QUESTIONNAIRE_START = 'questionnaire_start',
    QUESTIONNAIRE_SUBMIT = 'questionnaire_submit',
    QUESTIONNAIRE_SAVE = 'questionnaire_save'
}

export interface EventParams {
    [key: string]: any;
}

export interface UserInfo {
    browser: string;
    os: string;
    uid: string;
    timestamp: number;
}

type NetworkRequestFn = (eventName: EventName, params: EventParams) => void;

class TrackSDK {
    private commonParams: Record<string, any> = {};
    private projectId: string | null = null;
    private uploadPercent: number | null = null;
    private sendToServer: NetworkRequestFn;
    private startTime: number;
    private stayStartTime: number | null = null;

    constructor(networkRequestFn: NetworkRequestFn) {
        this.sendToServer = networkRequestFn;
        this.startTime = Date.now();
    }

    public register(config: { project_id: string; upload_percent: number }) {
        this.projectId = config.project_id;
        this.uploadPercent = config.upload_percent;
        console.log(`Project ID: ${this.projectId}, Upload Percent: ${this.uploadPercent}`);
    }

    public addCommonParams(params: { [key: string]: any }) {
        this.commonParams = { ...this.commonParams, ...params };
        console.log('Updated common params:', this.commonParams);
    }

    public sendEvent(eventName: EventName, params: EventParams = {}) {
        const data = {
            ...this.commonParams,
            ...params,
            project_id: this.projectId,
            timestamp: Date.now()
        };
        this.sendToServer(eventName, data);
    }

    private getUserInfo(): UserInfo {
        const browser = navigator.userAgent;
        const os = navigator.platform;
        const uid = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).id : 'anonymous';
        const timestamp = Date.now();

        return { browser, os, uid, timestamp };
    }

    private monitorPerformance() {
        if (window.performance) {
            const checkPerformance = () => {
                const performanceEntries = window.performance.getEntriesByType('paint');
                const fp = performanceEntries.find(entry => entry.name === 'first-paint');
                const fcp = performanceEntries.find(entry => entry.name === 'first-contentful-paint');

                const performanceMetrics = {
                    fp: fp ? fp.startTime : null,
                    fcp: fcp ? fcp.startTime : null,
                };

                if (fp && fcp) {
                    console.log('Performance Metrics:', performanceMetrics);
                    this.sendEvent(EventName.PERFORMANCE_METRICS, performanceMetrics);
                } else {
                    requestAnimationFrame(checkPerformance);
                }
            };

            checkPerformance();
        }
    }

    public monitorButtonClick(buttonElement: HTMLElement, buttonId: string) {
        buttonElement.addEventListener('click', () => {
            this.sendEvent(EventName.BUTTON_CLICK, { buttonId });
        });
    }

    private monitorStayTime() {
        this.stayStartTime = Date.now();
        window.addEventListener('beforeunload', () => {
            const stayTime = Date.now() - this.stayStartTime!;
            this.sendEvent(EventName.STAY_TIME, { stayTime });
        });
    }

    private errorTracker() {
        window.onerror = (event: string | Event, source?: string, lineno?: number, colno?: number, error?: Error) => {
            const message = event instanceof ErrorEvent ? event.message : String(event);
            const errorInfo = {
                message,
                source,
                lineno,
                colno,
                stack: error ? error.stack : '',
            };

            this.sendEvent(EventName.ERROR_EVENT, errorInfo);
        };

        window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
            const errorInfo = {
                reason: event.reason,
            };
            this.sendEvent(EventName.ERROR_EVENT, errorInfo);
        });
    }

    public init(config: { project_id: string; upload_percent: number }) {
        this.register(config);

        const userInfo = this.getUserInfo();
        console.log('User Info:', userInfo);
        this.addCommonParams({ user_info: userInfo });

        this.sendEvent(EventName.PAGE_LOAD, { user_info: userInfo });
        this.monitorPerformance();
        this.monitorStayTime();
        this.errorTracker();
    }
}

export const createTrackSDK = (networkRequestFn: NetworkRequestFn) => {
    return new TrackSDK(networkRequestFn);
};
