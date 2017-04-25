'use strict';
const _ = require('underscore');

const du = require('../lib/debug-utilities.js');

const entityController = require('./Entity.js');

class notificationSettingController extends entityController {

    constructor() {
        super(process.env.notifications_table, 'notificationsetting');
        this.table_name = process.env.notification_settings_table;
        this.descriptive_name = 'notificationsetting';
    }

    getDefaultProfile(){

        let default_notification_setting = {
            notification_groups:[
                {
                    key: 'account',
                    name:'Account',
                    description: 'Account related notifications',
                    default: true,
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
                    default: true,
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
                            key: 'rebill',
                            description:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sollicitudin eu orci faucibus vulputate. In ut tincidunt mi, nec dignissim.',
                            default: true,
                            name: 'Lead'
                        }
                    ]
                }
            ]
        };

        return Promise.resolve(default_notification_setting);

    }

}

module.exports = new notificationSettingController();
