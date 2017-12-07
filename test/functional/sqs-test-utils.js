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
        return Promise.all([
            this.purgeQueue('bill'),
            this.purgeQueue('bill_failed'),
            this.purgeQueue('rebill'),
            this.purgeQueue('pending'),
            this.purgeQueue('pending_failed'),
            this.purgeQueue('recover'),
            this.purgeQueue('hold'),
            this.purgeQueue('hold_failed'),
            this.purgeQueue('shipped'),
            this.purgeQueue('delivered'),
            this.purgeQueue('searchindex')
        ]);
    }

    messageCountInQueue(queue) {
        let query = 'Action=GetQueueAttributes' +
            '&AttributeName.1=ApproximateNumberOfMessages' +
            '&AttributeName.2=ApproximateNumberOfMessagesNotVisible' +
            '&AttributeName.3=ApproximateNumberOfMessagesDelayed';

        // Return the sum of all 3 attributes.
        return this.executeQuery(queue, query).then(res => {
            let text = res.text;
            let regexp = /<Value>(\d*)<\/Value>/g;
            let result = 0;

            let match = regexp.exec(text);

            while (match != null) {
                result += Number(match[1]);
                match = regexp.exec(text);
            }

            return result;
        });
    }

    receiveMessageFromQueue(queue) {
        return this.executeQuery(queue, 'Action=ReceiveMessage&AttributeName=All').then(res => {
            let bodies = res.text.match(/<Body>(.*)<\/Body>/);

            return bodies ? bodies[1].replace(/&quot;/g,'"') : null;
        });
    }

    executeQuery(queueName, queryString) {
        return request(this.baseUrl).get(`${this.queuePrefix}/${queueName}?${queryString}`);
    }
}

module.exports = new SqsTestUtils();