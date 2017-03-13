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

    messageCountInQueue(queue) {
        return new Promise((resolve, reject) => {
            this.executeQuery(queue, 'Action=GetQueueAttributes&AttributeName.1=ApproximateNumberOfMessages').then(res => {
                resolve(Number(res.text.match(/<Value>(\d*)<\/Value>/)[1]));
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