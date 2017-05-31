'use strict';
const _ = require('underscore');

const du = global.routes.include('lib', 'debug-utilities.js');

const entityController = global.routes.include('controllers', 'entities/Entity.js');

class notificationSettingController extends entityController {

    constructor() {
        super('notificationsetting');
    }

    getDefaultProfile(){

        let default_notification_setting = {
            notification_groups:[
                {
                    key: 'account',
                    name:'Account',
                    description: 'Account related notifications',
                    display: true,
                    notifications: [
                        {
                            key: 'invitation_sent',
                            description:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sollicitudin eu orci faucibus vulputate. In ut tincidunt mi, nec dignissim.',
                            default: true,
                            name: 'Invitation Sent'
                        },
                        {
                            key: 'invitation_accepted',
                            description:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sollicitudin eu orci faucibus vulputate. In ut tincidunt mi, nec dignissim.',
                            default: true,
                            name: 'Invitation Accepted'
                        }
                    ]
                },
                {
                    key: 'crm',
                    name:"CRM",
                    description: "CRM related notifications",
                    display: true,
                    notifications:[
                        {
                            key:'lead',
                            description:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sollicitudin eu orci faucibus vulputate. In ut tincidunt mi, nec dignissim.',
                            default: true,
                            name: 'Lead'
                        },
                        {
                            key: 'order',
                            description:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sollicitudin eu orci faucibus vulputate. In ut tincidunt mi, nec dignissim.',
                            default: true,
                            name: 'Order'
                        },
                        {
                            key:'upsell',
                            description:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sollicitudin eu orci faucibus vulputate. In ut tincidunt mi, nec dignissim.',
                            default: true,
                            name: 'Upsell'
                        },
                        {
                            key: 'decline',
                            description:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sollicitudin eu orci faucibus vulputate. In ut tincidunt mi, nec dignissim.',
                            default: true,
                            name: 'Decline'
                        },
                        {
                            key: 'cancellation',
                            description:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sollicitudin eu orci faucibus vulputate. In ut tincidunt mi, nec dignissim.',
                            default: true,
                            name: 'Cancellation'
                        },
                        {
                            key: 'rebill',
                            description:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sollicitudin eu orci faucibus vulputate. In ut tincidunt mi, nec dignissim.',
                            default: true,
                            name: 'Rebill'
                        },
                        {
                            key: 'mid',
                            description:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sollicitudin eu orci faucibus vulputate. In ut tincidunt mi, nec dignissim.',
                            default: true,
                            name: 'Merchant Processor'
                        }
                    ]
                }
            ]
        };

        return Promise.resolve(default_notification_setting);

    }

}

module.exports = new notificationSettingController();
