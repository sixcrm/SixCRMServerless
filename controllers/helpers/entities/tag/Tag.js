const _ = require('lodash');
const du = global.SixCRM.routes.include('lib','debug-utilities.js');

module.exports = class TagHelper {

  constructor(){

  }

  getTagPrototype({entity, key, value}){

    du.debug('Get Tag Prototype');

    return {
      entity: entity,
      key: key,
      value: value
    };

  }

  async putTag({entity, key, value}){

    du.debug('Put Tag');

    if(!_.has(this, 'tagController')){
      const TagController = global.SixCRM.routes.include('entities', 'Tag.js');
      this.tagController = new TagController();
    }

    let existing_tag = await this.tagController.listByEntityAndKey({id: entity, key:key});

    if(_.isNull(existing_tag)){
      let tag_prototype = this.getTagPrototype({entity: this.tagController.getID(entity), key: key, value: value});
      return this.tagController.create({entity: tag_prototype});
    }

    if(existing_tag.value !== value){
      existing_tag.value = value;
      return this.tagController.update({entity: existing_tag});
    }

    return existing_tag;
    
  }

}
