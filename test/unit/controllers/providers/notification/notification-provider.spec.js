let chai = require('chai');
let expect = chai.expect;
const _ = require('underscore');
const uuidV4 = require('uuid/v4');
const mockery = require('mockery');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

function getUserACLsFromAccount(){

  return [ { updated_at: '2018-03-21T15:09:38.997Z',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'customerservice.user@test.com',
    created_at: '2018-01-15T22:46:36.719Z',
    role: '1116c054-42bb-4bf5-841e-ee0c413fa69e',
    id: '68c49dd4-a44b-4b07-bd02-b250881d928c' },
  { updated_at: '2017-12-29T19:02:00.780Z',
    created_at: '2017-12-29T19:02:00.780Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: '190e9846-b245-4e9f-aa3f-a0b24f0ea2a1' },
  { updated_at: '2017-12-29T03:32:23.828Z',
    created_at: '2017-12-29T03:32:23.828Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: 'cac8bcc5-2b7f-4f3d-b4fd-76e4e22a236a' },
  { updated_at: '2018-01-11T20:14:01.539Z',
    created_at: '2018-01-11T20:14:01.539Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: 'b2eedbef-dec3-4bf4-924a-647d3b5f8ea5' },
  { updated_at: '2018-01-12T14:58:16.854Z',
    created_at: '2018-01-12T14:58:16.854Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: '1b9e3650-1d4a-426e-88e7-220aab96a777' },
  { updated_at: '2018-01-11T23:31:17.865Z',
    created_at: '2018-01-11T23:31:17.865Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: 'add33ed3-ddff-4dc7-a6cd-a6944f4b45c7' },
  { updated_at: '2018-01-12T18:44:01.393Z',
    created_at: '2018-01-12T18:44:01.393Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: '9a48f141-db13-4855-85df-d4370c0b47d5' },
  { updated_at: '2017-12-29T15:56:10.156Z',
    created_at: '2017-12-29T15:56:10.156Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: 'e1473cab-cb68-42a5-a3e6-cb97fb5f8837' },
  { updated_at: '2018-01-12T20:58:20.808Z',
    created_at: '2018-01-12T20:58:20.808Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: 'b2d22529-8a8c-456c-8d2f-c83a91549f01' },
  { updated_at: '2018-01-08T18:04:11.023Z',
    created_at: '2018-01-08T18:04:11.023Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: 'c18ca9df-8216-4e8e-879b-96a6635bd75b' },
  { updated_at: '2018-01-11T16:41:39.126Z',
    created_at: '2018-01-11T16:41:39.126Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: '4e0f1d48-2105-4af5-a91d-c42de6f61e70' },
  { updated_at: '2018-03-21T15:09:39.033Z',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'nathan.brenner@crmblackbox.com',
    created_at: '2017-04-06T18:40:41.405Z',
    role: 'cae614de-ce8a-40b9-8137-3d3bdff78039',
    id: 'dfd66ac0-3f2c-40c4-807b-a5262a86f68e' },
  { updated_at: '2018-01-09T15:08:18.976Z',
    created_at: '2018-01-09T15:08:18.976Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: '512cd299-6838-44b3-b8e9-2c584af3adc9' },
  { updated_at: '2018-01-11T15:59:46.863Z',
    created_at: '2018-01-11T15:59:46.863Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: '156f7f3d-6c4d-49d9-a0a6-756d3cd1d81e' },
  { updated_at: '2018-01-08T05:49:21.233Z',
    created_at: '2018-01-08T05:49:21.233Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: '8ace32a7-eb7b-4bcc-a271-147d960aee6d' },
  { updated_at: '2018-01-11T21:42:41.548Z',
    created_at: '2018-01-11T21:42:41.548Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: '3207dab6-c23a-48f8-89d5-dceafef07eb9' },
  { updated_at: '2018-03-21T15:09:38.971Z',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'graphql.documentation@sixcrm.com',
    created_at: '2018-01-15T22:46:36.730Z',
    role: '6341d12d-4c36-4717-bf6d-1d0cbebe63d8',
    id: '2cf80417-e4ae-4a69-903f-a459c9ea8f04' },
  { updated_at: '2017-12-29T05:29:20.990Z',
    created_at: '2017-12-29T05:29:20.990Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: '65365bae-3329-43db-97ee-60d49287580f' },
  { updated_at: '2018-01-10T19:04:29.091Z',
    created_at: '2018-01-10T19:04:29.091Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: '461542e3-e05c-406f-8111-fe24531c88d4' },
  { updated_at: '2017-12-29T17:31:07.294Z',
    created_at: '2017-12-29T17:31:07.294Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: '0b191dfb-0066-444d-a95c-8a2b8b6b446a' },
  { updated_at: '2018-01-12T18:29:19.646Z',
    created_at: '2018-01-12T18:29:19.646Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: '5eb82171-5431-4b4e-a003-d046c94ff626' },
  { updated_at: '2018-01-02T05:36:03.028Z',
    created_at: '2018-01-02T05:36:03.028Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: 'a4079070-dfbb-4b0e-886c-d77f7c2998ad' },
  { updated_at: '2018-01-11T18:57:59.764Z',
    created_at: '2018-01-11T18:57:59.764Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: 'c67c08fb-47a7-4ae4-b3b7-c79502a800f3' },
  { updated_at: '2018-01-08T19:27:42.982Z',
    created_at: '2018-01-08T19:27:42.982Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: '26518d98-b9c5-4738-bf21-08ffdc0256a4' },
  { updated_at: '2018-03-21T15:09:39.047Z',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'nikola.bosic@coingcs.com',
    created_at: '2018-01-15T22:46:36.722Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    id: '474e5f79-2662-49ab-a58e-8cc45e33159c' },
  { updated_at: '2017-12-31T09:39:12.263Z',
    created_at: '2017-12-31T09:39:12.263Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: 'e01b8d5d-7155-444d-9976-aee3198bddf4' },
  { updated_at: '2017-12-29T16:23:04.840Z',
    created_at: '2017-12-29T16:23:04.840Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: '39d4dc78-c667-419d-9f30-426c4a2f1622' },
  { updated_at: '2018-01-09T02:20:17.347Z',
    created_at: '2018-01-09T02:20:17.347Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: 'eb7310d1-efe8-4666-8c85-5dbbb841dff6' },
  { updated_at: '2018-01-09T20:30:54.461Z',
    created_at: '2018-01-09T20:30:54.461Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: 'bb67ed4f-ab0b-4e65-be96-b57e6d117d04' },
  { updated_at: '2018-01-12T07:43:24.303Z',
    created_at: '2018-01-12T07:43:24.303Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: '8d09990b-9f7d-4206-bf29-b78b2ee8ea28' },
  { updated_at: '2018-01-06T22:03:13.188Z',
    created_at: '2018-01-06T22:03:13.188Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: '1812a399-e943-4d69-be28-c34e4d8deb7d' },
  { updated_at: '2018-03-21T15:09:39.066Z',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'admin.user@test.com',
    created_at: '2018-01-15T22:46:36.688Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    id: 'e0b96ed2-f657-4c19-9219-1eab1cd3e706' },
  { updated_at: '2018-01-08T22:03:02.030Z',
    created_at: '2018-01-08T22:03:02.030Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: '81266d9d-c9d3-46ff-8450-26e91d7fbd31' },
  { updated_at: '2018-01-12T02:54:04.379Z',
    created_at: '2018-01-12T02:54:04.379Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: '5e92d2e7-6bc5-4d95-99e2-ca0ae3a95bd7' },
  { updated_at: '2018-03-21T15:09:38.979Z',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'timothy.dalbey@sixcrm.com',
    created_at: '2018-01-15T22:46:36.634Z',
    role: '1116c054-42bb-4bf5-841e-ee0c413fa69e',
    id: 'ef87cbb1-ee8c-426a-8f0c-7d5a363bb442' },
  { updated_at: '2018-03-21T15:09:39.012Z',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'owner.user@test.com',
    created_at: '2018-01-15T22:46:36.639Z',
    role: 'cae614de-ce8a-40b9-8137-3d3bdff78039',
    id: '1d28d82f-87f1-48eb-9a25-13513956776a' },
  { updated_at: '2018-01-10T17:59:03.796Z',
    created_at: '2018-01-10T17:59:03.796Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: '64f2aabd-f2f6-42f9-884a-6814e7f1a4eb' },
  { updated_at: '2018-01-03T17:22:08.938Z',
    created_at: '2018-01-03T17:22:08.938Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: 'e35ea1e1-6190-40d6-94f4-c9f2488f73b9' },
  { updated_at: '2018-01-08T23:59:35.542Z',
    created_at: '2018-01-08T23:59:35.542Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: '0c7cccce-2f2c-4634-9e20-6fd55bb4a420' },
  { updated_at: '2017-12-29T18:26:15.990Z',
    created_at: '2017-12-29T18:26:15.990Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: 'f9228ce2-bb95-409b-81b1-91ce775bf716' },
  { updated_at: '2018-01-09T20:33:00.813Z',
    created_at: '2018-01-09T20:33:00.813Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: '6993577a-1ee8-461a-97ad-fd9dc45ff2d6' },
  { updated_at: '2018-01-10T14:50:02.676Z',
    created_at: '2018-01-10T14:50:02.676Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: '273e22fd-ccfa-4705-a6e5-0adb6574bc68' },
  { updated_at: '2018-01-10T17:20:16.272Z',
    created_at: '2018-01-10T17:20:16.272Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: 'e9f76aac-d4c1-45a7-a843-73725b69c728' },
  { updated_at: '2018-01-09T20:10:27.176Z',
    created_at: '2018-01-09T20:10:27.176Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: 'a3d8d155-c026-4534-bfbf-438bfedd369e' },
  { updated_at: '2018-01-11T19:29:37.059Z',
    created_at: '2018-01-11T19:29:37.059Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: '101455a1-f0cc-4ce6-8ad9-00a6e585ad97' },
  { updated_at: '2018-01-01T23:15:39.084Z',
    created_at: '2018-01-01T23:15:39.084Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: '1778b222-d47e-4a24-af54-f8adad446fb0' },
  { updated_at: '2018-01-08T22:26:45.506Z',
    created_at: '2018-01-08T22:26:45.506Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: '5f262256-ed00-4b0a-857f-05c39688a9fb' },
  { updated_at: '2018-01-12T16:44:43.677Z',
    created_at: '2018-01-12T16:44:43.677Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: '4a444c08-07a7-4024-a788-e191a4ef6e0c' },
  { updated_at: '2018-01-10T02:38:35.521Z',
    created_at: '2018-01-10T02:38:35.521Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: 'c420b0dd-923e-4947-893f-0ac75d78a905' },
  { updated_at: '2018-01-10T16:57:47.240Z',
    created_at: '2018-01-10T16:57:47.240Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: 'ed61c84d-c1bf-45ab-a506-bf49fcce5a9f' },
  { updated_at: '2018-02-07T20:24:47.743Z',
    created_at: '2018-02-07T20:24:47.743Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: 'ac00e87b-ff9b-475f-b196-0d1966e1bac3' },
  { updated_at: '2018-01-03T00:30:50.082Z',
    created_at: '2018-01-03T00:30:50.082Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: 'c6d34c51-bd7c-435f-8b8c-33b8c4547d6b' },
  { updated_at: '2018-01-04T22:07:12.293Z',
    created_at: '2018-01-04T22:07:12.293Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: 'ddf9364b-73a5-4bf7-98fe-5d4b4216b16b' },
  { updated_at: '2018-01-04T22:57:24.338Z',
    created_at: '2018-01-04T22:57:24.338Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: '02d86dfd-9058-4e8d-b9d9-2799766c9f8f' },
  { updated_at: '2018-01-10T03:13:05.958Z',
    created_at: '2018-01-10T03:13:05.958Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: '819d2cf1-1f4b-4ea8-adc3-8bc5cd857bef' },
  { updated_at: '2017-12-29T02:54:16.742Z',
    created_at: '2017-12-29T02:54:16.742Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: 'd6dae63e-f99f-418e-9b4a-172557af67b6' },
  { updated_at: '2018-01-09T01:43:15.483Z',
    created_at: '2018-01-09T01:43:15.483Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: 'f2a60e97-9cd7-462c-a653-4bbfec59d9af' },
  { updated_at: '2018-01-10T13:51:23.233Z',
    created_at: '2018-01-10T13:51:23.233Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: 'ee178fcf-a497-444a-80d7-fabf5885cf55' },
  { updated_at: '2017-12-29T17:05:12.832Z',
    created_at: '2017-12-29T17:05:12.832Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: 'cb963052-02d8-4ca2-b6d8-881d46c95534' },
  { updated_at: '2018-01-10T16:32:42.129Z',
    created_at: '2018-01-10T16:32:42.129Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: '32d07729-8ecc-4766-8c2c-07ff8764950e' },
  { updated_at: '2017-12-29T16:48:38.038Z',
    created_at: '2017-12-29T16:48:38.038Z',
    role: 'e09ac44b-6cde-4572-8162-609f6f0aeca8',
    pending: 'Invite Sent',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    user: 'tmdalbey@gmail.com',
    id: '5b8f6f64-322f-4d5d-bd00-c3ca0439a2f1' } ];
}
function getValidUserSetting(){

  return {
    updated_at: '2018-03-21T15:09:39.461Z',
    created_at: '2018-01-18T14:53:35.500Z',
    notifications: [
      { name: 'six', receive: true },
      { name: 'email', receive: false },
      { name: 'sms', receive: false },
      { name: 'skype', receive: false },
      { name: 'slack', receive: false },
      { name: 'ios', receive: false }
    ],
    'timezone:': 'America/Los_Angeles',
    id: 'timothy.dalbey@sixcrm.com',
    language: 'English'
  };

}

function getValidDefaultNotificationSettings(){

  return {
    notification_groups: [
      { key: 'account',
         name: 'Account',
         description: 'Account related notifications',
         display: true,
         notifications: [
           {
             key: 'invitation_sent',
             description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sollicitudin eu orci faucibus vulputate. In ut tincidunt mi, nec dignissim.',
             default: true,
             name: 'Invitation Sent'
           },
           {
             key: 'invitation_accepted',
             description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sollicitudin eu orci faucibus vulputate. In ut tincidunt mi, nec dignissim.',
             default: true,
             name: 'Invitation Accepted'
           }
         ]
       },
       { key: 'crm',
         name: 'CRM',
         description: 'CRM related notifications',
         display: true,
         notifications:[
           { key: 'lead',
              description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sollicitudin eu orci faucibus vulputate. In ut tincidunt mi, nec dignissim.',
              default: true,
              name: 'Lead' },
            { key: 'order',
              description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sollicitudin eu orci faucibus vulputate. In ut tincidunt mi, nec dignissim.',
              default: true,
              name: 'Order' },
            { key: 'upsell',
              description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sollicitudin eu orci faucibus vulputate. In ut tincidunt mi, nec dignissim.',
              default: true,
              name: 'Upsell' },
            { key: 'decline',
              description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sollicitudin eu orci faucibus vulputate. In ut tincidunt mi, nec dignissim.',
              default: true,
              name: 'Decline' },
            { key: 'cancellation',
              description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sollicitudin eu orci faucibus vulputate. In ut tincidunt mi, nec dignissim.',
              default: true,
              name: 'Cancellation' },
            { key: 'rebill',
              description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sollicitudin eu orci faucibus vulputate. In ut tincidunt mi, nec dignissim.',
              default: true,
              name: 'Rebill' },
            { key: 'mid',
              description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sollicitudin eu orci faucibus vulputate. In ut tincidunt mi, nec dignissim.',
              default: true,
              name: 'Merchant Processor'
            }
          ]
        }
      ]
    };

}

function getValidUserNotificationSettings(){

  return {
    updated_at: '2017-12-29T19:04:42.013Z',
    settings: JSON.stringify({
      notification_groups:[
        {
          notifications:[
            {
              key:"invitation_sent",
              description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sollicitudin eu orci faucibus vulputate. In ut tincidunt mi, nec dignissim.",
              default:true,
              name:"Invitation Sent"
            },
            {
              key:"invitation_accepted",
              description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sollicitudin eu orci faucibus vulputate. In ut tincidunt mi, nec dignissim.",
              default:true,
              name:"Invitation Accepted"
            }
          ],
          key:"account",
          name:"Account",
          description:"Account",
          display:true
        },
        {
          notifications:[
            {
              key:"lead",
              description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sollicitudin eu orci faucibus vulputate. In ut tincidunt mi, nec dignissim.",
              default:true,
              name:"Lead"
            },
            {
              key:"order",
              description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sollicitudin eu orci faucibus vulputate. In ut tincidunt mi, nec dignissim.",
              default:true,
              name:"Order"
            },
            {
              key:"upsell",
              description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sollicitudin eu orci faucibus vulputate. In ut tincidunt mi, nec dignissim.",
              default:true,
              name:"Upsell"
            },
            {
              key:"decline",
              description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sollicitudin eu orci faucibus vulputate. In ut tincidunt mi, nec dignissim.",
              default:true,
              name:"Decline"
            },
            {
              key:"cancellation",
              description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sollicitudin eu orci faucibus vulputate. In ut tincidunt mi, nec dignissim.",
              default:true,
              name:"Cancellation"
            },
            {
              key:"rebill",
              description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sollicitudin eu orci faucibus vulputate. In ut tincidunt mi, nec dignissim.",
              default:true,
              name:"Rebill"
            },
            {
              key:"mid",
              description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sollicitudin eu orci faucibus vulputate. In ut tincidunt mi, nec dignissim.",
              default:true,
              name:"Merchant Processor"
            }
          ],
          key:"crm",
          name:"CRM",
          description:"CRM",
          display:true
        }
      ]
    }),
    created_at: '2017-12-29T19:04:42.013Z',
    id: 'timothy.dalbey@sixcrm.com'
  };

}

describe('controllers/providers/notification/notification-provider', () => {

    beforeEach(() => {
      mockery.enable({
          useCleanCache: true,
          warnOnReplace: false,
          warnOnUnregistered: false
      });
    });

    afterEach(() => {
        mockery.resetCache();
    });

    after(() => {
        mockery.deregisterAll();
    });

    describe('constructor', () => {
      it('successfully constructs', () => {

        let notification_provider = global.SixCRM.routes.include('providers', 'notification/notification-provider.js');
        expect(objectutilities.getClassName(notification_provider)).to.equal('NotificationProvider');

      });
    });

    describe('validateNotificationPrototype', () => {
      it('successfully fails to validate', () => {

        let notification_prototype = {};

        let notification_provider = global.SixCRM.routes.include('providers', 'notification/notification-provider.js');
        notification_provider.parameters.set('action', 'createNotificationForAccountAndUser');
        notification_provider.parameters.set('notificationprototype', notification_prototype);

        try{
          notification_provider.validateNotificationPrototype();
        }catch(error){
          expect(error.message).to.equal('[500] User is mandatory in notification prototypes when using the createNotificationsForAccountAndUser method.');
        }

      });

      it('successfully validates', () => {

        let notification_prototype = {user:'someuser@user.com'};

        let notification_provider = global.SixCRM.routes.include('providers', 'notification/notification-provider.js');
        notification_provider.parameters.set('action', 'createNotificationForAccountAndUser');
        notification_provider.parameters.set('notificationprototype', notification_prototype);

        try{
          notification_provider.validateNotificationPrototype();
        }catch(error){
          expect(error.message).to.equal('[500] User is mandatory in notification prototypes when using the createNotificationsForAccountAndUser method.');
        }

      });
    });

    describe('setReceiptUsersFromNotificationPrototype', () => {
      it('successfully sets the user from the notification prototype', () => {
        let notification_prototype = {user:'someuser@user.com'};

        let notification_provider = global.SixCRM.routes.include('providers', 'notification/notification-provider.js');
        notification_provider.parameters.set('notificationprototype', notification_prototype);

        let result = notification_provider.setReceiptUsersFromNotificationPrototype();
        expect(result).to.equal(true);
        expect(notification_provider.parameters.store['receiptusers']).to.deep.equal([notification_prototype.user]);
      });

      it('throws an error when user is not set', () => {
        let notification_prototype = {};

        let notification_provider = global.SixCRM.routes.include('providers', 'notification/notification-provider.js');
        notification_provider.parameters.set('notificationprototype', notification_prototype);

        try{
          notification_provider.setReceiptUsersFromNotificationPrototype();
        }catch(error){
          expect(error.message).to.equal('[500] Unable to identify receipt user in notification prototype');
        }

      });
    });

    describe('setReceiptUsers', () => {

      it('successfully sets the user from the notification prototype', () => {
        let notification_prototype = {user:'someuser@user.com'};

        let notification_provider = global.SixCRM.routes.include('providers', 'notification/notification-provider.js');
        notification_provider.parameters.set('notificationprototype', notification_prototype);
        notification_provider.parameters.set('action', 'createNotificationForAccountAndUser');

        let result = notification_provider.setReceiptUsers();
        expect(result).to.equal(true);
        expect(notification_provider.parameters.store['receiptusers']).to.deep.equal([notification_prototype.user]);
      });

      it('successfully sets the users from account acls', () => {

        let acls = getUserACLsFromAccount();

        let users = arrayutilities.filter(acls, acl => {
          return (!_.has(acl, 'pending'));
        })

        users = arrayutilities.map(users, user => {
          return user.user;
        });

        let notification_prototype = {
          account:'ad58ea78-504f-4a7e-ad45-128b6e76dc57'
        };

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/UserACL.js'), {
          getACLByAccount:() => {
            return Promise.resolve(acls);
          }
        });

        let notification_provider = global.SixCRM.routes.include('providers', 'notification/notification-provider.js');
        notification_provider.parameters.set('notificationprototype', notification_prototype);
        notification_provider.parameters.set('action', 'createNotificationsForAccount');

        return notification_provider.setReceiptUsers().then((result) => {
          expect(result).to.equal(true);
          expect(notification_provider.parameters.store['receiptusers']).to.deep.equal(users);
        });

      });

    });

    describe('setReceiptUsersFromAccount', () => {

      it('successfully throws an error (empty acls)', () => {

        let acls = [];
        let notification_prototype = {account:'ad58ea78-504f-4a7e-ad45-128b6e76dc57'};

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/UserACL.js'), {
          getACLByAccount:() => {
            return Promise.resolve(acls);
          }
        });

        let notification_provider = global.SixCRM.routes.include('providers', 'notification/notification-provider.js');
        notification_provider.parameters.set('notificationprototype', notification_prototype);

        return notification_provider.setReceiptUsersFromAccount().catch(error => {
          expect(error.message).to.equal('[500] Empty useracls element in account user_acl response');
        });

      });

      it('successfully throws an error (empty acls)', () => {

        let acls = getUserACLsFromAccount();

        let users = arrayutilities.filter(acls, acl => {
          return (!_.has(acl, 'pending'));
        });

        users = arrayutilities.map(users, user => {
          return user.user;
        });

        let notification_prototype = {account:'ad58ea78-504f-4a7e-ad45-128b6e76dc57'};

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/UserACL.js'), {
          getACLByAccount:() => {
            return Promise.resolve(acls);
          }
        });

        let notification_provider = global.SixCRM.routes.include('providers', 'notification/notification-provider.js');
        notification_provider.parameters.set('notificationprototype', notification_prototype);

        return notification_provider.setReceiptUsersFromAccount().then(result => {
          expect(result).to.equal(true);
          expect(notification_provider.parameters.store['receiptusers']).to.deep.equal(users);
        })

      });

    });

    describe('getNotificationSettings', () => {

      it('retrieves notification settings from dynamo', () => {

        let user = 'some@user.com';
        let user_notification_setting = getValidUserNotificationSettings();
        let default_notification_setting = getValidDefaultNotificationSettings();
        let user_setting = getValidUserSetting();

        mockery.registerMock(global.SixCRM.routes.path('entities', 'NotificationSetting.js'), {
          get:() => {
            return Promise.resolve(user_notification_setting);
          },
          getDefaultProfile: () => {
            return Promise.resolve(default_notification_setting);
          }
        });

        mockery.registerMock(global.SixCRM.routes.path('entities', 'UserSetting.js'), {
          get:() => {
            return Promise.resolve(user_setting);
          }
        });

        let notification_provider = global.SixCRM.routes.include('providers', 'notification/notification-provider.js');

        return notification_provider.getNotificationSettings({user: user}).then(({notification_settings, user_settings, default_notification_settings}) => {
          expect(notification_settings).to.deep.equal(user_notification_setting);
          expect(user_settings).to.deep.equal(user_setting);
          expect(default_notification_settings).to.deep.equal(default_notification_setting);
        });

      });

    });

    describe('buildNotificationCategoriesAndTypes', () => {

      it('successfully returns augmented normalized notification settings object', () => {

        let normalized_notification_settings = {};

        let notification_provider = global.SixCRM.routes.include('providers', 'notification/notification-provider.js');
        let result = notification_provider.buildNotificationCategoriesAndTypes(normalized_notification_settings);

        expect(result).to.have.property('notification_settings');
        expect(result).to.have.property('notification_categories');
        expect(result).to.have.property('notification_types');

      });

    });

    describe('createNotification', () => {

      it('successfully creates a notification prototype', () => {

        let user = 'someguy@somewhere.com';
        let account = 'ad58ea78-504f-4a7e-ad45-128b6e76dc57';
        let a_notification_prototype = {
          user: user,
          account: account,
          type: 'lead',
          category: 'transaction',
          context: {
            'category.name': 'Some category name',
            'session.id':'some_session_id'
          },
          name: 'lead'
        };

        let augmented_normalized_notification_settings = {};
        let user_settings = {};

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Notification.js'), {
          create:({entity}) => {
            entity.id = uuidV4();
            entity.created_at = timestamp.getISO8601();
            entity.updated_at = entity.created_at;
            return Promise.resolve(entity);
          }
        });

        let notification_provider = global.SixCRM.routes.include('providers', 'notification/notification-provider.js');
        return notification_provider.createNotification({
          notification_prototype: a_notification_prototype,
          user: user,
          account: account,
          augmented_normalized_notification_settings: augmented_normalized_notification_settings,
          user_settings: user_settings
        }).then(result => {
          expect(result).to.have.property('id');
          expect(result).to.have.property('created_at');
          expect(result).to.have.property('updated_at');
        });

      });

    });

    describe('saveAndSendNotification', () => {
      it('successfully saves and sends notifcations', () => {

        let user = 'someguy@somewhere.com';
        let account = 'ad58ea78-504f-4a7e-ad45-128b6e76dc57';
        let a_notification_prototype = {
          user: user,
          account: account,
          type: 'lead',
          category: 'transaction',
          context: {
            'category.name': 'Some category name',
            'session.id':'some_session_id'
          },
          name: 'lead'
        };

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Notification.js'), {
          create:({entity}) => {
            entity.id = uuidV4();
            entity.created_at = timestamp.getISO8601();
            entity.updated_at = entity.created_at;
            return Promise.resolve(entity);
          }
        });

        let user_notification_setting = getValidUserNotificationSettings();
        let default_notification_setting = getValidDefaultNotificationSettings();
        let user_setting = getValidUserSetting();

        mockery.registerMock(global.SixCRM.routes.path('entities', 'NotificationSetting.js'), {
          get:() => {
            return Promise.resolve(user_notification_setting);
          },
          getDefaultProfile: () => {
            return Promise.resolve(default_notification_setting);
          }
        });

        mockery.registerMock(global.SixCRM.routes.path('entities', 'UserSetting.js'), {
          get:() => {
            return Promise.resolve(user_setting);
          }
        });

        let notification_provider = global.SixCRM.routes.include('providers', 'notification/notification-provider.js');
        return notification_provider.saveAndSendNotification({
          notification_prototype: a_notification_prototype,
          user: user,
          account: account
        }).then(result => {
          expect(result).to.have.property('id');
          expect(result).to.have.property('created_at');
          expect(result).to.have.property('updated_at');
        });
      });
    });

    describe('createNotificationForAccountAndUser', () => {
      it('creates notifications for a account user', () => {

        let user = 'someguy@somewhere.com';
        let account = 'ad58ea78-504f-4a7e-ad45-128b6e76dc57';
        let a_notification_prototype = {
          user: user,
          account: account,
          type: 'lead',
          category: 'transaction',
          context: {
            'category.name': 'Some category name',
            'session.id':'some_session_id'
          },
          name: 'lead'
        };

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Notification.js'), {
          create:({entity}) => {
            entity.id = uuidV4();
            entity.created_at = timestamp.getISO8601();
            entity.updated_at = entity.created_at;
            return Promise.resolve(entity);
          }
        });

        let user_notification_setting = getValidUserNotificationSettings();
        let default_notification_setting = getValidDefaultNotificationSettings();
        let user_setting = getValidUserSetting();

        mockery.registerMock(global.SixCRM.routes.path('entities', 'NotificationSetting.js'), {
          get:() => {
            return Promise.resolve(user_notification_setting);
          },
          getDefaultProfile: () => {
            return Promise.resolve(default_notification_setting);
          }
        });

        mockery.registerMock(global.SixCRM.routes.path('entities', 'UserSetting.js'), {
          get:() => {
            return Promise.resolve(user_setting);
          }
        });

        let notification_provider = global.SixCRM.routes.include('providers', 'notification/notification-provider.js');
        return notification_provider.createNotificationForAccountAndUser({notification_prototype: a_notification_prototype}).then(result => {
          expect(result).to.equal(true);
        });
      });
    });

    describe('createNotificationsForAccount', () => {

      it('creates notifications for account users', () => {

        let user = 'someguy@somewhere.com';
        let account = 'ad58ea78-504f-4a7e-ad45-128b6e76dc57';
        let a_notification_prototype = {
          user: user,
          account: account,
          type: 'lead',
          category: 'transaction',
          context: {
            'category.name': 'Some category name',
            'session.id':'some_session_id'
          },
          name: 'lead'
        };

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Notification.js'), {
          create:({entity}) => {
            entity.id = uuidV4();
            entity.created_at = timestamp.getISO8601();
            entity.updated_at = entity.created_at;
            return Promise.resolve(entity);
          }
        });

        let user_notification_setting = getValidUserNotificationSettings();
        let default_notification_setting = getValidDefaultNotificationSettings();
        let user_setting = getValidUserSetting();

        mockery.registerMock(global.SixCRM.routes.path('entities', 'NotificationSetting.js'), {
          get:() => {
            return Promise.resolve(user_notification_setting);
          },
          getDefaultProfile: () => {
            return Promise.resolve(default_notification_setting);
          }
        });

        mockery.registerMock(global.SixCRM.routes.path('entities', 'UserSetting.js'), {
          get:() => {
            return Promise.resolve(user_setting);
          }
        });

        let acls = getUserACLsFromAccount();

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/UserACL.js'), {
          getACLByAccount:() => {
            return Promise.resolve(acls);
          }
        });

        let notification_provider = global.SixCRM.routes.include('providers', 'notification/notification-provider.js');
        return notification_provider.createNotificationsForAccount({notification_prototype: a_notification_prototype}).then(result => {
          expect(result).to.equal(true);
        });
      });
    });

    xdescribe('(LIVE) createNotificationForAccountAndUser (LIVE)', () => {
      it('creates notifications for a account user', () => {

        let user = 'timothy.dalbey@sixcrm.com';
        let account = 'd3fa3bf3-7824-49f4-8261-87674482bf1c';
        let a_notification_prototype = {
          user: user,
          account: account,
          type: 'notification',
          category: 'general',
          context: {},
          name: 'test'
        };

        let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');
        PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

        let notification_provider = global.SixCRM.routes.include('providers', 'notification/notification-provider.js');
        return notification_provider.createNotificationForAccountAndUser({notification_prototype: a_notification_prototype}).then(result => {
          expect(result).to.equal(true);
        });
      });
    });

    xdescribe('(LIVE) createNotificationsForAccount (LIVE)', () => {
      it('creates notifications for all account users', () => {

        let user = 'timothy.dalbey@sixcrm.com';
        let account = 'd3fa3bf3-7824-49f4-8261-87674482bf1c';
        let a_notification_prototype = {
          user: user,
          account: account,
          type: 'notification',
          category: 'general',
          context: {},
          name: 'test'
        };

        let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');
        PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

        let notification_provider = global.SixCRM.routes.include('providers', 'notification/notification-provider.js');
        return notification_provider.createNotificationsForAccount({notification_prototype: a_notification_prototype}).then(result => {
          expect(result).to.equal(true);
        });
      });
    });

});
