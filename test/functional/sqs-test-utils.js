const request = require('supertest');

class SqsTestUtils {

    constructor() {
        this.baseUrl = 'http://localhost:9324/';
        this.queuePrefix = 'queue';
    }

    sendMessageToQueue(queue, body) {
        return this.executeQuery(queue, 'Action=SendMessage&MessageBody=' + encodeURIComponent(body));
    }

    purgeQueue(queue) {
        return this.executeQuery(queue, 'Action=PurgeQueue');
    }

    purgeAllQueues() {
        return new Promise((resolve) => {
            Promise.all([
                this.purgeQueue('bill'),
                this.purgeQueue('recover'),
                this.purgeQueue('hold'),
                this.purgeQueue('shipped'),
                this.purgeQueue('delivered')
            ]).then(() => {
                resolve();
            });
        });
    }

    messageCountInQueue(queue) {
        let query = 'Action=GetQueueAttributes' +
            '&AttributeName.1=ApproximateNumberOfMessages' +
            '&AttributeName.2=ApproximateNumberOfMessagesNotVisible' +
            '&AttributeName.3=ApproximateNumberOfMessagesDelayed';

        // Return the sum of all 3 attributes.
        return new Promise((resolve, reject) => {
            this.executeQuery(queue, query).then(res => {
                let text = res.text;
                let regexp = /<Value>(\d*)<\/Value>/g;
                let result = 0;

                let match = regexp.exec(text);
                while (match != null) {
                    result += Number(match[1]);
                    match = regexp.exec(text);
                }

                resolve(result);
            });
        });
    }

    receiveMessageFromQueue(queue) {
        return new Promise((resolve, reject) => {
            this.executeQuery(queue, 'Action=ReceiveMessage&AttributeName=All').then(res => {
                resolve(res.text.match(/<Body>(.*)<\/Body>/)[1]);
            });
        });
    }

    executeQuery(queueName, queryString) {
        return request(this.baseUrl).get(`${this.queuePrefix}/${queueName}?${queryString}`);
    }
}

module.exports = new SqsTestUtils();